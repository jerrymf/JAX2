/**
 * @fileOverview fx-css3.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.1
 */

/**
 * @class JAX.FX.CSS3
 * je pomocník pro animaci pomocí CSS3 transitions
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.CSS3 = function(elm) {
	this._jaxElm = elm instanceof JAX.Node ? elm : JAX(elm);
	this._settings = [];
	this._maxDuration = 0;
	this._transitionCount = 0;
	this._ecTransition = null;
	this._promise = {
		finished: null
	};
};

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

(function() {
	if (JAK.Browser.platform == "and") {
		/* protoze nektere android browsery chybne poskytuji detekci transition bez prefixu, budeme preferovat tu s prefixem, ktera funguje korektne */
		if ("WebkitTransition" in document.createElement("div").style) {
			JAX.FX.CSS3._TRANSITION_PROPERTY = "WebkitTransition";
			JAX.FX.CSS3._TRANSITION_EVENT = "webkitTransitionEnd";
			return;
		}
	}

	var transitions = {
		"transition":"transitionend",
		"WebkitTransition":"webkitTransitionEnd",
		"OTransition":"oTransitionEnd",
		"MozTransition":"transitionend",
		"MSTransition":"MSTransitionEnd"
    };

	for (var p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX.CSS3._TRANSITION_PROPERTY = p;
			JAX.FX.CSS3._TRANSITION_EVENT = transitions[p];
			return; 
		}
	}
})();

/**
 * očekává pole objektů s nastavením jednotlivých animací
 *
 * @param {array} settings
 * @param {string} settings.property
 * @param {number || string} settings.startValue
 * @param {string} settings.startUnit
 * @param {number} settings.endValue
 * @param {string} settings.endUnit
 * @param {number} settings.durationValue
 * @param {string} settings.durationUnit
 * @param {string} settings.method
 */
JAX.FX.CSS3.prototype.set = function(settings) {
	this._settings = settings;
};

/**
 * spustí CSS3 transition
 *
 * @returns {JAK.Promise}
 */
JAX.FX.CSS3.prototype.run = function() {
	this._promise.finished = new JAK.Promise();

	var tp = JAX.FX.CSS3._TRANSITION_PROPERTY;
	var te = JAX.FX.CSS3._TRANSITION_EVENT;
	var tps = [];
	var node = this._jaxElm.node();
	var style = node.style;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var cssStartValue = setting.startValue + setting.startUnit;
		var transitionParam = this._styleToCSSProperty(setting.property) + " " + setting.durationValue + setting.durationUnit + " " + setting.method;
		this._maxDuration = Math.max(this._maxDuration, setting.durationValue);
		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	var render = node.offsetHeight; /* trick pro prerenderovani */

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._jaxElm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=this._settings.length; i<len; i++) {
			var setting = this._settings[i];
			var cssEndValue = setting.endValue + setting.endUnit;
			style[setting.property] = cssEndValue;
		}
	}.bind(this), 0);

	return this._promise.finished;
};

/**
 * stopne transition
 *
 */
JAX.FX.CSS3.prototype.stop = function() {
	var node = this._jaxElm.node();
	var style = node.style;

	for(var i=0, len=this._settings.length; i<len; i++) {
		var property = this._settings[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(this._styleToCSSProperty(property));
		style[property] = value;
	}

	while(this._transitionCount) { this._endTransition(); }
	this._promise.finished.reject(this._jaxElm);
};

JAX.FX.CSS3.prototype._endTransition = function() {
	this._transitionCount--;
	if (this._transitionCount) { return; }

	this._ecTransition.unregister();
	this._ecTransition = null;
	this._jaxElm.node().style[JAX.FX.CSS3._TRANSITION_PROPERTY] = "";
};

JAX.FX.CSS3.prototype._finishTransitionAnimation = function() {
	if (this._transitionCount) {
		this._endTransition();
		return;
	}

	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};

JAX.FX.CSS3.prototype._fallback = function() {
	while(this._transitionCount) {
		this._endTransition();
	}

	this._finishTransitionAnimation();
};
