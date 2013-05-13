(function() { 
 
/* version 1.99 */

var JAX = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.Node.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return JAX.Node.create(selector);
	} else if (selector instanceof JAX.Node) {
		return selector;
	}

	return false;
};

JAX.all = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.Node.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX.Node.create(selector));
	} else if (selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return false;
};

JAX.TAG_RXP = /^([a-zA-Z]+[a-zA-Z0-9]*)/g;
JAX.CLASS_ID_RXP = /([\.#])([^\.#]*)/g;

JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) !== "string") { throw new Error("First argument must be string."); }
	if (typeof(attrs) !== "object") { throw new Error("Second argument must be associative array."); }
	if (typeof(styles) !== "object") { throw new Error("Third argument must be associative array."); }
	if (typeof(srcDocument) !== "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) === -1) { throw new Error("Fourth argument must be document element."); }

	var tagName = tagString.match(JAX.TAG_RXP) || [];

	if (tagName.length === 1) {
		tagName = tagName[0];
		tagString = tagString.substring(tagName.length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
	}

	tagString.replace(JAX.CLASS_ID_RXP, function(match, p1, p2) {
		var property = p1 === "#" ? "id" : "className";

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

	var f = Object.create(JAX.Node.prototype);
	f._init(createdNode);
	
	return f;
};

JAX.makeText = function(text, doc) {
	return JAX.Node.create((doc || document).createTextNode(text));
};

JAX.isNumber = function(value) {
	return typeof(value) === "number";
};

JAX.isNumeric = function(value) {
	var val = parseFloat(value);
	return val === value * 1 && isFinite(val);
};

JAX.isString = function(value) {
	return typeof(value) === "string";
};

JAX.isArray = function(value) {
	return Object.prototype.toString.call(value) === "[object Array]";
};

JAX.isFunction = function(value) {
	return typeof(value) === "function";
};

JAX.isBoolean = function(value) {
	return value === true || value === false;
};

JAX.isDate = function(value) {
	return value instanceof Date;
};

JAX.isJAXNode = function(node) {
	return node instanceof JAX.Node;
};

 
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "0.71"
});

JAX.Node.MEASUREABLEVALUE = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;

JAX.Node.ELEMENT_NODE = 1;
JAX.Node.TEXT_NODE = 3;
JAX.Node.COMMENT_NODE = 8;
JAX.Node.DOCUMENT_NODE = 9;
JAX.Node.DOCUMENT_FRAGMENT_NODE = 11;

JAX.Node.instances = {};
JAX.Node.instances[JAX.Node.ELEMENT_NODE] = {};
JAX.Node.instances[JAX.Node.TEXT_NODE] = {};
JAX.Node.instances[JAX.Node.COMMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_FRAGMENT_NODE] = {};

JAX.Node._ids = {};
JAX.Node._ids[JAX.Node.ELEMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.TEXT_NODE] = 0;
JAX.Node._ids[JAX.Node.COMMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_FRAGMENT_NODE] = 0;

JAX.Node.create = function(node) {
	if (typeof(node) === "object" && node.nodeType) {
		var nodeType = node.nodeType;

		if (nodeType in JAX.Node.instances) {
			switch(nodeType) {
				case JAX.Node.ELEMENT_NODE:
					var jaxId = parseInt(node.getAttribute("data-jax-id"),10);
					if (typeof(jaxId) !== "number") { jaxId = -1; }
					if (jaxId > -1) {
						var item = JAX.Node.instances[JAX.Node.ELEMENT_NODE][jaxId];
						if (item) {return item.instance; }
					}
				break;
				default:
					var index = -1;
					var instances = JAX.Node.instances[nodeType];
					for (var i in instances) { 
						if (node === instances[i].node) { index = i; break; }
					}
					if (index > -1) { return JAX.Node.instances[nodeType][index].instance; }
			}
		}

		var f = Object.create(JAX.Node.prototype);
		f._init(node);
		return f;
	}
	
	throw new Error("First argument must be html element");
};

JAX.Node.prototype.jaxNodeType = 0;

JAX.Node.prototype.$constructor = function() {
	throw new Error("You can not call this class with operator new. Use JAX.Node.create factory method instead of it");
};

JAX.Node.prototype.$destructor = function() {
	this.destroy();

	if (this._node.nodeType in JAX.Node.instances) { delete JAX.Node.instances[this._node.nodeType][this._jaxId]; }

	this._node = null;
	this._storage = null;
	this._jaxId = -1;
};

JAX.Node.prototype.destroy = function() {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) { this._queueMethod(this.destroy, arguments); return this; }
	if ([1,9].indexOf(this._node.nodeType) !== -1) { this.stopListening(); }
	if ([1,3,8].indexOf(this._node.nodeType) !== -1) { this.removeFromDOM(); }
	if ([1,11].indexOf(this._node.nodeType) !== -1) { this.clear(); }
};

JAX.Node.prototype.node = function() {
	return this._node;
};

JAX.Node.prototype.$ = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.Node.prototype.$$ = function(selector) {
	return JAX(selector, this._node);
};

JAX.Node.prototype.addClass = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	var classNames = [].slice.call(arguments);

	if (classNames.length === 1) { classNames = [].concat(classNames[0]); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	}
	
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { throw new Error("Given arguments can be string, array of strings or strings separated by comma."); }
		var classes = cName.split(" ");
		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) === -1) { currclasses.push(newclass); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

JAX.Node.prototype.removeClass = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	var classNames = [].slice.call(arguments);

	if (classNames.length === 1) { classNames = [].concat(classNames[0]); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	}
	
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { throw new Error("Given arguments can be string, array of strings or strings separated by comma."); }
		var classes = cNames.split(" ");
		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index !== -1) { currclasses.splice(index, 1); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

JAX.Node.prototype.hasClass = function(className) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (typeof(classname) === "string") {  
		var names = className.split(" ");

		while(names.length) {
			var name = names.shift();
			if (this._node.className.indexOf(name) !== -1) { return true; }
		}

		return false;
	}
	
	throw new Error("For first argument I expected string");
};

JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	} else if (typeof(id) === "string") { 
		this.attr({id:id}); 
		return this;
	}
	
	throw new Error("For first argument I expected string");
};

JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	} else if (typeof(innerHTML) === "string" || typeof(innerHTML) === "number") {
		this._node.innerHTML = innerHTML + "";
		return this;
	}
	
	throw new Error("For first argument I expected string or number. You can call it also without arguments. Then it will return innerHTML value");
};

JAX.Node.prototype.add = function() {
	var nodes = [].slice.call(arguments);

	if (nodes.length === 1) { nodes = [].concat(nodes[0]); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	}
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !JAX.isJAXNode(node)) { throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them or you can separate them by comma."); }
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} 

	if (typeof(node) !== "object" || (!node.nodeType && !JAX.isJAXNode(node))) { throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); }
	if (typeof(nodeBefore) !== "object" || (!nodeBefore.nodeType && !JAX.isJAXNode(nodeBefore))) { throw new Error("For second argument I expected html element, text node or JAX.Node instance"); }

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

JAX.Node.prototype.appendTo = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, documentFragment or JAX.Node instance");
};

JAX.Node.prototype.appendBefore = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var node = node.jaxNodeType ? node.node() : node;
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

JAX.Node.prototype.removeFromDOM = function() {
	if ([9,11].indexOf(this._node.nodeType) !== -1) { throw new Error("You can not use this method for this node"); }
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeFromDOM, arguments); 
		return this; 
	}
	
	this._node.parentNode.removeChild(this._node);

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this element. You can use it only for element with nodeType === 1."); }

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.Node.create(clone);
};

JAX.Node.prototype.listen = function(type, funcMethod, obj, bindData) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html or document element"); }
	
	var obj = obj || window;

	if (!type || typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (!funcMethod || (typeof(funcMethod) !== "string" && typeof(funcMethod) !== "function")) { throw new Error("For second argument I expected string or function"); }
	if (typeof(obj) !== "object") { throw new Error("For third argument I expected referred object"); }
	if (typeof(funcMethod) === "string") {
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("Given method in second argument was not found in referred object given in third argument"); } 
		funcMethod = funcMethod.bind(obj);
	}

	var f = function(e, node) { funcMethod(e, JAX(node), bindData); };
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

JAX.Node.prototype.stopListening = function(type, listenerId) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html or document element"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.stopListening, arguments);
		return this; 
	} 

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		this._storage.events = {};
		return this;
	}

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }

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

	return this;
};

JAX.Node.prototype.attr = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var attributes = [].slice.call(arguments);

	if (attributes.length > 1) { 
		return this.attr(attributes);
	} else if (attributes.length === 1) {
		attributes = attributes[0];
	} else {
		return {};
	}

	if (typeof(attributes) === "string") { 
		return this._node.nodeType === 1 ? node.getAttribute(attributes) : ""; 
	} else if (attributes instanceof Array) {
		var attrs = {};
		if (this._node.nodeType !== 1) { return attrs; }
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = node.getAttribute(attribute);
		}
		return attrs;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	if (this._node.nodeType !== 1) { return this; }

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

	
JAX.Node.prototype.styleCss = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var cssStyles = [].slice.call(arguments);
	
	if (cssStyles.length > 1) { 
		return this.styleCss(cssStyles);
	} else if (cssStyles.length === 1) {
		cssStyles = cssStyles[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) === "string") {
		if (this._node.nodeType !== 1) { return ""; }
		return cssStyles === "opacity" ? this._getOpacity() : this._node.style[cssStyles]; 
	} else if (cssStyles instanceof Array) {
		var css = {};
		if (this._node.nodeType !== 1) { return css; }
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle === "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	if (this._node.nodeType !== 1) { return this; }

	for (var p in cssStyles) {
		var value = cssStyles[p];
		if (p === "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.Node.prototype.displayOn = function(displayValue) {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOn, arguments); 
		return this; 
	} 

	this._node.style["display"] = displayValue || "";

	return this;
};

JAX.Node.prototype.displayOff = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.displayOff, arguments); 
		return this; 
	} 
	this._node.style["display"] = "none";

	return this;
};

JAX.Node.prototype.computedCss = function() {
	if (this._node.nodeType !== 1) { throw new Error("You can not use this method for this node"); }
	
	var cssStyles = arguments;

	if (cssStyles.length > 1) { 
		return this.computedCss(cssStyles);
	} else if (cssStyles.length === 1) {
		cssStyles = arguments[0];
	} else {
		return [];
	}

	if (typeof(cssStyles) === "string") {
		if (this._node.nodeType !== 1) { return ""; }
		var value = JAK.DOM.getStyle(this._node, cssStyles);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	for (var i=0, len=cssStyles.length; i<len; i++) {
		var cssStyle = cssStyles[i];
		var value = JAK.DOM.getStyle(this._node, cssStyle);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node.MEASUREABLEVALUE.test(value)) { value = this._inPixels(value); }
		css[cssStyle] = value;
	}
	return css;
};

JAX.Node.prototype.fullWidth = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this node"); }
	
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.styleCss(backupStyle);
		return width; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
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

JAX.Node.prototype.fullHeight = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this node"); }
	
	if (!arguments.length) { 
		var backupStyle = this.styleCss("display","visibility","position");
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.styleCss("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.styleCss({"position":"absolute"}); }
		if (isDisplayNone) { this.styleCss({"display":""}); }		
		this.styleCss({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.styleCss(backupStyle);
		return height; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
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

JAX.Node.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.Node.create(this._node.parentNode); }
	return null;
};

JAX.Node.prototype.nSibling = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : null;
};

JAX.Node.prototype.pSibling = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : null;
};

JAX.Node.prototype.childs = function() {
	if (!this._node.childNodes) { return []; }
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		nodes.push(JAX(childNode));
	}
	return nodes;
};

JAX.Node.prototype.fChild = function() {
	return this._node.firstChild ? JAX(this._node.firstChild) : null;
};

JAX.Node.prototype.lChild = function() {
	return this._node.lastChild ? JAX(this._node.lastChild) : null;
};

JAX.Node.prototype.clear = function() {
	if ([1,11].indexOf(this._node.nodeType) === -1) { throw new Error("You can not use this method for this element. You can use it only with html node or documentFragment"); }

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.Node.prototype.contains = function(node) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element")
	}

	if (typeof(node) === "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm === this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

JAX.Node.prototype.isChildOf = function(node) {
	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
		throw new Error("You can not use this method for this element. You can use it only with html element or text node");
	}

	if (typeof(node) === "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	}
	
	throw new Error("For first argument I expected html element or JAX.Node instance");
};

JAX.Node.prototype.fade = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element")
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (duration < 0) { throw new Error("For second argument I expected positive number"); }

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
			console.warn("I got unsupported type '" + type + "'.");
			return this;
	}

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) { 
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();
	return fx;
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element");
	}
	
	var opacityValue = parseFloat(opacityValue);
	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(opacityValue) !== "number") { throw new Error("For first argument I expected number"); }
	if (duration<0) { throw new Error("For second argument I expected positive number"); }

	var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) {
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();

	return fx;
};

JAX.Node.prototype.slide = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		throw new Error("You can not use this method for this element. You can use it only with html element");
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) !== "string") { throw new Error("For first argument I expected string"); }
	if (duration<0) { throw new Error("For first argument I expected positive number"); }

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
			if (window.console && window.console.warn) { console.warn("I got unsupported type '" + type + "'."); }
			return this;
	}

	this.styleCss({"overflow": "hidden"});


	var fx = new JAX.FX(this).addProperty(property, duration, source, target);

	if (lockElm) {
		var func = function() {
			for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
			this.unlock();
		}.bind(this);
		fx.callWhenDone(func);
	}
	
	fx.run();

	return fx;
};

JAX.Node.prototype.lock = function() {
	if (this._node.nodeType === 1) { this._node.setAttribute("data-jax-locked","1"); }
	return this;
};

JAX.Node.prototype.isLocked = function() {
	if (this._node.nodeType !== 1) { return false; }

	return !!this._node.getAttribute("data-jax-locked");
};

JAX.Node.prototype.unlock = function() {
	if (!this.isLocked()) { return this; }
	if (this._node.nodeType === 1) {
		var queue = this._storage.lockQueue;
		this._node.removeAttribute("data-jax-locked");
		while(queue.length) {
			var q = queue.shift();
			q.method.apply(this, q.args);
		}
	}

	return this;
};

JAX.Node.prototype._init = function(node) {  	
	this._node = node;
	this.jaxNodeType = this._node.nodeType;

	/* set jax id for new (old) node */
	var oldJaxId = -1;
	if (node.getAttribute) { 
		var oldJaxId = parseInt(node.getAttribute("data-jax-id"),10);
		if (typeof(oldJaxId) !== "number") { oldJaxId = -1; }
	}

	if (oldJaxId > -1) {
		this._jaxId = oldJaxId;
		this._storage = JAX.Node.instances.html[this._jaxId];
		this._storage.instance = this;
		return;
	}

	if (this._node.nodeType in JAX.Node.instances) {
		switch(this._node.nodeType) {
			case JAX.Node.ELEMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.ELEMENT_NODE]++;
				this._node.setAttribute("data-jax-id", this._jaxId);

				var storage = {
					instance: this,
					events: {},
					lockQueue: []
				};

				JAX.Node.instances[JAX.Node.ELEMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.TEXT_NODE:
			case JAX.Node.COMMENT_NODE:
			case JAX.Node.DOCUMENT_FRAGMENT_NODE:
				var nodeType = this._node.nodeType;
				this._jaxId = JAX.Node._ids[nodeType]++;

				var storage = { instance: this, node: node };

				JAX.Node.instances[nodeType][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.DOCUMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.DOCUMENT_NODE]++;

				var storage = { 
					instance: this,
					events: {},
					node: node
				};

				JAX.Node.instances[JAX.Node.DOCUMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
		}
	}
};

JAX.Node.prototype._inPixels = function(value) {
	var style = this._node.style.left;
	var rStyle = this._node.runtimeStyle.left; 
    this._node.runtimeStyle.left = this._node.currentStyle.left;
    this._node.style.left = value || 0;  
    value = this._node.style.pixelLeft;
    this._node.style.left = style;
    this._node.runtimeStyle.left = rStyle;
      
    return value;
};

JAX.Node.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.FX.REGEXP_OPACITY, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Node.prototype._queueMethod = function(method, args) {
	this._storage.lockQueue.push({method:method, args:args});
};

JAX.Node.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

 
JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "0.1"
});

JAX.NodeArray.prototype.length = 0;

JAX.NodeArray.prototype.$constructor = function(nodes) {
	var nodes = [].concat(nodes);
	var len = nodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var node = nodes[i];
		if (typeof(node) === "object" && node.nodeType) { this._jaxNodes[i] = JAX(node); continue; }
		if (JAX.isJAXNode(node)) { this._jaxNodes[i] = node; continue; }

		throw new Error("First argument must be array of JAX.Node instances or html nodes");
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
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.addClass(); 
	}
	return this;
};

JAX.NodeArray.prototype.removeClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.removeClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.displayOn(displayValue); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOff = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.displayOff(); 
	}
	return this;
};

JAX.NodeArray.prototype.style = function(properties) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.styleCss(properties); 
	}
	return this;	
};

JAX.NodeArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.attr(attributes); 
	}
	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType === 9) { continue; }
		jaxNode.appendTo(node); 
	}
	return this;
};

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType === 9) { continue; }
		jaxNode.removeFromDOM(); 
	}
	return this;
};

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (jaxNode.jaxNodeType !== 1) { continue; }
		jaxNode.destroy(); 
	}
	return this;
};

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	return new JAX.NodeArray(this._jaxNodes.filter(func));
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX(node);
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
	var JAXNode = JAX(node);
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
		if (jaxNode.jaxNodeType !== 1) { continue; }
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
		if (jaxNode.jaxNodeType !== 1) { continue; }
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
	this._jax = { container: JAX.Node.create(document.createDocumentFragment()) };
	this._pointerJaxNode = null;
	this._stack = [];
};

JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	var jaxNode = element;

	if (typeof(element) === "string") {
		jaxNode = JAX.make(element, attributes, styles, this._doc);
	} else if (typeof(element) === "object" && element.nodeType) {
		jaxNode = JAX(element);
	}

	if (jaxNode && jaxNode.jaxNodeType !== 9) {
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

	throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
};

JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	var jaxNode = node;

	if (typeof(node) === "string") {
		jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) === "object" && node.nodeType) {
		jaxNode = JAX(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	}

	if (!(jaxNode instanceof JAX.Node) || jaxNode.jaxNodeType === 9) {
		throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
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
	if (typeof(txt) === "string") {
		var jaxNode = JAX.makeText(txt);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	throw new Error("First argument must be a string");
};

JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return;
	}

	throw new Error("There is no opened element so you can not close anything");
};

JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) === "object" && node.nodeType) {
		var jaxNode = JAX(node);
	} else if (JAX.isJAXNode(node) && node.jaxNodeType === 1) {
		var jaxNode = node;
	} else {
		throw new Error("You are trying to append me to unsupported element. I can be appended only to html element or documentFragment element.");
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

 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "0.32"
});

JAX.FX._TRANSITION_PROPERTY = "";
JAX.FX._TRANSITION_EVENT = "";

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
			JAX.FX._TRANSITION_PROPERTY = p;
			JAX.FX._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX._SUPPORTED_PROPERTIES = {
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
JAX.FX._REGEXP_OPACITY = new RegExp("alpha\(opacity=['\"]?([0-9]+)['\"]?\)");

JAX.FX.prototype.$constructor = function(element) {
	this._elm = JAX.isJAXNode(element) ? element : JAX.Node.create(element);
	this._properties = [];
	this._interpolators = [];
	this._callbacks = [];
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
};

JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	if (property in JAX.FX._SUPPORTED_PROPERTIES) { 
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

	var properties = [];
	for (var p in JAX.FX._SUPPORTED_PROPERTIES) { properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); }

	throw new Error("First argument must be supported property: " + properties.join(", "));
};

JAX.FX.prototype.callWhenDone = function(callback) {
	this._callbacks.push(callback);
	return this;
};

JAX.FX.prototype.run = function() {
	this._running = true;
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this;
};

JAX.FX.prototype.isRunning = function() {
	return this._running;
};

JAX.FX.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) === 0) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
};

JAX.FX.prototype._initTransition = function() {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
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

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit };
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

JAX.FX.prototype._endTransition = function() {
	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

 
if (!window.JAX) { 
	window.JAX = JAX; 
} else {
	if (window.console && window.console.warn) { window.console.warn("window.JAX is already defined. You are probably trying to initiate JAX twice or old version is present."); }
	return;
}

if (!window.$ && !window.$$) {
	window.$ = JAX;
	window.$$ = JAX.all;
}

 
})(); 
