JAX.HTMLDoc = JAK.ClassMaker.makeClass({
	NAME: "JAX.HTMLDoc",
	VERSION: "0.1"
});

JAX.HTMLDoc.events = {};

JAX.HTMLDoc.prototype.$constructor = function(doc) {
	if (!("nodeType" in doc) || doc.nodeType != 9) { throw new Error("JAX.HTMLDoc constructor accepts only document. See doc for more information.") }
	this._doc = doc;
};

JAX.HTMLDoc.prototype.$ = function(selector) {
	return JAX.$(selector, this._doc);
};

JAX.HTMLDoc.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._doc);
};

JAX.HTMLDoc.prototype.listen = function(type, method, obj, bindData) {
	if (!type || !JAX.isString(type)) { throw new Error("JAX.HTMLDoclisten: first parameter must be string. See doc for more information."); }
	if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { throw new Error("JAX.HTMLDoc.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.HTMLDoc.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.HTMLDoc.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._doc, type, f);
	var evtListeners = JAX.HTMLDoc.events[type] || [];

	evtListeners.push(listenerId);
	JAX.HTMLDoc.events[type] = evtListeners;

	return listenerId;
};

JAX.HTMLDoc.prototype.stopListening = function(type, listenerId) {
	if (!arguments.length) {
		var events = JAX.HTMLDoc.events;
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.HTMLDoc.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.HTMLDoc.events[type]; 
	if (!eventListeners) { console.warn("JAX.HTMLDoc.stopListening: no event '" + type + "' found"); return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.HTMLDoc.events[type];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index == -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	console.warn("JAX.HTMLDoc.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.HTMLDoc.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};

