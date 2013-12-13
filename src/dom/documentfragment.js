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
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.INodeWithChildren, JAX.IMoveableNode]
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
	console.error("You can not remove documentFragment node.")

	return this;
};

JAX.DocumentFragment.prototype.swapPlaceWith = function(node) {
	console.error("You can not switch place with documentFragment node. Use replaceWith method instead this.")

	return this;
};

JAX.DocumentFragment.prototype.isIn = function(node) {
	console.error("DocumentFragment can not be in DOM. Do not used method isIn.")

	return false;
};

JAX.DocumentFragment.prototype.parent = function() {
	return null;
};

JAX.DocumentFragment.prototype.next = function() {
	return null;
};

JAX.DocumentFragment.prototype.previous = function() {
	return null;
};