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
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.findAll = function(selector) {
	this._showMessage();

	return new JAX.NodeArray([]);
};

JAX.JAXNode.prototype.addClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.removeClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.hasClass = function(className) {
	this._showMessage();

	return false;
};

JAX.JAXNode.prototype.toggleClass = function(className) {
	this._showMessage();

	return this;
}

JAX.JAXNode.prototype.id = function(id) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.html = function(innerHTML) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.text = function(text) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.JAXNode.prototype.add = function(nodes) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.insertFirst = function(node) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.appendTo = function(node) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.before = function(node) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.after = function(node) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.replaceWith = function(node) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.remove = function() {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.clone = function(withContent) {
	this._showMessage("JAX.JAXNode.clone");

	return this;
};

JAX.JAXNode.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage();

	return new JAX.Listener(this, null, type, f);
};

JAX.JAXNode.prototype.stopListening = function(listener) {
	this._showMessage();

	return this;
};

JAX.JAXNode.prototype.prop = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.attr = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.css = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.JAXNode.prototype.computedCss = function(properties) {
	this._showMessage();

	return typeof(properties) ? "" : {};
};

JAX.JAXNode.prototype.fullSize = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.JAXNode.prototype.size = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.JAXNode.prototype.parent = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.next = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.previous = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.children = function(index) {
	this._showMessage();

	return arguments.length ? new JAX.JAXNode() : new JAX.NodeArray([]);
};

JAX.JAXNode.prototype.first = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.last = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.clear = function() {
	this._showMessage();

	return new JAX.JAXNode();
};

JAX.JAXNode.prototype.eq = function(node) {
	this._showMessage();

	return arguments[0] && arguments[0] instanceof JAX.JAXNode;
};

JAX.JAXNode.prototype.contains = function(node) {
	this._showMessage();

	return false;
};

JAX.JAXNode.prototype.isIn = function(node) {
	this._showMessage();

	return false;
};

JAX.JAXNode.prototype.animate = function(property, duration, start, end) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.fade = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype.slide = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.JAXNode.prototype._showMessage = function(method) {
	JAX.Report.error("I have bad feeling about this! You are trying to use unsupported method with my node.", this._node);
};
