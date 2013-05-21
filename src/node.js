JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "0.71"
});

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

JAX.Node._MEASUREABLEVALUE_REGEXP = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;
JAX.Node._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i

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

JAX.Node.prototype.addClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.addClass","You can not use this method for this node. Doing nothing.", this._node);
		return this; 
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.addClass","Given arguments can be string, array of strings or strings separated by comma. Trying convert to string: " + cName, this._node);
		}
		var classes = cName.split(" ");
		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) === -1) { currclasses.push(newclass); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

JAX.Node.prototype.removeClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.removeClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.removeClass","Given arguments can be string, array of strings or strings separated by comma. Trying convert to string: " + cName, this._node);
		}
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.hasClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(className) !== "string") {  
		className += "";
		JAX.Report.show("error","JAX.Node.hasClass","For first argument I expected string. Trying convert to string: " + className, this._node);
	}

	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (this._node.className.indexOf(name) === -1) { return false; }
	}

	return true;
};

JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.id","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	}

	if (typeof(id) !== "string") {
		id += "";
		JAX.Report.show("warn","JAX.Node.id","For first argument I expected string. Trying convert to string: " + id, this._node);
	}

	this.attr({id:id}); 
	return this;
};

JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.html","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	}

	if (typeof(innerHTML) !== "string" && typeof(innerHTML) !== "number") {
		innerHTML += "";
		JAX.Report.show("warn","JAX.Node.html","For first argument I expected string or number. Trying convert to string: " + innerHTML, this._node);
	}

	this._node.innerHTML = innerHTML + "";
	return this;
};

JAX.Node.prototype.add = function(nodes) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	}
	
	if (!(nodes instanceof Array)) { nodes = [].concat(nodes); }
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !(node instanceof JAX.Node)) { throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them."); }
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

	if (typeof(node) !== "object" || (!node.nodeType && !(node instanceof JAX.Node))) { throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); }
	if (typeof(nodeBefore) !== "object" || (!nodeBefore.nodeType && !(nodeBefore instanceof JAX.Node))) { throw new Error("For second argument I expected html element, text node or JAX.Node instance"); }

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

JAX.Node.prototype.appendTo = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) { 
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
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var node = node.jaxNodeType ? node.node() : node;
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

JAX.Node.prototype.removeFromDOM = function() {
	if ([9,11].indexOf(this._node.nodeType) !== -1) { 
		JAX.Report.show("warn","JAX.Node.removeFromDOM","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeFromDOM, arguments); 
		return this; 
	}
	
	this._node.parentNode.removeChild(this._node);

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.clone","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.Node.create(clone);
};

JAX.Node.prototype.listen = function(type, funcMethod, obj, bindData) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.listen","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	var obj = obj || window;

	if (!type || typeof(type) !== "string") { 
		type += "";
		JAX.Report.show("error","JAX.Node.listen","For first argument I expected string. Tring convert to string: " + type, this._node);
	}

	if (!funcMethod || (typeof(funcMethod) !== "string" && typeof(funcMethod) !== "function")) { 
		throw new Error("For second argument I expected string or function"); 
	}

	if (typeof(obj) !== "object") { 
		throw new Error("For third argument I expected referred object"); 
	}

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
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.stopListening","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

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

	if (typeof(type) !== "string") { 
		type += "";
		JAX.Report.show("error","JAX.Node.stopListening","For first argument I expected string. Tring convert to string: " + type, this._node);
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

	return this;
};

JAX.Node.prototype.attr = function(property, value) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.attr","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") { 
		if (arguments.length === 1) { 
			return node.getAttribute(property); 
		} 
		this._node.setAttribute(property, value + "");
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.attr","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var attrs = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			attrs[p] = node.getAttribute(p);
		}
		return attrs;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	for (var p in property) {
		var value = property[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

	
JAX.Node.prototype.css = function(property, value) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.css","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") {
		if (arguments.length === 1) { 
			return property === "opacity" ? this._getOpacity() : this._node.style[property]; 
		}
		this._node.style[property] = value; 
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.css","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var css = {};
		for (var i=0, len=property.length; i<len; i++) {
			var p = property[i];
			if (p === "opacity") { css[p] = this._getOpacity(); continue; }
			css[p] = this._node.style[p];
		}
		return css;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	for (var p in property) {
		var value = property[p];
		if (p === "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

JAX.Node.prototype.computedCss = function(properties) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.computedCss","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(properties) === "string") {
		var value = JAK.DOM.getStyle(this._node, properties);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	for (var i=0, len=properties.length; i<len; i++) {
		var p = properties[i];
		var value = JAK.DOM.getStyle(this._node, p);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		css[p] = value;
	}
	return css;
};

JAX.Node.prototype.fullWidth = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.fullWidth","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (!arguments.length) { 
		var backupStyle = this.css(["display","visibility","position"]);
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.css({"position":"absolute"}); }
		if (isDisplayNone) { this.css({"display":""}); }		
		this.css({"visibility":"hidden"});

		var width = this._node.offsetWidth;
		this.css(backupStyle);
		return width; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.width, arguments); 
		return this; 
	} 
	
	var boxSizing = this.computedCss("box-sizing") || this.computedCss("-moz-box-sizing") || this.computedCss("-webkit-box-sizing");
	var paddingLeft = 0,
		paddingRight = 0,
		borderLeft = 0,
		borderRight = 0;

	if (!boxSizing || boxSizing === "content-box") {
		var paddingLeft = parseFloat(this.computedCss("padding-left"));
		var paddingRight = parseFloat(this.computedCss("padding-right"));
	}
	
	if (boxSizing !== "border-box") {
		var borderLeft = parseFloat(this.computedCss("border-left"));
		var borderRight = parseFloat(this.computedCss("border-right"));
	}

	if (paddingLeft && isFinite(paddingLeft)) { value =- paddingLeft; }
	if (paddingRight && isFinite(paddingRight)) { value =- paddingRight; }
	if (borderLeft && isFinite(borderLeft)) { value =- borderLeft; }
	if (borderRight && isFinite(borderRight)) { value =- borderRight; }

	this._node.style.width = Math.max(value,0) + "px";
	return this;
};

JAX.Node.prototype.fullHeight = function(value) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.fullHeight","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (!arguments.length) { 
		var backupStyle = this.css(["display","visibility","position"]);
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.css({"position":"absolute"}); }
		if (isDisplayNone) { this.css({"display":""}); }		
		this.css({"visibility":"hidden"});

		var height = this._node.offsetHeight;
		this.css(backupStyle);
		return height; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.height, arguments); 
		return this; 
	} 
	
	var boxSizing = this.computedCss("box-sizing") || this.computedCss("-moz-box-sizing") || this.computedCss("-webkit-box-sizing");
	var paddingTop = 0,
		paddingBottom = 0,
		borderTop = 0,
		borderBottom = 0;

	if (!boxSizing || boxSizing === "content-box") {
		paddingTop = parseFloat(this.computedCss("padding-top"));
		paddingBottom = parseFloat(this.computedCss("padding-bottom"));
	}
	
	if (boxSizing !== "border-box") {
		borderTop = parseFloat(this.computedCss("border-top"));
		borderBottom = parseFloat(this.computedCss("border-bottom"));
	}
	
	if (paddingTop && isFinite(paddingTop)) { value =- paddingTop; }
	if (paddingBottom && isFinite(paddingBottom)) { value =- paddingBottom; }
	if (borderTop && isFinite(borderTop)) { value =- borderTop; }
	if (borderBottom && isFinite(borderBottom)) { value =- borderBottom; }

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
	if ([1,11].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.clear","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	} 
	JAK.DOM.clear(this._node);
	return this;
};

JAX.Node.prototype.contains = function(node) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
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
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	}
	
	throw new Error("For first argument I expected html element or JAX.Node instance");
};

JAX.Node.prototype.fade = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) !== "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.fade","For first argument I expected string. Trying convert to string: " + type, this._node); 
	}
	if (duration < 0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fade","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
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
			JAX.Report.show("warn","JAX.Node.fade","I got unsupported type '" + type + "'.", this._node);
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
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	var opacityValue = parseFloat(opacityValue) || 0;
	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (opacityValue<0) {
		opacityValue = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}
	if (duration<0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

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
		JAX.Report.show("warn","JAX.Node.slide","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) !== "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.slide","For first argument I expected string. Trying convert to string: " + type, this._node);
	}
	if (duration<0) {
		duration = 0;
		JAX.Report.show("error","JAX.Node.slide","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	switch(type) {
		case "down":
			var backupStyles = this.css(["height","overflow"]);
			var property = "height";
			var source = 0;
			var target = this.fullHeight();	
		break;
		case "up":
			var backupStyles = this.css(["height","overflow"]);
			var property = "height";
			var source = this.fullHeight();
			var target = 0;
		break;
		case "left":
			var backupStyles = this.css(["width","overflow"]);
			var property = "width";
			var source = this.fullWidth();
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.css(["width","overflow"]);
			var property = "width";
			var source = 0;
			var target = this.fullWidth();
		break;
		default:
			JAX.Report.show("warn","JAX.Node.slide","I got unsupported type '" + type + "'.", this._node);
			return this;
	}

	this.css({"overflow": "hidden"});


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
		this._node.style.filter.replace(JAX.NODE.OPACITY_REGEXP, function(match1, match2) {
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

