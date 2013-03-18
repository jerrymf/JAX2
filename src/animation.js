JAX.Animation = JAK.ClassMaker({
	NAME: "JAX.Animation",
	VERSION: "0.3"
});

JAX.Animation.SUPPORTED_PROPERTIES = [
	{"width":"px"}, 
	{"height":"px"}, 
	{"top":"px"}, 
	{"left":"px"}, 
	{"opacity":""}
];
JAX.Animation.REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element) {
	this._elm = element instanceof JAX.Element ? element.getElm() : element;
	this._properties = [];
	this._interpolators = [];
	this._callback = null;
	this._running = true;
};

JAX.Animation.prototype.addProperty = function(property, duration, start, end, method, privileged) {
	if (JAX.Animation.SUPPORTED_PROPERTIES.indexOf(property) == -1) { throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); }

	var cssEnd = this._parseCSSValue(property, end);
	if (!start && isNaN(start)) { 
		var cssStart = this._parseCSSValue(property, this._getPropertyValue(property), cssEnd.unit); 
	} else {
		var cssStart = this._parseCSSValue(property, start);
	}

	this._properties.push({
		property: property,
		duration: duration,
		cssStart: cssStart,
		cssEnd: cssEnd,
		method: method || "LINEAR",
		privileged: privileged
	});
};

JAX.Animation.prototype.run = function(callback) {
	this._callback = callback;
	this._initInterpolator();
	this._run();
};

JAX.Animation.prototype.isRunning = function() {
	return this._isRunning;
}

JAX.Animation.prototype.stop = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) {	this._interpolators.stop(); }
	this._running = false;
}

JAX.Animation.prototype._initInterpolator = function() {
	var index = 0;
	var oldPrivileged;

	while(this._properties.length) {
		var property = this._properties.shift();
		if (index && property.privileged != oldPrivileged) { break; }

		var interpolator = new JAK.CSSInterpolator(this._elm, property.duration, {
			"interpolation": property.method,
			"endCallback": this._endInterpolator.bind(this, index)
		});
		interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssEnd.unit);
		this._interpolators.push(interpolator);

		oldPrivileged = property.privileged;
		index++;
	}
};

JAX.Animation.prototype._getPropertyValue = function(property) {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		if (property == "opacity") {
			var value = "";
			this._elm.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
				value = match2;
			});
			return value || 1;
		}
	}

	var value = parseFloat(JAK.DOM.getStyle(this._elm, property));

	if (value == "NaN") {
		if (property == "width") { return this._elm.offsetWidth; }
		if (property == "height") { return this._elm.offsetHeight; }
	}
};

JAX.Animation.prototype._run = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._interpolators[i].start(); }
	this._running = true;
};

JAX.Animation.prototype._parseCSSValue = function(property, cssValue, fallbackUnit) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }
	if (fallbackUnit) { return { "value": value, "unit": fallbackUnit }; }

	return { "value": value, "unit": JAX.Animation.SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	var interpolator = this._interpolators.splice(index, 1);
	interpolator.stop();

	if (this._interpolators.length) { return; }
	if (this._properties.length) { this.run(); return; }

	this._running = false;
	this._callback();
};
