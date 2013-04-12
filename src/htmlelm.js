JAX.HTMLElm = JAK.ClassMaker.makeClass({
	NAME: "JAX.HTMLElm",
	VERSION: "0.7",
	IMPLEMENT:JAX.INode
});

JAX.HTMLElm.create = function(node) {
	var jaxId = node.getAttribute("data-jax-id");
	if (!jaxId || !(jaxId in JAX.allnodes)) { return new JAX.HTMLElm(node); }
	return JAX.allnodes[jaxId].instance;
};

JAX.HTMLElm.prototype.jaxNodeType = 1;

JAX.HTMLElm.prototype.$constructor = function(node) {
	if (node && node.nodeType && node.nodeType == 1) {  	
		this._node = node;

		/* set jax id for new (old) node */
		var oldJaxId = node.getAttribute("data-jax-id");
		if (oldJaxId) {
			this._jaxId = oldJaxId;	
		} else {
			this._jaxId = JAK.idGenerator();
			node.setAttribute("data-jax-id", this._jaxId);
		}

		/* create shortcut to modify static attribute, where are stored all information about node */
		JAX.allnodes[this._jaxId] = JAX.allnodes[this._jaxId] || {};
		this._storage = JAX.allnodes[this._jaxId];
		this._storage.instance = this;
		this._storage.events = this._storage.events || {};
		this._storage.lockQueue = [];
		this._storage.locked = false;

		return;
	}

	throw new Error("JAX.HTMLElm constructor accepts only HTML element as its parameter. See doc for more information.");
};

JAX.HTMLElm.prototype.$destructor = function() {
	this.destroy();
	this._node = null;
	this._storage = null;
	delete JAX.allnodes[this._jaxId];
	this._jaxId = "";
};

JAX.HTMLElm.prototype.destroy = function() {
	if (this._checkLocked(this.destroy, arguments)) { return this; }
	this.stopListening();
	this.removeFromDOM();
	this.clear();
};

JAX.HTMLElm.prototype.node = function() {
	return this._node;
};

JAX.HTMLElm.prototype.$ = function(selector) {
	return JAX.$(selector, this._node);
};

JAX.HTMLElm.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._node);
};

JAX.HTMLElm.prototype.addClass = function(classname) {
	if (this._checkLocked(this.addClass, arguments)) {
		return this; 
	} else if (JAX.isString(classname)) {
		var classnames = classname.split(" ");
		var classes = this._node.className.split(" ");

		while(classnames.length) {
			if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
		}

		this._node.className = classes.join(" ");

		return this;
	}

	throw new Error("JAX.HTMLElm.addClass accepts only string as its parameter. See doc for more information.");
	
};

JAX.HTMLElm.prototype.removeClass = function(classname) {
	if (this._checkLocked(this.removeClass, arguments)) { 
		return this; 
	} else if (JAX.isString(classname)) {
		var classnames = classname.split(" ");
		var classes = this._node.className.split(" ");

		while(classnames.length) {
			var index = classes.indexOf(classnames.shift());
			if (index != -1) { classes.splice(index, 1); }
		}

		this._node.className = classes.join(" ");
		return this;
	}

	throw new Error("JAX.HTMLElm.removeClass accepts only string as its parameter. See doc for more information.");
};

JAX.HTMLElm.prototype.hasClass = function(className) {
	if (JAX.isString(classname)) {  
		var names = className.split(" ");

		while(names.length) {
			var name = names.shift();
			if (this._node.className.indexOf(name) != -1) { return true; }
		}

		return false;
	}

	throw new Error("JAX.HTMLElm.hasClass accepts only string as its parameter. See doc for more information.");
};

JAX.HTMLElm.prototype.id = function(id) {
	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._checkLocked(this.id, arguments)) { 
		return this; 
	} else if (JAX.isString(id)) { 
		this.attr({id:id}); 
		return this;
	}

	throw new Error("JAX.HTMLElm.id accepts only string as its argument. See doc for more information. ");
};

JAX.HTMLElm.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._checkLocked(this.html, arguments)) { 
		return this; 
	} else if (JAX.isString(innerHTML)) {
		this._node.innerHTML = innerHTML;
		return this;
	}
	
	throw new Error("JAX.HTMLElm.html accepts only string as its argument. See doc for more information. ");	
};

JAX.HTMLElm.prototype.add = function() {
	var nodes = Array.prototype.slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (this._checkLocked(this.add, nodes)) { 
		return this; 
	} else if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
	} else if (nodes && (nodes.nodeType || nodes.jaxNodeType)) {
		try {
			var node = nodes.jaxNodeType ? nodes.node() : nodes;
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	} else if (!nodes) { 
		console.warn("JAX.HTMLElm.add is called with no argument, null or undefined."); 
		return this;
	}
	
	throw new Error("JAX.HTMLElm.add accepts only HTML node, textnode, JAX.HTMLElm or JAX.TextNode instance as its parameter. See doc for more information."); 
};

JAX.HTMLElm.prototype.addBefore = function(node, nodeBefore) {
	if (this._checkLocked(this.addBefore, arguments)) { 
		return this; 
	} else if (node && (node.nodeType || node.jaxNodeType) && (nodeBefore.nodeType || nodeBefore.jaxNodeType)) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
			this._node.insertBefore(node, nodeBefore);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.HTMLElm.addBefore accepts only HTML element, textnode, JAX.HTMLElm or JAX.TextNode instance as its first argument. See doc for more information.");
};

JAX.HTMLElm.prototype.appendTo = function(node) {
	if (this._checkLocked(this.appendTo, arguments)) {
		return this; 
	} else if (node && (node.nodeType || node.jaxNodeType)) { 
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.HTMLElm.appendTo accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information.");
};

JAX.HTMLElm.prototype.appendBefore = function(node) {
	if (this._checkLocked(this.appendBefore, arguments)) { 
		return this; 
	} else if (node && (node.nodeType || node.jaxNodeType)) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.HTMLElm.appendBefore accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information."); 
};

JAX.HTMLElm.prototype.removeFromDOM = function() {
	if (this._checkLocked(this.removeFromDOM, arguments)) { return this; }

	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
};

JAX.HTMLElm.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.HTMLElm.create(clone);
};

JAX.HTMLElm.prototype.listen = function(type, method, obj, bindData) {
	if (!type || !JAX.isString(type)) { 
		throw new Error("JAX.HTMLElm.listen: first parameter must be string. See doc for more information."); 
	} else if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { 
		throw new Error("JAX.HTMLElm.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.HTMLElm.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.HTMLElm.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	this._storage.events[type] = [].concat(this._storage.events[type]).push(listenerId);

	return listenerId;
};

JAX.HTMLElm.prototype.stopListening = function(type, listenerId) {
	if (this._checkLocked(this.stopListening, arguments)) { 
		return this; 
	}

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.HTMLElm.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = this._storage.events[type]; 
	if (!eventListeners) { 
		console.warn("JAX.HTMLElm.stopListening: no event '" + type + "' found"); 
		return this; 
	}

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete this._storage.events[type];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	console.warn("JAX.HTMLElm.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.HTMLElm.prototype.attr = function() {
	var attributes = Array.prototype.slice.call(arguments);

	if (attributes.length > 1) { 
		return this.attr(attributes);
	} else if (attributes.length == 1) {
		attributes = attributes[0];
	} else {
		return [];
	}

	if (JAX.isString(attributes)) { 
		return this._node.getAttribute(attributes); 
	} else if (JAX.isArray(attributes)) {
		var attrs = {};
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this._node.getAttribute(attribute);
		}
		return attrs;	
	} else if (this._checkLocked(this.attr, attributes)) { 
		return this; 
	}

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

JAX.HTMLElm.prototype.style = function() {
	var cssStyles = Array.prototype.slice.call(arguments);

	if (cssStyles.length > 1) { 
		return this.style(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = cssStyles[0];
	} else {
		return [];
	}

	if (JAX.isString(cssStyles)) { 
		return cssStyles == "opacity" ? this._getOpacity() : this._node.style[cssStyles]; 
	} else if (JAX.isArray(cssStyles)) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	} else if (this._checkLocked(this.style, cssStyles)) { 
		return this; 
	}

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.HTMLElm.prototype.displayOn = function(displayValue) {
	if (this._checkLocked(this.displayOn, arguments)) { return this; }
	this.style({"display":displayValue || ""});

	return this;
};

JAX.HTMLElm.prototype.displayOff = function() {
	if (this._checkLocked(this.displayOff, arguments)) { return this; }
	this.style({"display":"none"});

	return this;
};

JAX.HTMLElm.prototype.computedStyle = function() {
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedStyle(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (JAX.isString(cssStyles)) { 
		return JAK.DOM.getStyle(this._node, cssStyles); 
	}

	var css = {};
	var properties = [].concat(cssStyles);
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		css[cssStyle] = JAK.DOM.getStyle(this._node, cssStyle);
	}
	return css;
};

JAX.HTMLElm.prototype.width = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.style("display","visibility","position");
		var isFixedPosition = this.computedStyle("position").indexOf("fixed") == 0;
		var isDisplayNone = this.style("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.style({"position":"absolute"}); }
		if (isDisplayNone) { this.style({"display":""}); }		
		this.style({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.style(backupStyle);
		return width; 
	}

	if (this._checkLocked(this.width, arguments)) { return this; }

	var paddingLeft = parseInt(this.computedStyle("padding-left"),10);
	var paddingRight = parseInt(this.computedStyle("padding-right"), 10);
	var borderLeft = parseInt(this.computedStyle("border-left"),10);
	var borderRight = parseInt(this.computedStyle("border-right"), 10);

	if (!isNaN(paddingLeft)) { value =- paddingLeft; }
	if (!isNaN(paddingRight)) { value =- paddingRight; }
	if (!isNaN(borderLeft)) { value =- borderLeft; }
	if (!isNaN(borderRight)) { value =- borderRight; }

	this._node.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.HTMLElm.prototype.height = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.style("display","visibility","position");
		var isFixedPosition = this.computedStyle("position").indexOf("fixed") == 0;
		var isDisplayNone = this.style("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.style({"position":"absolute"}); }
		if (isDisplayNone) { this.style({"display":""}); }		
		this.style({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.style(backupStyle);
		return height; 
	}

	if (this._checkLocked(this.height, arguments)) { return this; }

	var paddingTop = parseInt(this.computedStyle("padding-top"),10);
	var paddingBottom = parseInt(this.computedStyle("padding-bottom"), 10);
	var borderTop = parseInt(this.computedStyle("border-top"),10);
	var borderBottom = parseInt(this.computedStyle("border-bottom"), 10);

	if (!isNaN(paddingTop)) { value =- paddingTop; }
	if (!isNaN(paddingBottom)) { value =- paddingBottom; }
	if (!isNaN(borderTop)) { value =- borderTop; }
	if (!isNaN(borderBottom)) { value =- borderBottom; }

	this._node.style.height = Math.max(value,0) + "px";
	return this;
};

JAX.HTMLElm.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.HTMLElm.create(this._node.parentNode); }
	return null;
};

JAX.HTMLElm.prototype.nextSibling = function() {
	return this._node.nextSibling ? JAX.HTMLElm.create(this._node.nextSibling) : null;
};

JAX.HTMLElm.prototype.prevSibling = function() {
	return this._node.previousSibling ? JAX.HTMLElm.create(this._node.previousSibling) : null;
};

JAX.HTMLElm.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.TextNode(childNode)); continue; }
		nodes.push(JAX.HTMLElm.create(childNode));
	}
	return nodes;
};

JAX.HTMLElm.prototype.clear = function() {
	if (this._checkLocked(this.clear, arguments)) { return this; }
	JAK.DOM.clear(this._node);
	return this;
};

JAX.HTMLElm.prototype.contains = function(node) {
	if (node && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("JAX.HTMLElm.contains accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information.");
};

JAX.HTMLElm.prototype.isChildOf = function(node) {
	if (node && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node : JAX.HTMLElm.create(node);
		return elm.contains(this);
	}

	throw new Error("JAX.HTMLElm.contains accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information.");
};

JAX.HTMLElm.prototype.fade = function(type, duration, completeCbk) {
	if (this._checkLocked(this.fadeIn, arguments)) { return this; }

	if (!JAX.isString(type)) {
		throw new Error("JAX.HTMLElm.fade accepts only String for first argument. See doc for more information.");
	} else if ((duration && !JAX.isNumber(duration)) || (completeCbk && !JAX.isFunction(completeCbk))) {
		throw new Error("JAX.HTMLElm.fade accepts only Number for duration argument and Function for completeCbk. See doc for more information.");
	}

	switch(type) {
		case "in":
			var sourceOpacity = 0;
			var targetOpacity = parseFloat(this.computedStyle("opacity")) || 1;	
		break;
		case "out":
			var sourceOpacity = parseFloat(this.computedStyle("opacity")) || 1;
			var targetOpacity = 0;
		break;
		default:
			console.warn("JAX.HTMLElm.fade got unsupported type '" + type + "'.");
			return this;
	}

	this._lock();

	var animation = new JAX.Animation(this);
	var func = function() {
		if (completeCbk) { completeCbk(); }
		this._unlock();
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();

	return this;
};

JAX.HTMLElm.prototype.slide = function(type, duration, completeCbk) {
	if (this._checkLocked(this.slideDown, arguments)) { return this; }

	if (!JAX.isString(type)) {
		throw new Error("JAX.HTMLElm.slide accepts only String for first argument. See doc for more information.");
	} else if ((duration && !JAX.isNumber(duration)) || (completeCbk && !JAX.isFunction(completeCbk))) {
		throw new Error("JAX.HTMLElm.slide accepts only Number for duration argument and Function for completeCbk. See doc for more information.");
	}

	switch(type) {
		case "down":
			var backupStyles = this.style("height","overflow");
			var property = "height";
			var source = 0;
			var target = this.height();	
		break;
		case "up":
			var backupStyles = this.style("height","overflow");
			var property = "height";
			var source = this.height();
			var target = 0;
		break;
		case "left":
			var backupStyles = this.style("width","overflow");
			var property = "width";
			var source = this.width();
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.style("width","overflow");
			var property = "width";
			var source = 0;
			var target = this.width();
		break;
		default:
			console.warn("JAX.HTMLElm.slide got unsupported type '" + type + "'.");
			return this;
	}

	this.style({"overflow": "hidden"});
	this._lock();

	var animation = new JAX.Animation(this);
	var func = function() {
		for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
		if (completeCbk) { completeCbk(); }
		this._unlock();
	}.bind(this);

	animation.addProperty(property, duration, source, target);
	animation.addCallback(func);
	animation.run();

	return this;
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

	this._node.style[property] = value + "";

};

JAX.HTMLElm.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.HTMLElm.prototype._lock = function() {
	this._storage.locked = true;
};

JAX.HTMLElm.prototype._checkLocked = function(method, args) {
	if (!this._storage.locked) { return false; }
	this._storage.lockQueue.push({method:method, args:args});
	return true;
};

JAX.HTMLElm.prototype._unlock = function() {
	var queue = this._storage.lockQueue;
	this._storage.locked = false;
	while(queue.length) {
		var q = queue.shift();
		q.method.apply(this, q.args);
	}
};

JAX.HTMLElm.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

