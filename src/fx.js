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
	VERSION: "1.0"
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
	"width": {defaultUnit:"px", css:"width" },
	"height":{defaultUnit:"px", css:"height" },
	"top": {defaultUnit:"px", css:"top" },
	"left": {defaultUnit:"px", css:"left" },
	"bottom": {defaultUnit:"px", css:"bottom" },
	"right": {defaultUnit:"px", css:"right" },
	"fontSize": {defaultUnit:"px", css:"font-size" },
	"opacity": {defaultUnit:"", css:"opacity" },
	"color": {defaultUnit:"", css:"color" },
	"backgroundColor": {defaultUnit:"", css:"background-color" }
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
 * constructor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 *
 * @param {HTMLElm} elm html element, který se má animovat
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._elm = elm instanceof JAX.Node ? elm : JAX.Node.create(elm);
	this._properties = [];
	this._interpolators = [];
	this._callbacks = [];
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
};

/**
 * Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit. <br>
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
	
	if (typeof(property) != "string") { throw new Error("For first argument I expected string"); }
	if (!isFinite(duration) || duration < 0) { throw new Error("For second argument I expected positive number"); }
	if (typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { throw new Error("For third argument I expected string or number"); }
	if (typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { throw new Error("For fourth argument I expected string or number"); }
	if (typeof(method) != "string") { throw new Error("For fifth argument I expected string"); }

	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];
		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); }
		throw new Error("First argument must be supported property: " + properties.join(", ")); 
	}
	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 
	var methodLowerCase = method.toLowerCase();

	for (var i=0, len=JAX.FX._SUPPORTED_METHODS.length; i<len; i++) {
		var supported = JAX.FX._SUPPORTED_METHODS[i];
		if (methodLowerCase == supported || (supported == "cubic-bezier" && methodLowerCase.indexOf(supported) == 0)) { 
			this._properties.push({
				property: property,
				cssStart: cssStart,
				cssEnd: cssEnd,
				duration: (duration || 1),
				method: method
			});
			return this;
		}
	}

	var methods = [];
	for (var p in JAX.FX._SUPPORTED_METHODS) { methods.concat(JAX.FX._SUPPORTED_METHODS[p]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
};

/**
 * Po doběhnutí celé animace zavolá funkci předanou parametrem. Opakovaným voláním této metody lze přidat více funkcí.
 * @example 
 * var func1 = function() { console.log("func1"); };
 * var func2 = function() { console.log("func1"); };
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.callWhenDone(func1);
 * fx.callWhenDone(func2);
 * fx.run();
 *
 * @param {function} callback funkce, která se provede po doběhnutí celé animace
 * @returns {JAX.FX}
 */
JAX.FX.prototype.callWhenDone = function(callback) {
	this._callbacks.push(callback);
	return this;
};

/**
 * Spustí animaci
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
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this;
};

/**
 * Zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * Stopne (zabije) animaci
 * 
 * @returns {JAX.FX}
 */
JAX.FX.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) === 0) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
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
		tps.push(property.property + " " + property.duration + "s " + property.method);
	}

	node.offsetHeight; /* trick - donutime porhlizec k prekresleni */
	node.style[tp] = tps.join(",");

	this._ecTransition = this._elm.listen(te, "_endTransition", this);
	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
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
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit };
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

JAX.FX.prototype._endTransition = function() {
	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

