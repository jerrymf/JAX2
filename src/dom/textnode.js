/**
 * @fileOverview textnode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.TextNode
 * je třída reprezentující text node a comment node (elm.nodeType == 3 || elm.nodeType == 8). Implementuje rozhraní {@link JAX.IMoveableNode}
 *
 * @param {object} node objekt typu window.Text
 */
JAX.TextNode = function(node) {
	this.___parent___.call(this, node);

	this.isText = true;

	this.isMoveable = true;
	this.isRemoveable = true;
};

JAX.extend(JAX.TextNode, JAX.Node);
JAX.mixin(JAX.TextNode, JAX.IMoveableNode);

/**
 * nastaví nebo vrátí textovou hodnotu uzlu
 *
 * @param {string || undefined} text textový řetězec
 * @returns {JAX.Node || string} JAX.Node
 */
JAX.TextNode.prototype.text = function(text) {
	if (!arguments.length) { 
		return this._node.nodeValue;
	}

	this._node.nodeValue = text;

	return this;
};

/**
 * nastaví textovou hodnotu na prázdný řetězec
 *
 * @returns {JAX.Node}
 */
JAX.TextNode.prototype.clear = function() {
	this._node.nodeValue = "";
	return this;
};

/**
 * porovná sama sebe se zadaným parametrem. Pokud se jedná o stejný node, vrátí true.
 *
 * @param {object} node DOM uzel nebo instance JAX.Node
 * @returns {boolean}
 */
JAX.TextNode.prototype.eq = function(node) {
	if (!node) { return false; }
	var jaxElm = node instanceof JAX.Node ? node : JAX(node);
	return jaxElm.n == this._node;
};
