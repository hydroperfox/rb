import { DOMParser } from "@xmldom/xmldom";
import { XMLUtil } from "./util";

export class Portal
{
    /**
     * @type {string}
     */
    title = "";

    /**
     * @type {string}
     */
    basePath = "";

    /**
     * @type {string}
     */
    description = "";

    /**
     * @type {string | null}
     */
    icon = null;

    /**
     * @type {TopBarColors | null}
     */
    topBarColors = null;

    /**
     * @type {Reference[]}
     */
    references = [];

    /**
     * @param {string} str
     */
    static fromXMLString(str)
    {
        return Portal.fromXML(new DOMParser().parseFromString(str, "text/xml"));
    }

    /**
     * @param {Document} xml
     */
    static fromXML(document)
    {
        // <portal>
        const portalNode = XMLUtil.element(document, null, "portal");
        if (portalNode === null)
        {
            throw new Error("Expected a root <portal> element in the configuration file.");
        }
        const portal = new Portal();

        // <title>
        const titleel = XMLUtil.element(portalNode, null, "title");
        portal.title = (titleel ? titleel.textContent : null) ?? "undefined";

        // <base-path>
        const basepathel = XMLUtil.element(portalNode, null, "base-path");
        portal.basePath = (basepathel ? basepathel.textContent : null) ?? "";

        // <description>
        const descriptionel = XMLUtil.element(portalNode, null, "description");
        portal.description = (descriptionel ? descriptionel.textContent : null) ?? "";

        // <icon>
        const iconel = XMLUtil.element(portalNode, null, "icon");
        portal.icon = iconel ? descriptionel.textContent : null;

        // <top-bar-colors>
        const topbarcolorsel = XMLUtil.element(portalNode, null, "top-bar-colors");
        if (topbarcolorsel !== null)
        {
            portal.topBarColors = TopBarColors.fromXML(topbarcolorsel);
        }

        // <references>
        const referencesel = XMLUtil.element(portalNode, null, "references");
        if (referencesel)
        {
            // <reference>
            for (const referenceel of XMLUtil.elements(referencesel, null, "reference"))
            {
                portal.references.push(Reference.fromXML(referenceel));
            }
        }

        return portal;
    }
}

export class Reference
{
    /**
     * @type {string}
     */
    title = "";

    /**
     * @type {string}
     */
    basePath = "";

    /**
     * @type {string | null}
     */
    icon = null;

    /**
     * @type {TopBarColors | null}
     */
    topBarColors = null;

    /**
     * @type {Section | null}
     */
    home = null;

    /**
     * @type {Section[]}
     */
    sections = [];

    /**
     * @param {Element} element
     * @returns {Reference} 
     */
    static fromXML(element)
    {
        const reference = new Reference();

        // <title>
        const titleel = XMLUtil.element(element, null, "title");
        reference.title = (titleel ? titleel.textContent : null) ?? "undefined";

        // <base-path>
        const basepathel = XMLUtil.element(element, null, "base-path");
        reference.basePath = (basepathel ? basepathel.textContent : null) ?? "";

        // <icon>
        const iconel = XMLUtil.element(element, null, "icon");
        reference.icon = iconel ? descriptionel.textContent : null;

        // <top-bar-colors>
        const topbarcolorsel = XMLUtil.element(element, null, "top-bar-colors");
        if (topbarcolorsel !== null)
        {
            reference.topBarColors = TopBarColors.fromXML(topbarcolorsel);
        }

        // <home>
        const homeel = XMLUtil.element(element, null, "home");
        reference.home = homeel ? Section.fromXML(homeel) : null;

        // <sections>
        const sectionsel = XMLUtil.element(element, null, "sections");
        if (sectionsel)
        {
            // <section>
            for (const secel of XMLUtil.elements(sectionsel, null, "section"))
            {
                reference.sections.push(Section.fromXML(secel));
            }
        }

        return reference;
    }
}

export class Section
{
    /**
     * @type {string}
     */
    title = "";

    /**
     * @type {string}
     */
    path = "";

    /**
     * @type {Section[]}
     */
    sections = [];

    /**
     * @param {Element} element
     * @returns {Section}
     */
    static fromXML(element)
    {
        const section = new Section();

        // <title>
        const titleel = XMLUtil.element(element, null, "title");
        section.title = (titleel ? titleel.textContent : null) ?? "undefined";

        // <path>
        const pathel = XMLUtil.element(element, null, "path");
        if (!pathel)
        {
            throw new Error("Missing <path> option for a section.");
        }
        section.path = pathel.textContent;

        // <sections>
        const sectionsel1 = XMLUtil.element(element, null, "sections");
        if (sectionsel1)
        {
            // <section>
            for (const secel of XMLUtil.elements(sectionsel1, null, "section"))
            {
                section.sections.push(Section.fromXML(secel));
            }
        }

        return section;
    }
}

export class TopBarColors
{
    /**
     * @type {string}
     */
    top = "#555";

    /**
     * @type {string}
     */
    bottom = "#000";

    /**
     * @param {string} top
     * @param {string} bottom
     */
    constructor(top, bottom)
    {
        this.top = top;
        this.bottom = bottom;
    }

    /**
     * @param {Element} element 
     * @returns {TopBarColors}
     */
    static fromXML(element)
    {
        return new TopBarColors(
            element.getAttribute("top") ?? "#555",
            element.getAttribute("bottom") ?? "#000");
    }
}