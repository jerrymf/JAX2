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
	IMPLEMENT: [JAX.IListening]
});

JAX.Window.prototype.$constructor = function(win) {
	this._node = win;
	this.jaxNodeType = -2;
};

JAX.Window.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		JAX.Report.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	if (sizeType != "width" && sizeType != "height") {
		JAX.Report.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
	}

	if ("innerWidth" in window) {
		return sizeType == "width" ? window.innerWidth : window.innerHeight;
	} else if ("clientWidth" in document.documentElement) {
		return sizeType == "width" ? document.documentElement.clientWidth : document.documentElement.clientHeight;
	} else if ("clientWidth" in document.body) {
		return sizeType == "width" ? document.body.clientWidth : document.body.clientHeight;
	} else {
		JAX.Report.error("You have probably unsupported browser.", this._node);
		return 0;
	}
};

JAX.Window.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		JAX.Report.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var top = ("pageYOffset" in this._node) ? this._node.pageYOffset : (this._node.document.documentElement || this._node.document.body).scrollTop;
	var left = ("pageXOffset" in this._node) ? this._node.pageXOffset : (this._node.document.documentElement || this._node.document.body).scrollLeft;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				JAX.Report.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var parsedValue = parseFloat(value);

	if (!isFinite(parsedValue)) {
		JAX.Report.error("I expected Number or string with number for my second argument.", this._node);
		parsedValue = 0;
	}

	switch(type.toLowerCase()) {
		case "top":
			this._node.scrollTo(left, parsedValue);
		break;
		case "left":
			this._node.scrollTo(parsedValue, top);
		break;
		default:
			JAX.Report.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
	}

	/*return new JAK.Promise().fulfill(this._node);*/
};
