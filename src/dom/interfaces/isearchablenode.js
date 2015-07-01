/**
 * @fileOverview isearchablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.ISearchableNode
 * tvoří rozhraní pro nody, které lze prohledávat pomocí querySelector a querySelectorAll
 */
JAX.ISearchableNode = function() {};

/**
 * najde element odpovídající selectoru v rámci tohoto elementu
 *
 * @param {string | object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.ISearchableNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * najde elementy odpovídají selectoru v rámci tohoto elementu
 *
 * @param {string | object | array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object)
 * @returns {JAX.NodeArray}
 */
JAX.ISearchableNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};