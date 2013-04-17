JAX.NodeDoc = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDoc",
	VERSION: "0.21"
});

JAX.NodeDoc.events = {};

JAX.NodeDoc.prototype.jaxNodeType = 9;

JAX.NodeDoc.prototype.$constructor = function(doc) {
	if (typeof(doc) == "object" && doc.nodeType && doc.nodeType == 9) {
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

JAX.NodeDoc.prototype.listen = function(type, funcMethod, obj, bindData) {
	if (!type || !typeof(type) == "string") { 
		throw new Error("JAX.NodeDoc.listen: first parameter must be string. See doc for more information."); 
	} else if (!funcMethod || (typeof(funcMethod) != "string" && typeof(funcMethod) != "string")) { 
		throw new Error("JAX.NodeDoc.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.NodeDoc.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (typeof(funcMethod) == "string") {
		var obj = obj || window;
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("JAX.NodeDoc.listen: funcMethod '" + funcMethod + "' was not found in " + obj + "."); }
		funcMethod = funcMethod.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { funcMethod(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._doc, type, f);
	var evtListeners = JAX.NodeDoc.events[type] || [];
	evtListeners.push(listenerId);
	JAX.NodeDoc.events[type] = evtListeners;
	
	return listenerId;
};

JAX.NodeDoc.prototype.stopListening = function(type, listenerId) {
	if (!arguments.length) {
		var events = JAX.NodeDoc.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		JAX.NodeDoc.events = {};
		return this;
	}

	if (typeof(type) != "string") {
		throw new Error("JAX.NodeDoc.stopListening: type must be string. See doc for more information.")
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

