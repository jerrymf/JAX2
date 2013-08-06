/**
 * @fileOverview node-null.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.Node.Null
 */
JAX.Node.Null = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node.Null",
	VERSION: "1.0"
});

JAX.Node.Null.prototype.$constructor = function() {
	this._node = null;
	this.jaxNodeType = -1;
	JAX.Report.show("error", "JAX.Node.Null.constructor", "Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
};

JAX.Node.Null.prototype.$destructor = function() {};

JAX.Node.Null.prototype.node = function() {
	return this._node;
};

JAX.Node.Null.prototype.exists = function() {
	return false;
};

JAX.Node.Null.prototype.find = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.findAll = function() {
	return new JAX.NodeArray([]);
};

JAX.Node.Null.prototype.addClass = function() {
	return this;
};

JAX.Node.Null.prototype.removeClass = function() {
	return this;
};

JAX.Node.Null.prototype.hasClass = function() {
	return false;
};

JAX.Node.Null.prototype.toggleClass = function() {
	return this;
}

JAX.Node.Null.prototype.id = function() {
	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.html = function() {
	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.text = function(text) {
	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.add = function() {
	return this;
};

JAX.Node.Null.prototype.addBefore = function() {
	return this;
};

JAX.Node.Null.prototype.appendTo = function() {
	return this;
};

JAX.Node.Null.prototype.before = function() {
	return this;
};

JAX.Node.Null.prototype.after = function() {
	return this;
};

JAX.Node.Null.prototype.insertFirstTo = function() {
	return this;
};

JAX.Node.Null.prototype.replaceWith = function() {
	return this;
};

JAX.Node.Null.prototype.remove = function() {
	return this;
};

JAX.Node.Null.prototype.clone = function() {
	return this;
};

JAX.Node.Null.prototype.listen = function() {
	return new JAX.Listener(this, null, type, f);
};

JAX.Node.Null.prototype.stopListening = function() {
	return this;
};

JAX.Node.Null.prototype.prop = function() {
	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.attr = function() {
	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.css = function() {
	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.computedCss = function() {
	return typeof(properties) ? "" : {};
};

JAX.Node.Null.prototype.fullSize = function() {
	return arguments.length == 1 ? 0 : this;
};

JAX.Node.Null.prototype.size = function() {
	return arguments.length == 1 ? 0 : this;
};

JAX.Node.Null.prototype.parent = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.next = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.previous = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.children = function() {
	return arguments.length ? new JAX.Node.Null() : new JAX.NodeArray([]);
};

JAX.Node.Null.prototype.first = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.last = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.clear = function() {
	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.eq = function() {
	return arguments[0] && arguments[0] instanceof JAX.Node.Null;
};

JAX.Node.Null.prototype.contains = function() {
	return false;
};

JAX.Node.Null.prototype.isIn = function() {
	return false;
};

JAX.Node.Null.prototype.animate = function() {
	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.fade = function() {
	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.fadeTo = function() {
	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.slide = function() {
	return new JAK.Promise().reject(this._node);
};