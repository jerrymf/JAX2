(function() {
JAX = {
	VERSION: "1.91b"
};

JAX.$ = function(query, element, filter) {
	if (typeof(query) != "string") { throw new Error("JAX.$ accepts only String as the first parameter. See doc for more information.")};
	if (!("querySelectorAll" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$ accepts only HTML element with querySelectorAll support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElms = (sourceElm instanceof JAX.Element ? sourceElm.getElm() : elm).querySelectorAll(query);
	var jaxelms = foundElms.length ? new JAX.Elements(foundElms) : null;

	if (filter) { jaxelms = jaxelms.filter(filter, this); }

	return jaxelms; 
};

JAX.$$ = function(query, element) {
	if (typeof(query) != "string") { throw new Error("JAX.$$ accepts only String as the first parameter.")};
	if (!("querySelector" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$$ accepts only HTML element with querySelector support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElm = (sourceElm instanceof JAX.Element ? sourceElm.getElm() : elm).querySelector(query);
	var jaxelm = foundElm ? new JAX.Element(foundElm) : null;

	return jaxelm;
};

JAX.Element = JAK.ClassMaker({
	NAME: "JAX.Element",
	VERSION: "0.2"
});

JAX.Element._EVENTS = {};

JAX.Element.prototype.$constructor = function(element) {
	if (!("tagName" in element)) { throw new Error("JAX.Element constructor accepts only HTML element as its parameter. See doc for more information.") }
	this._elm = element;
	JAX.Element._EVENTS[this._elm] = JAX.Element._EVENTS[this._elm] || {};
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

JAX.Element.prototype.addElement = function(element) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElement accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.getElm() : element;
	this._elm.appendChild(elm);

	return this;
};

JAX.Element.prototype.addElementBefore = function(element, elementBefore) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElmBefore accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.getElm() : element;
	var elmBefore = elementBefore instanceof JAX.Element ? elementBefore.getElm() : elementBefore;

	this._elm.insertBefore(elm, elmBefore);

	return this;
};

JAX.Element.prototype.addElements = function(elements) {
	for (var i=0, len=elements.length; i<len; i++) {
		this.appendElement(elements[i]);
	}
};

JAX.Element.prototype.appendTo = function(element) {
	var elm = element instanceof JAX.Element ? element.getElm() : element;
	element.appendChild(this._elm);
};

JAX.Element.prototype.appendBefore = function(element) {
	var elm = element instanceof JAX.Element ? element.getElm() : element;
	element.parentNode.insertBefore(this._elm, elm);	
};

JAX.Element.prototype.remove = function() {
	this._elm.parentNode.removeChild(this._elm);
};

JAX.Element.prototype.getElm = function() {
	return this._elm;
};

JAX.Element.prototype.getParent = function() {
	return this._elm.parentNode;
};

JAX.Element.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this._elm.cloneNode(withContent);
	return new JAX.Element(clone);
};

JAX.Element.prototype.listen = function(type, method, obj, bindParam) {
	if (!type || typeof(type) != "string") { throw new Error("JAX.Element.listen: first parameter must be string. See doc for more information."); }
	if (method && typeof(method) != "string" && !(method instanceof Function)) { throw new Error("JAX.Element.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.Element.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (arguments.length == 2) {
		var listenerId = JAK.Events.addListener(this._elm, type, method);
	} else if (arguments.length == 3) {
		var listenerId = JAK.Events.addListener(this._elm, type, obj, method);
	} else if (arguments.length > 3) {
		var obj = obj || window;
		if (typeof(method) == "string") { 
			var method = obj[method];
			if (!method) { throw new Error("JAX.Element.listen: method '" + method + "' was not found in " + obj + "."); }
		}
		var listenerId = JAK.Events.addListener(this._elm, type, obj, method.bind(obj, bindParam));
	}

	var eventListeners = JAX.Element._EVENTS[this._elm][type] || [];
	eventListeners = eventListeners.concat(listenerId);

	JAX.Element._EVENTS[this._elm][type] = eventListeners;

	return listenerId;
};

JAX.Element.prototype.stopListening = function(type, listenerId) {
	if (!type) {
		var events = JAX.Element._EVENTS[this._elm];
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (typeof(type) != "string" || (method && typeof(method) != "string")) {
		throw new Error("JAX.Element.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.Element._EVENTS[this._elm][type]; 
	if (!eventListeners) { console.warn("JAX.Element.stopListening: no event '" + event + "' found"); return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.Element._EVENTS[this._elm][event];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index == -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	console.warn("JAX.Element.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.Element.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) {
		var id = eventListeners[i];
		JAK.Events.removeListener(id);
	}
};
JAX.Elements = JAK.ClassMaker({
	NAME: "JAX.Elements",
	VERSION: "0.2"
});

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

JAX.Elements.prototype.stopListening = function(type) {
	for (var i=0, len=this._jaxelms.length; i<len; i++) {
		this._jaxelms[i].stopListening(type);
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

if (!window.JAX) { window.JAX = JAX; }

})();
