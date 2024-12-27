export class TOCItem
{
    /**
     * @type {string}
     * @readonly
     */
    static PORTAL = "portal";

    /**
     * @type {string}
     * @readonly
     */
    static REFERENCE = "reference";

    /**
     * @type {string}
     * @readonly
     */
    static SECTION = "section";

    /**
     * One of the `TOCItem` static constants.
     * @type {string}
     */
    type = TOCItem.SECTION;

    /**
     * @type {string}
     */
    title = "";

    /**
     * @type {string}
     */
    redirect = "/";

    /**
     * @type {TOCItem[]}
     */
    subitems = [];

    /**
     * @param {string} type - One of the `TOCItem` static constants.
     * @param {string} title
     * @param {string} redirect
     */
    constructor(type, title, redirect)
    {
        this.type = type;
        this.title = title;
        this.redirect = redirect;
    }
}