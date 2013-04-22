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

	new JAX.E({funcName:"JAX.NodeDoc.$constructor", caller:this.$constructor})
		.expected("first argument", "document element", doc)
		.show(); 
};

JAX.NodeDoc.prototype.$ = function(selector) {
	return JAX.$(selector, this._doc);
};

JAX.NodeDoc.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._doc);
};

JAX.NodeDoc.prototype.listen = function(type, funcMethod, obj, bindData) {
	var error = 15;
	var obj = obj || window;

	if (type && typeof(type) == "string") { error -= 1; }
	if (funcMethod && (typeof(funcMethod) == "string" || typeof(funcMethod) == "function")) { error -= 2; }
	if (typeof(obj) == "object") { error -= 4; }
	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (funcMethod) {
			error -= 8; 
			funcMethod = funcMethod.bind(obj);
		}
	} else {
		error -= 8;
	}

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeDoc.listen", caller:this.listen});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "string or function", funcMethod); }
		if (error & 4) { e.expected("third", "object", obj); }
		if (error & 8) { e.message("Method '" + funcMethod + "' in second argument was not found in third argument " + obj + "."); }
		e.show();
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
		new JAX.E({funcName:"JAX.NodeDoc.stopListening", caller:this.stopListening})
		.expected("first argument", "string", type)
		.show(); 
	}

	var eventListeners = JAX.NodeDoc.events[type]; 
	if (!eventListeners) { return this; }

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

	if (window.console && window.console.warn) { console.warn("JAX.NodeDoc.stopListening: no event listener id '" + listenerId + "' found. See doc for more information."); }
	return this;
};

JAX.NodeDoc.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

