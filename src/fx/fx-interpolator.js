/**
 * @fileOverview fx-interpolator.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.FX.Interpolator
 * je pomocník pro animaci pomocí interpolátoru
 */
JAX.FX.Interpolator = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.Interpolator",
	VERSION:"1.0",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

/**
 *
 * @param {object} jaxElm JAX.Node
 */
JAX.FX.Interpolator.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._interpolators = [];
	this._interpolatorsCount = 0;
	this._settings = [];
	this._promise = {
		finished: null
	};
};

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
JAX.FX.Interpolator.prototype.set = function(settings) {
	this._settings = settings;
};

/**
 * spustí interpolátor
 *
 * @returns {JAK.Promise}
 */
JAX.FX.Interpolator.prototype.run = function() {
	this._promise.finished = new JAK.Promise();
	this._interpolators = [];
	this._start();
	return this._promise.finished;
};

/**
 * stopne interpolátor
 *
 */
JAX.FX.Interpolator.prototype.stop = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._destroyInterpolator(i); }
	this._promise.finished.reject(this._jaxElm);
};

JAX.FX.Interpolator.prototype._start = function() {
	for(var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var durationValue = setting.durationValue;

		var interpolator = new JAK.CSSInterpolator(this._jaxElm.node(), durationValue, { 
			"interpolation": setting.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);

		if (["backgroundColor", "color"].indexOf(setting.property) != -1) {
			interpolator.addColorProperty(setting.property, setting.startValue, setting.endValue);
		} else if (setting.startUnit != setting.endUnit) {
			var property = setting.property;
			var cssProperty = this._styleToCSSProperty(property);
			var backupPropertyValue = this._jaxElm.css(property);

			this._jaxElm.css(property, setting.startValue + setting.startUnit);
			var sValue = parseFloat(this._jaxElm.computedCss(cssProperty));
			this._jaxElm.css(property, setting.endValue + setting.endUnit);
			var eValue = parseFloat(this._jaxElm.computedCss(cssProperty));

			this._jaxElm.css(property, backupPropertyValue);
			interpolator.addProperty(property, sValue, eValue, "px");
		} else {
			interpolator.addProperty(setting.property, setting.startValue, setting.endValue, setting.startUnit);
		}

		interpolator.start();
		this._interpolatorsCount++;
	}
};

JAX.FX.Interpolator.prototype._endInterpolator = function(index) {
	this._destroyInterpolator(index);

	if (this._interpolatorsCount) { return; }

	this._interpolators = [];
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.Interpolator.prototype._destroyInterpolator = function(index) {
	var interpolator = this._interpolators[index];
	
	if (interpolator) {
		interpolator.stop();
		this._interpolators[index] = null;
		this._interpolatorsCount--;
	}
};

JAX.FX.Interpolator.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
