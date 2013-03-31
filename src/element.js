JAX.Element = JAK.ClassMaker.makeClass({
	NAME: "JAX.Element",
	VERSION: "0.5"
});

JAX.Element._EVENTS = {};

JAX.Element.prototype.ELM = null;

JAX.Element.prototype.$constructor = function(element) {
	if (!("tagName" in element)) { throw new Error("JAX.Element constructor accepts only HTML element as its parameter. See doc for more information.") }
	this._elm = element;
	this.ELM = element;
	JAX.Element._EVENTS[this._elm] = JAX.Element._EVENTS[this._elm] || {};
};

JAX.Element.prototype.$destructor = function() {
	this.destroy();
};

JAX.Element.prototype.destroy = function() {
	this.stopListening();
	this.removeFromDOM();
	delete JAX.Element._EVENTS[this._elm];
	this._elm = null;
	this.ELM = null;
};

JAX.Element.prototype.addClass = function(classname) {
	if (!(classname instanceof String)) { throw new Error("JAX.Element.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
	}

	this._elm.className = classes.join(" ");

	return this;
};

JAX.Element.prototype.removeClass = function(classname) {
	if (!(classname instanceof String)) { throw new Error("JAX.Element.removeClass accepts only string as its parameter. See doc for more information."); }

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

JAX.Element.prototype.id = function(id) {
	if (!id && !(id instanceof String)) { return this.attr("id"); }
	this.attr({id:id});
	return this;
};

JAX.Element.prototype.addElement = function(element) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElement accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.ELM : element;
	this._elm.appendChild(elm);

	return this;
};

JAX.Element.prototype.addElementBefore = function(element, elementBefore) {
	if (!("nodeType" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.Element.addElmBefore accepts only HTML element, textnode or JAX.Element instance as its parameter. See doc for more information."); 
	}

	var elm = element instanceof JAX.Element ? element.ELM : element;
	var elmBefore = elementBefore instanceof JAX.Element ? elementBefore.ELM : elementBefore;

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
	var elm = element instanceof JAX.Element ? element.ELM : element;
	elm.appendChild(this._elm);
	return this;
};

JAX.Element.prototype.appendBefore = function(element) {
	var elm = element instanceof JAX.Element ? element.ELM : element;
	elm.parentNode.insertBefore(this._elm, elm);
	return this;
};

JAX.Element.prototype.removeFromDOM = function() {
	try {
		this._elm.parentNode.removeChild(this._elm);
	} catch(e) {};
	return this;
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
	if (!type || !(type instanceof String)) { throw new Error("JAX.Element.listen: first parameter must be string. See doc for more information."); }
	if (method && !(method instanceof String) && !(method instanceof Function)) { throw new Error("JAX.Element.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.Element.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (method instanceof String) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.Element.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

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

	if (!(type instanceof String) || (method && !(method instanceof String)) {
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

JAX.Element.prototype.attr = function(attributes) {
	if (attributes instanceof String) { attributes = [].concat(attributes); }
	if (attributes instanceof Array) {
		var attrs = [];
		for (var i=0, len=attrsArray.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this._elm.getAttribute(attribute);
		}
		return attrs;	
	}

	for (var p in attributes) {
		var value = attributes[p];
		this._elm.setAttribute(p, value);
	}

	return this;
};

JAX.Element.prototype.style = function(cssStyles) {
	if (cssStyles instanceof String) { cssStyles = [].concat(cssStyles); }
	if (cssStyles instanceof Array) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (property == "opacity") { css[property] = this._getOpacity(); continue; }
			css[cssStyle] = this._elm.style[cssStyle];
		}
		return css;
	}

	for (p in cssStyles) {
		var value = cssStyles[p];
		if (property == "opacity") { this._setOpacity(this._elm, value); continue; }
		this._elm.style[p] = value;
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
			this._fadeOut(duration, function() { 
				this._elm.style.display = "none"; 
				if (callback) { callback(); } 
			}.bind(this));
		break;

		case "slideUp":
			this._slideUp(duration, function() { 
				this._elm.style.display = "none"; 
				if (callback) { callback(); } 
			}.bind(this));
		break;

		default:
			this._elm.style.display = "none";
	}
	return this;
};

JAX.Element.prototype.computedStyle = function(properties) {
	var css = {};
	var properties = [].concat(properties);
	for (var i=0, len=properties.length; i<len; i++) {
		var property = properties[i];
		css[properties] = JAK.DOM.getStyle(this._elm, property);
	}
	return css;
};

JAX.Element.prototype.width = function(value) {
	if (!value && isNaN(value)) { return this._elm.offsetWidth; }

	var paddingLeft = parseInt(this.computedStyle("padding-left"),10);
	var paddingRight = parseInt(this.computedStyle("padding-right"), 10);
	var borderLeft = parseInt(this.computedStyle("border-left"),10);
	var borderRight = parseInt(this.computedStyle("border-right"), 10);

	if (!isNaN(paddingLeft)) { value =- paddingLeft; }
	if (!isNaN(paddingRight)) { value =- paddingRight; }
	if (!isNaN(borderLeft)) { value =- borderLeft; }
	if (!isNaN(borderRight)) { value =- borderRight; }

	this._elm.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.Element.prototype.height = function(value) {
	if (!value && isNaN(value)) { return this._elm.offsetHeight; }

	var paddingTop = parseInt(this.computedStyle("padding-top"),10);
	var paddingBottom = parseInt(this.computedStyle("padding-bottom"), 10);
	var borderTop = parseInt(this.computedStyle("border-top"),10);
	var borderBottom = parseInt(this.computedStyle("border-bottom"), 10);

	if (!isNaN(paddingTop)) { value =- paddingTop; }
	if (!isNaN(paddingBottom)) { value =- paddingBottom; }
	if (!isNaN(borderTop)) { value =- borderTop; }
	if (!isNaN(borderBottom)) { value =- borderBottom; }

	this._elm.style.height = Math.max(value,0) + "px";
	return this;
};

JAX.Element.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client == "ie" || JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
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
	var backupStyle = this.style("opacity");

	animation.addProperty("opacity", parseFloat(opacity) || 0,  1);
	animation.addCallback(function() {
		this.style("opacity", backupStyle);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._fadeOut = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var opacity = this.computedStyle("opacity");
	var backupStyle = this.style("opacity");

	animation.addProperty("opacity", parseFloat(opacity) ||  1, 0);
	animation.addCallback(function() {
		this.style("opacity", backupStyle);
		if (callback) { callback(); }
	}.bind(this));
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
