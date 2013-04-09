JAX.HTMLElm = JAK.ClassMaker.makeClass({
	NAME: "JAX.HTMLElm",
	VERSION: "0.6",
	IMPLEMENTS:JAX.INode
});

JAX.HTMLElm._EVENTS = {};
JAX.HTMLElm._LOCKS = {};

JAX.HTMLElm.prototype.$constructor = function(node) {
	if (!("nodeType" in node) || node.nodeType != 1) { throw new Error("JAX.HTMLElm constructor accepts only HTML element as its parameter. See doc for more information.") }
	this._node = node;
	JAX.HTMLElm._EVENTS[this._node] = JAX.HTMLElm._EVENTS[this._node] || {};
};

JAX.HTMLElm.prototype.$destructor = function() {
	this.destroy();
};

JAX.HTMLElm.prototype.destroy = function() {
	if (this._checkLocked(this.destroy, arguments)) { return this; }
	this.stopListening();
	this.removeFromDOM();
	this.clear();
	delete JAX.HTMLElm._EVENTS[this._node];
	this._node = null;
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
	if (this._checkLocked(this.addClass, arguments)) { return this; }
	if (!JAX.isString(classname)) { throw new Error("JAX.HTMLElm.addClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._node.className.split(" ");

	while(classnames.length) {
		if (classes.indexOf(classnames.shift()) == -1) { classes.push(classname); }
	}

	this._node.className = classes.join(" ");

	return this;
};

JAX.HTMLElm.prototype.removeClass = function(classname) {
	if (this._checkLocked(this.removeClass, arguments)) { return this; }
	if (!JAX.isString(classname)) { throw new Error("JAX.HTMLElm.removeClass accepts only string as its parameter. See doc for more information."); }

	var classnames = classname.split(" ");
	var classes = this._node.className.split(" ");

	while(classnames.length) {
		var index = classes.indexOf(classnames.shift());
		if (index != -1) { classes.splice(index, 1); }
	}

	this._node.className = classes.join(" ");
	
	return this;
};

JAX.HTMLElm.prototype.hasClass = function(className) {
	if (!JAX.isString(classname)) { throw new Error("JAX.HTMLElm.hasClass accepts only string as its parameter. See doc for more information."); }

	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (this._node.className.indexOf(name) != -1) { return true; }
	}

	return false;
};

JAX.HTMLElm.prototype.id = function(id) {
	if (!arguments.length) { return this.attr("id"); }
	if (this._checkLocked(this.id, arguments)) { return this; }
	if (!JAX.isString(id)) { throw new Error("JAX.HTMLElm.id accepts only string as its argument. See doc for more information. "); }
	this.attr({id:id});
	return this;
};

JAX.HTMLElm.prototype.html = function(innerHTML) {
	if (!arguments.length) { return innerHTML; }
	if (this._checkLocked(this.html, arguments)) { return this; }
	this._node.innerHTML = innerHTML;
	return this;
};

JAX.HTMLElm.prototype.addNode = function(node) {
	if (this._checkLocked(this.addNode, arguments)) { return this; }
	if (!("nodeType" in node) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.addNode accepts only HTML node, textnode, JAX.HTMLElm or JAX.TextNode instance as its parameter. See doc for more information."); 
	}

	var node = node instanceof JAX.HTMLElm ? node.node() : node;
	this._node.appendChild(node);

	return this;
};

JAX.HTMLElm.prototype.addNodes = function() {
	if (this._checkLocked(this.addNodes, arguments)) { return this; }
	if (!arguments.length) { console.warn("JAX.HTMLElm.addNodes is called with no argument."); }
	var nodes = arguments;
	if (nodes.length == 1 && nodes[0] instanceof Array) { nodes = nodes[0]; }
	for (var i=0, len=nodes.length; i<len; i++) { this.addNode(nodes[i]); }
	return this;
};

JAX.HTMLElm.prototype.addNodeBefore = function(node, nodeBefore) {
	if (this._checkLocked(this.addNodeBefore, arguments)) { return this; }
	if (!("nodeType" in node) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.addNodeBefore accepts only HTML element, textnode, JAX.HTMLElm or JAX.TextNode instance as its first argument. See doc for more information."); 
	}

	if (!("nodeType" in nodeBefore) && !(nodeBefore instanceof JAX.HTMLElm) && !(nodeBefore instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.addNodeBefore accepts only HTML element, textnode, JAX.HTMLElm or JAX.TextNode instance as its second argument. See doc for more information."); 
	}

	var node = node instanceof JAX.HTMLElm ? node.node() : node;
	var nodeBefore = nodeBefore instanceof JAX.HTMLElm ? nodeBefore.node() : nodeBefore;

	this._node.insertBefore(node, nodeBefore);

	return this;
};

JAX.HTMLElm.prototype.appendTo = function(node) {
	if (this._checkLocked(this.appendTo, arguments)) { return this; }
	if ((!("nodeType" in node) || node.nodeType != 1) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.appendTo accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information."); 
	}

	var node = node instanceof JAX.HTMLElm ? node.node() : node;
	node.appendChild(this._node);
	return this;
};

JAX.HTMLElm.prototype.appendBefore = function(node) {
	if (this._checkLocked(this.appendBefore, arguments)) { return this; }
	if ((!("nodeType" in node) || node.nodeType != 1) && !(node instanceof JAX.HTMLElm) && !(node instanceof JAX.TextNode)) { 
		throw new Error("JAX.HTMLElm.appendTo accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information."); 
	}

	var node = node.node() ? node.node() : node;
	node.parentNode.insertBefore(this._node, node);
	return this;
};

JAX.HTMLElm.prototype.removeFromDOM = function() {
	if (this._checkLocked(this.removeFromDOM, arguments)) { return this; }
	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {};
	return this;
};

JAX.HTMLElm.prototype.clone = function(withContent) {
	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	return new JAX.HTMLElm(clone);
};

JAX.HTMLElm.prototype.listen = function(type, method, obj, bindData) {
	if (!type || !JAX.isString(type)) { throw new Error("JAX.HTMLElm.listen: first parameter must be string. See doc for more information."); }
	if (!method || (!JAX.isString(method) && !JAX.isFunction(method))) { throw new Error("JAX.HTMLElm.listen: second paremeter must be function or name of function. See doc for more information."); }
	if (arguments.length > 4) { console.warn("JAX.HTMLElm.listen accepts maximally 4 arguments. See doc for more information."); }
	
	if (JAX.isString(method)) {
		var obj = obj || window;
		var method = obj[method];
		if (!method) { throw new Error("JAX.HTMLElm.listen: method '" + method + "' was not found in " + obj + "."); }
		method = method.bind(obj);
	}

	var thisNode = this;
	var f = function(e, node) { method(e, thisNode, bindData); }
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = JAX.HTMLElm._EVENTS[this._node][type] || [];

	evtListeners.push(listenerId);
	JAX.HTMLElm._EVENTS[this._node][type] = evtListeners;

	return listenerId;
};

JAX.HTMLElm.prototype.stopListening = function(type, listenerId) {
	if (this._checkLocked(this.stopListening, arguments)) { return this; }

	if (!arguments.length) {
		var events = JAX.HTMLElm._EVENTS[this._node];
		for (var p in events) { this.stopListening(p); }
		return this;
	}

	if (!JAX.isString(type)) {
		throw new Error("JAX.HTMLElm.stopListening bad arguments. See doc for more information.")
	}

	var eventListeners = JAX.HTMLElm._EVENTS[this._node][type]; 
	if (!eventListeners) { console.warn("JAX.HTMLElm.stopListening: no event '" + type + "' found"); return this; }

	if (!listenerId) { 
		this._destroyEvents(eventListeners);
		delete JAX.HTMLElm._EVENTS[this._node][type];
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
	if (JAX.isString(attributes)) { return this._node.getAttribute(attributes); }

	if (JAX.isArray(attributes)) {
		var attrs = {};
		for (var i=0, len=attributes.length; i<len; i++) { 
			var attribute = attributes[i];
			attrs[attribute] = this._node.getAttribute(attribute);
		}
		return attrs;	
	}

	if (this._checkLocked(this.attr, arguments)) { return this; }

	for (var p in attributes) {
		var value = attributes[p];
		this._node.setAttribute(p, value);
	}

	return this;
};

JAX.HTMLElm.prototype.style = function(cssStyles) {
	if (JAX.isString(cssStyles)) { return cssStyles == "opacity" ? this._getOpacity() : this._node.style[cssStyles]; }

	if (JAX.isArray(cssStyles)) {
		var css = {};
		for (var i=0, len=cssStyles.length; i<len; i++) {
			var cssStyle = cssStyles[i];
			if (cssStyle == "opacity") { css[cssStyle] = this._getOpacity(); continue; }
			css[cssStyle] = this._node.style[cssStyle];
		}
		return css;
	}

	if (this._checkLocked(this.style, arguments)) { return this; }

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

JAX.HTMLElm.prototype.computedStyle = function(cssStyles) {
	if (JAX.isString(cssStyles)) { return JAK.DOM.getStyle(this._node, cssStyles); }

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
		var backupStyle = this.style(["display","visibility","position"]);
		var isFixedPosition = this.computedStyle("position").indexOf("fixed") == 0;
		var isDisplayNone = this.style("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.style({"position":"absolute !important"}); }
		if (isDisplayNone) { this.style({"display":""}); }		
		this.style({"visibility":"hidden !important"});

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
		var backupStyle = this.style(["display","visibility","position"]);
		var isFixedPosition = this.computedStyle("position").indexOf("fixed") == 0;
		var isDisplayNone = this.style("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.style({"position":"absolute !important"}); }
		if (isDisplayNone) { this.style({"display":""}); }		
		this.style({"visibility":"hidden !important"});

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
	if (this._node.parentNode) { return new JAX.HTMLElm(this._node.parentNode); }
	return null;
};

JAX.HTMLElm.prototype.nextSibling = function() {
	return this._node.nextSibling ? new JAX.HTMLElm(this._node.nextSibling) : null;
};

JAX.HTMLElm.prototype.prevSibling = function() {
	return this._node.previousSibling ? new JAX.HTMLElm(this._node.previousSibling) : null;
};

JAX.HTMLElm.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.TextNode(childNode)); continue; }
		nodes.push(new JAX.HTMLElm(childNode));
	}
	return nodes;
};

JAX.HTMLElm.prototype.clear = function() {
	if (this._checkLocked(this.clear, arguments)) { return this; }
	JAK.DOM.clear(this._node);
	return this;
};

JAX.HTMLElm.prototype.contains = function(node) {
	var elm = node.node() ? node.node().parentNode : node.parentNode;
	while(elm) {
		if (elm == this._node) { return true; }
		elm = elm.parentNode;
	}
	return false;
};

JAX.HTMLElm.prototype.fadeIn = function(duration, callback) {
	if (this._checkLocked(this.fadeIn, arguments)) { return this; }

	var animation = new JAX.Animation(this);
	var targetOpacity = parseFloat(this.computedStyle("opacity")) || 1;

	animation.addProperty("opacity", duration, 0, targetOpacity);
	animation.addCallback(function() {
		if (callback) { callback(); }
		this._unlock();
	}.bind(this));
	animation.run();
	this._lock();

	return this;
};

JAX.HTMLElm.prototype.fadeOut = function(duration, callback) {
	if (this._checkLocked(this.fadeOut, arguments)) { return this; }
	var animation = new JAX.Animation(this);
	var sourceOpacity = parseFloat(this.computedStyle("opacity")) || 1;

	animation.addProperty("opacity", duration, sourceOpacity, 0);
	animation.addCallback(function() {
		if (callback) { callback(); }
		this._unlock();
	}.bind(this));
	animation.run();
	this._lock();

	return this;
};

JAX.HTMLElm.prototype.slideDown = function(duration, callback) {
	if (this._checkLocked(this.slideDown, arguments)) { return this; }
	var animation = new JAX.Animation(this);
	var backupStyles = this.style(["height","overflow"]);

	this.style({"overflow": "hidden"});

	animation.addProperty("height", duration, 0, this.height());
	animation.addCallback(function() {
		this.style(backupStyles);
		if (callback) { callback(); }
		this._unlock();
	}.bind(this));
	animation.run();

	return this;
};

JAX.HTMLElm.prototype.slideUp = function(duration, callback) {
	if (this._checkLocked(this.slideUp, arguments)) { return this; }
	var animation = new JAX.Animation(this);
	var backupStyles = this.style(["height","overflow"]);

	this.style({"overflow": "hidden"});

	animation.addProperty("height", duration, this.height(), 0);
	animation.addCallback(function() {
		this.style(backupStyles);
		if (callback) { callback(); }
		this._unlock();
	}.bind(this));
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
	JAX.HTMLElm._LOCKS[this._node] = [];
};

JAX.HTMLElm.prototype._checkLocked = function(method, args) {
	if (!JAX.HTMLElm._LOCKS[this._node]) { return false; }
	JAX.HTMLElm._LOCKS[this._node].push({method:method, args:args});
	return true;
};

JAX.HTMLElm.prototype._unlock = function() {
	var queue = JAX.HTMLElm._LOCKS[this._node].slice();
	delete JAX.HTMLElm._LOCKS[this._node];
	while(queue.length) {
		var mq = queue.shift();
		q.method.apply(this, q.args);
	}
};

JAX.HTMLElm.prototype._destroyEvents = function(eventlisteners) {
	for (var i=0, len=eventlisteners; i<len; i++) { JAK.Events.removeListener(eventListeners[i]); }
};
