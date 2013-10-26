/**
 * @fileOverview documentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující document node
 * @class JAX.Document
 */
JAX.Document = JAK.ClassMaker.makeClass({
	NAME: "JAX.Document",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening]
});

JAX.Document.prototype.$constructor = function(doc) {
	this._node = doc;
	this.jaxNodeType = doc.nodeType;
};

JAX.Document.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.Document.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.Document.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		return !!this.find(node).exists();
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		return this._node.contains(n);
	}
	
	console.error("JAX.Element.contains: For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node.");
	return false;
};

JAX.Document.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	switch(sizeType) {
		case "width":
     		 return Math.max(
     		 			this._node.body.scrollWidth, this._node.documentElement.scrollWidth, 
     		 			this._node.body.offsetWidth, this._node.documentElement.offsetWidth, 
     		 			this._node.body.clientWidth, this._node.documentElement.clientWidth
     		 		);
		case "height":
			return Math.max(
     		 			this._node.body.scrollHeight, this._node.documentElement.scrollHeight, 
     		 			this._node.body.offsetHeight, this._node.documentElement.offsetHeight, 
     		 			this._node.body.clientHeight, this._node.documentElement.clientHeight
     		 		);
		default:
			console.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
			return 0;
	}
};

JAX.Document.prototype.fullSize = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	return this.size(sizeType);
};

JAX.Document.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var scrollPos = JAK.DOM.getScrollPos();
	var left = scrollPos.x;
	var top = scrollPos.y;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var targetValue = parseFloat(value);

	if (!isFinite(targetValue)) {
		console.error("I expected Number or string with number for my second argument.", this._node);
		targetValue = 0;
	}

	var type = type.toLowerCase();

	if (!duration) {
		switch(type) {
			case "top":
				this._node.documentElement.scrollTop = value;
			break;
			case "left":
				this._node.documentElement.scrollLeft = value;
			break;
		}
		return this;
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or string with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		fx.run();

	return fx;
};
