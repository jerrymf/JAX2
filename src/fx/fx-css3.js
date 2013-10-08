JAX.FX.CSS3 = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.CSS3",
	VERSION:"1.0"
});

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

(function() {
	var transitions = {
		"transition":"transitionend",
		"WebkitTransition":"webkitTransitionEnd",
		"OTransition":"oTransitionEnd",
		"MozTransition":"transitionend",
		"MSTransition":"MSTransitionEnd"
    };

	for (var p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX.CSS3._TRANSITION_PROPERTY = p;
			JAX.FX.CSS3._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX.CSS3.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._maxDuration = 0;
	this._transitionCount = 0;
	this._ecTransition = null;
	this._promise = {
		finished: null
	};
	this._timeout = null;
};

JAX.FX.CSS3.prototype.set = function(settings) {
	this._settings = settings;
};

JAX.FX.CSS3.prototype.run = function() {
	this._promise.finished = new JAK.Promise();

	var tp = JAX.FX.CSS3._TRANSITION_PROPERTY;
	var te = JAX.FX.CSS3._TRANSITION_EVENT;
	var tps = [];
	var node = this._jaxElm.node();
	var style = node.style;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var cssStartValue = setting.startValue + setting.startUnit;
		var transitionParam = this._styleToCSSProperty(setting.property) + " " + setting.durationValue + setting.durationUnit + " " + setting.method;
		this._maxDuration = Math.max(this._maxDuration, setting.durationValue);
		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	var render = node.offsetHeight; /* trick pro prerenderovani */

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._jaxElm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=this._settings.length; i<len; i++) {
			var setting = this._settings[i];
			var cssEndValue = setting.endValue + setting.endUnit;
			style[setting.property] = cssEndValue;
		}

		this._timeout = setTimeout(this._fallback.bind(this), this._maxDuration + 50); /* sometimes transitioend is not fired, we must use fallback :-/ */
	}.bind(this), 0);

	return this._promise.finished;
};

JAX.FX.CSS3.prototype.stop = function() {
	var node = this._jaxElm.node();
	var style = node.style;

	for(var i=0, len=this._settings.length; i<len; i++) {
		var property = this._settings[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(this._styleToCSSProperty(property));
		style[property] = value;
	}

	while(this._transitionCount) { this._endTransition(); }
	clearTimeout(this._timeout);
	this._timeout = null;
	this._promise.finished.reject(this._jaxElm);
};

JAX.FX.CSS3.prototype._endTransition = function() {
	this._transitionCount--;
	if (this._transitionCount) { return; }

	this._ecTransition.unregister();
	this._ecTransition = null;
	this._jaxElm.node().style[JAX.FX.CSS3._TRANSITION_PROPERTY] = "";
};

JAX.FX.CSS3.prototype._finishTransitionAnimation = function() {
	if (this._transitionCount) {
		this._endTransition();
		return;
	}

	clearTimeout(this._timeout);
	this._timeout = null;
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};

JAX.FX.CSS3.prototype._fallback = function() {
	while(this._transitionCount) {
		this._endTransition();
	}

	this._finishTransitionAnimation();
};
