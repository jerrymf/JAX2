/**
 * @fileOverview documentfragmentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující documentFragment node
 * @class JAX.DocumentFragmentNode
 */
JAX.DocumentFragmentNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentFragmentNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.DocumentFragmentNode.prototype.$constructor = function(doc) {
	this.$super(doc);
};

JAX.DocumentFragmentNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.DocumentFragmentNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.DocumentFragmentNode.prototype.remove = function() {
	this._showMessage();

	return this;
};
