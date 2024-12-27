import { program } from "commander";
import { globSync } from "glob";
import * as fs from "fs";
import * as path from "path";
import * as url_ns from "url";
import { Portal, Reference, Section, TopBarColors } from "./Portal";

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
            console.error("Could not read rb.xml configuration file.");
            return;
        }
        let portal = null;
        try
        {
            portal = Portal.fromXMLString(fs.readFileSync(rbxmlpath, "utf-8"));
        }
        catch (e)
        {
            console.error(e.message);
            return;
        }

        // Output directory
        const outputDir = path.resolve(workingDir, "out");
        fs.mkdirSync(outputDir);

        // Copy the built-in theme
        this.copyTheme(path.resolve(selfScriptDir, "../theme"), outputDir);
    }

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
}