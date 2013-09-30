/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * Obecná třída reprezentující obecný JAXovský element
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.1"
});

/**
 * @param {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

JAX.Node.prototype.$destructor = function() {};

/**
 * @method vrací uzel, který si instance drží
 *
 * @returns {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * @method zjišťuje, zda-li je obsah platný nebo nikoliv.
 *
 * @returns {boolean}
 */
JAX.Node.prototype.exists = function() {
	return !!this._node;
};

/**
 * @method najde element odpovídající selectoru v rámci tohoto elementu
 * @see JAX
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.Node.prototype.find = function(selector) {
	this._showMessage("find");

	return new JAX.Node();
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto elementu
 * @see JAX.all
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.Node) | JAX.NodeArray
 * @returns {object} JAX.NodeArray
 */
JAX.Node.prototype.findAll = function(selector) {
	this._showMessage("findAll");

	return new JAX.NodeArray([]);
};

JAX.Node.prototype.addClass = function(classNames) {
	this._showMessage("addClass");

	return this;
};

JAX.Node.prototype.removeClass = function(classNames) {
	this._showMessage("removeClass");

	return this;
};

JAX.Node.prototype.hasClass = function(className) {
	this._showMessage("hasClass");

	return false;
};

JAX.Node.prototype.toggleClass = function(className) {
	this._showMessage("toggleClass");

	return this;
}

JAX.Node.prototype.id = function(id) {
	this._showMessage("id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.html = function(innerHTML) {
	this._showMessage("html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.text = function(text) {
	this._showMessage("text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.add = function(nodes) {
	this._showMessage("add");

	return this;
};

JAX.Node.prototype.insertFirst = function(node) {
	this._showMessage("inserFirst");

	return this;
};

JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage("addBefore");

	return this;
};

JAX.Node.prototype.appendTo = function(node) {
	this._showMessage("appendTo");

	return this;
};

JAX.Node.prototype.before = function(node) {
	this._showMessage("before");

	return this;
};

JAX.Node.prototype.after = function(node) {
	this._showMessage("after");

	return this;
};

JAX.Node.prototype.replaceWith = function(node) {
	this._showMessage("replaceWith");

	return this;
};

JAX.Node.prototype.swapPlaceWith = function(node) {
	this._showMessage("swapPlaceWith");

	return this;
};

JAX.Node.prototype.remove = function() {
	this._showMessage("remove");

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	this._showMessage("clone");

	return this;
};

JAX.Node.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage("listen");

	return new JAX.Listener(this, null, type, f);
};

JAX.Node.prototype.stopListening = function(listener) {
	this._showMessage("stopListening");

	return this;
};

JAX.Node.prototype.prop = function(property, value) {
	this._showMessage("prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.attr = function(property, value) {
	this._showMessage("attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.css = function(property, value) {
	this._showMessage("css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.computedCss = function(properties) {
	this._showMessage("computedCss");

	return typeof(properties) ? "" : {};
};

JAX.Node.prototype.fullSize = function(sizeType, value) {
	this._showMessage("fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.prototype.size = function(sizeType, value) {
	this._showMessage("size");

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.prototype.parent = function() {
	this._showMessage("parent");

	return new JAX.Node();
};

JAX.Node.prototype.next = function() {
	this._showMessage("next");

	return new JAX.Node();
};

JAX.Node.prototype.previous = function() {
	this._showMessage("previous");

	return new JAX.Node();
};

JAX.Node.prototype.children = function(index) {
	this._showMessage("children");

	return arguments.length ? new JAX.Node() : new JAX.NodeArray([]);
};

JAX.Node.prototype.first = function() {
	this._showMessage("first");

	return new JAX.Node();
};

JAX.Node.prototype.last = function() {
	this._showMessage("last");

	return new JAX.Node();
};

JAX.Node.prototype.clear = function() {
	this._showMessage("clear");

	return new JAX.Node();
};

JAX.Node.prototype.eq = function(node) {
	this._showMessage("eq");

	return arguments[0] && arguments[0] instanceof JAX.Node;
};

JAX.Node.prototype.contains = function(node) {
	this._showMessage("contains");

	return false;
};

JAX.Node.prototype.isIn = function(node) {
	this._showMessage("isIn");

	return false;
};

JAX.Node.prototype.animate = function(property, duration, start, end) {
	this._showMessage("animate");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.fade = function(type, duration) {
	this._showMessage("fade");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage("fadeTo");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.slide = function(type, duration) {
	this._showMessage("slide");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.scroll = function(type, value, duration) {
	this._showMessage("scroll");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype._showMessage = function(method) {
	console.error("You are trying to use unsupported method '" + method + "' with my node.", this._node);
};
