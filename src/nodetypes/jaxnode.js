/**
 * @fileOverview jaxnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující obecný jaxovsky node
 * @class JAX.JAXNode
 */
JAX.JAXNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.JAXNode",
	VERSION: "1.0"
});

JAX.JAXNode.prototype.$constructor = function() {
	this._node = null;
	this.jaxNodeType = -1;
};

JAX.JAXNode.prototype.$destructor = function() {};

/**
 * @method vrací uzel, který si instance drží
 * @example
 * JAX("#nejakeId").node();
 *
 * @returns {object} node
 */
JAX.JAXNode.prototype.node = function() {
	return this._node;
};

/**
 * @method zjišťuje, zda-li je node platný nebo nikoliv.
 * @example
 * JAX("#nejakeId").exists(); // vrati true pokud byl node s id nekajeId nalezen
 *
 * @returns {Boolean}
 */
JAX.JAXNode.prototype.exists = function() {
	return !!this._node;
};

JAX.JAXNode.prototype.find = function(selector) {
	this._showMessage("JAX.JAXNode.find");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.findAll = function(selector) {
	this._showMessage("JAX.JAXNode.findAll");

	return new JAX.NodeArray([]);
};

JAX.JAXNode.prototype.addClass = function(classNames) {
	this._showMessage("JAX.JAXNode.addClass");

	return this;
};

JAX.JAXNode.prototype.removeClass = function(classNames) {
	this._showMessage("JAX.JAXNode.removeClass");

	return this;
};

JAX.JAXNode.prototype.hasClass = function(className) {
	this._showMessage("JAX.JAXNode.hasClass");

	return false;
};

JAX.JAXNode.prototype.toggleClass = function(className) {
	this._showMessage("JAX.JAXNode.toggleClass");

	return this;
}

JAX.JAXNode.prototype.id = function(id) {
	this._showMessage("JAX.JAXNode.id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.html = function(innerHTML) {
	this._showMessage("JAX.JAXNode.html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.text = function(text) {
	this._showMessage("JAX.JAXNode.text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.add = function(nodes) {
	this._showMessage("JAX.JAXNode.add");

	return this;
};

JAX.JAXNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage("JAX.JAXNode.addBefore");

	return this;
};

JAX.JAXNode.prototype.appendTo = function(node) {
	this._showMessage("JAX.JAXNode.appendTo");

	return this;
};

JAX.JAXNode.prototype.before = function(node) {
	this._showMessage("JAX.JAXNode.before");

	return this;
};

JAX.JAXNode.prototype.after = function(node) {
	this._showMessage("JAX.JAXNode.after");

	return this;
};

JAX.JAXNode.prototype.insertFirstTo = function(node) {
	this._showMessage("JAX.JAXNode.insertFirstTo");

	return this;
};

JAX.JAXNode.prototype.replaceWith = function(node) {
	this._showMessage("JAX.JAXNode.replaceWith");

	return this;
};

JAX.JAXNode.prototype.remove = function() {
	this._showMessage("JAX.JAXNode.remove");

	return this;
};

JAX.JAXNode.prototype.clone = function(withContent) {
	this._showMessage("JAX.JAXNode.clone");

	return this;
};

JAX.JAXNode.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage("JAX.JAXNode.listen");

	return new JAX.Listener(this, null, type, f);
};

JAX.JAXNode.prototype.stopListening = function(listener) {
	this._showMessage("JAX.JAXNode.stopListening");

	return this;
};

JAX.JAXNode.prototype.prop = function(property, value) {
	this._showMessage("JAX.JAXNode.prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.attr = function(property, value) {
	this._showMessage("JAX.JAXNode.attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.css = function(property, value) {
	this._showMessage("JAX.JAXNode.css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.computedCss = function(properties) {
	this._showMessage("JAX.JAXNode.computedCss");

	return typeof(properties) ? "" : {};
};

JAX.JAXNode.prototype.fullSize = function(sizeType, value) {
	this._showMessage("JAX.JAXNode.fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.JAXNode.prototype.size = function(sizeType, value) {
	this._showMessage("JAX.JAXNode.size");

	return arguments.length == 1 ? 0 : this;
};

JAX.JAXNode.prototype.parent = function() {
	this._showMessage("JAX.JAXNode.parent");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.next = function() {
	this._showMessage("JAX.JAXNode.next");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.previous = function() {
	this._showMessage("JAX.JAXNode.previous");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.children = function(index) {
	this._showMessage("JAX.JAXNode.children");

	return arguments.length ? new JAX.JAXNode() : new JAX.NodeArray([]);
};

JAX.JAXNode.prototype.first = function() {
	this._showMessage("JAX.JAXNode.first");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.last = function() {
	this._showMessage("JAX.JAXNode.last");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.clear = function() {
	this._showMessage("JAX.JAXNode.clear");

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.eq = function(node) {
	this._showMessage("JAX.JAXNode.eq");

	return arguments[0] && arguments[0] instanceof JAX.JAXNode;
};

JAX.JAXNode.prototype.contains = function(node) {
	this._showMessage("JAX.JAXNode.contains");

	return false;
};

JAX.JAXNode.prototype.isIn = function(node) {
	this._showMessage("JAX.JAXNode.isIn");

	return false;
};

JAX.JAXNode.prototype.animate = function(property, duration, start, end) {
	this._showMessage("JAX.JAXNode.animate");

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.fade = function(type, duration) {
	this._showMessage("JAX.JAXNode.fade");

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage("JAX.JAXNode.fadeTo");

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.slide = function(type, duration) {
	this._showMessage("JAX.JAXNode.slide");

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype._showMessage = function(method) {
	JAX.Report.show("error", method, "Hey man! You are trying to use unsupported method with my node.", this._node);
};
