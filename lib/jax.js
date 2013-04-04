(function() {
JAX = {
	VERSION: "1.91b"
};

JAX.$ = function(query, element, filter) {
	if (typeof(query) !== "string") { throw new Error("JAX.$ accepts only String as the first parameter. See doc for more information.")};
	if (element && !("querySelectorAll" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$ accepts only HTML element with querySelectorAll support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElms = (sourceElm instanceof JAX.Element ? sourceElm.ELM : sourceElm).querySelectorAll(query);
	var jaxelms = [];

	for (var i=0, len=foundElms.length; i<len; i++) {
		jaxelms.push(new JAX.Element(foundElms[i]));
	}

	if (filter) { jaxelms = jaxelms.filter(filter, this); }

	return jaxelms;
};

JAX.$$ = function(query, element) {
	if (typeof(query) !== "string") { throw new Error("JAX.$$ accepts only String as the first parameter.")};
	if (element && !("querySelector" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$$ accepts only HTML element with querySelector support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElm = (sourceElm instanceof JAX.Element ? sourceElm.ELM : sourceElm).querySelector(query);
	var jaxelm = foundElm ? new JAX.Element(foundElm) : null;

	return jaxelm;
};

JAX.make = function(tagString, html, srcDocument) {
	var html = html || "";
	var tagName = "";
	var type="tagname";
	var attributes = {innerHTML:html};
	var currentAttrName = "";
	var inAttributes = false;

	if (typeof(html) !== "string") { throw new Error("JAX.make: Second parameter 'html' must be a string"); }
	if (tagString.length && ".#[=] ".indexOf(tagString[0]) > -1) { throw new Error("JAX.make: Tagname must be first."); }

	for (var i=0, len=tagString.length; i<len; i++) {
		var character = tagString[i];

		switch(character) {
			case ".":
				if (inAttributes && type == "attribute-value") { break; }

				if (!("className" in attributes)) { 
					attributes["className"] = ""; 
				} else {
					attributes["className"] += " "; 
				}

				type="attribute-value"; 
				currentAttrName = "className";
				continue;
			break;
			case "#":
				if (inAttributes && type == "attribute-value") { break; }

				if (!("id" in attributes)) {
					attributes["id"] = "";
				} else {	
					attributes["id"] += " ";
				}

				type="attribute-value"; 
				currentAttrName = "id";
				continue;
			break;
			case "[":
				type="attribute-name"; 
				currentAttrName = "";
				inAttributes = true;
				continue;
			break;
			case "=":
				if (type != "attribute-name") { break; }
				attributes[currentAttrName] = "";
				type="attribute-value";
				continue; 
			break;
			case "]":
				type="";
				inAttributes = false;
				continue;
			break;
			case " ":
				if (type != "attribute-value") { continue; }
			break;
		}

		switch(type) {
			case "tagname": 
				tagName += (character + ""); 
			break;
			case "attribute-name":
				currentAttrName += (character + "");
			break;
			case "attribute-value":
				attributes[currentAttrName] += (character + "");
			break;
		}

	}

	var elm = new JAX.Element(JAK.mel(tagName, attributes, {}, srcDocument || document));
	return elm;
};

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
	if (typeof(classname) !== "string") { throw new Error("JAX.Element.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
	}

	this._elm.className = classes.join(" ");

	return this;
};

JAX.Element.prototype.removeClass = function(classname) {
	if (typeof(classname) !== "string") { throw new Error("JAX.Element.removeClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._elm.className.split(" ");

	while(classnames.length) {
		var index = classes.indexOf(classnames.shift());
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
	if (typeof(id) !== "string") { return this.attr("id"); }
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
	if (!type || typeof(type) !== "string") { throw new Error("JAX.Element.listen: first parameter must be string. See doc for more information."); }
	if (method && typeof(method) !== "string" && !(method instanceof Function)) { throw new Error("JAX.Element.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.Element.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (typeof(method) === "string") {
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

	if (typeof(type) !== "string" || (method && typeof(method) !== "string")) {
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
	if (typeof(attributes) === "string") { return this._elm.getAttribute(attributes); }
	if (attributes instanceof Array) {
		var attrs = {};
		for (var i=0, len=attributes.length; i<len; i++) { 
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
	if (typeof(cssStyles) === "string") { return cssStyles == "opacity" ? this._getOpacity() : this._elm.style[cssStyles]; }
	if (cssStyles instanceof Array) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._elm.style[cssStyle];
		}
		return css;
	}

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
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

JAX.Element.prototype.computedStyle = function(cssStyles) {
	var css = {};
	var properties = [].concat(cssStyles);
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		css[cssStyle] = JAK.DOM.getStyle(this._elm, cssStyle);
	}
	return css;
};

JAX.Element.prototype.width = function(value) {
	if (isNaN(value)) { return this._elm.offsetWidth; }

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
	if (isNaN(value)) { return this._elm.offsetHeight; }

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

JAX.Element.prototype.html = function(innerHTML) {
	this._elm.innerHTML = innerHTML;
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

	this._elm.style[property] = value + "";

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
		this.style({"opacity":backupStyle});
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
		this.style({"opacity":backupStyle});
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._slideDown = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.style(["height","width","overflow"]);
	this.style({"overflow": "hidden", "width": this.width() + "px"});

	animation.addProperty("height", 0, this.height());
	animation.addCallback(function() {
		this.styles(backupStyles);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._slideUp = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.style(["height","width","overflow"]);
	this.style({"overflow": "hidden", "width": this.width() + "px"});

	animation.addProperty("height", this.height(), 0);
	animation.addCallback(function() {
		this.styles(backupStyles);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.Element.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};
JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.3"
});

JAX.Animation.TRANSITION_PROPERTY = "";
JAX.Animation.TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd"
    };

	for (p in transitions) {
		if (p in JAX.make("div")) {
			JAX.Animation.TRANSITION_PROPERTY = p;
			JAX.Animation.TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.Animation.SUPPORTED_PROPERTIES = {
	"width":"px", 
	"height":"px", 
	"top":"px", 
	"left":"px", 
	"opacity":""
};
JAX.Animation.REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element, duration, method) {
	this._elm = element instanceof JAX.Element ? element.ELM : element;
	this._properties = [];
	this._interpolator = null;
	this._callback = null;
	this._duration = (duration || 1) * 1000;
	this._method = method || "LINEAR";
	this._running = false;
};

JAX.Animation.prototype.addProperty = function(property, start, end) {
	if (!(property in JAX.Animation.SUPPORTED_PROPERTIES)) { throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); }

	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 

	this._properties.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd
	});
};

JAX.Animation.prototype.addCallback = function(callback) {
	this._callback = callback;
}

JAX.Animation.prototype.run = function() {
	this._interpolator = new JAK.CSSInterpolator(this._elm, this._duration, {
		"interpolation": this._method,
		"endCallback": this._endInterpolator.bind(this)
	});

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		this._interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
	}

	this._interpolator.start();
	this._running = true;
};

JAX.Animation.prototype.isRunning = function() {
	return this._running;
}

JAX.Animation.prototype.stop = function() {
	this._interpolator.stop();
	this._running = false;
}

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation.SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	this._running = false;
	if (this._callback) { this._callback(); }
};

if (!window.JAX) { window.JAX = JAX; }

})();
