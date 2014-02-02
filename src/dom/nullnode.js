/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.NullNode
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
 */
JAX.NullNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.NullNode",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IMoveableNode, JAX.INodeWithChildren, JAX.IListening, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]
});

JAX.NullNode.prototype.$constructor = function(selector) {
	this.$super(null);
	this._selector = selector || "";

	this.jaxNodeType = JAX.NULL;
	
	this.isNull = true;
	
	this.isSearchable = false;
	this.isListenable = false;
	this.isScrollable = false;
	this.isMoveable = false;
	this.isRemoveable = false;
	this.canHaveChildren = false;
};

JAX.NullNode.prototype.find = function() {
	this._showMessage("find");

	return JAX(null);
};

JAX.NullNode.prototype.findAll = function() {
	this._showMessage("findAll");

	return new JAX.NodeArray([]);
};

JAX.NullNode.prototype.addClass = function() {
	this._showMessage("addClass");

	return this;
};

JAX.NullNode.prototype.removeClass = function() {
	this._showMessage("removeClass");

	return this;
};

JAX.NullNode.prototype.hasClass = function() {
	this._showMessage("hasClass");

	return false;
};

JAX.NullNode.prototype.toggleClass = function() {
	this._showMessage("toggleClass");

	return this;
}

JAX.NullNode.prototype.id = function() {
	this._showMessage("id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.html = function() {
	this._showMessage("html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.text = function() {
	this._showMessage("text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.add = function() {
	this._showMessage("add");

	return this;
};

JAX.NullNode.prototype.insertFirst = function() {
	this._showMessage("inserFirst");

	return this;
};

JAX.NullNode.prototype.insertFirstTo = function() {
	this._showMessage("inserFirstTo");

	return this;
};

JAX.NullNode.prototype.addBefore = function() {
	this._showMessage("addBefore");

	return this;
};

JAX.NullNode.prototype.appendTo = function() {
	this._showMessage("appendTo");

	return this;
};

JAX.NullNode.prototype.before = function() {
	this._showMessage("before");

	return this;
};

JAX.NullNode.prototype.after = function() {
	this._showMessage("after");

	return this;
};

JAX.NullNode.prototype.replaceWith = function() {
	this._showMessage("replaceWith");

	return this;
};

JAX.NullNode.prototype.swapPlaceWith = function() {
	this._showMessage("swapPlaceWith");

	return this;
};

JAX.NullNode.prototype.remove = function() {
	this._showMessage("remove");

	return this;
};

JAX.NullNode.prototype.clone = function() {
	this._showMessage("clone");

	return this;
};

JAX.NullNode.prototype.listen = function() {
	this._showMessage("listen");

	return new JAX.Listener(this, null, arguments[0], arguments[2]);
};

JAX.NullNode.prototype.stopListening = function() {
	this._showMessage("stopListening");

	return this;
};

JAX.NullNode.prototype.prop = function() {
	this._showMessage("prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.attr = function() {
	this._showMessage("attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.css = function() {
	this._showMessage("css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.computedCss = function() {
	this._showMessage("computedCss");

	return typeof(arguments[0]) ? "" : {};
};

JAX.NullNode.prototype.fullSize = function() {
	this._showMessage("fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.size = function() {
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

JAX.NullNode.prototype.children = function() {
	this._showMessage("children");

	return arguments.length ? null : new JAX.NodeArray([]);
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

JAX.NullNode.prototype.eq = function() {
	this._showMessage("eq");

	return false;
};

JAX.NullNode.prototype.contains = function() {
	this._showMessage("contains");

	return false;
};

JAX.NullNode.prototype.isIn = function() {
	this._showMessage("isIn");

	return false;
};

JAX.NullNode.prototype.animate = function() {
	this._showMessage("animate");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fade = function() {
	this._showMessage("fade");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fadeTo = function() {
	this._showMessage("fadeTo");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.slide = function() {
	this._showMessage("slide");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.scroll = function() {
	this._showMessage("scroll");

	return  new JAX.FX.Scrolling(null);
};

JAX.NullNode.prototype._showMessage = function(method) {
	if (this._selector) {
		console.error("You are trying to work with null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
	}
};
