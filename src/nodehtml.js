JAX.NodeHTML = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeHTML",
	VERSION: "0.71"
});

JAX.NodeHTML.MEASUREDVALUE = /^(?:-)?\d+(\.\d+)?(px|%|em|in|cm|mm|ex|pt|pc)?$/i

JAX.NodeHTML.create = function(node) {
	var _JAX = JAX;

	if (node && node.nodeType) {
		var jaxId = node.getAttribute("data-jax-id");
		if (!jaxId || !(jaxId in _JAX.allnodes)) { return new _JAX.NodeHTML(node); }
		return _JAX.allnodes[jaxId].instance;
	}

	throw new Error("JAX.NodeHTML.create: arguments must be only html node");
};

JAX.NodeHTML.prototype.jaxNodeType = 1;

JAX.NodeHTML.prototype.$constructor = function(node) {
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
		var storage = JAX.allnodes[this._jaxId] || {};
		this._storage = storage;
		this._storage.instance = this;
		this._storage.events = this._storage.events || {};
		this._storage.lockQueue = [];
		this._storage.locked = false;
		JAX.allnodes[this._jaxId] = storage;

		return;
	}

	throw new Error("JAX.NodeHTML constructor accepts only HTML element as its parameter. See doc for more information.");
};

JAX.NodeHTML.prototype.$destructor = function() {
	this.destroy();
	this._node = null;
	this._storage = null;
	delete JAX.allnodes[this._jaxId];
	this._jaxId = "";
};

JAX.NodeHTML.prototype.destroy = function() {
	if (this._storage.locked) { this._queueMethod(this.destroy, arguments); return this; }
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
	var classNames = Array.prototype.slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._storage.locked) {
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

	throw new Error("JAX.NodeHTML.addClass accepts only string as its parameter. See doc for more information.");
	
};

JAX.NodeHTML.prototype.removeClass = function() {
	var classNames = Array.prototype.slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._storage.locked) {
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

	throw new Error("JAX.NodeHTML.removeClass accepts only string as its parameter. See doc for more information.");
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

	throw new Error("JAX.NodeHTML.hasClass accepts only string as its parameter. See doc for more information.");
};

JAX.NodeHTML.prototype.id = function(id) {
	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._storage.locked) {
		this._queueMethod(this.id, arguments); 
		return this; 
	} else if (typeof(id) == "string") { 
		this.attr({id:id}); 
		return this;
	}

	throw new Error("JAX.NodeHTML.id accepts only string as its argument. See doc for more information. ");
};

JAX.NodeHTML.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._storage.locked) {
		this._queueMethod(this.html, arguments); 
		return this; 
	} else if (typeof(innerHTML) == "string") {
		this._node.innerHTML = innerHTML;
		return this;
	}
	
	throw new Error("JAX.NodeHTML.html accepts only string as its argument. See doc for more information. ");	
};

JAX.NodeHTML.prototype.add = function() {
	var nodes = Array.prototype.slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (this._storage.locked) {
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
	} else if (!nodes) { 
		console.warn("JAX.NodeHTML.add is called with no argument, null or undefined."); 
		return this;
	}
	
	throw new Error("JAX.NodeHTML.add accepts only HTML node, textnode, JAX.NodeHTML or JAX.NodeText instance as its parameter. See doc for more information."); 
};

JAX.NodeHTML.prototype.addBefore = function(node, nodeBefore) {
	if (this._storage.locked) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} else if (node && (node.nodeType || JAX.isJAXNode(node)) && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) {
		var node = node.jaxNodeType ? node.node() : node;
		var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
		try {
			this._node.insertBefore(node, nodeBefore);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.addBefore accepts only HTML element, textnode, JAX.NodeHTML or JAX.NodeText instance as its first argument. See doc for more information.");
};

JAX.NodeHTML.prototype.appendTo = function(node) {
	if (this._storage.locked) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (node && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.appendTo accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.appendBefore = function(node) {
	if (this._storage.locked) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (node && (node.nodeType || JAX.isJAXNode(node))) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.appendBefore accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information."); 
};

JAX.NodeHTML.prototype.removeFromDOM = function() {
	if (this._storage.locked) {
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

JAX.NodeHTML.prototype.listen = function(type, method, obj, bindData) {
	if (!type || typeof(type) != "string") { 
		throw new Error("JAX.NodeHTML.listen: first parameter must be string. See doc for more information."); 
	} else if (!method || (typeof(method) != "string" && typeof(method) != "function")) { 
		throw new Error("JAX.NodeHTML.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.NodeHTML.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (typeof(method) == "string") {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.NodeHTML.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

JAX.NodeHTML.prototype.stopListening = function(type, listenerId) {
	if (this._storage.locked) {
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
		throw new Error("JAX.NodeHTML.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = this._storage.events[type]; 
	if (!eventListeners) { 
		console.warn("JAX.NodeHTML.stopListening: no event '" + type + "' found"); 
		return this; 
	}

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

	console.warn("JAX.NodeHTML.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.NodeHTML.prototype.attr = function() {
	var attributes = Array.prototype.slice.call(arguments);

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
	} else if (this._storage.locked) {
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
	var cssStyles = Array.prototype.slice.call(arguments);

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
	} else if (this._storage.locked) {
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
	if (this._storage.locked) {
		this._queueMethod(this.displayOn, arguments); 
		return this; 
	} 

	this._node.style["display"] = displayValue || "";

	return this;
};

JAX.NodeHTML.prototype.displayOff = function() {
	if (this._storage.locked) {
		this._queueMethod(this.displayOff, arguments); 
		return this; 
	} 
	this._node.style["display"] = "none";

	return this;
};

JAX.NodeHTML.prototype.computedStyleCss = function() {
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedStyleCss(cssStyles);
	} else if (cssStyles.length == 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) == "string") { 
		var value = JAK.DOM.getStyle(this._node, cssStyles);
		if (this._node.runtimeStyle && !document.addEventListener && JAX.NodeHTML.MEASUREDVALUE.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	var properties = [].concat(cssStyles);
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		var value = JAK.DOM.getStyle(this._node, cssStyle);
		if (this._node.runtimeStyle && !document.addEventListener && JAX.NodeHTML.MEASUREDVALUE.test(value)) { value = this._inPixels(value); }
		css[cssStyle] = value;
	}
	return css;
};

JAX.NodeHTML.prototype.fullWidth = function(value) {
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedStyleCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.styleCss(backupStyle);
		return width; 
	}

	if (this._storage.locked) {
		this._queueMethod(this.width, arguments); 
		return this; 
	} 

	var paddingLeft = parseFloat(this.computedStyleCss("padding-left"));
	var paddingRight = parseFloat(this.computedStyleCss("padding-right"));
	var borderLeft = parseFloat(this.computedStyleCss("border-left"));
	var borderRight = parseFloat(this.computedStyleCss("border-right"));

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
		var isFixedPosition = this.computedStyleCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.styleCss(backupStyle);
		return height; 
	}

	if (this._storage.locked) {
		this._queueMethod(this.height, arguments); 
		return this; 
	} 

	var paddingTop = parseFloat(this.computedStyleCss("padding-top"));
	var paddingBottom = parseFloat(this.computedStyleCss("padding-bottom"));
	var borderTop = parseFloat(this.computedStyleCss("border-top"));
	var borderBottom = parseFloat(this.computedStyleCss("border-bottom"));

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
	if (this._storage.locked) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.NodeHTML.prototype.contains = function(node) {
	if (node && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("JAX.NodeHTML.contains accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.isChildOf = function(node) {
	if (node && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node : JAX.NodeHTML.create(node);
		return elm.contains(this);
	}

	throw new Error("JAX.NodeHTML.contains accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.fade = function(type, duration, completeCbk) {
	if (this._storage.locked) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) != "string") {
		throw new Error("JAX.NodeHTML.fade accepts only String for first argument. See doc for more information.");
	} else if (duration && typeof(duration) != "number") {
		throw new Error("JAX.NodeHTML.fade accepts only Number for duration argument. See doc for more information.");
	} else if (completeCbk && typeof(completeCbk) != "function") {
		throw new Error("JAX.NodeHTML.fade accepts only Function for completeCbk. See doc for more information.");
	}

	switch(type) {
		case "in":
			var sourceOpacity = 0;
			var targetOpacity = parseFloat(this.computedStyleCss("opacity")) || 1;	
		break;
		case "out":
			var sourceOpacity = parseFloat(this.computedStyleCss("opacity")) || 1;
			var targetOpacity = 0;
		break;
		default:
			console.warn("JAX.NodeHTML.fade got unsupported type '" + type + "'.");
			return this;
	}

	var animation = new JAX.Animation(this);
	var func = function() {
		this._unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this._lock();

	return this;
};

JAX.NodeHTML.prototype.fadeTo = function(opacityValue, duration, completeCbk) {
	if (this._storage.locked) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (!isFinite(opacityValue)) {
		throw new Error("JAX.NodeHTML.fadeTo accepts only numeric value for first argument. See doc for more information.");
	} else if (duration && typeof(duration) != "number") {
		throw new Error("JAX.NodeHTML.fadeTo accepts only Number for duration argument. See doc for more information.");
	} else if (completeCbk && typeof(completeCbk) != "function") {
		throw new Error("JAX.NodeHTML.fadeTo only Function for completeCbk. See doc for more information.");
	}

	var sourceOpacity = parseFloat(this.computedStyleCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var animation = new JAX.Animation(this);
	var func = function() {
		this._unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty("opacity", duration, sourceOpacity, targetOpacity);
	animation.addCallback(func);
	animation.run();
	this._lock();

	return this;
};

JAX.NodeHTML.prototype.slide = function(type, duration, completeCbk) {
	if (this._storage.locked) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) != "string") {
		throw new Error("JAX.NodeHTML.slide accepts only String for first argument. See doc for more information.");
	} else if (duration && typeof(duration) != "number") {
		throw new Error("JAX.NodeHTML.slide accepts only Number for duration argument. See doc for more information.");
	} else if (completeCbk && typeof(completeCbk) != "function") {
		throw new Error("JAX.NodeHTML.slide accepts only Function for completeCbk. See doc for more information.");
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
			console.warn("JAX.NodeHTML.slide got unsupported type '" + type + "'.");
			return this;
	}

	this.styleCss({"overflow": "hidden"});

	var animation = new JAX.Animation(this);
	var func = function() {
		for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
		this._unlock();
		if (completeCbk) { completeCbk(); }
	}.bind(this);

	animation.addProperty(property, duration, source, target);
	animation.addCallback(func);
	animation.run();
	this._lock();

	return this;
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

JAX.NodeHTML.prototype._lock = function() {
	this._storage.locked = true;
};

JAX.NodeHTML.prototype._queueMethod = function(method, args) {
	this._storage.lockQueue.push({method:method, args:args});
};

JAX.NodeHTML.prototype._unlock = function() {
	var queue = this._storage.lockQueue;
	this._storage.locked = false;
	while(queue.length) {
		var q = queue.shift();
		q.method.apply(this, q.args);
	}
};

JAX.NodeHTML.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

