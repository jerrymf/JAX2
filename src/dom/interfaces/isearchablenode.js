/**
 * @fileOverview isearchablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které lze prohledávat pomocí querySelector a querySelectorAll
 * @class
 */
JAX.ISearchableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.ISearchableNode",
	VERSION: "1.0"
});

/**
 * @method najde element odpovídající selectoru v rámci tohoto elementu
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object}
 */
JAX.ISearchableNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto elementu
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object
 * @returns {object}
 */
JAX.ISearchableNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};