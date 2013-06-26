/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.0",
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
	"height": {
		defaultUnit:"px", 
		css:"height" 
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
	this._elm = elm instanceof JAX.Node ? elm : new JAX.Node(elm);
	this._properties = [];
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
 * @param {string} property css vlastnost, která se má animovat
 * @param {number} duration délka v sekundách, lze zadat i desetinné číslo, např. 1.2
 * @param {string} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	var duration = parseInt(duration);
	var method = this._transitionSupport ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		throw new Error("For first argument I expected string"); 
	}
	if (!isFinite(duration) || duration < 0) { 
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
		var cssEnd = this._foundCSSValue(property);;
	}

	if (start || (typeof(start) == "number" && isFinite(start))) { 
		var cssStart = this._parseCSSValue(property, start);
	} else {
		var cssStart = this._foundCSSValue(property);
	}

	this._properties.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd,
		duration: (duration || 1),
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
 * @eturns {JAX.FX}
 */
JAX.FX.prototype.run = function() {
	this._running = true;
	this._promise = new JAK.Promise();
	if (!this._transitionSupport) { this._initInterpolators(); return this._promise; }
	this._initTransition();
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
			properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); 
		}

		throw new Error("First argument must be supported property: " + properties.join(", ")); 
	}
};

JAX.FX.prototype._checkSupportedMethod = function(method) {
	var method = method.toLowerCase();
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method) > -1 || method.indexOf("cubic-bezier") == 0) {
		return;
	}

	var methods = [];
	for (var p in JAX.FX._SUPPORTED_METHODS) { methods.concat(JAX.FX._SUPPORTED_METHODS[p]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
}

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._finishInterpolatorAnimation.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) != -1) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
	this._promise.reject(this._elm);
};

JAX.FX.prototype._initTransition = function() {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		tps.push(JAX.FX._SUPPORTED_PROPERTIES[property.property].css + " " + property.duration + "s " + property.method);
		this._transitionCount++;
	}

	node.offsetHeight;

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._elm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=this._properties.length; i<len; i++) {
			var property = this._properties[i];
			style[property.property] = property.cssEnd.value + property.cssStart.unit;
		}
	}.bind(this), 0);
};

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
	this._processPromise();
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	if (property == "backgroundColor" || property == "color") {
		var value = cssValue;
	} else {
		var value = parseFloat(cssValue);
		var foundUnit = (cssValue+"").replace(value, "");
		if (foundUnit) { unit = foundUnit; }
	}

	return { 
		value: value, 
		unit: unit 
	};
};

JAX.FX.prototype._foundCSSValue = function(property) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	switch(property) {
		case "width":
		case "height":
			value = this._elm.size(property);
		break;
		case "backgroundColor":
		case "color":
			var value = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		break;
		default:
			var cssValue = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css);
			var value = parseFloat(cssValue);
	}

	return {
		value:value,
		unit: unit
	}
};

JAX.FX.prototype._finishTransitionAnimation = function() {
	this._endTransition();
	this._processPromise(true);
};

JAX.FX.prototype._finishInterpolatorAnimation = function(index) {
	this._endInterpolator(index);
	this._processPromise(true);
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
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

JAX.FX.prototype._processPromise = function(fulfilled) {
	if (fulfilled) { this._promise.fulfill(this._elm); return; }
	this._promise.reject(this._elm);
};

