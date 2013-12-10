/**
 * @fileOverview ijaxnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní, které reprezentuje všechny dostupné metody u všech nodů
 * @class JAX.IJAXNode
 */
JAX.IJAXNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IJAXNode",
	VERSION: "1.0"
});

/**
 * @method najde element odpovídající selectoru v rámci tohoto elementu
 * @see JAX
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.IJAXNode
 * @returns {object} JAX.IJAXNode
 */
JAX.IJAXNode.prototype.find = function(selector) {
	this._showMessage("find");

	return JAX(null);
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto elementu
 * @see JAX.all
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.IJAXNode) | JAX.NodeArray
 * @returns {object} JAX.NodeArray
 */
JAX.IJAXNode.prototype.findAll = function(selector) {
	this._showMessage("findAll");

	return new JAX.NodeArray([]);
};

JAX.IJAXNode.prototype.addClass = function(classNames) {
	this._showMessage("addClass");

	return this;
};

JAX.IJAXNode.prototype.removeClass = function(classNames) {
	this._showMessage("removeClass");

	return this;
};

JAX.IJAXNode.prototype.hasClass = function(className) {
	this._showMessage("hasClass");

	return false;
};

JAX.IJAXNode.prototype.toggleClass = function(className) {
	this._showMessage("toggleClass");

	return this;
}

JAX.IJAXNode.prototype.id = function(id) {
	this._showMessage("id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.IJAXNode.prototype.html = function(innerHTML) {
	this._showMessage("html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.IJAXNode.prototype.text = function(text) {
	this._showMessage("text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.IJAXNode.prototype.add = function(nodes) {
	this._showMessage("add");

	return this;
};

JAX.IJAXNode.prototype.insertFirst = function(node) {
	this._showMessage("inserFirst");

	return this;
};

JAX.IJAXNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage("addBefore");

	return this;
};

JAX.IJAXNode.prototype.appendTo = function(node) {
	this._showMessage("appendTo");

	return this;
};

JAX.IJAXNode.prototype.before = function(node) {
	this._showMessage("before");

	return this;
};

JAX.IJAXNode.prototype.after = function(node) {
	this._showMessage("after");

	return this;
};

JAX.IJAXNode.prototype.replaceWith = function(node) {
	this._showMessage("replaceWith");

	return this;
};

JAX.IJAXNode.prototype.swapPlaceWith = function(node) {
	this._showMessage("swapPlaceWith");

	return this;
};

JAX.IJAXNode.prototype.remove = function() {
	this._showMessage("remove");

	return this;
};

JAX.IJAXNode.prototype.clone = function(withContent) {
	this._showMessage("clone");

	return this;
};

JAX.IJAXNode.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage("listen");

	return new JAX.Listener(this, null, type, funcMethod);
};

JAX.IJAXNode.prototype.stopListening = function(listener) {
	this._showMessage("stopListening");

	return this;
};

JAX.IJAXNode.prototype.prop = function(property, value) {
	this._showMessage("prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.IJAXNode.prototype.attr = function(property, value) {
	this._showMessage("attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.IJAXNode.prototype.css = function(property, value) {
	this._showMessage("css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.IJAXNode.prototype.computedCss = function(properties) {
	this._showMessage("computedCss");

	return typeof(properties) ? "" : {};
};

JAX.IJAXNode.prototype.fullSize = function(sizeType, value) {
	this._showMessage("fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.IJAXNode.prototype.size = function(sizeType, value) {
	this._showMessage("size");

	return arguments.length == 1 ? 0 : this;
};

JAX.IJAXNode.prototype.parent = function() {
	this._showMessage("parent");

	return null;
};

JAX.IJAXNode.prototype.next = function() {
	this._showMessage("next");

	return null;
};

JAX.IJAXNode.prototype.previous = function() {
	this._showMessage("previous");

	return null;
};

JAX.IJAXNode.prototype.children = function(index) {
	this._showMessage("children");

	return arguments.length ? new JAX.IJAXNode() : new JAX.NodeArray([]);
};

JAX.IJAXNode.prototype.first = function() {
	this._showMessage("first");

	return null;
};

JAX.IJAXNode.prototype.last = function() {
	this._showMessage("last");

	return null;
};

JAX.IJAXNode.prototype.clear = function() {
	this._showMessage("clear");

	return null;
};

JAX.IJAXNode.prototype.eq = function(node) {
	this._showMessage("eq");

	return false;
};

JAX.IJAXNode.prototype.contains = function(node) {
	this._showMessage("contains");

	return false;
};

JAX.IJAXNode.prototype.isIn = function(node) {
	this._showMessage("isIn");

	return false;
};

JAX.IJAXNode.prototype.animate = function(property, duration, start, end) {
	this._showMessage("animate");

	return new JAK.Promise().reject(this._node);
};

JAX.IJAXNode.prototype.fade = function(type, duration) {
	this._showMessage("fade");

	return new JAK.Promise().reject(this._node);
};

JAX.IJAXNode.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage("fadeTo");

	return new JAK.Promise().reject(this._node);
};

JAX.IJAXNode.prototype.slide = function(type, duration) {
	this._showMessage("slide");

	return new JAK.Promise().reject(this._node);
};

JAX.IJAXNode.prototype.scroll = function(type, value, duration) {
	this._showMessage("scroll");

	return new JAK.Promise().reject(this._node);
};

JAX.IJAXNode.prototype._showMessage = function(method) {
	console.error("You are trying to use unsupported method '" + method + "' with my node.", this._node);
};

JAX.IJAXNode.prototype._contains = function(node) {
	var n = node;

	while(n && n.nodeType != 11 && n.nodeType != 9) {
		if (n == this._node) { return true; }
		n = n.parentNode;
	}

	return false;
};