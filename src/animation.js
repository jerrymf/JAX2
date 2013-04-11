JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.31"
});

JAX.Animation._TRANSITION_PROPERTY = "";
JAX.Animation._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd"
    };

	for (p in transitions) {
		if (p in JAX.make("div")) {
			JAX.Animation._TRANSITION_PROPERTY = p;
			JAX.Animation._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.Animation._SUPPORTED_PROPERTIES = {
	"width":"px", 
	"height":"px", 
	"top":"px", 
	"left":"px",
	"font-size":"px",
	"opacity":""
};
JAX.Animation._REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element) {
	this._elm = element instanceof JAX.HTMLElm ? element : JAX.HTMLElm.create(element);
	this._properties = [];
	this._interpolators = [];
	this._callback = null;
	this._running = false;
	this._transitionSupport = !!JAX.Animation._TRANSITION_PROPERTY;
};

JAX.Animation.prototype.addProperty = function(property, duration, start, end, method) {
	if (!(property in JAX.Animation._SUPPORTED_PROPERTIES)) { 
		throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); 
	}

	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 
	var method = !this._transitionSupport ? (method || "linear") : "LINEAR";

	this._properties.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd,
		duration: (duration || 1) * 1000,
		method: method
	});
};

JAX.Animation.prototype.addCallback = function(callback) {
	this._callback = callback;
};

JAX.Animation.prototype.run = function() {
	this._running = true;
	if (!this._transitionSupport) { this._initInterpolators(); return; }
	this._initTransition();
};

JAX.Animation.prototype.isRunning = function() {
	return this._running;
};

JAX.Animation.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); }
	this._stopTransition();
};

JAX.Animation.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		interpolator.start();
	}
};

JAX.Animation.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) {
		this._endInterpolator(i);
	}
}

JAX.Animation.prototype._initTransition = function() {
	var tp = JAX.Animation._TRANSITION_PROPERTY;
	var te = JAX.Animation._TRANSITION_EVENT;
	var tps = [];

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		var style = {};
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		this._elm.style(style);
		tps.push(property.property + " " + property.duration + "s" + " " + property.method);
	}

	this._elm.node().style[tp] = tps.join(",");
	this._elm.node().offsetWidth; /* trick */
	this._ecTransition = this._elm.listen(te, "_endTransition", this);

	for (var i=0, len=this._properties.length; i<len; i++) {
		this._elm.node().style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
};

JAX.Animation.prototype._stopTransition = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var styleProperty = this._properties[i].property;
		var styleValue = this._elm.style(styleProperty);
		this._elm.style(styleProperty, styleValue);
	}
};

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation._SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	if (this._callback) { this._callback(); }
};

JAX.Animation.prototype._endTransition = function() {
	var te = JAX.Animation._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._ecTransition = null;
	this._running = false;
	if (this._callback) { this._callback(); }
};

