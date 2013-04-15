JAX.NodeDoc = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDoc",
	VERSION: "0.21"
});

JAX.NodeDoc.events = {};

JAX.NodeDoc.prototype.jaxNodeType = 9;

JAX.NodeDoc.prototype.$constructor = function(doc) {
	if (doc && "nodeType" in doc && doc.nodeType == 9) {
		this._doc = doc;
		return;
	}

	throw new Error("JAX.NodeDoc constructor accepts only document. See doc for more information.");
};

JAX.NodeDoc.prototype.$ = function(selector) {
	return JAX.$(selector, this._doc);
};

JAX.NodeDoc.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._doc);
};

JAX.NodeDoc.prototype.listen = function(type, method, obj, bindData) {
	if (!type || !JAX.isString(type)) { 
		throw new Error("JAX.NodeDoclisten: first parameter must be string. See doc for more information."); 
	} else if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { 
		throw new Error("JAX.NodeDoc.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.NodeDoc.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.NodeDoc.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._doc, type, f);
	var evtListeners = JAX.NodeDoc.events[type] || [];

	evtListeners.push(listenerId);
	JAX.NodeDoc.events[type] = evtListeners;

	return listenerId;
};

JAX.NodeDoc.prototype.stopListening = function(type, listenerId) {
	if (!arguments.length) {
		var events = JAX.NodeDoc.events;
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.NodeDoc.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.NodeDoc.events[type]; 
	if (!eventListeners) { console.warn("JAX.NodeDoc.stopListening: no event '" + type + "' found"); return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.NodeDoc.events[type];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	console.warn("JAX.NodeDoc.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.NodeDoc.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};
