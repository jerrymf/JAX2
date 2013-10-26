/**
 * @fileOverview documentfragmentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující documentFragment node
 * @class JAX.DocumentFragment
 */
JAX.DocumentFragment = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentFragment",
	VERSION: "1.0",
	EXTEND: JAX.DOMNode
});

JAX.DocumentFragment.prototype.$constructor = function(doc) {
	this.$super(doc);
};

JAX.DocumentFragment.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.DocumentFragment.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.DocumentFragment.prototype.remove = function() {
	this._showMessage("JAX.DocumentFragment.remove");

	return this;
};

JAX.DocumentFragment.prototype.swapPlaceWith = function(node) {
	this._showMessage("JAX.DocumentFragment.swapPlaceWith");

	return this;
};

JAX.DocumentFragment.prototype.isIn = function(node) {
	this._showMessage("JAX.DocumentFragment.isIn");

	return false;
};

JAX.DocumentFragment.prototype.parent = function() {
	return JAX(null);
};

JAX.DocumentFragment.prototype.next = function() {
	return JAX(null);
};

JAX.DocumentFragment.prototype.previous = function() {
	return JAX(null);
};