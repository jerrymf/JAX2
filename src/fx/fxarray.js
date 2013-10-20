
JAX.FXArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.FXArray",
	VERSION: "1.0"
});

JAX.FXArray.prototype.$constructor = function(fxArray) {
	this.length = fxArray.length

	for (var i=0; i<this.length; i++) {
		this[i] = fxArray[i];
	}
};

JAX.FXArray.prototype.getItems = function() {
	var arr = new Array(this.length);

	for (var i=0; i<this.length; i++) {
		arr[i] = this[i];
	}

	return arr;
};

JAX.FXArray.prototype.run = function() {
	for (var i=0; i<this.length; i++) {
		this[i].run();
	}

	return this;
};

JAX.FXArray.prototype.then = function(onFulfill, onReject) {
	var fxPromises = new Array(this.length);

	var func = function(jaxElm) {
		return jaxElm;
	};

	for (var i=0; i<this.length; i++) {
		fxPromises[i] = this[i].then(func, func);
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
	for (var i=0; i<this.length; i++) {
		this[i].stop();
	}

	return this;
};

JAX.FXArray.prototype.reverse = function() {
	for (var i=0; i<this.length; i++) {
		this[i].reverse();
	}

	return this;
};
