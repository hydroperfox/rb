import chalk from "chalk";
import { program } from "commander";
import { globSync } from "glob";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import * as url_ns from "url";
import { Portal, Reference, Section, TopBarColors } from "./Portal";
import { TOCItem } from "./TOCItem";
import { CommonPathUtil } from "./util";

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
        fs.mkdirSync(outputDir);

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
        this.outputHTML(portal, outputDir, indexHandlebars);

        // Generate JavaScript
        TODO();

        // Finish
        console.log(chalk.green("Successfully generated reference portal at:"), outputDir);
    }

    /**
     * @param {string} themePath
     * @param {string} outputDir
     */
    copyTheme(themePath, outputDir)
    {
        const filenames = globSync(path.resolve(themePath, "**/*.{txt,css,ttf,otf,woff,woff2,png,jpg,jpeg}"));
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
        const filenames = globSync(path.resolve(mediaDir, "**/*.{png,bmp,gif,jpg,jpeg,svg,mp4}"));
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
        let p = reference.basePath + "/" + section.path;
        p = p.endsWith(".md") ? p.slice(0, p.length - 3) : p;
        p = p.replace(/[\\\/]+/g, "/");

        const tocItem2 = new TOCItem(TOCItem.SECTION, section.title, p + ".html");
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
                builder.push('<div class="section-nav"><div>');

                // Reference links
                for (const tocItem of toc.subitems)
                {
                    builder.push(`<a href="${tocItem.redirect}">${tocItem.title}</a>`);
                }
                builder.push('</div><div>');

                // Sections by reference
                for (const tocItem of toc.subitems)
                {
                    builder.push(this.generateSectionNavHTML(tocItem));
                }
                builder.push('</div></div>');
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
                    builder.push(`<div class="nestable-section"><div><div class="empty-connector"></div><a href="${toc.redirect}">${toc.title}</a></div></div>`);
                }
                else
                {
                    builder.push(`<div class="nestable-section"><div><div class="connector"></div><a href="${toc.redirect}">${toc.title}</a></div><div class="section-list">`);
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

        if (item instanceof Portal)
        {
            // Path to root (used in output code)
            pathToRoot = "";
            // Path to reference (used in output code)
            pathToReference = "./";

            //
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
            pathToRoot = "..";
            // Path to reference (used in output code)
            pathToReference = "./";

            //
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
            // Path to reference (used in output code)
            pathToReference = CommonPathUtil.pathToRoot(item.path);

            //
        }
        else
        {
            throw new Error("Could not match item.");
        }
    }
}