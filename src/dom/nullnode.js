/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.NullNode
 * je třída reprezentující nullový node - návrhový vzor Null object. Implementuje následující rozhraní: {@link JAX.INodeWithChildren}, {@link JAX.IMoveableNode}, {@link JAX.ISearchableNode}, {@link JAX.IListening}, {@link JAX.IAnimateableNode}, {@link JAX.IScrollableNode}
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
 *
 * @param {string} selector CSS3 (CSS 2.1) selector, který selhal
 */
JAX.NullNode = function(selector) {
	this.__parent__.call(this, null);

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

JAX.extend(JAX.NullNode, JAX.Node);
JAX.mixin(JAX.NullNode, [JAX.IMoveableNode, JAX.INodeWithChildren, JAX.IListening, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]);

JAX.NullNode.prototype.find = function() {
	this._showMessage("find", Array.prototype.slice.call(arguments));

	return JAX(null);
};

JAX.NullNode.prototype.findAll = function() {
	this._showMessage("findAll", Array.prototype.slice.call(arguments));

	return new JAX.NodeArray([]);
};

JAX.NullNode.prototype.addClass = function() {
	this._showMessage("addClass", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.removeClass = function() {
	this._showMessage("removeClass", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.hasClass = function() {
	this._showMessage("hasClass", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.toggleClass = function() {
	this._showMessage("toggleClass", Array.prototype.slice.call(arguments));

	return this;
}

JAX.NullNode.prototype.id = function() {
	this._showMessage("id", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.html = function() {
	this._showMessage("html", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.text = function() {
	this._showMessage("text", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.add = function() {
	this._showMessage("add", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.insertFirst = function() {
	this._showMessage("inserFirst", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.insertFirstTo = function() {
	this._showMessage("inserFirstTo", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.addBefore = function() {
	this._showMessage("addBefore", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.appendTo = function() {
	this._showMessage("appendTo", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.before = function() {
	this._showMessage("before", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.after = function() {
	this._showMessage("after", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.replaceWith = function() {
	this._showMessage("replaceWith", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.swapPlaceWith = function() {
	this._showMessage("swapPlaceWith", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.remove = function() {
	this._showMessage("remove", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.clone = function() {
	this._showMessage("clone", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.listen = function() {
	this._showMessage("listen", Array.prototype.slice.call(arguments));

	return new JAX.Listener(this, null, arguments[0], arguments[2]);
};

JAX.NullNode.prototype.stopListening = function() {
	this._showMessage("stopListening", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.prop = function() {
	this._showMessage("prop", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.attr = function() {
	this._showMessage("attr", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.removeAttr = function() {
	this._showMessage("removeAttr", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.css = function() {
	this._showMessage("css", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.computedCss = function() {
	this._showMessage("computedCss", Array.prototype.slice.call(arguments));

	return typeof(arguments[0]) ? "" : {};
};

JAX.NullNode.prototype.fullSize = function() {
	this._showMessage("fullSize", Array.prototype.slice.call(arguments));

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.size = function() {
	this._showMessage("size", Array.prototype.slice.call(arguments));

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.parent = function() {
	this._showMessage("parent", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.next = function() {
	this._showMessage("next", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.previous = function() {
	this._showMessage("previous", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.children = function() {
	this._showMessage("children", Array.prototype.slice.call(arguments));

	return arguments.length ? null : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.elements = function() {
	this._showMessage("elements", Array.prototype.slice.call(arguments));

	return arguments.length ? null : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.first = function() {
	this._showMessage("first", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.last = function() {
	this._showMessage("last", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.clear = function() {
	this._showMessage("clear", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.eq = function() {
	this._showMessage("eq", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.contains = function() {
	this._showMessage("contains", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.isIn = function() {
	this._showMessage("isIn", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.animate = function() {
	this._showMessage("animate", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fade = function() {
	this._showMessage("fade", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fadeTo = function() {
	this._showMessage("fadeTo", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.slide = function() {
	this._showMessage("slide", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.scroll = function() {
	this._showMessage("scroll", Array.prototype.slice.call(arguments));

	return  new JAX.FX.Scrolling(null);
};

JAX.NullNode.prototype._showMessage = function(method, args) {
	var argsSerialized = "";
	for (var i=0, len=args.length; i<len; i++) {
		if (i) { argsSerialized += ", "; }
		
		try {
			argsSerialized += JSON.stringify(args[i]);
		} catch(e) {
			argsSerialized += "probably cyclic object";
		}
	}

	if (this._selector) {
		console.error("Hey man! You are trying to call '" + method + "(" + argsSerialized + ")' for null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Shit, it's screwed up! You are trying to call '" + method + "(" + argsSerialized + ")' for object that is not node (probably it is null or undefined).");
	}
};
