
JAX.NodeArray.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray.FX",
	VERSION: "1.0"
});

JAX.NodeArray.FX.prototype.$constructor = function(jaxElementFXArray) {
	this._jaxElementFXArray = jaxElementFXArray;
};

JAX.NodeArray.FX.prototype.then = function(onFulfill, onReject) {
	var len = this._jaxElementFXArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._jaxElementFXArray[i].getPromise();
	}

	var fulfill = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onFulfill(nodeArray);
	};

	var reject = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onReject(nodeArray);
	};

	return JAK.Promise.when(fxPromises).then(fulfill, reject);
};

JAX.NodeArray.FX.prototype.stop = function() {
	var len = this._jaxElementFXArray.length;

	for (var i=0; i<len; i++) {
		this._jaxElementFXArray[i].stop();
	}

	return this;
};

JAX.NodeArray.FX.prototype.reverse = function() {
	var len = this._jaxElementFXArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._jaxElementFXArray[i].reverse();
	}

	return JAK.Promise.when(fxPromises);
};
