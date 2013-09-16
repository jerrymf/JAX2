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
	VERSION: "1.05",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

JAX.FX._TRANSITION_PROPERTY = "";
JAX.FX._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd",
      "MSTransition":"MSTransitionEnd"
    };

	for (var p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX._TRANSITION_PROPERTY = p;
			JAX.FX._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": {
		defaultUnit:"px", 
		css:"width" 
	},
	"maxWidth": {
		defaultUnit:"px", 
		css:"max-width" 
	},
	"minWidth": {
		defaultUnit:"px", 
		css:"min-width" 
	},
	"height": {
		defaultUnit:"px", 
		css:"height" 
	},
	"maxHeight": {
		defaultUnit:"px", 
		css:"max-height" 
	},
	"minHeight": {
		defaultUnit:"px", 
		css:"min-height" 
	},
	"top": {
		defaultUnit:"px", 
		css:"top" 
	},
	"left": {
		defaultUnit:"px", 
		css:"left" 
	},
	"bottom": {
		defaultUnit:"px", 
		css:"bottom" 
	},
	"right": {
		defaultUnit:"px", 
		css:"right" 
	},
	"fontSize": {
		defaultUnit:"px", 
		css:"font-size" 
	},
	"opacity": {
		defaultUnit:"", 
		css:"opacity" 
	},
	"color": {
		defaultUnit:"", 
		css:"color" 
	},
	"backgroundColor": {
		defaultUnit:"", 
		css:"background-color" 
	}
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
	this._elm = JAX(elm);

	if (!this._elm.node()) { 
		throw new Error("I can not continue because I got null node. Check your code. please."); 
	}

	this._settings = [];
	this._reversed = false;
	this._durationPassed = 0;
	this._durationIntervalChecker = null;
	this._interpolators = [];
	this._transitionCount = 0;
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
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
	var durationValue = this._parseValue(duration);
	var durationUnit = this._parseUnit(duration) || "ms";
	var method = this._transitionSupport ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		throw new Error("For first argument I expected string"); 
	}
	if (!isFinite(durationValue) || durationValue < 0) { 
		throw new Error("For second argument I expected positive number"); 
	}
	if (start && typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { 
		throw new Error("For third argument I expected string, number or null for automatic checking"); 
	}
	if (end && typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { 
		throw new Error("For fourth argument I expected string or number"); 
	}
	if (start == null && end == null) {
		throw new Error("At least one of start and end values must be defined."); 	
	}
	if (typeof(method) != "string") { 
		throw new Error("For fifth argument I expected string"); 
	}

	this._checkSupportedProperty(property);
	this._checkSupportedMethod(method);

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

	this._settings.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd,
		duration: durationUnit == "ms" ? durationValue : durationValue * 1000,
		durationUnit: "ms",
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
	if (this.isRunning()) { this.stop(); }

	this._running = true;
	this._promise = new JAK.Promise();

	if (!this._transitionSupport) { 
		this._initInterpolators(this._settings); 
	} else {
		this._initTransition(this._settings);
	}

	this._durationPassed = 0;
	this._durationIntervalChecker = setInterval(function() { this._durationPassed += 100; }.bind(this), 100);

	return this._promise;
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

	this._reversed = !this._reversed;
	var reversedSettings = [];

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var property = setting.property;
		var method = setting.method;
		var durationUnit = setting.durationUnit;
		var durationValue = this._durationPassed;

		if (this._reversed) {
			var cssEnd = setting.cssStart;
			var cssStart = this._parseCSSValue(property, this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css));
		} else {
			var cssEnd = setting.cssEnd;
			var cssStart = this._parseCSSValue(property, this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css));
		}

		var reversedSetting = {
			property: property,
			cssStart: cssStart,
			cssEnd: cssEnd,
			duration: durationValue,
			durationUnit: durationUnit,
			method: method
		};

		reversedSettings.push(reversedSetting);
	}

	this._running = true;
	this._promise = new JAK.Promise();

	if (!this._transitionSupport) { 
		this._initInterpolators(reversedSettings); 
	} else {
		this._initTransition(reversedSettings);
	}

	this._durationPassed = 0;
	this._durationIntervalChecker = setInterval(function() { this._durationPassed += 100; }.bind(this), 100);

	return this._promise;
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
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._checkSupportedProperty = function(property) {
	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];

		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { 
			properties.push(p); 
		}

		throw new Error("First argument must be supported setting: " + properties.join(", ")); 
	}
};

JAX.FX.prototype._checkSupportedMethod = function(method) {
	var method = method.toLowerCase();
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method) > -1 || method.indexOf("cubic-bezier") == 0) {
		return;
	}

	var methods = [];
	for (var i=0, len=JAX.FX._SUPPORTED_METHODS.length; i<len; i++) { methods.push(JAX.FX._SUPPORTED_METHODS[i]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
}

JAX.FX.prototype._initInterpolators = function(settings) {
	for(var i=0, len=settings.length; i<len; i++) {
		var setting = settings[i];
		var duration = setting.duration;

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), duration, { 
			"interpolation": setting.method, 
			"endCallback": this._finishInterpolatorAnimation.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(setting.property) != -1) {
			interpolator.addColorProperty(setting.property, setting.cssStart.value, setting.cssEnd.value);
		} else {
			interpolator.addProperty(setting.property, setting.cssStart.value, setting.cssEnd.value, setting.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
	this._promise.reject(this._elm);
};

JAX.FX.prototype._initTransition = function(settings) {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=settings.length; i<len; i++) {
		var setting = settings[i];
		var cssStartValue = setting.cssStart.value + setting.cssStart.unit;
		var transitionParam = JAX.FX._SUPPORTED_PROPERTIES[setting.property].css + " " + setting.duration + setting.durationUnit + " " + setting.method;

		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	var render = node.offsetHeight; /* trick pro prerenderovani */

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._elm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=settings.length; i<len; i++) {
			var setting = settings[i];
			style[setting.property] = setting.cssEnd.value + setting.cssStart.unit;
		}
	}.bind(this), 0);
};

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._settings.length; i<len; i++) {
		var property = this._settings[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	while(this._transitionCount) { this._endTransition(); }
	this._finishAnimation();
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
			value = this._elm.size(setting);
		break;
		case "backgroundColor":
		case "color":
			var value = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[setting].css);
		break;
		default:
			var cssValue = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[setting].css);
			var value = parseFloat(cssValue);
	}

	return {
		value:value,
		unit: unit
	}
};

JAX.FX.prototype._finishTransitionAnimation = function() {
	this._endTransition();
	this._finishAnimation(true);
};

JAX.FX.prototype._finishInterpolatorAnimation = function(index) {
	this._endInterpolator(index);
	this._finishAnimation(true);
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators[index] = null;

	for (var i=0, len=this._interpolators.length; i<len; i++) {
		if (this._interpolators[i]) { return; }
	}

	this._interpolators = [];
	this._running = false;
};

JAX.FX.prototype._endTransition = function() {
	this._transitionCount--;
	if (this._transitionCount) { return; }

	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "";
	this._ecTransition = null;
	this._running = false;
};

JAX.FX.prototype._finishAnimation = function(fulfilled) {
	clearInterval(this._durationIntervalChecker);
	if (fulfilled) { this._promise.fulfill(this._elm); return; }
	this._promise.reject(this._elm);
};

