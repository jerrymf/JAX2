/**
 * @fileOverview jaxnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující obecný jaxovsky node
 * @class JAX.INode
 */
JAX.INode = JAK.ClassMaker.makeClass({
	NAME: "JAX.INode",
	VERSION: "1.0"
});

JAX.INode.prototype.$constructor = function() {
	this._node = null;
	this.jaxNodeType = -1;
};

JAX.INode.prototype.$destructor = function() {};

/**
 * @method vrací uzel, který si instance drží
 * @example
 * JAX("#nejakeId").node();
 *
 * @returns {object} node
 */
JAX.INode.prototype.node = function() {
	return this._node;
};

/**
 * @method zjišťuje, zda-li je node platný nebo nikoliv.
 * @example
 * JAX("#nejakeId").exists(); // vrati true pokud byl node s id nekajeId nalezen
 *
 * @returns {Boolean}
 */
JAX.INode.prototype.exists = function() {
	return !!this._node;
};

JAX.INode.prototype.find = function(selector) {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.findAll = function(selector) {
	this._showMessage();

	return new JAX.NodeArray([]);
};

JAX.INode.prototype.addClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.removeClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.hasClass = function(className) {
	this._showMessage();

	return false;
};

JAX.INode.prototype.toggleClass = function(className) {
	this._showMessage();

	return this;
}

JAX.INode.prototype.id = function(id) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.INode.prototype.html = function(innerHTML) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.INode.prototype.text = function(text) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.INode.prototype.add = function(nodes) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.insertFirst = function(node) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.appendTo = function(node) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.before = function(node) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.after = function(node) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.replaceWith = function(node) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.remove = function() {
	this._showMessage();

	return this;
};

JAX.INode.prototype.clone = function(withContent) {
	this._showMessage("JAX.INode.clone");

	return this;
};

JAX.INode.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage();

	return new JAX.Listener(this, null, type, f);
};

JAX.INode.prototype.stopListening = function(listener) {
	this._showMessage();

	return this;
};

JAX.INode.prototype.prop = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.INode.prototype.attr = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.INode.prototype.css = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.INode.prototype.computedCss = function(properties) {
	this._showMessage();

	return typeof(properties) ? "" : {};
};

JAX.INode.prototype.fullSize = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.INode.prototype.size = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.INode.prototype.parent = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.next = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.previous = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.children = function(index) {
	this._showMessage();

	return arguments.length ? new JAX.INode() : new JAX.NodeArray([]);
};

JAX.INode.prototype.first = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.last = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.clear = function() {
	this._showMessage();

	return new JAX.INode();
};

JAX.INode.prototype.eq = function(node) {
	this._showMessage();

	return arguments[0] && arguments[0] instanceof JAX.INode;
};

JAX.INode.prototype.contains = function(node) {
	this._showMessage();

	return false;
};

JAX.INode.prototype.isIn = function(node) {
	this._showMessage();

	return false;
};

JAX.INode.prototype.animate = function(property, duration, start, end) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.INode.prototype.fade = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.INode.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.INode.prototype.slide = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.INode.prototype._showMessage = function(method) {
	JAX.Report.error("I have bad feeling about this! You are trying to use unsupported method with my node.", this._node);
};
