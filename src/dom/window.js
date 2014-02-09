/**
 * @fileOverview window.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.Window
 * je třída reprezentující object Window
 *
 */

/**
 * @see JAX.IListening
 * @see JAX.IScrollableNode
 *
 * @param {object} win window
 */
JAX.Window = function(win) {
	this.__parent__.call(this, win);

	this.jaxNodeType = JAX.WINDOW;

	this.isWindow = true;
	this.isListenable = true;
	this.isScrollable = true;
};

JAX.extend(JAX.Window, JAX.Node);
JAX.mixin(JAX.Window, JAX.IMoveableNode);

/**
 * zjistí velikost okna dle zadaného typu, tedy šířku nebo výšku
 *
 * @param {string} sizeType "width" nebo "height"
 * @returns {number}
 */
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
