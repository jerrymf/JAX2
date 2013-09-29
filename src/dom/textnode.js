/**
 * @fileOverview textnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující text node a comment node (nodeType == 3 || nodeType == 8)
 * @class JAX.TextNode
 */
JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.0",
	EXTEND: JAX.DOMNode
});

JAX.TextNode.prototype.$constructor = function(node) {
	this.$super(node);
};

JAX.TextNode.prototype.text = function(text) {
	if (!arguments.length) { 
		return this._node.nodeValue;
	}

	this._node.nodeValue = text;

	return this;
};

JAX.TextNode.prototype.clear = function() {
	this._node.nodeValue = "";
	return this;
};

JAX.TextNode.prototype.eq = function(node) {
	if (!node) { return false; }
	var elm = node.jaxNodeType ? node.node() : node;
	return elm == this._node;
};

JAX.TextNode.prototype.add = function(nodes) {
	this._showMessage();

	return this;
};

JAX.TextNode.prototype.insertFirst = function(node, nodeBefore) {
	this._showMessage();

	return this;
};

JAX.TextNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage();

	return this;
};
