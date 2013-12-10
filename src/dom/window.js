/**
 * @fileOverview window.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující object Window
 * @class JAX.Window
 */
JAX.Window = JAK.ClassMaker.makeClass({
	NAME: "JAX.Window",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IJAXNode, JAX.IListening]
});

JAX.Window.prototype.$constructor = function(win) {
	this._node = win;
	this.jaxNodeType = -2;
};

JAX.Window.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	if (sizeType != "width" && sizeType != "height") {
		console.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
	}

	if ("innerWidth" in window) {
		return sizeType == "width" ? window.innerWidth : window.innerHeight;
	} else if ("clientWidth" in document.documentElement) {
		return sizeType == "width" ? document.documentElement.clientWidth : document.documentElement.clientHeight;
	} else if ("clientWidth" in document.body) {
		return sizeType == "width" ? document.body.clientWidth : document.body.clientHeight;
	} else {
		console.error("You have probably unsupported browser.", this._node);
		return 0;
	}
};

JAX.Window.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	if ("pageXOffset" in this._node) {
		var left = this._node.pageXOffset;
		var top = this._node.pageYOffset;
	} else {
		var scrollPosDoc = JAK.DOM.getScrollPos();
		var left = scrollPosDoc.x;
		var top = scrollPosDoc.y;	
	}

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
				this._node.scrollTo(left, value);
			break;
			case "left":
				this._node.scrollTo(value, top);
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
