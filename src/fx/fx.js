/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.05
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.1"
});

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": 			{ defaultUnit:"px" },
	"maxWidth": 		{ defaultUnit:"px" },
	"minWidth": 		{ defaultUnit:"px" },
	"height": 			{ defaultUnit:"px" },
	"maxHeight": 		{ defaultUnit:"px" },
	"minHeight": 		{ defaultUnit:"px" },
	"top": 				{ defaultUnit:"px" },
	"left": 			{ defaultUnit:"px" },
	"bottom": 			{ defaultUnit:"px" },
	"right": 			{ defaultUnit:"px" },
	"paddingTop": 		{ defaultUnit:"px" },
	"paddingBottom": 	{ defaultUnit:"px" },
	"paddingLeft": 		{ defaultUnit:"px" },
	"paddingRight": 	{ defaultUnit:"px" },
	"marginTop": 		{ defaultUnit:"px" },
	"marginBottom": 	{ defaultUnit:"px" },
	"marginLeft": 		{ defaultUnit:"px" },
	"marginRight": 		{ defaultUnit:"px" },
	"fontSize": 		{ defaultUnit:"px" },
	"opacity": 			{ defaultUnit:""   },
	"color": 			{ defaultUnit:""   },
	"backgroundColor": 	{ defaultUnit:""   }
};

JAX.FX._SUPPORTED_METHODS = [
	"ease",
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"cubic-bezier"
];

/**
 * @method constructor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 *
 * @param {HTMLElm} elm html element, který se má animovat
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._jaxElm = JAX(elm);

	if (!this._jaxElm.exists()) { 
		console.error("JAX.FX: I got null node. Check your code please."); 
	}

	this._settings = [];
	this._reversed = false;
	this._running = false;

	this._maxDuration = 0;
	this._startTime = 0;
	this._currentTime = 0;

	this._promise = {
		finished: null
	};

	this._processor = null;
};

/**
 * @method Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit. <br>
 * Podporované css vlasnosti pro animaci: width, height, top, left, bottom, right, fontSize, opacity, color a backgroundColor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @param {String} setting css vlastnost, která se má animovat
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @param {String} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {String} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {String} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	if (!this._jaxElm.exists()) { return this; }

	var durationValue = this._parseValue(duration);
	var durationUnit = this._parseUnit(duration) || "ms";
	var method = JAX.FX.CSS3.isSupported ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		console.error("JAX.FX.addProperty: For first argument I expected string"); 
		return this;
	}
	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) {
		console.error("JAX.FX.addProperty: First argument must be supported property. You are trying to give me '" + property + "' which is unsupoorted.");
		return this;
	}
	if (!isFinite(durationValue) || durationValue < 0) { 
		console.error("JAX.FX.addProperty: For second argument I expected positive number"); 
		return this;
	}
	if (start && typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { 
		console.error("JAX.FX.addProperty: For third argument I expected string, number or null for automatic checking"); 
		return this;
	}
	if (end && typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { 
		console.error("JAX.FX.addProperty: For fourth argument I expected string or number"); 
		return this;
	}
	if (start == null && end == null) {
		console.error("JAX.FX.addProperty: At least one of start and end values must be defined."); 	
		return this;
	}
	if (typeof(method) != "string") { 
		console.error("JAX.FX.addProperty: For fifth argument I expected string"); 
		return this;
	}
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method.toLowerCase()) == -1 && method.toLowerCase().indexOf("cubic-bezier") != 0) {
		console.error("JAX.FX.addProperty: Fifth argument must be supported method. You are trying to give me '" + method + "' which is unsupoorted."); 
		method = JAX.FX.CSS3.isSupported ? "linear" : "LINEAR";
	}

	if (end || (typeof(end) == "number" && isFinite(end))) {
		var cssEnd = this._parseCSSValue(property, end);
	} else {
		var cssEnd = this._foundCSSValue(property);
	}

	if (start || (typeof(start) == "number" && isFinite(start))) { 
		var cssStart = this._parseCSSValue(property, start);
	} else {
		var cssStart = this._foundCSSValue(property);
	}

	var duration = {
		value: durationUnit == "ms" ? durationValue : durationValue * 1000,
		unit: "ms"
	};

	this._maxDuration = Math.max(duration.value, this._maxDuration);

	this._settings.push({
		property: property,
		startValue: cssStart.value,
		startUnit: cssStart.unit,
		endValue: cssEnd.value,
		endUnit: cssEnd.unit,
		durationValue: duration.value,
		durationUnit: duration.unit,
		method: method
	});

	return this;
};

/**
 * @method Spustí animaci
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @returns {JAK.Promise}
 */
JAX.FX.prototype.run = function() {
	if (this.isRunning()) { return this._promise.finished; }

	if (!this._settings.length) {
		this._promise.finished = new JAK.Promise().reject(this._jaxElm);
		console.error("JAX.FX.run: I have no added properties. FX will not run.");
		return this;
	}

	this._processor = JAX.FX.CSS3.isSupported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(this._settings);

	this._running = true;

	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this._promise.finished;
};

JAX.FX.prototype.then = function(onfulfill, onreject) {
	return this._promise.finished.then(onfulfill, onreject);
};

/**
 * @method Spustí animaci "pozpátku", tedy provede zpětný chod.
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 10000, 0, 200);
 * fx.addProperty("height", 10000, 0, 100);
 * fx.run();
 * setTimeout(function() { fx.reverse(); }, 5000); // po peti sekundach se zpusti zpetny chod
 *
 * @returns {JAK.Promise}
 */
JAX.FX.prototype.reverse = function() {
	if (this.isRunning()) { this.stop(); }

	if (!this._settings.length) {
		this._promise.finished = new JAK.Promise().reject(this._jaxElm);
		console.error("JAX.FX.reverse: I have no added properties. FX will not run in reversed mode.");
		return this;
	}

	this._reversed = !this._reversed;
	var reversedSettings = [];

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var property = setting.property;
		var method = setting.method;

		var parsedCss = this._parseCSSValue(property, this._jaxElm.computedCss(this._styleToCSSProperty(property)));
		var startValue = parsedCss.value;
		var startUnit = parsedCss.unit;

		var durationUnit = setting.durationUnit;

		if (this._reversed) {
			var durationValue = Math.min(this._currentTime, setting.durationValue);
			var endValue = setting.startValue;
			var endUnit = setting.startUnit;
		} else {
			var durationValue = Math.max(setting.durationValue - this._currentTime, 0);
			var endValue = setting.endValue;
			var endUnit = setting.endUnit;
		}

		var reversedSetting = {
			property: property,
			startValue: startValue,
			startUnit: startUnit,
			endValue: endValue,
			endUnit: endUnit,
			durationValue: durationValue,
			durationUnit: durationUnit,
			method: method
		};

		reversedSettings.push(reversedSetting);
	}

	this._processor = JAX.FX.CSS3.isSupported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(reversedSettings);

	this._running = true;

	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this._promise.finished;
};

/**
 * @method Zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * @method Stopne (zabije) animaci
 * 
 * @returns {JAX.FX}
 */
JAX.FX.prototype.stop = function() {
	this._processor.stop();
	return this;
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	if (property == "backgroundColor" || property == "color") {
		var value = cssValue;
	} else {
		var value = this._parseValue(cssValue);
		var unit = this._parseUnit(cssValue) || unit;
	}

	return { 
		value: value, 
		unit: unit 
	};
};

JAX.FX.prototype._parseValue = function(value) {
	return parseFloat(value);
};

JAX.FX.prototype._parseUnit = function(value) {
	var val = parseFloat(value);
	return (value+"").replace(val, "");
};

JAX.FX.prototype._foundCSSValue = function(setting) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[setting].defaultUnit;

	switch(setting) {
		case "width":
		case "height":
			value = this._jaxElm.size(setting);
		break;
		case "backgroundColor":
		case "color":
			var value = this._jaxElm.computedCss(this._styleToCSSProperty(setting));
		break;
		default:
			var cssValue = this._jaxElm.computedCss(this._styleToCSSProperty(setting));
			var value = parseFloat(cssValue);
	}

	return {
		value:value,
		unit: unit
	}
};

JAX.FX.prototype._finishAnimation = function() {
	var passedTime = new Date().getTime() - this._startTime;

	if (!this._reversed) {
		this._currentTime += passedTime;
		this._currentTime = Math.min(this._currentTime, this._maxDuration);
	} else {
		this._currentTime -= passedTime;
		this._currentTime = Math.max(this._currentTime, 0);
	}

	this._startTime = 0;
	this._isRunning = false;
};

JAX.FX.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
