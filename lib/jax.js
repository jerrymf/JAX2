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

JAX.make = function(tagString, html, srcDocument) {
	var html = html || "";
	var tagName = "";
	var type="";
	var foundString = ""; 
	var classNames = [];
	var ids = [];

	if (typeof(html) != "string") { throw new Error("JAX.make: Second parameter 'html' must be a string"); }

	for (var i=0, len=tagString.length; i<len; i++) {
		if (".#".indexOf(tagString[i]) > -1 || i == len - 1) {
			if (i == 0) { throw new Error("JAX.make: Classname or id can not be first. First must be tagname."); }
			if (i == len -1) { foundString += ("" + tagString[i]); }
			if (foundString && type == "") { tagName = foundString; }
			if (foundString && type == "class") { classNames.push(foundString); }
			if (foundString && type == "id") { ids.push(foundString); }
			foundString = "";
			type = tagString[i] == "#" ? "id" : "class"; 
			continue; 
		}
		foundString += ("" + tagString[i]);
	}

	var elm = new JAX.Element(JAK.mel(tagName, {innerHTML:html}, {}, srcDocument || document));
	if (ids.length) { elm.setId(ids.join(" ")); }
	if (classNames.length) { elm.addClass(classNames.join(" ")); }

	return elm;
};

JAX.Element = JAK.ClassMaker.makeClass({
	NAME: "JAX.Element",
	VERSION: "0.31"
});

JAX.Element._EVENTS = {};

JAX.Element.prototype.$constructor = function(element) {
	if (!("tagName" in element)) { throw new Error("JAX.Element constructor accepts only HTML element as its parameter. See doc for more information.") }
	this._elm = element;
	JAX.Element._EVENTS[this._elm] = JAX.Element._EVENTS[this._elm] || {};
};

JAX.Element.prototype.$destructor = function() {
	this.destroy();
};

JAX.Element.prototype.destroy = function() {
	this.stopListening();
	this.remove();
	delete JAX.Element._EVENTS[this._elm];
	this._elm = null;
};

JAX.Element.prototype.addClass = function(classname) {
	if (typeof(classname) != "string") { throw new Error("JAX.Element.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
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

JAX.Element.prototype.hasClass = function(className) {
	var names = className.split(" ");

	while(names.length) {
		var name = classNames.shift();
		if (this._elm.className.indexOf(name) == -1) { return false; }
	}

	return true;
};

JAX.Element.prototype.setId = function(id) {
	this.attr("id",id);
	return this;
};

JAX.Element.prototype.getId = function() {
	return this.attr("id");
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

JAX.Element.prototype.addElements = function() {
	var elms = arguments;
	if (elms.length == 1 && elms instanceof Array) { elms = elms[0]; }
	for (var i=0, len=elms.length; i<len; i++) { this.addElement(elms[i]); }
	return this;
};

JAX.Element.prototype.appendTo = function(element) {
	var elm = element instanceof JAX.Element ? element.getElm() : element;
	elm.appendChild(this._elm);
	return this;
};

JAX.Element.prototype.appendBefore = function(element) {
	var elm = element instanceof JAX.Element ? element.getElm() : element;
	elm.parentNode.insertBefore(this._elm, elm);
	return this;
};

JAX.Element.prototype.remove = function() {
	this._elm.parentNode.removeChild(this._elm);
	return this;
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
	
	var obj = obj || window;
	if (typeof(method) == "string") {
		var method = obj[method];
		if (!method) { throw new Error("JAX.Element.listen: method '" + method + "' was not found in " + obj + "."); }
	}
	method = method.bind(obj);

	var thisElm = this;
	var f = function(e, elm) { method(e, thisElm, bindParam); }
	var listenerId = JAK.Events.addListener(this._elm, type, f);

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

JAX.Element.prototype.valueOf = function(property, value) {
	if (value === undefined) { return this._elm[property]; }
	this._elm[property] = value;
	return this;
};

JAX.Element.prototype.attr = function(attribute, value) {
	if (value === undefined) { return this._elm.getAttribute(attribute); }
	this._elm.setAttribute(attribute, value);
	return this;
};

JAX.Element.prototype.attrs = function(attributes, values) {
	if (values === undefined) {
		var attrs = {};
		for (var i=0, len=attrsArray.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this._elm.getAttribute(attribute); 
		}
		return attrs;	
	}

	for (var i=0, len=attributes.length; i<len; i++) {
		var attribute = attributes[i];
		var value = values[i];
		this._elm.setAttribute(attribute, value);
	}

	return this;
};

JAX.Element.prototype.style = function(property, value) {
	if (value === undefined) { return this._elm.style[property]; }
	this._elm.style[property] = value;
	return this;
};

JAX.Element.prototype.styles = function(properties, values) {
	if (value === undefined) { 
		var vals = {};
		for (var i=0, len=properties.length; i<len; i++) {
			var property = properties[i];
			vals[property] = this._elm.style[property];
		}
		return vals;
		
	}
	
	for (var i=0, len=properties.length; i<len; i++) {
		var property = properties[i];
		var value = values[i];
		this._elm.style[property] = value;
	}

	return this;
};

JAX.Element.prototype.displayOn = function(displayValue) {
	this.style("display", displayValue || "");
};

JAX.Element.prototype.displayOff = function() {
	this.style("display", "none");
};

JAX.Element.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};
JAX.Elements = JAK.ClassMaker.makeClass({
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

JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.3"
});

JAX.Animation.SUPPORTED_PROPERTIES = [
	{"width":"px"}, 
	{"height":"px"}, 
	{"top":"px"}, 
	{"left":"px"}, 
	{"opacity":""}
];
JAX.Animation.REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element) {
	this._elm = element instanceof JAX.Element ? element.getElm() : element;
	this._properties = [];
	this._interpolators = [];
	this._callback = null;
	this._running = true;
};

JAX.Animation.prototype.addProperty = function(property, duration, start, end, method, privileged) {
	if (JAX.Animation.SUPPORTED_PROPERTIES.indexOf(property) == -1) { throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); }

	var cssEnd = this._parseCSSValue(property, end);
	if (!start && isNaN(start)) { 
		var cssStart = this._parseCSSValue(property, this._getPropertyValue(property)); 
	} else {
		var cssStart = this._parseCSSValue(property, start);
	}

	this._properties.push({
		property: property,
		duration: duration,
		cssStart: cssStart,
		cssEnd: cssEnd,
		method: method || "LINEAR",
		privileged: privileged
	});
};

JAX.Animation.prototype.run = function(callback) {
	this._callback = callback;
	this._initInterpolator();
	this._run();
};

JAX.Animation.prototype.isRunning = function() {
	return this._running;
}

JAX.Animation.prototype.stop = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) {	this._interpolators.stop(); }
	this._running = false;
}

JAX.Animation.prototype._initInterpolator = function() {
	var index = 0;
	var oldPrivileged;

	while(this._properties.length) {
		var property = this._properties.shift();
		if (index && property.privileged != oldPrivileged) { break; }

		var interpolator = new JAK.CSSInterpolator(this._elm, property.duration, {
			"interpolation": property.method,
			"endCallback": this._endInterpolator.bind(this, index)
		});
		interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		this._interpolators.push(interpolator);

		oldPrivileged = property.privileged;
		index++;
	}
};

JAX.Animation.prototype._getPropertyValue = function(property) {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		if (property == "opacity") {
			var value = "";
			this._elm.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
				value = match2;
			});
			return value || 1;
		}
	}

	var value = parseFloat(JAK.DOM.getStyle(this._elm, property));

	if (value == "NaN") {
		if (property == "width") { return this._elm.offsetWidth; }
		if (property == "height") { return this._elm.offsetHeight; }
	}
};

JAX.Animation.prototype._run = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._interpolators[i].start(); }
	this._running = true;
};

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation.SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	var interpolator = this._interpolators.splice(index, 1);
	interpolator.stop();

	if (this._interpolators.length) { return; }
	if (this._properties.length) { this.run(); return; }

	this._running = false;
	this._callback();
};

if (!window.JAX) { window.JAX = JAX; }

})();
