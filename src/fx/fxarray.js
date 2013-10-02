
JAX.FXArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.FXArray",
	VERSION: "1.0"
});

JAX.FXArray.prototype.$constructor = function(fxArray) {
	this._fxArray = fxArray;
};

JAX.FXArray.prototype.run = function() {
	var len = this._fxArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._fxArray[i].run();
	}

	return this;
};

JAX.FXArray.prototype.then = function(onFulfill, onReject) {
	var len = this._fxArray.length;
	var fxPromises = new Array(len);

	var func = function(jaxElm) {
		return jaxElm;
	};

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._fxArray[i].then(func, func);
	}

	var finalFulfill = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onFulfill(nodeArray);
	};

	var finalReject = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onReject(nodeArray);
	};

	return JAK.Promise.when(fxPromises).then(finalFulfill, finalReject);
};

JAX.FXArray.prototype.stop = function() {
	var len = this._fxArray.length;

	for (var i=0; i<len; i++) {
		this._fxArray[i].stop();
	}

	return this;
};

JAX.FXArray.prototype.reverse = function() {
	var len = this._fxArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._fxArray[i].reverse();
	}

	return this;
};
