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
	delete JAX.HTMLElm._EVENTS[this.NODE];
	this.NODE = null;
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
	if (innerHTML === undefined) { return innerHTML; }
	this.NODE.innerHTML = innerHTML;
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
	this.style({"overflow": "hidden", "width": this.width() + "px"});

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
	this.style({"overflow": "hidden", "width": this.width() + "px"});

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
