(function() {
JAX = {
	VERSION: "1.96b"
};

JAX.allnodes = {};

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(query);
		var jaxelms = [];

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms.push(JAX.NodeHTML.create(foundElms[i])); }

		return jaxelms;
	} else if ("nodeType" in selector) {
		switch(selector.nodeType) {
			case 1: return [JAX.NodeHTML.create(selector)];
			case 3: return [new JAX.NodeText(selector)];
			case 9: return [new JAX.NodeDoc(selector)];
		}
	} else if (JAX.isJaxNode(selector)) {
		return [selector];
	}
	
	return false;
};

JAX.$$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.NodeHTML.create(foundElm) : null;

		return jaxelm;
	} else if ("nodeType" in selector) {
		switch(selector.nodeType) {
			case 1: return JAX.NodeHTML.create(selector);
			case 3: return new JAX.NodeText(selector);
			case 9: return new JAX.NodeDoc(selector);
		}
	} else if (JAX.isJaxNode(selector)) {
		return selector;
	}

	return false;
};

JAX.make = function(tagString, html, srcDocument) {
	var attributes = html ? {innerHTML:html} : {};
	var tagName = "";
	var type="tagname";
	var currentAttrName = "";
	var inAttributes = false;

	if (html && !JAX.isString(html) && !JAX.isNumber(html)) { throw new Error("JAX.make: Second parameter 'html' must be a string or number"); }
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

	var elm = JAX.NodeHTML.create(JAK.mel(tagName, attributes, {}, srcDocument || document));
	return elm;
};

JAX.makeText = function(text) {
	return new JAX.NodeText(JAK.ctext(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	return isFinite(value);
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

JAX.isJaxNode = function(node) {
	return node instanceof JAX.NodeHTML || node instanceof JAX.NodeText || node instanceof JAX.NodeDoc;
}

JAX.NodeHTML = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeHTML",
	VERSION: "0.71"
});

JAX.NodeHTML.create = function(node) {
	var jaxId = node.getAttribute("data-jax-id");
	if (!jaxId || !(jaxId in JAX.allnodes)) { return new JAX.NodeHTML(node); }
	return JAX.allnodes[jaxId].instance;
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
		JAX.allnodes[this._jaxId] = JAX.allnodes[this._jaxId] || {};
		this._storage = JAX.allnodes[this._jaxId];
		this._storage.instance = this;
		this._storage.events = this._storage.events || {};
		this._storage.lockQueue = [];
		this._storage.locked = false;

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
	if (this._checkLocked(this.destroy, arguments)) { return this; }
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

	if (this._checkLocked(this.addClass, arguments)) {
		return this; 
	} else if (JAX.isString(classNames)) {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) == -1) { currclasses.push(newclass); }
		}

		this._node.className = currclasses.join(" ");

		return this;
	} else if (JAX.isArray(classNames)) {
		for (var i=0, len=classNames.length; i<len; i++) { this.addClass(classNames[i]); }

		return this;
	}

	throw new Error("JAX.NodeHTML.addClass accepts only string as its parameter. See doc for more information.");
	
};

JAX.NodeHTML.prototype.removeClass = function() {
	var classNames = Array.prototype.slice.call(arguments);

	if (classNames.length == 1) { classNames = classNames[0]; }

	if (this._checkLocked(this.removeClass, arguments)) { 
		return this; 
	} else if (JAX.isString(classNames)) {
		var classes = classNames.split(" ");
		var currclasses = this._node.className.split(" ");

		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index != -1) { currclasses.splice(index, 1); }
		}

		this._node.className = currclasses.join(" ");
		return this;
	} else if (JAX.isArray(classNames)) {
		for (var i=0, len=classNames.length; i<len; i++) { this.removeClass(classNames[i]); }

		return this;
	}

	throw new Error("JAX.NodeHTML.removeClass accepts only string as its parameter. See doc for more information.");
};

JAX.NodeHTML.prototype.hasClass = function(className) {
	if (JAX.isString(classname)) {  
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
	} else if (this._checkLocked(this.id, arguments)) { 
		return this; 
	} else if (JAX.isString(id)) { 
		this.attr({id:id}); 
		return this;
	}

	throw new Error("JAX.NodeHTML.id accepts only string as its argument. See doc for more information. ");
};

JAX.NodeHTML.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._checkLocked(this.html, arguments)) { 
		return this; 
	} else if (JAX.isString(innerHTML)) {
		this._node.innerHTML = innerHTML;
		return this;
	}
	
	throw new Error("JAX.NodeHTML.html accepts only string as its argument. See doc for more information. ");	
};

JAX.NodeHTML.prototype.add = function() {
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
		console.warn("JAX.NodeHTML.add is called with no argument, null or undefined."); 
		return this;
	}
	
	throw new Error("JAX.NodeHTML.add accepts only HTML node, textnode, JAX.NodeHTML or JAX.NodeText instance as its parameter. See doc for more information."); 
};

JAX.NodeHTML.prototype.addBefore = function(node, nodeBefore) {
	if (this._checkLocked(this.addBefore, arguments)) { 
		return this; 
	} else if (node && (node.nodeType || JAX.isJaxNode(node)) && (nodeBefore.nodeType || nodeBefore.jaxNodeType)) {
		try {
			var node = JAX.isJaxNode(node) ? node.node() : node;
			var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
			this._node.insertBefore(node, nodeBefore);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.addBefore accepts only HTML element, textnode, JAX.NodeHTML or JAX.NodeText instance as its first argument. See doc for more information.");
};

JAX.NodeHTML.prototype.appendTo = function(node) {
	if (this._checkLocked(this.appendTo, arguments)) {
		return this; 
	} else if (node && (node.nodeType || JAX.isJaxNode(node))) { 
		try {
			var node = JAX.isJaxNode(node) ? node.node() : node;
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.appendTo accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.appendBefore = function(node) {
	if (this._checkLocked(this.appendBefore, arguments)) { 
		return this; 
	} else if (node && (node.nodeType || JAX.isJaxNode(node))) {
		try {
			var node = JAX.isJaxNode(node) ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.NodeHTML.appendBefore accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information."); 
};

JAX.NodeHTML.prototype.removeFromDOM = function() {
	if (this._checkLocked(this.removeFromDOM, arguments)) { return this; }

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
	if (!type || !JAX.isString(type)) { 
		throw new Error("JAX.NodeHTML.listen: first parameter must be string. See doc for more information."); 
	} else if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { 
		throw new Error("JAX.NodeHTML.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.NodeHTML.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.NodeHTML.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	this._storage.events[type] = [].concat(this._storage.events[type]).push(listenerId);

	return listenerId;
};

JAX.NodeHTML.prototype.stopListening = function(type, listenerId) {
	if (this._checkLocked(this.stopListening, arguments)) { 
		return this; 
	}

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.NodeHTML.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = this._storage.events[type]; 
	if (!eventListeners) { 
		console.warn("JAX.NodeHTML.stopListening: no event '" + type + "' found"); 
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

JAX.NodeHTML.prototype.style = function() {
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

JAX.NodeHTML.prototype.displayOn = function(displayValue) {
	if (this._checkLocked(this.displayOn, arguments)) { return this; }
	this.style({"display":displayValue || ""});

	return this;
};

JAX.NodeHTML.prototype.displayOff = function() {
	if (this._checkLocked(this.displayOff, arguments)) { return this; }
	this.style({"display":"none"});

	return this;
};

/* FIXME - polyfill computed style for IE8 */
JAX.NodeHTML.prototype.computedStyle = function() {
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

/* FIXME - for working in percentage values */
JAX.NodeHTML.prototype.width = function(value) {
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

/* FIXME - for working in percentage values */
JAX.NodeHTML.prototype.height = function(value) {
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

JAX.NodeHTML.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.NodeHTML.create(this._node.parentNode); }
	return null;
};

JAX.NodeHTML.prototype.nextSibling = function() {
	return this._node.nextSibling ? JAX.NodeHTML.create(this._node.nextSibling) : null;
};

JAX.NodeHTML.prototype.prevSibling = function() {
	return this._node.previousSibling ? JAX.NodeHTML.create(this._node.previousSibling) : null;
};

JAX.NodeHTML.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.NodeText(childNode)); continue; }
		nodes.push(JAX.NodeHTML.create(childNode));
	}
	return nodes;
};

JAX.NodeHTML.prototype.clear = function() {
	if (this._checkLocked(this.clear, arguments)) { return this; }
	JAK.DOM.clear(this._node);
	return this;
};

JAX.NodeHTML.prototype.contains = function(node) {
	if (node && (node.nodeType || JAX.isJaxNode(node))) {
		var elm = JAX.isJaxNode(node) ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("JAX.NodeHTML.contains accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.isChildOf = function(node) {
	if (node && (node.nodeType || JAX.isJaxNode(node))) {
		var elm = JAX.isJaxNode(node) ? node : JAX.NodeHTML.create(node);
		return elm.contains(this);
	}

	throw new Error("JAX.NodeHTML.contains accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeHTML.prototype.fade = function(type, duration, completeCbk) {
	if (this._checkLocked(this.fadeIn, arguments)) { return this; }

	if (!JAX.isString(type)) {
		throw new Error("JAX.NodeHTML.fade accepts only String for first argument. See doc for more information.");
	} else if ((duration && !JAX.isNumber(duration)) || (completeCbk && !JAX.isFunction(completeCbk))) {
		throw new Error("JAX.NodeHTML.fade accepts only Number for duration argument and Function for completeCbk. See doc for more information.");
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
			console.warn("JAX.NodeHTML.fade got unsupported type '" + type + "'.");
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

JAX.NodeHTML.prototype.slide = function(type, duration, completeCbk) {
	if (this._checkLocked(this.slideDown, arguments)) { return this; }

	if (!JAX.isString(type)) {
		throw new Error("JAX.NodeHTML.slide accepts only String for first argument. See doc for more information.");
	} else if ((duration && !JAX.isNumber(duration)) || (completeCbk && !JAX.isFunction(completeCbk))) {
		throw new Error("JAX.NodeHTML.slide accepts only Number for duration argument and Function for completeCbk. See doc for more information.");
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
			console.warn("JAX.NodeHTML.slide got unsupported type '" + type + "'.");
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

JAX.NodeHTML.prototype._setOpacity = function(value) {
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

JAX.NodeHTML.prototype._checkLocked = function(method, args) {
	if (!this._storage.locked) { return false; }
	this._storage.lockQueue.push({method:method, args:args});
	return true;
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

JAX.NodeText = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeText",
	VERSION: "0.21"
});

JAX.NodeText.prototype.jaxNodeType = 3;

JAX.NodeText.prototype.$constructor = function(node) {
	if (node && "nodeType" in node && node.nodeType == 3) { 
		this._node = node;
		return;
	}

	throw new Error("JAX.NodeText constructor accepts only text node as its parameter. See doc for more information.")
};

JAX.NodeText.prototype.node = function() {
	return this._node;
};

JAX.NodeText.prototype.appendTo = function(node) {
	if (node && (node.nodeType || JAX.isJaxNode(node))) {
		try {
			var node = JAX.isJaxNode(node) ? node.node() : node;
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeText.appendTo accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeText.prototype.appendBefore = function(node, nodeBefore) {
	if (node && (node.nodeType || JAX.isJaxNode(node))) {
		try {
			var node = JAX.isJaxNode(node) ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.NodeText.appendBefore accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeText.prototype.removeFromDOM = function() {
	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
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
	if (doc && "nodeType" in doc && doc.nodeType == 9) {
		this._doc = doc;
		return;
	}

	throw new Error("JAX.NodeDoc constructor accepts only document. See doc for more information.");
};

JAX.NodeDoc.prototype.$ = function(selector) {
	return JAX.$(selector, this._doc);
};

JAX.NodeDoc.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._doc);
};

JAX.NodeDoc.prototype.listen = function(type, method, obj, bindData) {
	if (!type || !JAX.isString(type)) { 
		throw new Error("JAX.NodeDoclisten: first parameter must be string. See doc for more information."); 
	} else if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { 
		throw new Error("JAX.NodeDoc.listen: second paremeter must be function or name of function. See doc for more information."); 
	} else if (arguments.length > 4) { 
		console.warn("JAX.NodeDoc.listen accepts maximally 4 arguments. See doc for more information."); 
	}
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.NodeDoc.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._doc, type, f);
	var evtListeners = JAX.NodeDoc.events[type] || [];

	evtListeners.push(listenerId);
	JAX.NodeDoc.events[type] = evtListeners;

	return listenerId;
};

JAX.NodeDoc.prototype.stopListening = function(type, listenerId) {
	if (!arguments.length) {
		var events = JAX.NodeDoc.events;
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.NodeDoc.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.NodeDoc.events[type]; 
	if (!eventListeners) { console.warn("JAX.NodeDoc.stopListening: no event '" + type + "' found"); return this; }

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

	console.warn("JAX.NodeDoc.stopListening: no event listener id '" + listenerId + "' found. See doc for more information.");
	return this;
};

JAX.NodeDoc.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "0.1"
});

JAX.NodeArray.prototype.$constructor = function(jaxNodes) {
	this._jaxNodes = jaxNodes;
};

JAX.NodeArray.prototype.addClass = function() {
	for (var i=0, len=this.length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
};

JAX.NodeArray.prototype.removeClass = function() {
	for (var i=0, len=this.length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
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
      "WebkitTransition":"webkitTransitionEnd"
    };

	for (p in transitions) {
		if (p in JAX.make("div")) {
			JAX.Animation._TRANSITION_PROPERTY = p;
			JAX.Animation._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.Animation._SUPPORTED_PROPERTIES = {
	"width":"px", 
	"height":"px", 
	"top":"px", 
	"left":"px",
	"font-size":"px",
	"opacity":""
};
JAX.Animation._REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.Animation.prototype.$constructor = function(element) {
	this._elm = JAX.isJaxNode(element) ? element : JAX.NodeHTML.create(element);
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
		var method = !this._transitionSupport ? (method || "linear") : "LINEAR";

		this._properties.push({
			property: property,
			cssStart: cssStart,
			cssEnd: cssEnd,
			duration: (duration || 1) * 1000,
			method: method
		});
		return this;
	}

	throw new Error("JAX.Animation.addProperty: property '" + property + "' not supported. See doc for more information."); 
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

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
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

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		var style = {};
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		this._elm.style(style);
		tps.push(property.property + " " + property.duration + "s" + " " + property.method);
	}

	this._elm.node().style[tp] = tps.join(",");
	this._elm.node().offsetWidth; /* trick */
	this._ecTransition = this._elm.listen(te, "_endTransition", this);

	for (var i=0, len=this._properties.length; i<len; i++) {
		this._elm.node().style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
};

JAX.Animation.prototype._stopTransition = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var styleProperty = this._properties[i].property;
		var styleValue = this._elm.style(styleProperty);
		this._elm.style(styleProperty, styleValue);
	}
};

JAX.Animation.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.Animation._SUPPORTED_PROPERTIES[property] };
};

JAX.Animation.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	if (this._callback) { this._callback(); }
};

JAX.Animation.prototype._endTransition = function() {
	var te = JAX.Animation._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._ecTransition = null;
	this._running = false;
	if (this._callback) { this._callback(); }
};

if (!window.JAX) { window.JAX = JAX; }

})();
