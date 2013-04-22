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

