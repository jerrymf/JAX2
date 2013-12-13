/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.NullNode
 */
JAX.NullNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.NullNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.NullNode.prototype.$constructor = function(selector) {
	this.$super(null);
	this._selector = selector || "";

	this.jaxNodeType = -1;
	this._setFlags();
};

JAX.NullNode.prototype.find = function(selector) {
	this._showMessage("find");

	return JAX(null);
};

JAX.NullNode.prototype.findAll = function(selector) {
	this._showMessage("findAll");

	return new JAX.NodeArray([]);
};

JAX.NullNode.prototype.addClass = function(classNames) {
	this._showMessage("addClass");

	return this;
};

JAX.NullNode.prototype.removeClass = function(classNames) {
	this._showMessage("removeClass");

	return this;
};

JAX.NullNode.prototype.hasClass = function(className) {
	this._showMessage("hasClass");

	return false;
};

JAX.NullNode.prototype.toggleClass = function(className) {
	this._showMessage("toggleClass");

	return this;
}

JAX.NullNode.prototype.id = function(id) {
	this._showMessage("id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.html = function(innerHTML) {
	this._showMessage("html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.text = function(text) {
	this._showMessage("text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.add = function(nodes) {
	this._showMessage("add");

	return this;
};

JAX.NullNode.prototype.insertFirst = function(node) {
	this._showMessage("inserFirst");

	return this;
};

JAX.NullNode.prototype.insertFirstTo = function(node) {
	this._showMessage("inserFirstTo");

	return this;
};

JAX.NullNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage("addBefore");

	return this;
};

JAX.NullNode.prototype.appendTo = function(node) {
	this._showMessage("appendTo");

	return this;
};

JAX.NullNode.prototype.before = function(node) {
	this._showMessage("before");

	return this;
};

JAX.NullNode.prototype.after = function(node) {
	this._showMessage("after");

	return this;
};

JAX.NullNode.prototype.replaceWith = function(node) {
	this._showMessage("replaceWith");

	return this;
};

JAX.NullNode.prototype.swapPlaceWith = function(node) {
	this._showMessage("swapPlaceWith");

	return this;
};

JAX.NullNode.prototype.remove = function() {
	this._showMessage("remove");

	return this;
};

JAX.NullNode.prototype.clone = function(withContent) {
	this._showMessage("clone");

	return this;
};

JAX.NullNode.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage("listen");

	return new JAX.Listener(this, null, type, funcMethod);
};

JAX.NullNode.prototype.stopListening = function(listener) {
	this._showMessage("stopListening");

	return this;
};

JAX.NullNode.prototype.prop = function(property, value) {
	this._showMessage("prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.attr = function(property, value) {
	this._showMessage("attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.css = function(property, value) {
	this._showMessage("css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.computedCss = function(properties) {
	this._showMessage("computedCss");

	return typeof(properties) ? "" : {};
};

JAX.NullNode.prototype.fullSize = function(sizeType, value) {
	this._showMessage("fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.size = function(sizeType, value) {
	this._showMessage("size");

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.parent = function() {
	this._showMessage("parent");

	return null;
};

JAX.NullNode.prototype.next = function() {
	this._showMessage("next");

	return null;
};

JAX.NullNode.prototype.previous = function() {
	this._showMessage("previous");

	return null;
};

JAX.NullNode.prototype.children = function(index) {
	this._showMessage("children");

	return arguments.length ? new this.constructor() : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.first = function() {
	this._showMessage("first");

	return null;
};

JAX.NullNode.prototype.last = function() {
	this._showMessage("last");

	return null;
};

JAX.NullNode.prototype.clear = function() {
	this._showMessage("clear");

	return null;
};

JAX.NullNode.prototype.eq = function(node) {
	this._showMessage("eq");

	return false;
};

JAX.NullNode.prototype.contains = function(node) {
	this._showMessage("contains");

	return false;
};

JAX.NullNode.prototype.isIn = function(node) {
	this._showMessage("isIn");

	return false;
};

JAX.NullNode.prototype.animate = function(property, duration, start, end) {
	this._showMessage("animate");

	return new JAK.Promise().reject(this._node);
};

JAX.NullNode.prototype.fade = function(type, duration) {
	this._showMessage("fade");

	return new JAK.Promise().reject(this._node);
};

JAX.NullNode.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage("fadeTo");

	return new JAK.Promise().reject(this._node);
};

JAX.NullNode.prototype.slide = function(type, duration) {
	this._showMessage("slide");

	return new JAK.Promise().reject(this._node);
};

JAX.NullNode.prototype.scroll = function(type, value, duration) {
	this._showMessage("scroll");

	return new JAK.Promise().reject(this._node);
};

JAX.NullNode.prototype._showMessage = function(method) {
	if (this._selector) {
		console.error("You are trying to work with null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
	}
};
