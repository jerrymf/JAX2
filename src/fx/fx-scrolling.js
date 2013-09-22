/**
 * @fileOverview fx-scrolling.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.05
 */

/**
 * Pomocník pro animaci scrollování
 * @class JAX.FX
 */ 
JAX.FX.Scrolling = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX.Scrolling",
	VERSION: "1.0"
});


JAX.FX.Scrolling.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._promises = {
		animationFinished: null
	};
	this._maxDuration = 0;
	this._timeline = 0;
	this._interpolators = [];
	this._runningInterpolatorCount = 0;
	this._reversed = false;
	this._isRunning = false;
	this._interval = null;
	this._onScrollingFinished = this._onScrollingFinished.bind(this);
};

JAX.FX.Scrolling.prototype.addProperty = function(property, value, duration) {
	if (property != "left" && property != "top") {
		JAX.Report.error("You are trying to use unsupported property: " + property + ".", this._jaxElm.node());
		return;
	}
	this._settings.push({property:property, defValue: null, value:value, duration:duration});
	this._maxDuration = Math.max(this._maxDuration, duration);
	return this;
};

JAX.FX.Scrolling.prototype.run = function() {
	if (this._promises.animationFinished) { 
		return this._promises.animationFinished; 
	}

	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var defValue = this._jaxElm.scroll(setting.property);
		setting.defValue = defValue;
		this._startInterval(setting.property, setting.value, setting.duration);
	}

	this._isRunning = true;
	this._reversed = false;
	this._interval = setInterval(this._tick.bind(this), 30);

	return this._promises.animationFinished;
};

JAX.FX.Scrolling.prototype.then = function(onFulfill, onReject) {
	return this._promises.animationFinished.then(onFulfill, onReject);
};

JAX.FX.Scrolling.prototype.stop = function() {
	if (!this._isRunning) { return this; }

	for (var i=0, len=this._interpolators.length; i<len; i++) {
		this._interpolators[i].stop();
	}

	this._runningInterpolatorCount = 0;
	this._interpolators = [];
	this._isRunning = false;
	this._promises.animationFinished.reject(this._jaxElm);
	this._promises.animationFinished = null;
	clearInterval(this._interval);

	return this;
};

JAX.FX.Scrolling.prototype.reverse = function() {
	if (this._isRunning) {
		this.stop();
	}

	this._reversed = !this._reversed;
	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var duration = this._reversed ? Math.min(setting.duration, this._timeline) : Math.max(setting.duration - this._timeline, 0);
		this._startInterval(setting.property, this._reversed ? setting.defValue : setting.value, duration);
	}

	this._isRunning = true;
	this._interval = setInterval(this._tick.bind(this), 30);

	return this._promises.animationFinished;
};

JAX.FX.Scrolling.prototype._startInterval = function(property, value, duration) {
	var property = property;
	var defValue = this._jaxElm.scroll(property);

	var scrollFunc = function(value) {
		this._jaxElm.scroll(property, value);
	}.bind(this);

	var interpolator = new JAK.Interpolator(defValue, value, duration, scrollFunc, {endCallback:this._onScrollingFinished});
		interpolator.start();

	this._interpolators.push(interpolator);
	this._runningInterpolatorCount++;
};

JAX.FX.Scrolling.prototype._onScrollingFinished = function() {
	this._runningInterpolatorCount--;
	if (this._runningInterpolatorCount) { return; }
	this._interpolators = [];
	this._isRunning = false;
	this._promises.animationFinished.fulfill(this._jaxElm);
	this._promises.animationFinished = null;
	clearInterval(this._interval);
	this._timeline = !this._reversed ? this._maxDuration : 0;
};

JAX.FX.Scrolling.prototype._tick = function() {
	this._timeline = Math.min(Math.max(this._timeline + (this._reversed ? -30 : 30), 0), this._maxDuration);
};