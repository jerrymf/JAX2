(function() {
JAX = {
	VERSION: "1.97b"
};

JAX.TAG_RXP = /^([a-zA-Z]*)/g;
JAX.CLASS_ID_RXP = /([\.#])([^\.#]*)/g;
JAX.allnodes = [];

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.NodeHTML.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) == "object" && selector.nodeType) {
		switch(selector.nodeType) {
			case 1: return new JAX.NodeArray(JAX.NodeHTML.create(selector));
			case 3: return new JAX.NodeArray(new JAX.NodeText(selector));
			case 9: return new JAX.NodeArray(new JAX.NodeDoc(selector));
			case 11: return new JAX.NodeArray(new JAX.NodeDocFrag(selector));
		}
	} else if (JAX.isJAXNode(selector)) {
		return new JAX.NodeArray(selector);
	}
	
	return false;
};

JAX.$$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.NodeHTML.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) == "object" && selector.nodeType) {
		switch(selector.nodeType) {
			case 1: return JAX.NodeHTML.create(selector);
			case 3: return new JAX.NodeText(selector);
			case 9: return new JAX.NodeDoc(selector);
			case 11: return new JAX.NodeDocFrag(selector);
		}
	} else if (JAX.isJAXNode(selector)) {
		return selector;
	}

	return false;
};

JAX.make = function(tagString, attrs, styles, srcDocument) {
	var error = 15;
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (tagString && typeof(tagString) == "string") { error -= 1; }
	if (typeof(attrs) == "object") { error -= 2; }
	if (typeof(styles) == "object") { error -= 4; }
	if (typeof(srcDocument) == "object" && srcDocument.nodeType && (srcDocument.nodeType == 9 || srcDocument.nodeType != 11)) { error -= 8; }

	if (error) {
		var e = new JAX.E({funcName:"JAX.make", caller:this.make});
		if (error & 1) { e.expected("first argument", "string", tagString); }
		if (error & 2) { e.expected("second argument", "associative array", attrs); }
		if (error & 4) { e.expected("third argument", "associative array", styles); }
		if (error & 8) { e.expected("fourth argument", "associative array", srcDocument); }
		e.show();
	}

	var tagName = tagString.match(JAX.TAG_RXP) || [];

	if (tagName.length == 1) {
		tagName = tagName[0];
		tagString = tagString.substring(tagName.length, tagString.length);
	} else {
		new JAX.E({funcName:"JAX.make", value:tagString, caller:this.make})
			.expected("first argument", "tagname first", tagString)
			.show();
	}

	tagString.replace(JAX.CLASS_ID_RXP, function(match, p1, p2) {
		var property = p1 == "#" ? "id" : "className";

		if (!(property in attrs)) { 
			attrs[property] = ""; 
		} else {
			attrs[property] += " ";
		}

		attrs[property] += p2;
	});

	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.NodeHTML.prototype);
	f._init(createdNode);
	
	return f;
};

JAX.makeText = function(text, doc) {
	return new JAX.NodeText((doc || document).createTextNode(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	var val = parseFloat(value);
	return val === value * 1 && isFinite(val);
};

JAX.isString = function(value) {
	return typeof(value) == "string";
};

JAX.isArray = function(value) {
	return value instanceof Array;
};

JAX.isFunction = function(value) {
	return typeof(value) == "function";
};

JAX.isBoolean = function(value) {
	return value === true || value === false;
};

JAX.isDate = function(value) {
	return value instanceof Date;
};

JAX.isJAXNode = function(node) {
	return node instanceof JAX.NodeHTML || node instanceof JAX.NodeText || node instanceof JAX.NodeDoc || node instanceof JAX.NodeDocFrag;
}

JAX.NodeHTML = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeHTML",
	VERSION: "0.71"
});

JAX.NodeHTML.MEASUREABLEVALUE = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i
JAX.NodeHTML.idCounter = -1;

JAX.NodeHTML.create = function(node) {
	if (typeof(node) == "object" && node.nodeType && node.nodeType == 1) {
		var jaxId = parseInt(node.getAttribute("data-jax-id"),10) || -1;

		if (jaxId<0) {
			var f = Object.create(JAX.NodeHTML.prototype);
			f._init(node);
			return f;
		}

		return JAX.allnodes[jaxId].instance;
	}

	new JAX.E({funcName:"JAX.NodeHTML.create", caller:this.create})
		.expected("first argument", "HTML element", node)
		.show();
};

JAX.NodeHTML.prototype.jaxNodeType = 1;

JAX.NodeHTML.prototype.$constructor = function() {
	new JAX.E({funcName:"JAX.NodeHTML.$constructor", caller:this.$constructor})
		.message("You can not call this class with operator new. Use JAX.NodeHTML.create factory method instead of it")
		.show();
};

JAX.NodeHTML.prototype.$destructor = function() {
	this.destroy();
	this._node = null;
	this._storage = null;
	delete JAX.allnodes[this._jaxId];
	this._jaxId = "";
};

JAX.NodeHTML.prototype.destroy = function() {
	if (this._node.getAttribute("data-jax-locked")) { this._queueMethod(this.destroy, arguments); return this; }
	this.stopListening();
	this.removeFromDOM();
	this.clear();
};

JAX.NodeHTML.prototype.node = function() {
	return this._node;
};

JAX.NodeHTML.prototype.$ = function(selector) {
	return JAX.$(selector, this._node);
};

JAX.NodeHTML.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._node);
};

JAX.NodeHTML.prototype.addClass = function() {
	var classNames = [].slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	} else if (typeof(classNames) == "string") {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) == -1) { currclasses.push(newclass); }
		}

		this._node.className = currclasses.join(" ");

		return this;
	} else if (classNames instanceof Array) {
		for (var i=0, len=classNames.length; i<len; i++) { this.addClass(classNames[i]); }

		return this;
	}

	new JAX.E({funcName:"JAX.NodeHTML.addClass", node:this._node, caller:this.addClass})
		.expected("arguments", "string or array of strings", classNames)
		.show();
};

JAX.NodeHTML.prototype.removeClass = function() {
	var classNames = [].slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	} else if (typeof(classNames) == "string") {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index != -1) { currclasses.splice(index, 1); }
		}

		this._node.className = currclasses.join(" ");
		return this;
	} else if (classNames instanceof Array) {
		for (var i=0, len=classNames.length; i<len; i++) { this.removeClass(classNames[i]); }

		return this;
	}

	new JAX.E({funcName:"JAX.NodeHTML.removeClass", node:this._node, caller:this.removeClass})
		.expected("arguments", "string or array of strings", classNames)
		.show();
};

JAX.NodeHTML.prototype.hasClass = function(className) {
	if (typeof(classname) == "string") {  
		var names = className.split(" ");

		while(names.length) {
			var name = names.shift();
			if (this._node.className.indexOf(name) != -1) { return true; }
		}

		return false;
	}

	new JAX.E({funcName:"JAX.NodeHTML.hasClass", node:this._node, caller:this.hasClass})
		.expected("first argument", "string", className)
		.show();
};

JAX.NodeHTML.prototype.id = function(id) {
	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	} else if (typeof(id) == "string") { 
		this.attr({id:id}); 
		return this;
	}

	new JAX.E({funcName:"JAX.NodeHTML.id", node:this._node, caller:this.id})
		.expected("first argument", "string", id)
		.show();
};

JAX.NodeHTML.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	} else if (typeof(innerHTML) == "string" || typeof(innerHTML) == "number") {
		this._node.innerHTML = innerHTML + "";
		return this;
	}

	new JAX.E({funcName:"JAX.NodeHTML.html", node:this._node, caller:this.html})
		.expected("first argument", "string", html)
		.message("You can call it withou arguments. Then it will return innerHTML value.")
		.show();
};

JAX.NodeHTML.prototype.add = function() {
	var nodes = [].slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	} else if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
	} else if (nodes && (nodes.nodeType || JAX.isJAXNode(nodes))) {
		var node = nodes.jaxNodeType ? nodes.node() : nodes;
		try {
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	}
	
	new JAX.E({funcName:"JAX.NodeHTML.add", node:this._node, caller:this.add})
		.expected("arguments", "HTML node, textnode, instance of JAX.NodeHTML, JAX.NodeText or JAX.NodeDocFrag", nodes)
		.message("You can call it with arguments separated by comma or array or single argument.")
		.show();
};

JAX.NodeHTML.prototype.addBefore = function(node, nodeBefore) {
	var error = 3;

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} 

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { error -= 1; }
	if (typeof(nodeBefore) == "object" && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) { error -= 2; }

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeHTML.addBefore", node:this._node, caller:this.addBefore});
		if (error & 1) { e.expected("first argument", "HTML element, textnode, instance of JAX.NodeHTML, JAX.NodeText or JAX.NodeDocFrag", node); }
		if (error & 2) { e.expected("second argument", "HTML element, textnode, instance of JAX.NodeHTML or JAX.NodeText", nodeBefore); }
		e.show();
	}

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	try {
		this._node.insertBefore(node, nodeBefore);
		return this;
	} catch(e) {}
};

JAX.NodeHTML.prototype.appendTo = function(node) {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeHTML.appendTo", node:this._node, caller:this.appendTo})
		.expected("first argument", "HTML element, instance of JAX.NodeHTML or JAX.NodeDocFrag", nodes)
		.show();
};

JAX.NodeHTML.prototype.appendBefore = function(node) {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeHTML.appendBefore", node:this._node, caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, instance of JAX.NodeHTML or JAX.NodeText", nodes)
		.show();
};

JAX.NodeHTML.prototype.removeFromDOM = function() {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeFromDOM, arguments); 
		return this; 
	}

	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
};

JAX.NodeHTML.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.NodeHTML.create(clone);
};

JAX.NodeHTML.prototype.listen = function(type, funcMethod, obj, bindData) {
	var error = 15;
	var obj = obj || window;

	if (type && typeof(type) == "string") { error -= 1; }
	if (funcMethod && (typeof(funcMethod) == "string" || typeof(funcMethod) == "function")) { error -= 2; }
	if (typeof(obj) == "object") { error -= 4; }
	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (funcMethod) {
			error -= 8; 
			funcMethod = funcMethod.bind(obj);
		}
	} else { 
		error -= 8; 
	}

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeHTML.listen", node:this._node, caller:this.listen});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "string or function", funcMethod); }
		if (error & 4) { e.expected("third", "object", obj); }
		if (error & 8) { e.message("Method '" + funcMethod + "' in second argument was not found in third argument " + obj + "."); }
		e.show();
	}

	var thisNode = this;
	var f = function(e, node) { funcMethod(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

JAX.NodeHTML.prototype.stopListening = function(type, listenerId) {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.stopListening, arguments);
		return this; 
	} 

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		this._storage.events = {};
		return this;
	}

	if (typeof(type) != "string") {
		new JAX.E({funcName:"JAX.NodeHTML.stopListening", node:this._node, caller:this.stopListening})
		.expected("first argument", "string", type)
		.show(); 
	}

	var eventListeners = this._storage.events[type]; 
	if (!eventListeners) { return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		this._storage.events[type] = [];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	if (window.console && window.console.warn) { 
		console.warn("JAX.NodeHTML.stopListening: no event listener id '" + listenerId + "' found. See doc for more information."); 
	}
	return this;
};

JAX.NodeHTML.prototype.attr = function() {
	var attributes = [].slice.call(arguments);

	if (attributes.length > 1) { 
		return this.attr(attributes);
	} else if (attributes.length == 1) {
		attributes = attributes[0];
	} else {
		return [];
	}

	if (typeof(attributes) == "string") { 
		return this._node.getAttribute(attributes); 
	} else if (attributes instanceof Array) {
		var attrs = {};
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this._node.getAttribute(attribute);
		}
		return attrs;	
	} else if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

	
JAX.NodeHTML.prototype.styleCss = function() {
	var cssStyles = [].slice.call(arguments);
	
	if (cssStyles.length > 1) { 
		return this.styleCss(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = cssStyles[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) == "string") { 
		return cssStyles == "opacity" ? this._getOpacity() : this._node.style[cssStyles]; 
	} else if (cssStyles instanceof Array) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	} else if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.NodeHTML.prototype.displayOn = function(displayValue) {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOn, arguments); 
		return this; 
	} 

	this._node.style["display"] = displayValue || "";

	return this;
};

JAX.NodeHTML.prototype.displayOff = function() {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOff, arguments); 
		return this; 
	} 
	this._node.style["display"] = "none";

	return this;
};

JAX.NodeHTML.prototype.computedCss = function() {
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedCss(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) == "string") { 
		var value = JAK.DOM.getStyle(this._node, cssStyles);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.NodeHTML.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	var properties = [].concat(cssStyles);
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		var value = JAK.DOM.getStyle(this._node, cssStyle);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.NodeHTML.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		css[cssStyle] = value;
	}
	return css;
};

JAX.NodeHTML.prototype.fullWidth = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.styleCss(backupStyle);
		return width; 
	}

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.width, arguments); 
		return this; 
	} 

	var paddingLeft = parseFloat(this.computedCss("padding-left"));
	var paddingRight = parseFloat(this.computedCss("padding-right"));
	var borderLeft = parseFloat(this.computedCss("border-left"));
	var borderRight = parseFloat(this.computedCss("border-right"));

	if (isFinite(paddingLeft)) { value =- paddingLeft; }
	if (isFinite(paddingRight)) { value =- paddingRight; }
	if (isFinite(borderLeft)) { value =- borderLeft; }
	if (isFinite(borderRight)) { value =- borderRight; }

	this._node.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.NodeHTML.prototype.fullHeight = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.styleCss(backupStyle);
		return height; 
	}

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.height, arguments); 
		return this; 
	} 

	var paddingTop = parseFloat(this.computedCss("padding-top"));
	var paddingBottom = parseFloat(this.computedCss("padding-bottom"));
	var borderTop = parseFloat(this.computedCss("border-top"));
	var borderBottom = parseFloat(this.computedCss("border-bottom"));

	if (isFinite(paddingTop)) { value =- paddingTop; }
	if (isFinite(paddingBottom)) { value =- paddingBottom; }
	if (isFinite(borderTop)) { value =- borderTop; }
	if (isFinite(borderBottom)) { value =- borderBottom; }

	this._node.style.height = Math.max(value,0) + "px";
	return this;
};

JAX.NodeHTML.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.NodeHTML.create(this._node.parentNode); }
	return null;
};

JAX.NodeHTML.prototype.nSibling = function() {
	return this._node.nextSibling ? JAX.$$(this._node.nextSibling) : null;
};

JAX.NodeHTML.prototype.pSibling = function() {
	return this._node.previousSibling ? JAX.$$(this._node.previousSibling) : null;
};

JAX.NodeHTML.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		nodes.push(JAX.$$(childNode));
	}
	return nodes;
};

JAX.NodeHTML.prototype.fChild = function() {
	return this._node.firstChild ? JAX.$$(this._node.firstChild) : null;
}

JAX.NodeHTML.prototype.lChild = function() {
	return this._node.lastChild ? JAX.$$(this._node.lastChild) : null;
}

JAX.NodeHTML.prototype.clear = function() {
	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.NodeHTML.prototype.contains = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	new JAX.E({funcName:"JAX.NodeHTML.contains", node:this._node, caller:this.contains})
		.expected("first argument", "HTML element, text node, instance of JAX.NodeHTML or JAX.NodeText", node)
		.show();
};

JAX.NodeHTML.prototype.isChildOf = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node : JAX.NodeHTML.create(node);
		return elm.contains(this);
	}

	new JAX.E({funcName:"JAX.NodeHTML.isChildOf", node:this._node, caller:this.isChildOf})
		.expected("first argument", "HTML element, JAX.NodeHTML or JAX.NodeDocFrag", node)
		.show();
};

JAX.NodeHTML.prototype.fade = function(type, duration, completeCbk) {
	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) == "string") { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.NodeHTML.fade", node:this._node, caller:this.fade});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

	switch(type) {
		case "in":
			var sourceOpacity = 0;
			var targetOpacity = parseFloat(this.computedCss("opacity")) || 1;	
		break;
		case "out":
			var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
			var targetOpacity = 0;
		break;
		default:
			console.warn("JAX.NodeHTML.fade got unsupported type '" + type + "'.");
			return this;
	}

	var animation = new JAX.Animation(this);
	var func = function() {
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.NodeHTML.prototype.fadeTo = function(opacityValue, duration, completeCbk) {
	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (JAX.isNumeric(opacityValue)) { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.NodeHTML.fadeTo", node:this._node, caller:this.fadeTo});
		if (error & 1) { e.expected("first argument", "number", opacityValue); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

	var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var animation = new JAX.Animation(this);
	var func = function() {
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.NodeHTML.prototype.slide = function(type, duration, completeCbk) {
	var error = 7;
	var duration = duration || 0;

	if (this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) == "string") { error -= 1; }
	if (typeof(duration) == "number") { error -= 2; }
	if (!completeCbk || typeof(completeCbk) == "function") { error -= 4; }

	if (error) {
		var e = JAX.E({funcName:"JAX.NodeHTML.slide", node:this._node, caller:this.slide});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "number", duration); }
		if (error & 4) { e.expected("third argument", "function", completeCbk); }
		e.show();
	}

	switch(type) {
		case "down":
			var backupStyles = this.styleCss("height","overflow");
			var property = "height";
			var source = 0;
			var target = this.fullHeight();	
		break;
		case "up":
			var backupStyles = this.styleCss("height","overflow");
			var property = "height";
			var source = this.fullHeight();
			var target = 0;
		break;
		case "left":
			var backupStyles = this.styleCss("width","overflow");
			var property = "width";
			var source = this.fullWidth();
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.styleCss("width","overflow");
			var property = "width";
			var source = 0;
			var target = this.fullWidth();
		break;
		default:
			if (window.console && window.console.warn) { console.warn("JAX.NodeHTML.slide got unsupported type '" + type + "'."); }
			return this;
	}

	this.styleCss({"overflow": "hidden"});

	var animation = new JAX.Animation(this);
	var func = function() {
		for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
		this.unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty(property, duration, source, target);
	animation.addCallback(func);
	animation.run();
	this.lock();

	return this;
};

JAX.NodeHTML.prototype.lock = function() {
	this._node.setAttribute("data-jax-locked","1");
};

JAX.NodeHTML.prototype.isLocked = function() {
	return !!this._node.getAttribute("data-jax-locked");
}

JAX.NodeHTML.prototype.unlock = function() {
	var queue = this._storage.lockQueue;
	this._node.removeAttribute("data-jax-locked");
	while(queue.length) {
		var q = queue.shift();
		q.method.apply(this, q.args);
	}
};

JAX.NodeHTML.prototype._init = function(node) {  	
	this._node = node;

	/* set jax id for new (old) node */
	var oldJaxId = parseInt(node.getAttribute("data-jax-id"),10) || -1;
	if (oldJaxId > -1) {
		this._jaxId = oldJaxId;
		this._storage = JAX.allnodes[this._jaxId];
		this._storage.instance = this;
	} else {
		this._jaxId = ++JAX.NodeHTML.idCounter;
		node.setAttribute("data-jax-id", this._jaxId);
		var storage = {
			instance: this,
			events: {},
			lockQueue: []
		};
		JAX.allnodes[this._jaxId] = storage;
		this._storage = storage;
	}
};

JAX.NodeHTML.prototype._inPixels = function(value) {
	var style = this._node.style.left;
	var rStyle = this._node.runtimeStyle.left; 
    this._node.runtimeStyle.left = this._node.currentStyle.left;
    this._node.style.left = value || 0;  
    value = this._node.style.pixelLeft;
    this._node.style.left = style;
    this._node.runtimeStyle.left = rStyle;
      
    return value;
};

JAX.NodeHTML.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.NodeHTML.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.Animation.REGEXP_OPACITY, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.NodeHTML.prototype._queueMethod = function(method, args) {
	this._storage.lockQueue.push({method:method, args:args});
};

JAX.NodeHTML.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

JAX.NodeText = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeText",
	VERSION: "0.9"
});

JAX.NodeText.prototype.jaxNodeType = 3;

JAX.NodeText.prototype.$constructor = function(node) {
	if (typeof(node) == "object" && node.nodeType && node.nodeType == 3) { 
		this._node = node;
		return;
	}

	new JAX.E({funcName:"JAX.NodeText.$constructor", caller:this.$constructor})
		.expected("first argument", "text node", node)
		.show(); 
};

JAX.NodeText.prototype.node = function() {
	return this._node;
};

JAX.NodeText.prototype.appendTo = function(node) {
	if (typeof(node) == "object" && ((node.nodeType && node.nodeType == 1) || (JAX.isJAXNode(node) && JAX.jaxNodeType == 1))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeText.appendTo", caller:this.appendTo})
		.expected("first argument", "HTML element, JAX.NodeHTML, JAX.NodeDoc or JAX.NodeDocFrag instance", node)
		.show(); 
};

JAX.NodeText.prototype.appendBefore = function(node) {
	if (typeof(node) == "object" && ((node.nodeType && node.nodeType == 1) || (JAX.isJAXNode(node) && JAX.jaxNodeType == 1))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.parentNode.insertBefore(this._node, node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeText.appendBefore", caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, JAX.NodeDoc or JAX.NodeText", node)
		.show();
};

JAX.NodeText.prototype.nSibling = function() {
	return this._node.nextSibling ? JAX.$$(this._node.nextSibling) : null;
};

JAX.NodeText.prototype.pSibling = function() {
	return this._node.previousSibling ? JAX.$$(this._node.previousSibling) : null;
};

JAX.NodeText.prototype.removeFromDOM = function() {
	try {
		this._node.parentNode.removeChild(this._node);
		return this;
	} catch(e) {};
};

JAX.NodeText.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.NodeHTML.create(this._node.parentNode); }
	return null;
};

JAX.NodeDoc = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDoc",
	VERSION: "0.21"
});

JAX.NodeDoc.events = {};

JAX.NodeDoc.prototype.jaxNodeType = 9;

JAX.NodeDoc.prototype.$constructor = function(doc) {
	if (typeof(doc) == "object" && doc.nodeType && doc.nodeType == 9) {
		this._doc = doc;
		return;
	}

	new JAX.E({funcName:"JAX.NodeDoc.$constructor", caller:this.$constructor})
		.expected("first argument", "document element", doc)
		.show(); 
};

JAX.NodeDoc.prototype.$ = function(selector) {
	return JAX.$(selector, this._doc);
};

JAX.NodeDoc.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._doc);
};

JAX.NodeDoc.prototype.listen = function(type, funcMethod, obj, bindData) {
	var error = 15;
	var obj = obj || window;

	if (type && typeof(type) == "string") { error -= 1; }
	if (funcMethod && (typeof(funcMethod) == "string" || typeof(funcMethod) == "function")) { error -= 2; }
	if (typeof(obj) == "object") { error -= 4; }
	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (funcMethod) {
			error -= 8; 
			funcMethod = funcMethod.bind(obj);
		}
	} else {
		error -= 8;
	}

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeDoc.listen", caller:this.listen});
		if (error & 1) { e.expected("first argument", "string", type); }
		if (error & 2) { e.expected("second argument", "string or function", funcMethod); }
		if (error & 4) { e.expected("third", "object", obj); }
		if (error & 8) { e.message("Method '" + funcMethod + "' in second argument was not found in third argument " + obj + "."); }
		e.show();
	}
	
	var thisNode = this;
	var f = function(e, node) { funcMethod(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._doc, type, f);
	var evtListeners = JAX.NodeDoc.events[type] || [];
	evtListeners.push(listenerId);
	JAX.NodeDoc.events[type] = evtListeners;
	
	return listenerId;
};

JAX.NodeDoc.prototype.stopListening = function(type, listenerId) {
	if (!arguments.length) {
		var events = JAX.NodeDoc.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		JAX.NodeDoc.events = {};
		return this;
	}

	if (typeof(type) != "string") {
		new JAX.E({funcName:"JAX.NodeDoc.stopListening", caller:this.stopListening})
		.expected("first argument", "string", type)
		.show(); 
	}

	var eventListeners = JAX.NodeDoc.events[type]; 
	if (!eventListeners) { return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.NodeDoc.events[type];
		return this;
	}

	var index = eventListeners.indexOf(listenerId);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	if (window.console && window.console.warn) { console.warn("JAX.NodeDoc.stopListening: no event listener id '" + listenerId + "' found. See doc for more information."); }
	return this;
};

JAX.NodeDoc.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

JAX.NodeDocFrag = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDocFrag",
	VERSION: "0.9"
});

JAX.NodeDocFrag.prototype.jaxNodeType = 11;

JAX.NodeDocFrag.prototype.$constructor = function(doc) {
	if (typeof(doc) == "object" && doc.nodeType && (doc.nodeType == 9 || doc.nodeType == 11)) {
		switch(doc.nodeType) {
			case 9:
				this._doc = doc;
				this._node = this._doc.createDocumentFragment();
			break;
			case 11:
				this._node = doc;
				this._doc = doc.ownerDocument;
			break;			
		}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.$constructor", caller:this.$constructor})
		.expected("first argument", "document element or documentFragment element", doc)
		.show();

};

JAX.NodeDocFrag.prototype.$destructor = function() {
	this.clear();
	this._node = null;
};

JAX.NodeDocFrag.prototype.node = function() {
	return this._node;
};

JAX.NodeDocFrag.prototype.$ = function(selector) {
	return JAX.$(selector, this._node);
};

JAX.NodeDocFrag.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._node);
};

JAX.NodeDocFrag.prototype.html = function(innerHTML) {
	var div = document.createElement("div");

	if (!arguments.length) { 
		return div.appendChild(this._node).innerHTML;
	} else if (typeof(innerHTML) == "string") {
		div.innerHTML = innerHTML;
		while(div.firstChild) { this._node.appendChild(div.firstChild); }
		return this;
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.html", caller:this.html})
		.expected("first argument", "string", innerHTML)
		.message("You can call it with no argmuments. Then it will return string with html.")
		.show();
};

JAX.NodeDocFrag.prototype.add = function() {
	var nodes = [].slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
	} else if (nodes && (nodes.nodeType || nodes.jaxNodeType)) {
		var node = nodes.jaxNodeType ? nodes.node() : nodes;
		try {
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.add", caller:this.add})
		.expected("arguments", "HTML node, textnode, JAX.NodeHTML, JAX.NodeDocFrag or JAX.NodeText instance", innerHTML)
		.show();
};

JAX.NodeDocFrag.prototype.addBefore = function(node, nodeBefore) {
	var error = 3;

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { var node = node.jaxNodeType ? node.node() : node; error -= 1;}
	if (typeof(nodeBefore) == "object" && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) { var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore; error -= 2;}

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeDocFrag.addBefore", caller:this.addBefore});
		if (error & 1) { e.expected("first argument", "HTML element, textnode, JAX.nodeHTML, JAX.NodeDocFrag or JAX.NodeText instance", node); }
		if (error & 2) { e.expected("second argument", "HTML node, textnode, JAX.NodeHTML or JAX.NodeText instance", nodeBefore); }
		e.show();
	}

	try {
		this._node.insertBefore(node, nodeBefore);
		return this;
	} catch(e) {}
};

JAX.NodeDocFrag.prototype.appendTo = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.appendTo", caller:this.appendTo})
		.expected("first argument", "HTML element, JAX.NodeHTML or JAX.NodeDocFrag instance", node)
		.show();
};

JAX.NodeDocFrag.prototype.appendBefore = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.appendBefore", caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, or JAX.NodeText instance", node)
		.show();
};

JAX.NodeDocFrag.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.NodeText(childNode)); continue; }
		nodes.push(JAX.NodeHTML.create(childNode));
	}
	return nodes;
};

JAX.NodeDocFrag.prototype.fChild = function() {
	return this._node.firstChild ? JAX.$$(this._node.firstChild) : null;
};

JAX.NodeDocFrag.prototype.lChild = function() {
	return this._node.lastChild ? JAX.$$(this._node.lastChild) : null;
};

JAX.NodeDocFrag.prototype.clear = function() {
	JAK.DOM.clear(this._node);
	return this;
};

JAX.NodeDocFrag.prototype.contains = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = JAX.isJAXNode(node) ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.contains", caller:this.contains})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, or JAX.NodeText instance", node)
		.show();
};

JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "0.1"
});

JAX.NodeArray.prototype.length = 0;

JAX.NodeArray.prototype.$constructor = function(JAXNodes) {
	var JAXNodes = [].concat(JAXNodes);
	var len = JAXNodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var JAXNode = JAXNodes[i];
		if (typeof(JAXNode) == "object" && JAXNode.nodeType) { JAXNode = JAX.$$(JAXNode); }
		if (JAX.isJAXNode(JAXNode)) { this._jaxNodes[i] = JAXNode; continue; }
		new JAX.E({funcName:"JAX.NodeArray.$constructor", caller:this.$constructor})
			.expected("first argument", "HTML element, text node, JAX.NodeHTML or JAX.NodeText instance", JAXNode)
			.show();
	}
	this.length = this._jaxNodes.length;
};

JAX.NodeArray.prototype.item = function(index) {
	return this._jaxNodes[index];
};

JAX.NodeArray.prototype.items = function() {
	return this._jaxNodes.slice();
};

JAX.NodeArray.prototype.addClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.addClass(); 
	}
	return this;
};

JAX.NodeArray.prototype.removeClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.removeClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.displayOn(displayValue); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOff = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.displayOff(); 
	}
	return this;
};

JAX.NodeArray.prototype.style = function(properties) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.styleCss(properties); 
	}
	return this;	
};

JAX.NodeArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.attr(attributes); 
	}
	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType == 9) { continue; }
		jaxNode.appendTo(node); 
	}
	return this;
}

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType == 9) { continue; }
		jaxNode.removeFromDOM(); 
	}
	return this;
}

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.destroy(); 
	}
	return this;
}

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	return new JAX.NodeArray(this._jaxNodes.filter(func));
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

JAX.NodeArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

JAX.NodeArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

JAX.NodeArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeArray.prototype.fade = function(type, duration, completeCbk) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { completeCbk(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.fade(type, duration, f); 
	}
	return this;
};

JAX.NodeArray.prototype.slide = function(type, duration, completeCbk) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { completeCbk(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType != 1) { continue; }
		jaxNode.slide(type, duration, f); 
	}
	return this;
};

JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "0.2"
});

JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: new JAX.NodeDocFrag() };
	this._pointerJaxNode = null;
	this._stack = [];
};

JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	var jaxNode = null;

	if (typeof(element) == "string") {
		jaxNode = JAX.make(element, attributes, styles, this._doc);
	} else if (typeof(element) == "object" && element.nodeType) {
		jaxNode = JAX.$$(element);
	}

	if (jaxNode && jaxNode.jaxNodeType != 9) {
		if (!this._pointerJaxNode) {
			this._stack.push(this._pointerJaxNode);
			this._jax.container.add(jaxNode); 
		} else {
			this._pointerJaxNode.add(jaxNode);
			this._stack.push(this._pointerJaxNode);
		}
		this._pointerJaxNode = jaxNode;
		return jaxNode;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.open", caller:this.open})
		.expected("first argument", "HTML Element definition compatible with JAX.make or HTML element", element)
		.show(); 
}

JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	if (typeof(node) == "string") {
		var jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) == "object" && node.nodeType) {
		var jaxNode = JAX.$$(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	} else if (!JAX.isJAXNode(node) && node.jaxNodeType == 9) {
		new JAX.E({funcName:"JAX.DOMBuilder.add", caller:this.add})
		.expected("first argument", "string, node, instance of JAX.NodeHTML, JAX.NodeText, JAX.NodeDocFrag", node)
		.show(); 
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.styleCss(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) == "string") {
		var jaxNode = JAX.makeText(node);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.addText", caller:this.addText})
		.expected("first argument", "string", typeof(node))
		.show(); 
};

JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return;
	}

	new JAX.E({funcName:"JAX.DOMBuilder.addText", caller:this.close})
		.expected("closing", "opened element", "no opened element")
		.show(); 
};

JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) == "object" && node.nodeType) {
		var jaxNode = JAX.$$(node);
	} else if (JAX.isJAXNode(node) && node.jaxNodeType == 1) {
		var jaxNode = node;
	} else {
		new JAX.E({funcName:"JAX.DOMBuilder.appendTo", caller:this.appendTo})
		.expected("argument", "html element, instance of JAX.NodeHTML or JAX.NodeDocFrag", node)
		.show(); 
	}

	this._jax.container.appendTo(jaxNode);
};

JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
};

JAX.Animation = JAK.ClassMaker.makeClass({
	NAME: "JAX.Animation",
	VERSION: "0.32"
});

JAX.Animation._TRANSITION_PROPERTY = "";
JAX.Animation._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd",
      "MSTransition":"MSTransitionEnd"
    };

	for (p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.Animation._TRANSITION_PROPERTY = p;
			JAX.Animation._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.Animation._SUPPORTED_PROPERTIES = {
	"width": {defaultUnit:"px", css:"width" },
	"height":{defaultUnit:"px", css:"height" },
	"top": {defaultUnit:"px", css:"top" },
	"left": {defaultUnit:"px", css:"left" },
	"bottom": {defaultUnit:"px", css:"bottom" },
	"right": {defaultUnit:"px", css:"right" },
	"fontSize": {defaultUnit:"px", css:"font-size" },
	"opacity": {defaultUnit:"", css:"opacity" },
	"color": {defaultUnit:"", css:"color" },
	"backgroundColor": {defaultUnit:"", css:"background-color" }
};
JAX.Animation._REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element) {
	this._elm = JAX.isJAXNode(element) ? element : JAX.NodeHTML.create(element);
	this._properties = [];
	this._interpolators = [];
	this._callback = null;
	this._running = false;
	this._transitionSupport = !!JAX.Animation._TRANSITION_PROPERTY;
};

JAX.Animation.prototype.addProperty = function(property, duration, start, end, method) {
	if (property in JAX.Animation._SUPPORTED_PROPERTIES) { 
		var cssEnd = this._parseCSSValue(property, end);
		var cssStart = this._parseCSSValue(property, start); 
		var method = this._transitionSupport ? (method || "linear") : "LINEAR";

		this._properties.push({
			property: property,
			cssStart: cssStart,
			cssEnd: cssEnd,
			duration: (duration || 1),
			method: method
		});

		return this;
	}

	new JAX.E({funcName:"JAX.Animation.addProperty", node:this._elm.node(), caller:this.addProperty})
		.expected("first parameter", "supported property", "unsupported property: " + property)
		.show(); 
};

JAX.Animation.prototype.addCallback = function(callback) {
	this._callback = callback;
	return this;
};

JAX.Animation.prototype.run = function() {
	this._running = true;
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this;
};

JAX.Animation.prototype.isRunning = function() {
	return this._running;
};

JAX.Animation.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.Animation.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) == 0) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.Animation.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
}

JAX.Animation.prototype._initTransition = function() {
	var tp = JAX.Animation._TRANSITION_PROPERTY;
	var te = JAX.Animation._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		tps.push(property.property + " " + property.duration + "s " + property.method);
	}

	node.offsetHeight; /* trick - donutime porhlizec k prekresleni */
	node.style[tp] = tps.join(",");

	this._ecTransition = this._elm.listen(te, "_endTransition", this);
	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
};

JAX.Animation.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.Animation._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
};

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation._SUPPORTED_PROPERTIES[property].defaultUnit };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	if (this._callback) { this._callback(); }
	this._running = false;
};

JAX.Animation.prototype._endTransition = function() {
	var te = JAX.Animation._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._elm.node().style[JAX.Animation._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	if (this._callback) { this._callback(); }
};

JAX.E = JAK.ClassMaker.makeClass({
	NAME: "JAX.D",
	VERSION: "0.1"
});

JAX.E.TRACED_CALLING = 20;

JAX.E.prototype.$constructor = function(data) {
	this._data = data || {};
	this._message = "";
	this._output = "JAX Error:";
};

JAX.E.prototype.expected = function(forThe, expected, got) {
	this._message += "\n\nFor " + forThe + " ";
	this._message += "I expected " + expected + ". ";
	this._message += "I got " + got + " with type '" + typeof(got) + "' from you. ";
	return this;
};

JAX.E.prototype.message = function(text) {
	if (!text) { return this; }
	this._message += "\n\n" + text;
	return this;
};

JAX.E.prototype.show = function() {
	this._generateOutput();
	throw new Error(this._output);
}

JAX.E.prototype._generateOutput = function() {
	if (this._data.funcName && typeof(this._data.funcName) == "string") { 
		this._output += "Function " + this._data.funcName + ": "; 
	}
	if (this._message) {
		this._output += this._message;
	}

	if (this._data.node) { 
		this._output += "\n\n===";
		this._output += "\nNode: " + this._stringifyNode();
		this._output += "\n===";
	}

	if ("caller" in this._data) {
		this._output += "\n\n===";
		this._output += "\nTRACED CALLING SEQUENCE:";

		var caller = this._data.caller.caller;

		if (caller) {
			this._output += "\nCalled from:\n" + caller.toString(); 

			var counter = JAX.E.TRACED_CALLING;

			do {
				caller = caller.caller; 
				if (caller) { this._output += "\n\nAnd it was called from:\n" + caller.toString(); }
				counter--;
			} while(caller && counter);

			if (caller) { 
				this._output += "\n\n... and much more calling"; 
			} else {
				this._output += "\n\n... and it was probably called directly from window"; 
			}
			this._output += "\n===";
		} else {
			this._output += "\nProbably called directly from window"; 
		}
	}; 
};

JAX.E.prototype._stringifyNode = function() {
	var output = "";
	var nodeStart = "";
	var nodeBody = "";
	var nodeEnd = "";

	var f = function(match, p1, p2) {
		nodeStart = p1;
		nodeEnd = p2;

    	return match;
	};
	var regexp = /(<[^>]*>).*(<\/[^<>]*>)/i;
	this._data.node.outerHTML.replace(regexp, f);

	if (nodeStart) { output += nodeStart; }
	if (this._data.node.innerHTML) { output += this._data.node.innerHTML.substring(0,10) + "..."; }
	if (nodeEnd) { output += nodeEnd; }

	return output;
};

if (!window.JAX) { window.JAX = JAX; }

})();
