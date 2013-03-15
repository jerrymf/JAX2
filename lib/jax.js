(function() {
JAX = {
	VERSION: "1.9b"
};

JAX.$ = function(query, element) {
	if (typeof(query) != "string") { throw new Error("JAX.$ accepts only String as the first parameter. See doc for more information.")};
	if (!("querySelectorAll" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$ accepts only HTML element with querySelectorAll support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElms = (sourceElm instanceof JAX.Element ? sourceElm.getElm() : elm).querySelectorAll(query);
	var jaxelms = foundElms.length ? new JAX.Elements(foundElms) : null;

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

if (!window.JAX) { window.JAX = JAX; }

})();
