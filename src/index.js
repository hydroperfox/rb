import chalk from "chalk";
import { program } from "commander";
import { globSync } from "glob";
import Handlebars from "handlebars";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import * as fs from "fs";
import * as path from "path";
import * as url_ns from "url";
import { Portal, Reference, Section, TopBarColors } from "./Portal.js";
import { TOCItem } from "./TOCItem.js";
import { CommonPathUtil } from "./util.js";

program
    .name("hydroperrb")
    .description("Reference portal builder.")
    .version("1.0.0");

program
    .command("build")
    .description("Build the reference portal.")
    .action(options => {
        new BuildProcess().run();
    });

const md = markdownIt({
    html: true,
    linkify: true,
})
    .use(markdownItAnchor, {});

class BuildProcess
{
    run()
    {
        // This script's directory
        const selfScriptDir = path.resolve(url_ns.fileURLToPath(import.meta.url), "..");

        // The current working directory
        const workingDir = process.cwd();

        // Read rb.xml
        const rbxmlpath = path.resolve(workingDir, "rb.xml");
        if (!(fs.existsSync(rbxmlpath) && fs.lstatSync(rbxmlpath).isFile()))
        {
            console.error(chalk.red("Error:"), "Could not read rb.xml configuration file.");
            return;
        }
        let portal = null;
        try
        {
            portal = Portal.fromXMLString(fs.readFileSync(rbxmlpath, "utf-8"));
        }
        catch (e)
        {
            console.error(chalk.red("Error:"), e.message);
            return;
        }

        // Output directory
        const outputDir = path.resolve(workingDir, "out");
        fs.mkdirSync(outputDir, { recursive: true });

        // Theme path
        const themePath = path.resolve(selfScriptDir, "../theme");

        // Copy the built-in theme
        this.copyTheme(themePath, outputDir);

        // Setup the table of contents (TOC)
        const toc = this.setupTOC(portal);

        // Generate HTML for the section navigator (TOC)
        const sectionNavHTML = this.generateSectionNavHTML(toc);

        // Copy media files
        this.copyMediaFiles(path.resolve(workingDir, portal.basePath), outputDir);

        // IndexHandlebars
        const indexHandlebars = Handlebars.compile(fs.readFileSync(path.resolve(themePath, "index.hbs"), "utf-8"));

        // Generate HTML for the portal root and each section
        this.outputHTML(portal, outputDir, null, indexHandlebars);

        // Generate table of contents JavaScript
        const scriptHandlebars = Handlebars.compile(fs.readFileSync(path.resolve(themePath, "toc.hbs"), "utf-8"));
        fs.writeFileSync(path.resolve(outputDir, "toc.js"), scriptHandlebars({
            section_nav: sectionNavHTML.replace(/`/g, "&#x60;"),
        }));

        // Finish
        console.log(chalk.green("Successfully generated reference portal at:"), outputDir);
    }

    /**
     * @param {string} themePath
     * @param {string} outputDir
     */
    copyTheme(themePath, outputDir)
    {
        const filenames = globSync("/**/*.{txt,js,css,ttf,otf,woff,woff2,png,jpg,jpeg}", {
            root: path.resolve(themePath),
        });
        outputDir = path.normalize(outputDir);
        themePath = path.normalize(themePath);
        themePath = themePath + (themePath.endsWith(path.sep) ? "" : path.sep);

        for (const filename of filenames)
        {
            const filenameInsideTheme = path.normalize(filename).slice(themePath.length);
            const outFilename = path.resolve(outputDir, filenameInsideTheme);
            fs.mkdirSync(path.resolve(outFilename, ".."), { recursive: true });
            fs.writeFileSync(outFilename, fs.readFileSync(filename));
        }
    }

    /**
     * @param {string} mediaDir
     * @param {string} outputDir
     */
    copyMediaFiles(mediaDir, outputDir)
    {
        const filenames = globSync("/**/*.{png,bmp,gif,jpg,jpeg,svg,mp4}", {
            root: path.resolve(mediaDir),
        });
        outputDir = path.normalize(outputDir);
        mediaDir = path.normalize(mediaDir);
        mediaDir = mediaDir + (mediaDir.endsWith(path.sep) ? "" : path.sep);

        for (const filename of filenames)
        {
            const filenameInsideMediaDir = path.normalize(filename).slice(mediaDir.length);
            const outFilename = path.resolve(outputDir, filenameInsideMediaDir);
            fs.mkdirSync(path.resolve(outFilename, ".."), { recursive: true });
            fs.writeFileSync(outFilename, fs.readFileSync(filename));
        }
    }

    /**
     * @param {Portal} portal
     * @returns {TOCItem}
     */
    setupTOC(portal)
    {
        const tocItem1 = new TOCItem(TOCItem.PORTAL, portal.title, "index.html");
        tocItem1.originalObject = portal;

        for (const reference of portal.references)
        {
            const tocItem2 = new TOCItem(TOCItem.REFERENCE, reference.title, CommonPathUtil.excludeTrailingSlash(reference.basePath) + "/" + "index.html");
            tocItem2.originalObject = reference;

            for (const section of reference.sections)
            {
                this.setupTOCSection(reference, section, tocItem2);
            }

            tocItem1.subitems.push(tocItem2);
        }

        return tocItem1;
    }

    /**
     * @param {Reference} reference 
     * @param {Section} section 
     * @param {TOCItem} tocItem1 
     */
    setupTOCSection(reference, section, tocItem1)
    {
        const tocItem2 = new TOCItem(TOCItem.SECTION, section.title, fullSectionPath(reference, section));
        tocItem2.originalObject = section;

        for (const section1 of section.sections)
        {
            this.setupTOCSection(reference, section1, tocItem2);
        }

        tocItem1.subitems.push(tocItem2);
    }

    /**
     * @param {TOCItem} toc
     * @returns {string} A HTML to be inserted before page content through JavaScript.
     */
    generateSectionNavHTML(toc)
    {
        const builder = [];
        switch (toc.type)
        {
            case TOCItem.PORTAL:
                builder.push('<div style="margin-bottom: 0.7rem">');

                // Reference links
                for (const tocItem of toc.subitems)
                {
                    builder.push(`<a href="${tocItem.redirect}"><b>${tocItem.title}</b></a>`);
                }
                builder.push('</div>');

                // Sections by reference
                for (const tocItem of toc.subitems)
                {
                    builder.push(this.generateSectionNavHTML(tocItem));
                }
                break;
            case TOCItem.REFERENCE:
                builder.push(`<div class="section-nav-ref" data-path="${CommonPathUtil.excludeTrailingSlash(toc.originalObject.basePath)}"><div>`);
                builder.push(`<b>${toc.title}</b>`);
                builder.push('</div><div class="section-list">');
                for (const tocItem of toc.subitems)
                {
                    builder.push(this.generateSectionNavHTML(tocItem));
                }
                builder.push('</div></div>');
                break;
            case TOCItem.SECTION:
                if (toc.subitems.length == 0)
                {
                    builder.push(`<div class="nestable-section"><div><div class="empty-connector"></div><a href="${toc.redirect}"><b>${toc.title}</b></a></div></div>`);
                }
                else
                {
                    builder.push(`<div class="nestable-section"><div><div class="connector"></div><a href="${toc.redirect}"><b>${toc.title}</b></a></div><div class="section-list">`);
                    for (const tocItem of toc.subitems)
                    {
                        builder.push(this.generateSectionNavHTML(tocItem));
                    }
                    builder.push('</div></div>');
                }
                break;
        }
        return builder.join("");
    }

    /**
     * @param {Object} item
     * @param {string} outputDir
     * @param {Object[] | null} currentSectionPath Array that starts with a `Portal` object
     * followed by a `Reference` object followed by `Section` objects.
     * @param {HandlebarsTemplateDelegate<any>} indexHandlebars
     */
    outputHTML(item, outputDir, currentSectionPath = null, indexHandlebars)
    {
        // Path to root (used in output code)
        let pathToRoot = "";
        // Path to reference home (used in output code)
        let pathToReference = "";

        const colorModeSelector = '<select id="color-mode-selector"><option value="system">System color</option><option value="light">Light</option><option value="dark">Dark</option></select>';

        if (item instanceof Portal)
        {
            // Path to root (used in output code)
            pathToRoot = "./";
            // Path to reference (used in output code)
            pathToReference = "./";

            // Top bar background
            const topBarBackground = `background: linear-gradient(0deg, ${item.topBarColors?.bottom ?? "#000"} 0%, ${item.topBarColors?.top ?? "#555"} 100%)`;

            // Top bar items
            const topBarIconItem = item.icon ? `<img class="icon" src="${item.icon}" alt="Icon">` : "";
            const topBarItems = topBarIconItem + colorModeSelector;

            // Header controls
            const companyLogo = item.companyLogo ? `<img class="company-logo" src="${pathToRoot + item.companyLogo}">` : "";
            const headerControls = `<div class="header-controls" style="display: flex; flex-direction: row; justify-content: space-between"><h1>${item.title}</h1>${companyLogo}</div>`;

            // Content
            /*
            const links = [];
            for (const reference of item.references)
            {
                links.push(`<a href="${CommonPathUtil.excludeTrailingSlash(reference.basePath) + "/" + "index.html"}">${reference.title}</a>`);
            }
            */
            const content = "";

            // Write HTML
            fs.writeFileSync(path.resolve(outputDir, "index.html"), indexHandlebars({
                path_to_root: pathToRoot,
                path_to_reference: pathToReference,
                reference_original_path: "",
                section_original_path: "",
                title: item.title,
                top_bar_background: topBarBackground,
                top_bar_items: topBarItems,
                header_controls: headerControls,
                content,
                footer_controls: "",
            }));

            // Visit references
            for (const reference of item.references)
            {
                this.outputHTML(reference, outputDir, [item], indexHandlebars);
            }
        }
        else if (item instanceof Reference)
        {
            // Reference should be in a directory plus an index.html file.

            /**
             * Portal
             * @type {Portal}
             */
            const portal = currentSectionPath[0];

            // Path to root (used in output code)
            pathToRoot = "../";
            // Path to reference (used in output code)
            pathToReference = "./";

            // Top bar background
            const topBarBackground = `background: linear-gradient(0deg, ${item.topBarColors?.bottom ?? "#000"} 0%, ${item.topBarColors?.top ?? "#555"} 100%)`;

            // Top bar items
            const topBarIconItem = item.icon ? `<img class="icon" src="${item.icon}" alt="Icon">` : "";
            const topBarItems = topBarIconItem + colorModeSelector;

            // Header controls
            const nextSec = item.sections.length == 0 ? "" : sectionPathRelativeToReference(item.sections[0]);
            const companyLogo = portal.companyLogo ? `<img class="company-logo" src="${pathToRoot + portal.companyLogo}">` : "";
            const headerControls = `<div class="header-controls" style="display: flex; flex-direction: row; justify-content: space-between"><h1>${item.title}</h1><div style="display: flex; flex-direction: row; gap: 1rem; align-items: end"><div class="prev-next-buttons"><div><button class="button" disabled>⯇</button></div><a href="${nextSec}"><button class="button">⯈</button></a></div>${companyLogo}</div></div>`;

            // Content
            let content = "";
            if (item.home !== null)
            {
                const homeMarkdown = fs.readFileSync(path.resolve(portal.basePath, item.basePath, item.home.path), "utf-8");
                content = md.render(homeMarkdown);
            }

            // Write HTML
            fs.mkdirSync(path.resolve(outputDir, item.basePath), { recursive: true });
            fs.writeFileSync(path.resolve(outputDir, item.basePath, "index.html"), indexHandlebars({
                path_to_root: pathToRoot,
                path_to_reference: pathToReference,
                reference_original_path: CommonPathUtil.excludeTrailingSlash(item.basePath),
                section_original_path: "",
                title: item.title,
                top_bar_background: topBarBackground,
                top_bar_items: topBarItems,
                header_controls: headerControls,
                content,
                footer_controls: "",
            }));

            // Visit sections
            for (const section of item.sections)
            {
                this.outputHTML(section, outputDir, [portal, item], indexHandlebars);
            }
        }
        else if (item instanceof Section)
        {
            /**
             * Portal
             * @type {Portal}
             */
            const portal = currentSectionPath[0];

            /**
             * Reference.
             * @type {Reference}
             */
            const reference = currentSectionPath[1];

            // Path to root (used in output code)
            pathToRoot = CommonPathUtil.pathToRoot(CommonPathUtil.join(reference.basePath, item.path));
            pathToRoot = pathToRoot.replace(/^\.\.\//, "");
            // Path to reference (used in output code)
            pathToReference = CommonPathUtil.pathToRoot(item.path);

            // Top bar background
            const topBarBackground = `background: linear-gradient(0deg, ${reference.topBarColors?.bottom ?? "#000"} 0%, ${reference.topBarColors?.top ?? "#555"} 100%)`;

            // Top bar items
            const topBarIconItem = reference.icon ? `<img class="icon" src="${reference.icon}" alt="Icon">` : "";
            const topBarItems = topBarIconItem + colorModeSelector;

            // Previous/next sections
            const [prevsec, nextsec] = prevNextSections(reference, item);

            // Header controls
            const prevSecButton = prevsec ? `<a href="${pathToRoot + fullSectionPath(reference, prevsec)}"><button class="button">⯇</button></a>` : '<div><button class="button" disabled>⯇</button></div>';
            const nextSecButton = nextsec ? `<a href="${pathToRoot + fullSectionPath(reference, nextsec)}"><button class="button">⯈</button></a>` : '<div><button class="button" disabled>⯈</button></div>';
            const companyLogo = portal.companyLogo ? `<img class="company-logo" src="${pathToRoot + portal.companyLogo}">` : "";
            const companyLogoEmpty = portal.companyLogo ? `<div class="company-logo"></div>` : "";
            const sectionPathLinks = currentSectionPath.slice(1).map(item => {
                if (item instanceof Reference)
                {
                    return `<a href="${pathToRoot + item.basePath + "/index.html"}"><b>Home</b></a>`;
                }
                // Section
                return `<a href="${pathToRoot + fullSectionPath(reference, item)}"><b>${item.title}</b></a>`;
            });
            sectionPathLinks.splice(1, 0, `<a href="${pathToRoot + reference.basePath + "/index.html"}"><b>${reference.title}</b></a>`);
            const currentSectionPathControls = `<div style="display: flex; flex-direction: row; gap: 0.5rem">${sectionPathLinks.join(" <b>/</b> ")}</div>`;
            const headerControls = `<div class="header-controls" style="display: flex; flex-direction: row; justify-content: space-between">${currentSectionPathControls}<div style="display: flex; flex-direction: row; gap: 1rem; align-items: end"><div class="prev-next-buttons">${prevSecButton}${nextSecButton}</div>${companyLogo}</div></div>`;
            const footerControls = `<div class="footer-controls" style="display: flex; flex-direction: row; justify-content: space-between">${currentSectionPathControls}<div style="display: flex; flex-direction: row; gap: 1rem;"><div class="prev-next-buttons">${prevSecButton}${nextSecButton}</div>${companyLogoEmpty}</div></div>`;

            // Content
            let content = "";
            if (item.home !== null)
            {
                const sectionMarkdown = fs.readFileSync(path.resolve(portal.basePath, reference.basePath, item.path), "utf-8");
                content = md.render(sectionMarkdown);
            }
            let directSubsections = "";
            if (item.sections.length > 0)
            {
                const builder = [];
                for (const sec of item.sections)
                {
                    builder.push(`<p><a href="${pathToRoot + fullSectionPath(reference, sec)}"><b>${sec.title}</b></a></p>`);
                }
                directSubsections = `<hr><p style="margin-top: 2rem">${builder.join("")}</p>`;
            }
            content = `<h1>${item.title}</h1>${content}${directSubsections}`;

            // Write HTML
            fs.mkdirSync(path.resolve(fullSectionOutputPath(outputDir, reference, item), ".."), { recursive: true });
            fs.writeFileSync(fullSectionOutputPath(outputDir, reference, item), indexHandlebars({
                path_to_root: pathToRoot,
                path_to_reference: pathToReference,
                reference_original_path: CommonPathUtil.excludeTrailingSlash(reference.basePath),
                section_original_path: fullSectionPath(reference, item),
                title: item.title,
                top_bar_background: topBarBackground,
                top_bar_items: topBarItems,
                header_controls: headerControls,
                content,
                footer_controls: footerControls,
            }));

            // Visit subsections
            const nextSectionPath = currentSectionPath.slice(0);
            nextSectionPath.push(item);
            for (const subsection of item.sections)
            {
                this.outputHTML(subsection, outputDir, nextSectionPath, indexHandlebars);
            }
        }
        else
        {
            throw new Error("Could not match item.");
        }
    }
}

/**
 * @param {string} outputDir
 * @param {Reference} reference 
 * @param {Section} section 
 * @returns {string}
 */
function fullSectionOutputPath(outputDir, reference, section)
{
    let p = section.path;
    p = p.endsWith(".md") ? p.slice(0, p.length - 3) : p;
    return path.resolve(outputDir, reference.basePath, p + ".html");
}

/**
 * @param {Reference} reference 
 * @param {Section} section 
 * @returns {string}
 */
function fullSectionPath(reference, section)
{
    let p = reference.basePath + "/" + section.path;
    p = p.endsWith(".md") ? p.slice(0, p.length - 3) : p;
    return p.replace(/[\\\/]+/g, "/") + ".html";
}

/**
 * @param {Section} section 
 * @returns {string}
 */
function sectionPathRelativeToReference(section)
{
    let p = section.path;
    p = p.endsWith(".md") ? p.slice(0, p.length - 3) : p;
    return p.replace(/[\\\/]+/g, "/") + ".html";
}

/**
 * @param {Reference} reference
 * @param {Section} section
 * @returns {[Section | null, Section | null]}
 */
function prevNextSections(reference, section)
{
    const a = reference.fullSectionArray;
    const i = a.indexOf(section);
    if (i == -1)
    {
        return [null, null];
    }
    return [i > 0 ? a[i - 1] : null, i + 1 < a.length ? a[i + 1] : null];
}

program.parse();