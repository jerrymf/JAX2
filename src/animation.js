JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.3"
});

JAX.Animation.TRANSITION_PROPERTY = "";
JAX.Animation.TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd"
    };

	for (p in transitions) {
		if (p in JAX.make("div")) {
			JAX.Animation.TRANSITION_PROPERTY = p;
			JAX.Animation.TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.Animation.SUPPORTED_PROPERTIES = {
	"width":"px", 
	"height":"px", 
	"top":"px", 
	"left":"px", 
	"opacity":""
};
JAX.Animation.REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element, duration, method) {
	this._elm = element instanceof JAX.Element ? element.getElm() : element;
	this._properties = [];
	this._interpolator = null;
	this._callback = null;
	this._duration = (duration || 1) * 1000;
	this._method = method || "LINEAR";
	this._running = false;
};

JAX.Animation.prototype.addProperty = function(property, start, end) {
	if (!(property in JAX.Animation.SUPPORTED_PROPERTIES)) { throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); }

	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 

	this._properties.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd
	});
};

JAX.Animation.prototype.addCallback = function(callback) {
	this._callback = callback;
}

JAX.Animation.prototype.run = function() {
	this._interpolator = new JAK.CSSInterpolator(this._elm, this._duration, {
		"interpolation": this._method,
		"endCallback": this._endInterpolator.bind(this)
	});

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		this._interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
	}

	this._interpolator.start();
	this._running = true;
};

JAX.Animation.prototype.isRunning = function() {
	return this._running;
}

JAX.Animation.prototype.stop = function() {
	this._interpolator.stop();
	this._running = false;
}

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation.SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	this._running = false;
	if (this._callback) { this._callback(); }
};

