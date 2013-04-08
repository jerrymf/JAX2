(function() {
JAX = {
	VERSION: "1.92b"
};

JAX.$ = function(query, element, filter) {
	if (typeof(query) != "string") { throw new Error("JAX.$ accepts only String as the first parameter. See doc for more information.")};
	if (element && !("querySelectorAll" in element) && !(element instanceof JAX.HTMLElm)) { 
		throw new Error("JAX.$ accepts only HTML element with querySelectorAll support or JAX.HTMLElm instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElms = (sourceElm instanceof JAX.HTMLElm ? sourceElm.NODE : sourceElm).querySelectorAll(query);
	var jaxelms = [];

	for (var i=0, len=foundElms.length; i<len; i++) {
		jaxelms.push(new JAX.HTMLElm(foundElms[i]));
	}

	if (filter) { jaxelms = jaxelms.filter(filter, this); }

	return jaxelms;
};

JAX.$$ = function(query, element) {
	if (typeof(query) != "string") { throw new Error("JAX.$$ accepts only String as the first parameter.")};
	if (element && !("querySelector" in element) && !(element instanceof JAX.HTMLElm)) { 
		throw new Error("JAX.$$ accepts only HTML element with querySelector support or JAX.HTMLElm instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElm = (sourceElm instanceof JAX.HTMLElm ? sourceElm.NODE : sourceElm).querySelector(query);
	var jaxelm = foundElm ? new JAX.HTMLElm(foundElm) : null;

	return jaxelm;
};

JAX.make = function(tagString, html, srcDocument) {
	var html = html || "";
	var tagName = "";
	var type="tagname";
	var attributes = {innerHTML:html};
	var currentAttrName = "";
	var inAttributes = false;

	if (typeof(html) != "string") { throw new Error("JAX.make: Second parameter 'html' must be a string"); }
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

	var elm = new JAX.HTMLElm(JAK.mel(tagName, attributes, {}, srcDocument || document));
	return elm;
};

JAX.makeText = function(text) {
	return new JAX.TextNode(JAK.ctext(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	var val = parseFloat(value);
	return val === (value * 1) && !isNaN(val) && value != Infinity;
};

JAX.isString = function(value) {
	return typeof(value) == "string";
};

JAX.isArray = function(value) {
	return value instanceof Array;
};

JAX.isFunction = function(value) {
	return value instanceof Function;
};

JAX.isBoolean = function(value) {
	return value === true || value === false;
};

JAX.isDate = function(value) {
	return value instanceof Date;
};

JAX.INode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.Node",
	VERSION: "0.1"
});

JAX.INode.prototype.NODE = null;
JAX.INode.prototype.appendTo = function(node) {};
JAX.INode.prototype.appendBefore = function(node) {};
JAX.INode.prototype.removeFromDOM = function() {};
JAX.INode.prototype.getParent = function() {};

JAX.HTMLElm = JAK.ClassMaker.makeClass({
	NAME: "JAX.HTMLElm",
	VERSION: "0.6",
	IMPLEMENTS:JAX.INode
});

JAX.HTMLElm._EVENTS = {};

JAX.HTMLElm.prototype.$constructor = function(node) {
	if (!("tagName" in node)) { throw new Error("JAX.HTMLElm constructor accepts only HTML node as its parameter. See doc for more information.") }
	this.NODE = node;
	JAX.HTMLElm._EVENTS[this.NODE] = JAX.HTMLElm._EVENTS[this.NODE] || {};
};

JAX.HTMLElm.prototype.$destructor = function() {
	this.destroy();
};

JAX.HTMLElm.prototype.destroy = function() {
	this.stopListening();
	this.removeFromDOM();
	this.clear();
	delete JAX.HTMLElm._EVENTS[this.NODE];
	this.NODE = null;
};

JAX.HTMLElm.prototype.$ = function(query, filter) {
	return JAX.$(query, this.NODE, filter);
};

JAX.HTMLElm.prototype.$$ = function(query) {
	return JAX.$$(query, this.NODE);
};

JAX.HTMLElm.prototype.addClass = function(classname) {
	if (typeof(classname) != "string") { throw new Error("JAX.HTMLElm.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this.NODE.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
	}

	this.NODE.className = classes.join(" ");

	return this;
};

JAX.HTMLElm.prototype.removeClass = function(classname) {
	if (typeof(classname) != "string") { throw new Error("JAX.HTMLElm.removeClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this.NODE.className.split(" ");

	while(classnames.length) {
		var index = classes.indexOf(classnames.shift());
		if (index != -1) { classes.splice(index, 1); }
	}

	this.NODE.className = classes.join(" ");
	
	return this;
};

JAX.HTMLElm.prototype.hasClass = function(className) {
	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (this.NODE.className.indexOf(name) != -1) { return true; }
	}

	return false;
};

JAX.HTMLElm.prototype.id = function(id) {
	if (typeof(id) != "string") { return this.attr("id"); }
	this.attr({id:id});
	return this;
};

JAX.HTMLElm.prototype.addNode = function(node) {
	if (!("nodeType" in node) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.addNode accepts only HTML node, textnode, JAX.HTMLElm or JAX.TextNode instance as its parameter. See doc for more information."); 
	}

	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	this.NODE.appendChild(node);

	return this;
};

JAX.HTMLElm.prototype.addNodeBefore = function(node, nodeBefore) {
	if (!("nodeType" in node) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.addNodeBefore accepts only HTML node, textnode, JAX.HTMLElm or JAX.TextNode instance as its parameter. See doc for more information."); 
	}

	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	var nodeBefore = nodeBefore instanceof JAX.HTMLElm ? nodeBefore.NODE : nodeBefore;

	this.NODE.insertBefore(node, nodeBefore);

	return this;
};

JAX.HTMLElm.prototype.addNodes = function() {
	var nodes = arguments;
	if (nodes.length == 1 && nodes instanceof Array) { nodes = nodes[0]; }
	for (var i=0, len=nodes.length; i<len; i++) { this.addNode(nodes[i]); }
	return this;
};

JAX.HTMLElm.prototype.appendTo = function(node) {
	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	node.appendChild(this.NODE);
	return this;
};

JAX.HTMLElm.prototype.appendBefore = function(node) {
	var node = node.NODE ? node.NODE : node;
	node.parentNode.insertBefore(this.NODE, node);
	return this;
};

JAX.HTMLElm.prototype.removeFromDOM = function() {
	try {
		this.NODE.parentNode.removeChild(this.NODE);
	} catch(e) {};
	return this;
};

JAX.HTMLElm.prototype.getParent = function() {
	if (this.NODE.parentNode) { return new JAX.HTMLElm(this.NODE.parentNode); }
	return null;
};

JAX.HTMLElm.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this.NODE.cloneNode(withContent);
	return new JAX.HTMLElm(clone);
};

JAX.HTMLElm.prototype.listen = function(type, method, obj, bindData) {
	if (!type || typeof(type) != "string") { throw new Error("JAX.HTMLElm.listen: first parameter must be string. See doc for more information."); }
	if (method && typeof(method) != "string" && !(method instanceof Function)) { throw new Error("JAX.HTMLElm.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.HTMLElm.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (typeof(method) == "string") {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.HTMLElm.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this.NODE, type, f);

	var eventListeners = JAX.HTMLElm._EVENTS[this.NODE][type] || [];
	eventListeners = eventListeners.concat(listenerId);

	JAX.HTMLElm._EVENTS[this.NODE][type] = eventListeners;

	return listenerId;
};

JAX.HTMLElm.prototype.stopListening = function(type, listenerId) {
	if (!type) {
		var events = JAX.HTMLElm._EVENTS[this.NODE];
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (typeof(type) != "string" || (method && typeof(method) != "string")) {
		throw new Error("JAX.HTMLElm.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.HTMLElm._EVENTS[this.NODE][type]; 
	if (!eventListeners) { console.warn("JAX.HTMLElm.stopListening: no event '" + event + "' found"); return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.HTMLElm._EVENTS[this.NODE][event];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index == -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	console.warn("JAX.HTMLElm.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.HTMLElm.prototype.attr = function(attributes) {
	if (typeof(attributes) === "string") { return this.NODE.getAttribute(attributes); }
	if (attributes instanceof Array) {
		var attrs = {};
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this.NODE.getAttribute(attribute);
		}
		return attrs;	
	}

	for (var p in attributes) {
		var value = attributes[p];
		this.NODE.setAttribute(p, value);
	}

	return this;
};

JAX.HTMLElm.prototype.style = function(cssStyles) {
	if (typeof(cssStyles) === "string") { return cssStyles == "opacity" ? this._getOpacity() : this.NODE.style[cssStyles]; }
	if (cssStyles instanceof Array) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this.NODE.style[cssStyle];
		}
		return css;
	}

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
		this.NODE.style[p] = value;
	}

	return this;
};

JAX.HTMLElm.prototype.displayOn = function(displayValue, withEffect, duration, callback) {
	this.NODE.style.display = displayValue || "";

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

JAX.HTMLElm.prototype.displayOff = function(withEffect, duration, callback) {
	switch(withEffect) {
		case "fadeOut":
			this._fadeOut(duration, function() { 
				this.NODE.style.display = "none"; 
				if (callback) { callback(); } 
			}.bind(this));
		break;

		case "slideUp":
			this._slideUp(duration, function() { 
				this.NODE.style.display = "none"; 
				if (callback) { callback(); } 
			}.bind(this));
		break;

		default:
			this.NODE.style.display = "none";
	}
	return this;
};

JAX.HTMLElm.prototype.computedStyle = function(cssStyles) {
	var css = {};
	var properties = [].concat(cssStyles);
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		css[cssStyle] = JAK.DOM.getStyle(this.NODE, cssStyle);
	}
	return css;
};

JAX.HTMLElm.prototype.width = function(value) {
	if (!arguments.length) { return this.NODE.offsetWidth; }

	var paddingLeft = parseInt(this.computedStyle("padding-left"),10);
	var paddingRight = parseInt(this.computedStyle("padding-right"), 10);
	var borderLeft = parseInt(this.computedStyle("border-left"),10);
	var borderRight = parseInt(this.computedStyle("border-right"), 10);

	if (!isNaN(paddingLeft)) { value =- paddingLeft; }
	if (!isNaN(paddingRight)) { value =- paddingRight; }
	if (!isNaN(borderLeft)) { value =- borderLeft; }
	if (!isNaN(borderRight)) { value =- borderRight; }

	this.NODE.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.HTMLElm.prototype.height = function(value) {
	if (!arguments.length) { return this.NODE.offsetHeight; }

	var paddingTop = parseInt(this.computedStyle("padding-top"),10);
	var paddingBottom = parseInt(this.computedStyle("padding-bottom"), 10);
	var borderTop = parseInt(this.computedStyle("border-top"),10);
	var borderBottom = parseInt(this.computedStyle("border-bottom"), 10);

	if (!isNaN(paddingTop)) { value =- paddingTop; }
	if (!isNaN(paddingBottom)) { value =- paddingBottom; }
	if (!isNaN(borderTop)) { value =- borderTop; }
	if (!isNaN(borderBottom)) { value =- borderBottom; }

	this.NODE.style.height = Math.max(value,0) + "px";
	return this;
};

JAX.HTMLElm.prototype.html = function(innerHTML) {
	if (!arguments.length) { return innerHTML; }
	this.NODE.innerHTML = innerHTML;
	return this;
};

JAX.HTMLElm.prototype.nextSibling = function() {
	return this.NODE.nextSibling ? new JAX.HTMLElm(this.NODE.nextSibling) : null;
};

JAX.HTMLElm.prototype.prevSibling = function() {
	return this.NODE.previousSibling ? new JAX.HTMLElm(this.NODE.previousSibling) : null;
};

JAX.HTMLElm.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this.NODE.childNodes.length; i<len; i++) {
		var childNode = this.NODE.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.TextNode(childNode)); continue; }
		nodes.push(new JAX.HTMLElm(childNode));
	}
	return nodes;
};

JAX.HTMLElm.prototype.clear = function() {
	JAK.DOM.clear(this.NODE);
	return this;
};

JAX.HTMLElm.prototype.contains = function(node) {
	var elm = node.NODE ? node.NODE.parentNode : node.parentNode;
	while(elm) {
		if (elm == this.NODE) { return true; }
		elm = elm.parentNode;
	}
	return false;
};

JAX.HTMLElm.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client == "ie" || JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}

	this.NODE.style[property] = value + "";

};

JAX.HTMLElm.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this.NODE.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this.NODE.style["opacity"];
};

JAX.HTMLElm.prototype._fadeIn = function(duration, callback) {
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

JAX.HTMLElm.prototype._fadeOut = function(duration, callback) {
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

JAX.HTMLElm.prototype._slideDown = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.style(["height","width","overflow"]);
	var width = parseInt(this.computedStyle("width")) || this.width();
	this.style({"overflow": "hidden", "width": width + "px"});

	animation.addProperty("height", 0, this.height());
	animation.addCallback(function() {
		this.styles(backupStyles);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.HTMLElm.prototype._slideUp = function(duration, callback) {
	var animation = new JAX.Animation(this, duration);
	var backupStyles = this.style(["height","width","overflow"]);
	var width = parseInt(this.computedStyle("width")) || this.width();
	this.style({"overflow": "hidden", "width": width + "px"});

	animation.addProperty("height", this.height(), 0);
	animation.addCallback(function() {
		this.styles(backupStyles);
		if (callback) { callback(); }
	}.bind(this));
	animation.run();

	return animation;
};

JAX.HTMLElm.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};
JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.TextNode",
	VERSION: "0.1",
	IMPLEMENTS:JAX.INode
});

JAX.TextNode.prototype.$constructor = function(node) {
	if (!("nodeType" in node) || node.nodeType != 3) { throw new Error("JAX.TextNode constructor accepts only HTML node as its parameter. See doc for more information.") }
	this.NODE = node;
};

JAX.TextNode.prototype.appendTo = function(node) {
	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	node.appendChild(this.NODE);
	return this;
};

JAX.TextNode.prototype.appendBefore = function(node) {
	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	node.parentNode.insertBefore(this.NODE, node);
	return this;
};

JAX.TextNode.prototype.removeFromDOM = function() {
	try {
		this.NODE.parentNode.removeChild(this.NODE);
	} catch(e) {};
	return this;
};

JAX.TextNode.prototype.getParent = function() {
	if (this.NODE.parentNode) { return new JAX.HTMLElm(this.NODE.parentNode); }
	return null;
};

JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.31"
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
	this._elm = element instanceof JAX.HTMLElm ? element.NODE : element;
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
