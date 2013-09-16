JAX.FX.Interpolator = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.Interpolator",
	VERSION:"1.0",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

JAX.FX.Interpolator.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._interpolators = [];
	this._interpolatorsCount = 0;
	this._settings = [];
	this._promise = {
		finished: null
	};
};

JAX.FX.Interpolator.prototype.set = function(settings) {
	this._settings = settings;
};

JAX.FX.Interpolator.prototype.run = function() {
	this._promise.finished = new JAK.Promise();
	this._interpolators = [];
	this._start();
	return this._promise.finished;
};

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
