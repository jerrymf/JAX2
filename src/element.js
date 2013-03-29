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
		var name = names.shift();
		if (this._elm.className.indexOf(name) != -1) { return true; }
	}

	return false;
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

JAX.Element.prototype.removeFromDOM = function() {
	this._elm.parentNode.removeChild(this._elm);
	return this;
};

JAX.Element.prototype.getElm = function() {
	return this._elm;
};

JAX.Element.prototype.getParent = function() {
	return new JAX.Element(this._elm.parentNode);
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
		var attrs = [];
		var vals = [];
		for (var i=0, len=attrsArray.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs.push(attribute);
			vals.push(this._elm.getAttribute(attribute));
		}
		return {attributes:attrs, values:vals};	
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
	if (values === undefined) { 
		var vals = [];
		var props = [];
		for (var i=0, len=properties.length; i<len; i++) {
			var property = properties[i];
			if (property == "opacity") { vals[property] = this._getOpacity(); continue; }
			props.push(property);
			vals.push(this._elm.style[property] || "");
		}
		return {properties:props, values:vals};
		
	}
	
	for (var i=0, len=properties.length; i<len; i++) {
		var property = properties[i];
		var value = values[i];
		if (property == "opacity") { this._setOpacity(this._elm, value); continue; }
		this._elm.style[property] = value;
	}

	return this;
};

JAX.Element.prototype.displayOn = function(displayValue, withEffect, duration, callback) {
	this._elm.style.display = displayValue || "";

	switch(withEffect) {
		case "fadeIn":
			this._fadeIn(duration, callback);
		break;
		case "slideDown":
			this._slideDown(duration, callback);
		break;
	}

	return this;
};

JAX.Element.prototype.displayOff = function(withEffect, duration, callback) {
	switch(withEffect) {
		case "fadeOut":
			this._fadeOut(duration, function() { this._elm.style.display = "none"; if (callback) { callback(); } }.bind(this));
		break;

		case "slideUp":
			this._slideUp(duration, function() { this._elm.style.display = "none"; if (callback) { callback(); } }.bind(this));
		break;

		default:
			this._elm.style.display = "none";
	}
	return this;
};

JAX.Element.prototype.computedStyle = function(property) {
	return JAK.DOM.getStyle(this._elm, property);
};

JAX.Element.prototype.width = function(value) {
	if (value === undefined) { return this._elm.offsetWidth; }
	this._elm.style.width = value + "px";
	return this;
};

JAX.Element.prototype.height = function(value) {
	if (value === undefined) { return this._elm.offsetHeight; }
	this._elm.style.height = value + "px";
	return this;
};

JAX.Element.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client == "ie" || JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*val);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + val + ");";
	} else {
		property = "opacity";
	}

	this._elm.style[property] = value;

};

JAX.Element.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._elm.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._elm.style["opacity"];
};

JAX.Element.prototype._fadeIn = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var opacity = this.computedStyle("opacity");

	animation.addProperty("opacity", parseFloat(opacity) || 0,  1);
	animation.addCallback(callback);
	animation.run();

	return animation;
};

JAX.Element.prototype._fadeOut = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);

	var opacity = this.computedStyle("opacity");
	animation.addProperty("opacity", parseFloat(opacity) ||  1, 0);

	animation.addCallback(callback);
	animation.run();

	return animation;
};

JAX.Element.prototype._slideDown = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.styles(["height","width","overflow"]);
	this.style("overflow", "hidden");
	this.style("width", this.width() + "px");

	animation.addProperty("height", 0, this.height());
	animation.addCallback(function() {
		this.styles(backupStyles.properties, backupStyles.values);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._slideUp = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.styles(["height","width","overflow"]);
	this.style("overflow", "hidden");
	this.style("width", this.width() + "px");

	animation.addProperty("height", this.height(), 0);
	animation.addCallback(function() {
		this.styles(backupStyles.properties, backupStyles.values);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};
