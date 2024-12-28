export const XMLUtil = {
    /**
     * @param {Node} node
     * @param {string | null} nsURI
     * @param {string} localName
     * @returns {Element[]}
     */
    elements(node, nsURI = null, localName = "*")
    {
        const r = [];
        for (let i = 0, l = node.childNodes.length; i < l; ++i)
        {
            const c = node.childNodes[i];
            if (c.nodeType == c.ELEMENT_NODE && XMLUtil.testName(c, nsURI, localName))
            {
                r.push(c);
            }
        }
        return r;
    },

    /**
     * @param {Node} node
     * @param {string | null} nsURI
     * @param {string} localName
     * @returns {Element | null}
     */
    element(node, nsURI = null, localName = "*")
    {
        const r = XMLUtil.elements(node, nsURI, localName);
        return r.length == 0 ? null : r[0];
    },

    /**
     * @param {Element} element
     * @param {string | null} nsURI 
     * @param {string} localName 
     * @returns {boolean}
     */
    testName(element, nsURI, localName)
    {
        if (nsURI === null && localName == "*")
        {
            return true;
        }
        return element.tagName == localName && element.namespaceURI === nsURI;
    },
};

/**
 * Utilities for simple forward slash (`/`) based paths.
 */
export const CommonPathUtil = {
    /**
     * @param {...string[]} paths 
     * @returns string
     */
    join(...paths)
    {
        const r = [];
        let startSlash = false;
        for (let p of paths)
        {
            const startsWithSlash = p.startsWith("/");
            startSlash = startSlash || startsWithSlash;
            p = startsWithSlash ? p.slice(1) : p;
            p = p.endsWith("/") ? p.slice(0, p.length - 1) : p;
            r.push(p);
        }
        return (startSlash || r.length == 0 ? "/" : "") + r.join("/");
    },

    /**
     * @param {string} p - A relative slash path.
     * @returns {string}
     */
    pathToRoot(p)
    {
        return "../".repeat(p.split(/[\/\\]+/g).length);
    },

    /**
     * @param {string} p - A simple slash path.
     * @returns {string}
     */
    excludeTrailingSlash(p)
    {
        p = p.replace(/[\\\/]+/g, "/");
        return p.endsWith("/") ? p.slice(0, p.length - 1) : p;
    },
};