
JAX.Element.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.Element.FX",
	VERSION: "1.0"
});

JAX.Element.FX.prototype.$constructor = function(jaxElm, jaxFX) {
	this._jaxElm = jaxElm;
	this._jaxFX = jaxFX;
	this._jaxFXFinished = jaxFX ? null : new JAX.Promise().reject(this._jaxElm);
};

JAX.Element.FX.prototype.run = function() {
	this._jaxFXFinished = this._jaxFX.run();
	return this;
};

JAX.Element.FX.prototype.then = function(onFulfill, onReject) {
	return this._jaxFXFinished.then(onFulfill, onReject);
};

JAX.Element.FX.prototype.getAnimation = function() {
	return this._jaxFX;
};

JAX.Element.FX.prototype.getPromise = function() {
	return this._jaxFXFinished;
};

JAX.Element.FX.prototype.getJAXNode = function() {
	return this._jaxElm;
};

JAX.Element.FX.prototype.stop = function() {
	if (this._jaxFX) { this._jaxFX.stop(); }
	return this;
};

JAX.Element.FX.prototype.reverse = function() {
	if (this._jaxFX) { 
		return this._jaxFX.reverse();
	} else {
		return new JAK.Promise().reject();
	}
};