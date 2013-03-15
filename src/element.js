JAX.Element = JAK.ClassMaker({
	NAME: "JAX.Element",
	VERSION: "0.1"
});

JAX.Element.__EVENTS = {};

JAX.Element.prototype.$constructor = function(element) {
	if (!("tagName" in element)) { throw new Error("JAX.Element constructor accepts only HTML element as its parameter. See doc for more information.") }
	this._elm = element;
	JAX.Element.__EVENTS[this._elm] = JAX.Element.__EVENTS[this._elm] || {};
};

JAX.Element.prototype.addClass = function(classname) {
	if (typeof(classname) != "string") { throw new Error("JAX.Element.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classname.shift()) == -1) { classes.push(classname); }
	}

	this._elm.className = classes.join(" ");

	return this;
};

JAX.Element.prototype.removeClass = function(classname) {
	if (typeof(classname) != "string") { throw new Error("JAX.Element.removeClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		var index = classes.indexOf(classname.shift());
		if (index != -1) { classes.splice(index, 1); }
	}

	this._elm.className = classes.join(" ");
	
	return this;
};

JAX.Element.prototype.addElm = function(element) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElement accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.getElm() : element;
	this._elm.appendChild(elm);

	return this;
};

JAX.Element.prototype.addElmBefore = function(element, elementBefore) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElmBefore accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.getElm() : element;
	var elmBefore = elementBefore instanceof JAX.Element ? elementBefore.getElm() : elementBefore;

	this._elm.insertBefore(elm, elmBefore);

	return this;
};

JAX.Element.prototype.getElm = function() {
	return this._elm;
};

JAX.Element.prototype.getParentNode = function() {
	return this._elm.parentNode;
};

JAX.Element.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this._elm.cloneNode(withContent);
	return new JAX.Element(clone);
};

JAX.Element.prototype.listen = function(type, method, obj) {
	if (typeof(type) != "string") { throw new Error("JAX.Element.listen accepts only string as its first parameter. See doc for more information."); }

	if (arguments.length < 4) {
		var listenerId = JAK.Events.addListener(this._elm, type, obj, method);
	} else {
		if (typeof(method == "string")) { var bindMethod = obj[method]; }
		for (var i=3, len=arguments.length; i<len; i++) { bindMedhod = method.bind(obj, arguments[i]); }
		var listenerId = JAK.Events.addListener(this._elm, type, obj, method);
	}

	var eventListeners = JAX.Element.__EVENTS[this._elm][type] || [];
	eventListeners.concat({id:listenerId, method:method});

	JAX.Element.__EVENTS[this._elm][type] = eventListeners;

	return listenerId;
};

JAX.Element.prototype.stopListening = function(type) {
	if (typeof(type) != "string" || (method && typeof(method) != "string")) {
		throw new Error("JAX.Element.stopListening bad arguments. See doc for more information.")
	}

	if (!method) { 
		var eventListeners = JAX.Element.__EVENTS[this._elm][event]; 
		if (!eventListeners) { throw new Error("JAX.Element.stopListening: no event '" + event + "' found"); }
		this._destroyEvents(eventListeners);
		delete JAX.Element.__EVENTS[this._elm][event];
		return;
	}
	
	var method = obj[method];
	var eventListeners = JAX.Element.__EVENTS[this._elm][event.type];
	if (!eventListeners) { return; }

	var index = eventListeners.indexOf(event.id);
	if (index == -1) { return; }

	this._destroyEvents(eventListeners[index]]);
	eventListeners.splice(index, 1);

	return this;
};

JAX.Element.prototype.stopAllListening = function() {
	var events = JAX.Element.__EVENTS[this._elm];

	for (var p in events) { this.stopListening(p); }
	return;
}

JAX.Element.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) {
		var id = eventListeners[i].id;
		JAK.Events.removeListener(id);
	}
}
