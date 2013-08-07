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
};

JAX.Node.Null.prototype.$destructor = function() {};

JAX.Node.Null.prototype.node = function() {
	return this._node;
};

JAX.Node.Null.prototype.exists = function() {
	return false;
};

JAX.Node.Null.prototype.find = function() {
	this._showMessage("JAX.Node.Null.find");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.findAll = function() {
	this._showMessage("JAX.Node.Null.findAll");

	return new JAX.NodeArray([]);
};

JAX.Node.Null.prototype.addClass = function() {
	this._showMessage("JAX.Node.Null.addClass");

	return this;
};

JAX.Node.Null.prototype.removeClass = function() {
	this._showMessage("JAX.Node.Null.removeClass");

	return this;
};

JAX.Node.Null.prototype.hasClass = function() {
	this._showMessage("JAX.Node.Null.hasClass");

	return false;
};

JAX.Node.Null.prototype.toggleClass = function() {
	this._showMessage("JAX.Node.Null.toggleClass");

	return this;
}

JAX.Node.Null.prototype.id = function() {
	this._showMessage("JAX.Node.Null.id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.html = function() {
	this._showMessage("JAX.Node.Null.html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.text = function() {
	this._showMessage("JAX.Node.Null.text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.Null.prototype.add = function() {
	this._showMessage("JAX.Node.Null.add");

	return this;
};

JAX.Node.Null.prototype.addBefore = function() {
	this._showMessage("JAX.Node.Null.addBefore");

	return this;
};

JAX.Node.Null.prototype.appendTo = function() {
	this._showMessage("JAX.Node.Null.appendTo");

	return this;
};

JAX.Node.Null.prototype.before = function() {
	this._showMessage("JAX.Node.Null.before");

	return this;
};

JAX.Node.Null.prototype.after = function() {
	this._showMessage("JAX.Node.Null.after");

	return this;
};

JAX.Node.Null.prototype.insertFirstTo = function() {
	this._showMessage("JAX.Node.Null.insertFirstTo");

	return this;
};

JAX.Node.Null.prototype.replaceWith = function() {
	this._showMessage("JAX.Node.Null.replaceWith");

	return this;
};

JAX.Node.Null.prototype.remove = function() {
	this._showMessage("JAX.Node.Null.remove");

	return this;
};

JAX.Node.Null.prototype.clone = function() {
	this._showMessage("JAX.Node.Null.clone");

	return this;
};

JAX.Node.Null.prototype.listen = function() {
	this._showMessage("JAX.Node.Null.listen");

	return new JAX.Listener(this, null, type, f);
};

JAX.Node.Null.prototype.stopListening = function() {
	this._showMessage("JAX.Node.Null.stopListening");

	return this;
};

JAX.Node.Null.prototype.prop = function() {
	this._showMessage("JAX.Node.Null.prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.attr = function() {
	this._showMessage("JAX.Node.Null.attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.css = function() {
	this._showMessage("JAX.Node.Null.css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.Null.prototype.computedCss = function() {
	this._showMessage("JAX.Node.Null.computedCss");

	return typeof(properties) ? "" : {};
};

JAX.Node.Null.prototype.fullSize = function() {
	this._showMessage("JAX.Node.Null.fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.Null.prototype.size = function() {
	this._showMessage("JAX.Node.Null.size");

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.Null.prototype.parent = function() {
	this._showMessage("JAX.Node.Null.parent");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.next = function() {
	this._showMessage("JAX.Node.Null.next");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.previous = function() {
	this._showMessage("JAX.Node.Null.previous");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.children = function() {
	this._showMessage("JAX.Node.Null.children");

	return arguments.length ? new JAX.Node.Null() : new JAX.NodeArray([]);
};

JAX.Node.Null.prototype.first = function() {
	this._showMessage("JAX.Node.Null.first");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.last = function() {
	this._showMessage("JAX.Node.Null.last");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.clear = function() {
	this._showMessage("JAX.Node.Null.clear");

	return new JAX.Node.Null();
};

JAX.Node.Null.prototype.eq = function() {
	this._showMessage("JAX.Node.Null.eq");

	return arguments[0] && arguments[0] instanceof JAX.Node.Null;
};

JAX.Node.Null.prototype.contains = function() {
	this._showMessage("JAX.Node.Null.contains");

	return false;
};

JAX.Node.Null.prototype.isIn = function() {
	this._showMessage("JAX.Node.Null.isIn");

	return false;
};

JAX.Node.Null.prototype.animate = function() {
	this._showMessage("JAX.Node.Null.animate");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.fade = function() {
	this._showMessage("JAX.Node.Null.fade");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.fadeTo = function() {
	this._showMessage("JAX.Node.Null.fadeTo");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype.slide = function() {
	this._showMessage("JAX.Node.Null.slide");

	return new JAK.Promise().reject(this._node);
};

JAX.Node.Null.prototype._showMessage = function(method) {
	JAX.Report.show("error", method, "Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
};
