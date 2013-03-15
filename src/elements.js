JAX.Elements = JAK.ClassMaker({
	NAME: "JAX.Elements",
	VERSION: "0.1"
});

JAK.Elements.__EVENTS = {};

JAX.Elements.prototype.$constructor = function(elements) {
	this._jaxelms = [];
	for (var i=0, len=elements.length; i<len; i++) {
		this._jaxelms.push(new JAX.Element(elements[i]));
	}
};

JAX.Elements.prototype.addClass = function(classname) {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		this._jaxelms[i].addClass(classname);
	}

	return this;
};

JAX.Elements.prototype.removeClass = function(classname) {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		this._jaxelms[i].removeClass(classname);
	}

	return this;
};

JAX.Elements.prototype.listen = function(type, method, obj) {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		this._jaxelms[i].listen(type, method, obj);
	}

	return this;
};

JAX.Elements.prototype.stopListening = function(eventName) {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		listeners.push(this._jaxelms[i].stopListening(eventName));
	}

	return this;	
};

JAX.Elements.prototype.stopAllListening = function() {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		listeners.push(this._jaxelms[i].stopAllListening());
	}

	return this;	
};

JAX.Elements.prototype.getJAXElms = function() {
	return this._jaxelms.slice();
};

JAX.Elements.prototype.getElms = function() {
	var elms = [];

	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		elms.push(this._jaxelms.getElm());
	}

	return elms;
};

