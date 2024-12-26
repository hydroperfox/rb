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
            portal.topBarColors = new TopBarColors(
                topbarcolorsel.getAttribute("top") ?? "#555",
                topbarcolorsel.getAttribute("bottom") ?? "#000");
        }

        // <references>
        const referencesel = XMLUtil.element(portalNode, null, "references");
        for (const referenceel of XMLUtil.elements(referencesel))
        {
            TODO();
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
}