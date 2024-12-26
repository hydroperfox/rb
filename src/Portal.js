import { DOMParser } from "@xmldom/xmldom";

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
        TODO();
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