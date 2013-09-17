JAX.FX.CSS3 = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.CSS3",
	VERSION:"1.0"
});

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

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
			JAX.FX.CSS3._TRANSITION_PROPERTY = p;
			JAX.FX.CSS3._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX.CSS3.isSuported = !!JAX.FX.CSS3._TRANSITION_PROPERTY;

JAX.FX.CSS3.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._transitionCount = 0;
	this._ecTransition = null;
	this._promise = {
		finished: null
	};
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

	for (var i=0, len=settings.length; i<len; i++) {
		var setting = settings[i];
		var cssStartValue = setting.startValue + setting.startUnit;
		var transitionParam = this._styleToCSSProperty(setting.property) + " " + setting.durationValue + setting.durationUnit + " " + setting.method;

		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	var render = node.offsetHeight; /* trick pro prerenderovani */

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._jaxElm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=settings.length; i<len; i++) {
			var setting = settings[i];
			var cssEndValue = setting.endValue + setting.startUnit;
			style[setting.property] = cssEndValue;
		}
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
	this._endTransition();
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
