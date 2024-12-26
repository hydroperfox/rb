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
            if (c.nodeType == c.ELEMENT_NODE && XMLUtil.testName(nsURI, localName))
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
    testName(element, nsURI, localName) {
        if (nsURI === null && localName == "*")
        {
            return true;
        }
        return element.tagName == localName && element.namespaceURI === nsURI;
    },
};