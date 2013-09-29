/**
 * @fileOverview jax.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.2
 * @group jak-util
 */

/**
 * @method Najde element, který odpovídá selectoru
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @param {string || object} [srcElement=window.document] element, ve kterém se má hledat
 * @returns {object} JAX.Node
 */
var JAX = function(selector, srcElement) {
	if (!selector) {
		return new JAX.NullNode();
	}

	if (JAX.isJAXElement(selector)) {
		return selector;
	}

	if (typeof(selector) == "string") {
		srcElement = srcElement || document;

		if (srcElement != document) {
			var jaxSrcElement = JAX(srcElement);

			if (!jaxSrcElement.exists()) {
				return new JAX.NullNode();
			}

			srcElement = jaxSrcElement.node();
		}

		var foundElm = srcElement.querySelector(selector);
		var nodeType = foundElm ? foundElm.nodeType : -1;
	} else if (JAX.isDOMElement(selector)) {
		var nodeType = !("nodeType" in selector) ? -2 : selector.nodeType;
		var foundElm = selector;
	} else {
		var nodeType = -1;
		var foundElm = null;
	}

	switch(nodeType) {
		case -2:
			return new JAX.Window(foundElm);
		case -1:
			return new JAX.NullNode();
		case 1:
			return new JAX.Element(foundElm);
		case 3:
		case 8:
			return new JAX.TextNode(foundElm);
		case 9:
			return new JAX.Document(foundElm);
		case 11:
			return new JAX.DocumentFragment(foundElm);
	}
};

/**
 * @method Najde elementy, které odpovídají selectoru
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.Node) | JAX.NodeArray
 * @param {object || string} [srcElement=window.document] CSS3 (CSS2.1) selector nebo element, ve kterém se má hledat
 * @returns {object} JAX.NodeArray
 */
JAX.all = function(selector, srcElement) {
	if (!selector) {
		return JAX.NodeArray([]);
	}

	if (typeof(selector) == "string") {
		srcElement = srcElement || document;

		if (srcElement != document) {
			var jaxSrcElement = JAX(srcElement);

			if (!jaxSrcElement.exists()) {
				return new JAX.NullNode();
			}

			srcElement = jaxSrcElement.node();
		}

		var foundElms = srcElement.querySelectorAll(selector);
		var arrayElms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { arrayElms[i] = foundElms[i]; }

		return new JAX.NodeArray(arrayElms);
	}
	
	return new JAX.NodeArray(selector);
};

/**
 * @method Vytvoří element na základě zadaných parametrů
 *
 * @param {string} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {object} attrs asociativní pole atributů tagu
 * @param {object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {object} [srcDocument=window.document] documentElement, ve kterém se má vytvářet
 * @returns {object} instance JAX.Node
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) != "string") { 
		console.error("First argument must be string.");
		return JAX(null); 
	}
	if (typeof(attrs) != "object") { 
		console.error("Second argument must be associative array."); 
		attrs = {};
	}
	if (typeof(styles) != "object") { 
		console.error("Third argument must be associative array."); 
		styles = {};
	}
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { 
		console.error("Fourth argument must be document element."); 
		srcDocument = document;
	}

	var parts = tagString.match(/[#.]?[a-z0-9_-]+/ig) || [];
	var tagName = parts[0];

	if (!tagName || !/^[a-z0-9]+$/ig.test(tagName)) {
		console.error("Tagname must be first in element definition.");
		return JAX(null);
	}
	
	for (var i=0, len=parts.length; i<len; i++) {
		var part = parts[i];
		var ch = part.charAt(0);

		if (ch == "#") { 
			attrs["id"] = part.substring(1);
		} else if (ch == ".") { 
			if (attrs["className"]) { 
				attrs["className"] += " ";
				attrs["className"] += part.substring(1);
			} else {
				attrs["className"] = part.substring(1);
			}
		}
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }
	
	return new JAX.Element(createdNode);
};

/**
 * @method Vytvoří z HTML stringu elementy - *zhmotní* html string.
 *
 * @param {string} html html string, který má být transformováno na uzly
 * @returns {object} JAX.NodeArray
 */
JAX.makeFromHTML = function(html) {
	if (!html) { return new JAX.NodeArray([]); }

	var temp = JAX.make("div").html(html);
	var children = temp.children();

	return children;
};

/**
 * @method Vytvoří textový uzel
 *
 * @param {string} text text, který má uzel obsahovat
 * @param {object} [srcDocument=window.document] documentElement node, ve kterém se má vytvářet
 * @returns {object} JAX.Node
 */
JAX.makeText = function(text, srcDocument) {
	return new JAX.TextNode((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 *
 * @param {} value testovaná hodnota
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) == "number") {
		return "number";
	} else if (typeof(value) == "string") {
		return "string";
	} else if (typeof(value) == "undefined") {
		return "undefined";
	} else if (typeof(value) == "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult == "[object Array]") {
		return "array";	
	} else if (toStringResult == "[object Date]") {
		return "date";
	}

	return "object";
};

/**
 * @method Zjistí, jestli se jedná o podporovaný DOM element
 *
 * @param {} o testovaná hodnota
 * @returns {boolean}
 */
JAX.isDOMElement = function(o) {
	if (!o || typeof(o) != "object") {
		return false;
	}

	if ((o.Window && o instanceof o.Window) || o instanceof Window) {
		return true;
	}
	
	var win = o.defaultView || o.parentWindow || (o.ownerDocument ? (o.ownerDocument.defaultView || o.ownerDocument.parentWindow) : null);

	return win && (
		(win.HTMLElement && o instanceof win.HTMLElement) ||
		(win.Element && o instanceof win.Element) || // IE
		(win.HTMLDocument && o instanceof win.HTMLDocument) ||
		(win.Document && o instanceof win.Document) || // IE 10
		(win.DocumentFragment && o instanceof win.DocumentFragment) ||
		(win.Text && o instanceof win.Text)
	);
};

/**
 * @method Zjistí, jestli se jedná o instanci JAX.Node
 *
 * @param {} o testovaná hodnota
 * @returns {boolean}
 */
JAX.isJAXElement = function(o) {
	return o instanceof JAX.Node;
};
 
/**
 * @fileOverview ilistening.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhrani implementujici praci s navesovani a odvesovani udalosti
 * @class JAX.IListening
 */
JAX.IListening = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IListening",
	VERSION: "1.0"
});

JAX.IListening._events = [];

/**
 * @method navěsí posluchač události na element a vrátí event id. Pokud událost proběhne, vyvolá se zadané funkce. Do této funkce jsou pak předány parametry event (window.Event), jaxlm (instance JAX.Node) a bindData
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var func = function(jaxE) { alert(jaxE.currentTarget().html()); };
 * var eventId = JAX(document.body.firstChild).listen("click", func); // navesi udalost click na span
 *
 * @param {String} type typ události, na kterou chceme reagovat ("click", "mousedown", ...)
 * @param {Object} obj objekt, ve které se metoda uvedená pomocí stringu nachází. Pokud je funcMethod function, tento parameter lze nechat prázdný nebo null
 * @param {String | Function} funcMethod název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {any} bindData pokud je potřeba přenést zároveň s tím i nějakou hodnotu (String, Number, Asociativní pole, ...)
 * @returns {String} Event ID
 */
JAX.IListening.prototype.listen = function(type, obj, funcMethod, bindData) {
	if (!funcMethod) {
		var funcMethod = obj;
		obj = window;
	}

	if (typeof(type) != "string") { 
		type += "";
		console.error("For first argument I expected string.", this._node);
	}

	if (!obj || (typeof(obj) != "object" && typeof(obj) != "function")) { 
		console.error("For second argument I expected referred object or binded function.", this._node);
		obj = function() {};
		funcMethod = null;
	}

	if (funcMethod && typeof(funcMethod) != "string" && typeof(funcMethod) != "function") { 
		console.error("For third argument I expected string with function name or function.", this._node); 
		obj = function() {};
		funcMethod = null;
	}

	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (funcMethod) {
			funcMethod = funcMethod.bind(obj);
		} else {
			console.error("Given method in second argument was not found in referred object given in third argument.", this._node);
			funcMethod = function() {};
		}
	} else if (typeof(funcMethod) == "function" && obj) {
		funcMethod = funcMethod.bind(obj);
	} else if (typeof(obj) == "function") {
		funcMethod = obj;
	}

	var f = function(e, elm) {
		funcMethod(new JAX.Event(e), bindData); 
	};
	
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var objListener = new JAX.Listener(this, listenerId, type, f);
	var allNodes = JAX.IListening._events;
	var nodeIndex = -1;

	for (var i=0, len=allNodes.length; i<len; i++) {
		if (allNodes[i].node == this._node) { nodeIndex = i; break; }
	}

	if (nodeIndex == -1) {
		var nodeInfo = {
			node: this._node,
			events: {}
		};
		allNodes.push(nodeInfo);
	} else {
		var nodeInfo = allNodes[nodeIndex];
	}

	if (nodeInfo.events[type]) {
		nodeInfo.events[type].push(objListener);	
	} else {
		nodeInfo.events[type] = [objListener];
	}

	return objListener;
};

/**
 * @method odvěsí posluchač na základě parametru, což může být eventId vrácené pomocí metody JAX.Node.listen a nebo jméno konkrétkní události, např.: "click" Pokud se uvede jméno konkrétní události, jsou odstranění všechny listenery na tomto elementu, které na ni poslouchají a které byly navěšeny JAXem.
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var func = function(e, jaxElm) { jaxElm.stopListening("click"); }; // pri kliknuti odvesi udalost
 * var eventId = JAX(document.body.firstChild).listen("click", func); // navesi udalost click na span
 *
 * @param {String} id konkrétní událost nebo event id vrácené metodou JAX.Node.listen
 * @returns {JAX.Node}
 */
JAX.IListening.prototype.stopListening = function(listener) {
	var allNodes = JAX.IListening._events;
	var nodeIndex = -1;

	for (var i=0, len=allNodes.length; i<len; i++) {
		if (allNodes[i].node == this._node) { nodeIndex = i; break; }
	}

	if (nodeIndex == -1) { return this; }
	var nodeInfo = allNodes[nodeIndex];

	if (!arguments.length) {
		var events = nodeInfo.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		allNodes.splice(nodeIndex, 1);
		return this;
	}

	if (typeof(listener) == "string") {
		var eventListeners = nodeInfo.events[listener];
		this._destroyEvents(eventListeners);
		delete allNodes[nodeIndex].events[listener];
		return this;
	}

	if (listener instanceof JAX.Listener) {
		var eventListeners = nodeInfo.events[listener.type()];
		var listenerIndex = eventListeners.indexOf(listener);
		if (listenerIndex > -1) {
			this._destroyEvents([eventListeners[listenerIndex]]);
			eventListeners.splice(listenerIndex, 1);
		}
		return this;
	}

	console.error("For first argument I expected JAX.Listener instance, string with event type or you can call it without arguments.");

	return this;
}; 
/**
 * @fileOverview event.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída obalující window.Event pro snadnější práci se stavem událostí
 * @class JAX.Event
 */ 
JAX.Event = JAK.ClassMaker.makeClass({
	NAME: "JAX.Event",
	VERSION: "1.0"
});

/**
 * @method $constructor
 *
 * @param {window.Event} e událost
 */
JAX.Event.prototype.$constructor = function(e) {
	this._e = e;
};

/**
 * @method vrací event object
 *
 * @returns {window.Event}
 */
JAX.Event.prototype.event = function() {
	return this._e;
};

/**
 * @method zruší výchozí provedení události
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.prevent= function() {
	JAK.Events.cancelDef(this._e);
	return this;
};

/**
 * @method stopne probublávání
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.stop = function() {
	JAK.Events.stopEvent(this._e);
	return this;
};

/**
 * @method vrací cílový element
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.target = function() {
	return JAX(JAK.Events.getTarget(this._e));
};

/**
 * @method vrací element, na který byla událost zavěšena
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.currentTarget = function() {
	return JAX(this._e.currentTarget);
};

/**
 * @method vrací typ události
 *
 * @returns {String}
 */
JAX.Event.prototype.type = function() {
	return this._e.type;
};
 
/**
 * @fileOverview listener.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující listener
 * @class JAX.Listener
 */ 
JAX.Listener = JAK.ClassMaker.makeClass({
	NAME: "JAX.Listener",
	VERSION: "1.0"
});

JAX.Listener.prototype.$constructor = function(jaxElm, id, type, method) {
	this._jaxElm = jaxElm;
	this._type = type;
	this._method = method;
	this._id = id;
};

JAX.Listener.prototype.unregister = function() {
	if (!this._id) { return; }
	this._jaxElm.stopListening(this);
	this._id = null;
};

JAX.Listener.prototype.node = function() {
	return this._jaxElm.node();
};

JAX.Listener.prototype.id = function() {
	return this._id;
};

JAX.Listener.prototype.type = function() {
	return this._type;
};
 
/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující listener
 * @class JAX.ListenerArray
 */ 
JAX.ListenerArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.ListenerArray",
	VERSION: "1.0"
});

JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this._listeners = listeners;
};

JAX.ListenerArray.prototype.unregister = function() {
	for (var i=0, len=this._listeners.length; i<len; i++) {
		this._listeners[i].unregister();
	}
	this._listeners = [];
};

JAX.ListenerArray.prototype.getListeners = function() {
	return this._listeners.slice();	
};
 
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * Obecná třída reprezentující obecný JAXovský element
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.1"
});

/**
 * @param {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

JAX.Node.prototype.$destructor = function() {};

/**
 * @method vrací uzel, který si instance drží
 *
 * @returns {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * @method zjišťuje, zda-li je obsah platný nebo nikoliv.
 *
 * @returns {boolean}
 */
JAX.Node.prototype.exists = function() {
	return !!this._node;
};

/**
 * @method najde element odpovídající selectoru v rámci tohoto elementu
 * @see JAX
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.Node.prototype.find = function(selector) {
	this._showMessage();

	return new JAX.Node();
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto elementu
 * @see JAX.all
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.Node) | JAX.NodeArray
 * @returns {object} JAX.NodeArray
 */
JAX.Node.prototype.findAll = function(selector) {
	this._showMessage();

	return new JAX.NodeArray([]);
};

JAX.Node.prototype.addClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.removeClass = function(classNames) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.hasClass = function(className) {
	this._showMessage();

	return false;
};

JAX.Node.prototype.toggleClass = function(className) {
	this._showMessage();

	return this;
}

JAX.Node.prototype.id = function(id) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.html = function(innerHTML) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.text = function(text) {
	this._showMessage();

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.Node.prototype.add = function(nodes) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.insertFirst = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.appendTo = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.before = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.after = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.replaceWith = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.swapPlaceWith = function(node) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.remove = function() {
	this._showMessage();

	return this;
};

JAX.Node.prototype.clone = function(withContent) {
	this._showMessage("JAX.Node.clone");

	return this;
};

JAX.Node.prototype.listen = function(type, obj, funcMethod, bindData) {
	this._showMessage();

	return new JAX.Listener(this, null, type, f);
};

JAX.Node.prototype.stopListening = function(listener) {
	this._showMessage();

	return this;
};

JAX.Node.prototype.prop = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.attr = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.css = function(property, value) {
	this._showMessage();

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.Node.prototype.computedCss = function(properties) {
	this._showMessage();

	return typeof(properties) ? "" : {};
};

JAX.Node.prototype.fullSize = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.prototype.size = function(sizeType, value) {
	this._showMessage();

	return arguments.length == 1 ? 0 : this;
};

JAX.Node.prototype.parent = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.next = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.previous = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.children = function(index) {
	this._showMessage();

	return arguments.length ? new JAX.Node() : new JAX.NodeArray([]);
};

JAX.Node.prototype.first = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.last = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.clear = function() {
	this._showMessage();

	return new JAX.Node();
};

JAX.Node.prototype.eq = function(node) {
	this._showMessage();

	return arguments[0] && arguments[0] instanceof JAX.Node;
};

JAX.Node.prototype.contains = function(node) {
	this._showMessage();

	return false;
};

JAX.Node.prototype.isIn = function(node) {
	this._showMessage();

	return false;
};

JAX.Node.prototype.animate = function(property, duration, start, end) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.fade = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.slide = function(type, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype.scroll = function(type, value, duration) {
	this._showMessage();

	return new JAK.Promise().reject(this._node);
};

JAX.Node.prototype._showMessage = function(method) {
	console.error("I have bad feeling about this! You are trying to use unsupported method with my node.", this._node);
};
 
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující obecny DOM Node (nodeType == 1 || 3 || 8)
 * @class JAX.DOMNode
 */
JAX.DOMNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.DOMNode.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {String | Node | Node[] | JAX.DOMNodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.DOMNodeArray
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.add = function(nodes) {
	if (nodes instanceof JAX.DOMNodeArray) {
		nodes = nodes.items();
	} else if (typeof(nodes) == "string") {
		var div = document.createElement("div");
		div.innerHTML = nodes;
		var nodesLength = div.childNodes.length;
		nodes = new Array(nodesLength);
		for (var i=0, len=nodesLength; i<len; i++) { nodes[i] = div.childNodes[i]; }
	} else if (!(nodes instanceof Array)) { 
		nodes = [].concat(nodes); 
	} 
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if ((!node.nodeType && !node.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) {
			console.error("For my argument I expected html node, text node, documentFragment or JAX node. You can use also array of them.");
			continue;
		}
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

/**
 * @method vloží zadaný element jako první
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.insertFirst = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();

		if (this._node.childNodes && this._node.firstChild) {
			this._node.insertBefore(node, this._node.firstChild);
		} else if (this._node.childNodes) {
			this._node.appendChild(node);
		} else {
			console.error("Given element can not have child nodes.", this._node);
		}
		
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @param {Node | JAX.DOMNode} nodeBefore DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.addBefore = function(node, nodeBefore) {
	if (!node || typeof(node) != "object" || (!node.nodeType && !node.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) { 
		console.error("For first argument I expected html element, text node, documentFragment or JAX node.");
		return this;
	}
	if (!nodeBefore || typeof(nodeBefore) != "object" || (!nodeBefore.nodeType && !nodeBefore.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) { 
		console.error("For second argument I expected html element, text node or JAX node."); 
		return this;
	}

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

/**
 * @method připne (přesune) element do jiného elementu (na konec)
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendTo(document.body); // pripne span do body
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS 3 (CSS 2.1 selector pro IE8)
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.appendTo = function(node) {
	var node = JAX(node);

	if (node.exists()) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").before(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.before = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element za jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").after(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.after = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();

		if (node.nextSibling) {
			node.parentNode.insertBefore(this._node, node.nextSibling);
		} else {
			node.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní zadaný element z DOMu a nahradí ho za sebe
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span.novy").replaceWith(document.body.lastChild); // odstrani prvek a nahradi ho za sebe
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.replaceWith = function(node) {
	var node = JAX(node);

	if (node.exists()) { 
		var node = node.node();
		node.parentNode.replaceChild(this._node, node);
		return this;
	}

	console.error("For first argument I expected html element, text node or JAX node.");
	return this;
};

JAX.DOMNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var targetNode = jaxNode.node();
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var parent = this._node.parentNode;

		if (parent) {
			this._node.parentNode.replaceChild(targetNode, this._node);
		} else if (targetParentNode) {
			jaxNode.remove();
		}

		if (targetParentNode) {
			if (targetSiblingNode) {
				targetParentNode.insertBefore(this._node, targetSiblingNode);
			} else {
				targetParentNode.appendChild(this._node);
			}
		}

		return this;
	}

	console.error("For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.remove = function() {
	this._node.parentNode.removeChild(this._node);

	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.DOMNode
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);

	return new this(clone);
};

/**
 * @method získá nebo nastaví vlastnost elementu
 * @example
 * document.body.innerHTML = "<input type='text' value='aaa'>";
 * var jaxElm = JAX(document.body);
 * console.log(jaxElm.prop("value")); // vraci pole ["mojeId", "demo"]
 * jaxElm.prop("value","bbb"); // nastavi value na "bbb"
 * jaxElm.prop("tagName"); // vrati "input"
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {value} value pokud je uvedena a první argument je string, provede se nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {String | Object | JAX.DOMNode}
 */
JAX.DOMNode.prototype.prop = function(property, value) {
	if (typeof(property) == "string") { 
		if (arguments.length == 1) { 
			return this._node[property]; 
		}
		this._node[property] = value;
		return this;
	} else if (property instanceof Array) {
		var props = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			props[p] = this._node[p];
		}
		return props;	
	}

	for (var p in property) {
		this._node[p] = property[p];
	}

	return this;
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * if (JAX("em").isIn("span")) { alert("Span obsahuje em"); }
 *
 * @param {Node | JAX.DOMNode | String} node uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.DOMNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "object" && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node : JAX(node);
		return elm.exists() ? elm.contains(this) : false;
	} else if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			var parent = JAK.DOM.findParent(this._node, node);
			return !!parent;
		}
		return !!JAX.all(node).filterItems(
			function(jaxElm) { return jaxElm.contains(this._node); }.bind(this)
		).length;
	}
	
	console.error("For first argument I expected html element, JAX node or CSS3 (2.1) selector.");
	return false;
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.parent = function() {
	if (this._node.parentNode) { return JAX(this._node.parentNode); }
	return new JAX.NullNode();
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.next = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : new JAX.NullNode();
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.previous = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : new JAX.NullNode();
};
 
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující prvek v DOMu a poskytující rozšířené metody pro práci s ním
 * @class JAX.Node
 */
JAX.Element = JAK.ClassMaker.makeClass({
	NAME: "JAX.Element",
	VERSION: "1.0",
	EXTEND: JAX.DOMNode,
	IMPLEMENT: JAX.IListening
});

JAX.Element._events = [];
JAX.Element._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i;
JAX.Element._BOX_SIZING = null;

(function() {
	var boxSizing = {
		"boxSizing": "box-sizing",
		"MozBoxSizing": "-moz-box-sizing",
		"webkitBoxSizing": "-webkit-box-sizing"
	};

	var tempDiv = document.createElement("div");

	for (var i in boxSizing) {
		if (i in tempDiv.style) { JAX.Element._BOX_SIZING = boxSizing[i]; break; }
	}
})();

JAX.Element.prototype.$constructor = function(node) {
	this.$super(node);
};

/**
 * @method destructor - odvěsí všechny události a odstraní všechny reference na něj z JAXu. Voláme, pokud víme, že uzel už se do DOMu nikdy více nepřipne.
 * @example
 * JAX("#nejakeId").$destructor();
 */
JAX.Element.prototype.$destructor = function() {
	this.stopListening();
	this._node = null;
};

/**
 * @method vyhledá a vrátí jeden DOM prvek, který odpovídá zadanému CSS3 (pro IE8 CSS2.1) selectoru
 * @example
 * JAX("#nejakeId").find(".trida"); // vrati prvni nalezeny prvek s classou trida v danem elementu
 *
 * @param {String} selector CSS3 (pro IE8 CSS2.1) selector
 * @returns {JAX.Node}
 */
JAX.Element.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * @method vyhledá a vrátí instance JAX.NodeArray obsahující DOM prvky, které odpovídají zadanému CSS3 (pro IE8 CSS2.1) selectoru
 * @example
 * JAX("#nejakeId").findAll(".trida"); // vrati vsechny nalezene prvky s classou trida v danem elementu
 *
 * @param {String} selector CSS3 (pro IE8 CSS2.1) selector
 * @returns {JAX.NodeArray}
 */
JAX.Element.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

/**
 * @method přídá css třídu k elementu, lze zadat i více tříd oddělených mezerou
 * @example
 * JAX("#nejakeId").addClass("trida"); // piseme bez tecky
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.Node}
 */
JAX.Element.prototype.addClass = function(classNames) {
	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("Given argument can be only string.", this._node);
	}

	var cNames = classNames.trim().split(" ");
	
	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		this._node.classList.add(cName);
	}
	
	return this;
};

/**
 * @method odebere css třídu od elementu, lze zadat i více tříd oddělených mezerou
 * @example
 * JAX("#nejakeId").removeClass("trida"); // piseme bez tecky
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.Node}
 */
JAX.Element.prototype.removeClass = function(classNames) {
	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("Given argument can be only string.", this._node);
	}

	var cNames = classNames.trim().split(" ");
	
	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		this._node.classList.remove(cName);
	}
	
	return this;
};

/**
 * @method zjistí, zda má element nastavenou požadovanou tříd. Lze zadat i jména více tříd oddělených mezerů, ale pokud alespoň jedna není přítomna, vrací false.
 * @example
 * if (JAX("#nejakeId").hasClass("trida")) { console.log("Trida pritomna"); } // jmeno tridy piseme bez tecky
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {Boolean}
 */
JAX.Element.prototype.hasClass = function(className) {
	if (className == "") { return true; }

	if (typeof(className) != "string") {
		className += "";  
		console.error("For my argument I expected string.", this._node);
	}

	if (className == "")  { return false; }
	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (!this._node.classList.contains(name)) { return false; }
	}

	return true;
};

/**
 * @method pokud element classu má, tak i odebere, jinak ji přidá. Lze operovat jen s jednou classou.
 * @example
 * JAX("body").toggleClass("trida");
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.Node}
 */
JAX.Element.prototype.toggleClass = function(className) {
	if (className == "") { return this; }

	if (typeof(className) != "string") {
		className += "";
		console.error("For my argument I expected string.", this._node);
	}

	this._node.classList.toggle(className);
	
	return this;
};

/**
 * @method nastavuje nebo vrací atribut id elementu
 * @example
 * var jaxElm = JAX(document.body).id("mojeId"); 
 * console.log(jaxElm.id());
 *
 * @param {String|Undefined} id název id | bez parametru, pokud chceme id vrátit
 * @returns {JAX.Node | String}
 */
JAX.Element.prototype.id = function(id) {
	if (!arguments.length) { 
		return this.attr("id"); 
	}

	if (typeof(id) != "string") {
		id += "";
		console.error("For my argument I expected string.", this._node);
	}

	this.attr({id:id}); 
	return this;
};

/**
 * @method nastavuje nebo vrací textový html obsah elementu
 * @example
 * var jaxElm = JAX(document.body).html("neco"); 
 * console.log(jaxElm.html());
 *
 * @param {String | Undefined} innerHTML html text | bez parametru, pokud chceme html obsah vrátit
 * @returns {JAX.Node | String}
 */
JAX.Element.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return this._node.innerHTML; 
	}

	if (typeof(innerHTML) != "string" && typeof(innerHTML) != "number") {
		console.error("For my argument I expected string or number.", this._node);
	}

	this._node.innerHTML = innerHTML + "";
	return this;
};

/**
 * @method nastavuje nebo vrací textový obsah elementu, pozn.: při získávání textu je zahrnut veškerý text, tedy i ten, který není na stránce vidět
 * @example
 * var jaxElm = JAX(document.body).text("neco"); 
 * console.log(jaxElm.text());
 *
 * @param {String | Undefined} text html text | bez parametru, pokud chceme textový obsah vrátit
 * @returns {JAX.Node | String}
 */
JAX.Element.prototype.text = function(text) {
	if (typeof(innerHTML) != "string" && typeof(innerHTML) != "number") {
		console.error("For my argument I expected string or number.", this._node);
	}

	if (!arguments.length && "innerHTML" in this._node) { 
		return this._getText(this._node);
	}

	if ("innerHTML" in this._node) {
		this.clear();
		this._node.appendChild(this._node.ownerDocument.createTextNode(text + ""));
	}

	return this;
};

/**
 * @method nastaví nebo získá html atributy
 * @example
 * var jaxElm = JAX(document.body);
 * jaxElm.attr("id","mojeId"); // nastavi id
 * jaxElm.attr({"data-word":"demo"}); // nastavi attribut data-word
 * console.log(jaxElm.attr("id")); // ziska, jak je nastaven atribut id
 * console.log(jaxElm.attr(["id", "data-word"])); // vraci pole ["mojeId", "demo"]
 *
 * @param {String | Array | Object} property název atributu | pole názvů atributů | asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {value} value pokud je uvedena a první argument je string, provede se nastavení příslušného atributu na určitou hodnotu
 * @returns {String | Object | JAX.Node}
 */
JAX.Element.prototype.attr = function(property, value) {
	if (typeof(property) == "string") { 
		if (arguments.length == 1) { 
			return this._node.getAttribute(property); 
		}
		this._node.setAttribute(property, value + "");
		return this;
	} else if (property instanceof Array) {
		var attrs = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			attrs[p] = this._node.getAttribute(p);
		}
		return attrs;	
	}

	for (var p in property) {
		this._node.setAttribute(p, property[p]);
	}

	return this;
};

JAX.Element.prototype.removeAttr = function(properties) {
	if (typeof(properties) == "string") { 
		this._node.removeAttribute(properties);
		return this;
	} else if (property instanceof Array) {
		for (var i=0, len=properties.length; i<len; i++) {
			this._node.removeAttribute(properties[i]);
		}
		return this;
	}

	console.error("For first argument I expected string or array of strings.", this._node);
	return this;
}
/** 
 * @method nastaví nebo získá style vlastnosti u elementu
 * @example
 * var jaxElm = JAX(document.body);
 * jaxElm.css("width","100%"); // nastavi document.body.style.width = "100%";
 * jaxElm.css({"display":"block"}); // nastavi document.body.style.dsiplay = "block";
 * console.log(jaxElm.css("display")); // ziska, jak je nastavena vlastnost display
 * console.log(jaxElm.css(["display", "width"])); // vraci pole ["block", "100%"]
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {display:"none", width:"100%"}
 * @param {value} value pokud je tento argument uveden a první argument je string, provede se nastavení příslušné vlastnosti na danou hodnotu
 * @returns {String | Object | JAX.Node}
 */
JAX.Element.prototype.css = function(property, value) {
	if (typeof(property) == "string") {
		if (arguments.length == 1) { 
			return property == "opacity" ? this._getOpacity() : this._node.style[property]; 
		}
		this._node.style[property] = value;
		return this;
	} else if (property instanceof Array) {
		var css = {};
		for (var i=0, len=property.length; i<len; i++) {
			var p = property[i];
			if (p == "opacity") { css[p] = this._getOpacity(); continue; }
			css[p] = this._node.style[p];
		}
		return css;
	}

	for (var p in property) {
		var value = property[p];
		if (p == "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

/** 
 * @method vrátí aktuální platné hodnoty požadovaných css vlastností u elementu bez ohledu na to, jestli jsou nastaveny přes css pravidlo nebo object style
 * @example
 * <style> .trida { padding-top:100px; } </style>
 * var jaxElm = JAX(document.body).addClass("trida");
 * jaxElm.computedCss("padding-top"); // vraci "100px"
 * jaxElm.css("paddingTop", "200px");
 * jaxElm.computedCss("padding-top"); // vraci "200px"
 *
 * @param {String | Array} properties název vlastnosti | pole názvů vlastností
 * @returns {String | Object | JAX.Node}
 */
JAX.Element.prototype.computedCss = function(properties) {
	if (typeof(properties) == "string") {
		var value = JAX.Element.getComputedStyle(this._node).getPropertyValue(properties);
		return value;
	}

	var css = {};
	for (var i=0, len=properties.length; i<len; i++) {
		var p = properties[i];
		var value = JAX.Element.getComputedStyle(this._node).getPropertyValue(p);
		css[p] = value;
	}
	return css;
};

/** 
 * @method zjistí nebo nastaví skutečnou výšku nebo šířku elementu včetně paddingu a borderu
 * @example
 * <style> .trida { padding:20px; width:100px; } </style>
 * var jaxElm = JAX(document.body).addClass("trida");
 * console.log(jaxElm.fullSize("width")); // vraci 140
 *
 * @param {String} sizeType "width" nebo "height"
 * @param {Number} value hodnota (v px)
 * @returns {Number | JAX.Node}
 */
JAX.Element.prototype.fullSize = function(sizeType, value) {
	if (arguments.length == 1) {
		var backupDisplay = this.css("display"); 
		
		var size = sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight;
		this.css("display", backupDisplay);
		return size; 
	}

	var value = this._getSizeWithBoxSizing(sizeType, value);
	this._node.style[sizeType]= Math.max(value,0) + "px";
	return this;
};

/** 
 * @method zjistí nebo nastaví vlastnost width nebo height. V případě, že width nebo height nejsou nijak nastaveny, tak při zjišťování spočítá velikost obsahu na základě vlastnosti box-sizing.
 * @example
 * <style> .trida { padding:20px; width:100px; } </style>
 * var jaxElm = JAX(document.body).addClass("trida");
 * console.log(jaxElm.size("width")); // vraci 100
 *
 * @param {String} sizeType "width" nebo "height"
 * @param {Number} value hodnota (v px)
 * @returns {Number | JAX.Node}
 */
JAX.Element.prototype.size = function(sizeType, value) {
	if (arguments.length == 1) { 
		var size = parseInt(this.computedCss(sizeType), 10);
		if (isFinite(size)) { return size; }

		var backupDisplay = this.css("display");
		if (backupDisplay.indexOf("none") == 0) { this.css("display",""); }

		size = this._getSizeWithBoxSizing(sizeType);
		this.css("display", backupDisplay);
		return size; 
	}

	var value = parseInt(value, 10);
	this._node.style[sizeType]= Math.max(value,0) + "px";
	return this;
};

/** 
 * @method vrací instanci JAX.NodeArray, která obsahuje všechny přímé potomky uzlu
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(body.children().length);
 *
 * @returns {JAX.NodeArray | null}
 */
JAX.Element.prototype.children = function(index) {
	if (!arguments.length) {
		var nodes = [];
		for (var i=0, len=this._node.childNodes.length; i<len; i++) {
			nodes.push(JAX(this._node.childNodes[i]));
		}
		return new JAX.NodeArray(nodes);
	}

	var child = this._node.childNodes[index];
	if (child) {
		return JAX(child);
	}

	return new JAX.NullNode();
};

/** 
 * @method vrací první html element (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body").first().prop("tagName") == "span");
 *
 * @returns {JAX.Node | null}
 */
JAX.Element.prototype.first = function() {
	if ("firstElementChild" in this._node) {
		return this._node.firstElementChild ? JAX(this._node.firstElementChild) : new JAX.NullNode();
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return new JAX.NullNode(); }
	
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return new JAX.NullNode();
};

/** 
 * @method vrací poslední uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").last().node() == JAX("body span").first().node();
 *
 * @returns {JAX.Node | null}
 */
JAX.Element.prototype.last = function() {
	if ("lastElementChild" in this._node) {
		return this._node.lastElementChild ? JAX(this._node.lastElementChild) : new JAX.NullNode();
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return new JAX.NullNode(); }
	
	for (var i=this._node.childNodes.length - 1; i>-1; i--) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return new JAX.NullNode();
};

/** 
 * @method promaže element
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * body.clear();
 *
 * @returns {JAX.Node}
 */
JAX.Element.prototype.clear = function() {
	if ("innerHTML" in this._node) {
		JAK.DOM.clear(this._node);
	}

	return this;
};

/** 
 * @method porovná, jestli element odpovídá zadaným kritériím
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><em>3</em>";
 * if (JAX("body").first().eq("span")) { alert("span je prvni"); }
 *
 * @param {Node | JAX.Node | String} node uzel | instance JAX.Node | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.Element.prototype.eq = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "object" && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node.node() : node;
		return elm === this._node;
	} else if (typeof(node) == "string") {
		if (/^[a-zA-Z0-9]+$/g.test(node)) { return !!(this._node.tagName && this._node.tagName.toLowerCase() == node); }
		return !!this.parent().findAll(node).filterItems(
			function(jaxElm) { return jaxElm.eq(this._node); }, this
		).length;
	}

	return false;
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2</span><em>3</em></div>";
 * if (JAX("body").first().contains("em")) { alert("Obsahuje em"); }
 *
 * @param {Node | JAX.Node | String} node uzel | instance JAX.Node | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.Element.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "object" && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node.parent().node() : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	} else if (typeof(node) == "string") {
		return !!this.find(node);
	}
	
	console.error("For first argument I expected html element, text node, string with CSS3 compatible selector or JAX node.");
	return false;
};

JAX.Element.prototype.animate = function(property, duration, start, end) {
	if (typeof(property) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	var fx = new JAX.FX(this);
	fx.addProperty(property, duration, start, end);
	return fx.run();
};

/** 
 * @method animuje průhlednost dle typu
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * JAX("body div").fade("out", 2);
 *
 * @param {String} type typ "in" nebo "out"
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAX.FX}
 */
JAX.Element.prototype.fade = function(type, duration) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	switch(type) {
		case "in":
			return this.animate("opacity", duration, 0, 1);
		break;
		case "out":
			return this.animate("opacity", duration, 1, 0);
		break;
		default:
			console.error("I got unsupported type '" + type + "'.", this._node);
			return new JAX.FX(null).run();
	}
};

/**
 * @method animuje průhlednost do určité hodnoty
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * JAX("body div").fadeTo(0.5, 2);
 *
 * @param {Number} opacityValue do jaké hodnoty od 0 do 1 se má průhlednost animovat
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAX.FX}
 */
JAX.Element.prototype.fadeTo = function(opacityValue, duration) {
	var opacityValue = parseFloat(opacityValue) || 0;

	if (opacityValue<0) {
		opacityValue = 0;
		console.error("For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	return this.animate("opacity", duration, null, opacityValue);
};

/**
 * @method zobrazí element pomocí animace výšky nebo šířky
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * JAX("body div").slide("down", 1);
 *
 * @param {String} type udává typu efektu - "down", "up", "left" nebo "right"
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAX.FX}
 */
JAX.Element.prototype.slide = function(type, duration) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node);
	}

	var backupStyles = {};
	switch(type) {
		case "down":
			backupStyles = this.css(["overflow", "height"]);
			var property = "height";
			var start = 0;
			var end = null;
		break;
		case "up":
			var property = "height";
			var start = null
			var end = 0;
		break;
		case "left":
			var property = "width";
			var start = null;
			var end = 0;	
		break;
		case "right":
			backupStyles = this.css(["overflow", "width"]);
			var property = "width";
			var start = 0;
			var end = null;
		break;
		default:
			console.error("I got unsupported type '" + type + "'.", this._node);
			return new JAX.FX(null).run();
	}

	this.css("overflow", "hidden");

	var func = function() { this.css(backupStyles); }.bind(this);
	var fx = this.animate(property, duration, start, end);
	fx.then(func);

	return fx;
};

JAX.Element.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var left = this._node.scrollLeft;
	var top = this._node.scrollTop;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var targetValue = parseFloat(value);

	if (!isFinite(targetValue)) {
		console.error("I expected Number or string with number for my second argument.", this._node);
		targetValue = 0;
	}

	var type = type.toLowerCase();

	if (!duration) {
		switch(type) {
			case "top":
				this._node.scrollTop = value;
			break;
			case "left":
				this._node.scrollLeft = value;
			break;
		}
		return this;
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or string with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		
	return fx.run();
};

JAX.Element.prototype._setOpacity = function(value) {
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

JAX.Element.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.ELEMENT._OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Element.prototype._getSizeWithBoxSizing = function(sizeType, value) {
	var boxSizing = JAX.Node._BOX_SIZING ? this.computedCss(JAX.Node._BOX_SIZING) : "";

	var paddingX = 0,
		paddingY = 0,
		borderX = 0,
		borderY = 0,
		paddingPropertyX = "padding-" + (sizeType == "width" ? "left" : "top"),
		paddingPropertyY = "padding-" + (sizeType == "width" ? "right" : "bottom"),
		borderPropertyX = "border-" + (sizeType == "width" ? "left" : "top"),
		borderPropertyY = "border-" + (sizeType == "width" ? "right" : "bottom");

	if (arguments.length == 1) {
		var value = (sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight);
	}

	if (!boxSizing || boxSizing == "content-box") {
		paddingX = parseFloat(this.computedCss(paddingPropertyX));
		paddingY = parseFloat(this.computedCss(paddingPropertyY));
	}
	
	if (boxSizing != "border-box") {
		borderX = parseFloat(this.computedCss(borderPropertyX));
		borderY = parseFloat(this.computedCss(borderPropertyY));
	}
	
	if (paddingX && isFinite(paddingX)) { value -= paddingX; }
	if (paddingY && isFinite(paddingY)) { value -= paddingY; }
	if (borderX && isFinite(borderX)) { value -= borderX; }
	if (borderY && isFinite(borderY)) { value -= borderY; }

	return value;
};

JAX.Element.prototype._getText = function(node) {
	var text = "";
	for (var i=0, len=node.childNodes.length; i<len; i++) {
		var child = node.childNodes[i];
		var tagName = child.tagName ? child.tagName.toLowerCase() : "";
		if (child.childNodes && child.childNodes.length) { text += this._getText(child); continue; }
		if (child.nodeValue) { text += child.nodeValue; continue; }
		text += " ";
	}
	return text;
};

JAX.Element.prototype._destroyEvents = function(eventListeners) {
	for (var i=0, len=eventListeners.length; i<len; i++) { 
		var eventListener = eventListeners[i].id();
		JAK.Events.removeListener(eventListener);
	}
};
 
/**
 * @fileOverview node-getcomputedstyle.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * JAXovský polyfill pro window.getComputedStyle do IE8
 */
(function() {
	if (!window.getComputedStyle) {

		function normalize(property) {
﻿		 ﻿ return property.replace(/-([a-z])/g, function(match, letter) { return letter.toUpperCase(); });
		};

		function denormalize(property) {
﻿		 ﻿ return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
		};

		function getRecountedPixelSize(size, suffix, rootSize, fontSize) {
			switch (suffix) {
				case "em":
					return size * fontSize;
				case "in":
					return size * 96;
				case "pt":
					return size * 96 / 72;
				case "pc":
					return size * 12 * 96 / 72;
				case "cm":
					return size * 0.3937 * 96;
				case "mm":
					return size * 0.3937 * 96 / 10;
				case "%":
					return size / 100 * rootSize;
				default:
					return size;
			}
		};

		function getBaseFontSize(element) {
			if (!element) { return 16; }

			var style = element.currentStyle;
			var cssValue = style["fontSize"];
			var size = parseFloat(cssValue);
			var suffix = cssValue.split(/\d/)[0];
			var isProportional = /%|em/.test(suffix);

			if (isProportional) { 
				return getBaseFontSize(element.parentElement); 
			}

			return getRecountedPixelSize(size, suffix);
		};

		function getFirstNonStaticElementSize(element, property) {
			while(element.parentElement && element.parentElement.currentStyle) {
				element = element.parentElement;
				var position = element.currentStyle.position || "";
				if (["absolute","relative","fixed"].indexOf(position) != -1) { return element[property]; }
			}

			return element.ownerDocument.documentElement[property];
		};

		function getPixelSize(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];

			if (property == "fontSize") {
				var rootSize = fontSize;
			} else if (element.parentElement != element.ownerDocument) {
				var parentElement = element.parentElement;
				/* dirty trick, how to quickly find out width of parent element */
				var temp = document.createElement("jaxtempxyz");
					temp.style.display = "block";
					parentElement.appendChild(temp);
				var rootSize = temp.offsetWidth;
					parentElement.removeChild(temp);
			} else {
				var rootSize = element.parentElement.documentElement.clientWidth;
			}

			return getRecountedPixelSize(size, suffix, rootSize, fontSize) || 0;
		};

		function getPixelPosition(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 

			return getRecountedPixelSize(size, suffix, rootSize, fontSize);
		};

		function getPixelSizeWH(property, style, fontSize, offsetLength) {
			var boxSizing = style.boxSizing,
				paddingX = 0,
				paddingY = 0,
				borderX = 0,
				borderY = 0,
				paddingPropertyX = "padding" + (property == "width" ? "Left" : "Top"),
				paddingPropertyY = "padding" + (property == "width" ? "Right" : "Bottom"),
				borderPropertyX = "border" + (property == "width" ? "LeftWidth" : "Top"),
				borderPropertyY = "border" + (property == "width" ? "RightWidth" : "Bottom"),
				value = offsetLength;

			if (!boxSizing || boxSizing == "content-box") {
				paddingX = parseFloat(style[paddingPropertyX]);
				paddingY = parseFloat(style[paddingPropertyY]);
			}
			
			if (boxSizing != "border-box") {
				borderX = parseFloat(style[borderPropertyX]);
				borderY = parseFloat(style[borderPropertyY]);
			}
			
			if (paddingX && isFinite(paddingX)) { value -= paddingX; }
			if (paddingY && isFinite(paddingY)) { value -= paddingY; }
			if (borderX && isFinite(borderX)) { value -= borderX; }
			if (borderY && isFinite(borderY)) { value -= borderY; }

			return value;
		};

		function CSSStyleDeclaration(element) {
			var currentStyle = element.currentStyle;
			var fontSize = getBaseFontSize(element);
			var index = 0;

			for (property in currentStyle) {
				this[index] = denormalize(property);
				if (/margin.|padding.|border.+W|^fontSize$/.test(property) && currentStyle[property] != "auto") {
					this[property] = getPixelSize(element, currentStyle, property, fontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = currentStyle[property];
				} else if (["left","right","top","bottom"].indexOf(property) > -1 && ["absolute","relative","fixed"].indexOf(currentStyle["position"]) > -1 && currentStyle[property] != "auto") {
					this[property] = getPixelPosition(element, currentStyle, property, fontSize) + "px";
				} else {
					try {
						/* IE8 crashes in case of getting some properties (outline, outlineWidth, ...) */
						this[property] = currentStyle[property];
					} catch(e) {
						this[property] = "";
					}
				}
				index++;
			}

			this.length = index;

			var currentStyleWidth = currentStyle["width"];
			if (currentStyleWidth != "auto") {
				this["width"] = currentStyleWidth.indexOf("px") > -1 ? currentStyleWidth : getPixelSizeWH("width", this, fontSize, element.offsetWidth) + "px";
			} else {
				this["width"] = currentStyleWidth;
			}

			var currentStyleHeight = currentStyle["height"];
			if (currentStyleHeight != "auto") {
				this["height"] = currentStyleHeight.indexOf("px") > -1 ? currentStyleHeight : getPixelSizeWH("height", this, fontSize, element.offsetHeight) + "px";
			} else {
				this["height"] = currentStyleHeight;
			}
		};

		CSSStyleDeclaration.prototype.getPropertyPriority =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		};

		CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
			return this[normalize(prop)] || "";
		};

		CSSStyleDeclaration.prototype.item = function(index) {
			return this[index];
		};

		CSSStyleDeclaration.prototype.removeProperty =  function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		};

		CSSStyleDeclaration.prototype.setProperty =  function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		};

		CSSStyleDeclaration.prototype.getPropertyCSSValue =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		};

		JAX.Element.getComputedStyle = function(element) {
			return new CSSStyleDeclaration(element);
		}
	} else {	
		JAX.Element.getComputedStyle = function(element) {
			return element.ownerDocument.defaultView.getComputedStyle(element, "");
		}
	}
})();
 
/**
 * @fileOverview textnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující text node a comment node (nodeType == 3 || nodeType == 8)
 * @class JAX.TextNode
 */
JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.0",
	EXTEND: JAX.DOMNode
});

JAX.TextNode.prototype.$constructor = function(node) {
	this.$super(node);
};

JAX.TextNode.prototype.text = function(text) {
	if (!arguments.length) { 
		return this._node.nodeValue;
	}

	this._node.nodeValue = text;

	return this;
};

JAX.TextNode.prototype.clear = function() {
	this._node.nodeValue = "";
	return this;
};

JAX.TextNode.prototype.eq = function(node) {
	if (!node) { return false; }
	var elm = node.jaxNodeType ? node.node() : node;
	return elm == this._node;
};

JAX.TextNode.prototype.add = function(nodes) {
	this._showMessage();

	return this;
};

JAX.TextNode.prototype.insertFirst = function(node, nodeBefore) {
	this._showMessage();

	return this;
};

JAX.TextNode.prototype.addBefore = function(node, nodeBefore) {
	this._showMessage();

	return this;
};
 
/**
 * @fileOverview documentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující document node
 * @class JAX.Document
 */
JAX.Document = JAK.ClassMaker.makeClass({
	NAME: "JAX.Document",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening]
});

JAX.Document.prototype.$constructor = function(doc) {
	this._node = doc;
	this.jaxNodeType = doc.nodeType;
};

JAX.Document.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.Document.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.Document.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	switch(sizeType) {
		case "width":
     		 return Math.max(
     		 			this._node.body.scrollWidth, this._node.documentElement.scrollWidth, 
     		 			this._node.body.offsetWidth, this._node.documentElement.offsetWidth, 
     		 			this._node.body.clientWidth, this._node.documentElement.clientWidth
     		 		);
		case "height":
			return Math.max(
     		 			this._node.body.scrollHeight, this._node.documentElement.scrollHeight, 
     		 			this._node.body.offsetHeight, this._node.documentElement.offsetHeight, 
     		 			this._node.body.clientHeight, this._node.documentElement.clientHeight
     		 		);
		default:
			console.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
			return 0;
	}
};

JAX.Document.prototype.fullSize = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	return this.size(sizeType);
};

JAX.Document.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var scrollPos = JAK.DOM.getScrollPos();
	var left = scrollPos.x;
	var top = scrollPos.y;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var targetValue = parseFloat(value);

	if (!isFinite(targetValue)) {
		console.error("I expected Number or string with number for my second argument.", this._node);
		targetValue = 0;
	}

	var type = type.toLowerCase();

	if (!duration) {
		switch(type) {
			case "top":
				this._node.documentElement.scrollTop = value;
			break;
			case "left":
				this._node.documentElement.scrollLeft = value;
			break;
		}
		return this;
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or string with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		fx.run();

	return fx;
};
 
/**
 * @fileOverview documentfragmentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující documentFragment node
 * @class JAX.DocumentFragment
 */
JAX.DocumentFragment = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentFragment",
	VERSION: "1.0",
	EXTEND: JAX.DOMNode
});

JAX.DocumentFragment.prototype.$constructor = function(doc) {
	this.$super(doc);
};

JAX.DocumentFragment.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.DocumentFragment.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.DocumentFragment.prototype.remove = function() {
	this._showMessage();

	return this;
};
 
/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.NullNode
 */
JAX.NullNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.NullNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.NullNode.prototype.$constructor = function() {
	this._node = null;
	this.jaxNodeType = -1;
};

JAX.NullNode.prototype._showMessage = function(method) {
	console.error("Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
};
 
/**
 * @fileOverview window.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující object Window
 * @class JAX.Window
 */
JAX.Window = JAK.ClassMaker.makeClass({
	NAME: "JAX.Window",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening]
});

JAX.Window.prototype.$constructor = function(win) {
	this._node = win;
	this.jaxNodeType = -2;
};

JAX.Window.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	if (sizeType != "width" && sizeType != "height") {
		console.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
	}

	if ("innerWidth" in window) {
		return sizeType == "width" ? window.innerWidth : window.innerHeight;
	} else if ("clientWidth" in document.documentElement) {
		return sizeType == "width" ? document.documentElement.clientWidth : document.documentElement.clientHeight;
	} else if ("clientWidth" in document.body) {
		return sizeType == "width" ? document.body.clientWidth : document.body.clientHeight;
	} else {
		console.error("You have probably unsupported browser.", this._node);
		return 0;
	}
};

JAX.Window.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	if ("pageXOffset" in this._node) {
		var left = this._node.pageXOffset;
		var top = this._node.pageYOffset;
	} else {
		var scrollPosDoc = JAK.DOM.getScrollPos();
		var left = scrollPosDoc.x;
		var top = scrollPosDoc.y;	
	}

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var targetValue = parseFloat(value);

	if (!isFinite(targetValue)) {
		console.error("I expected Number or string with number for my second argument.", this._node);
		targetValue = 0;
	}

	var type = type.toLowerCase();

	if (!duration) {
		switch(type) {
			case "top":
				this._node.scrollTo(left, value);
			break;
			case "left":
				this._node.scrollTo(value, top);
			break;
		}
		return this; 
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or string with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		fx.run();

	return fx;
};
 
/**
 * @fileOverview nodearray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * Třída reprezentující pole instancí JAX.Node a poskytující metody pro hromadné zpracování
 * @class JAX.NodeArray
 */
JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "1.1"
});

/**
 * @method $constructor
 *
 * @param {Object} lze zadat 
 */
JAX.NodeArray.prototype.$constructor = function(nodes) {
	if (nodes instanceof JAX.NodeArray) {
		var arr = nodes.items();
	} else {
		var arr = [].concat(nodes);
	}

	this.length = 0;
	this._jaxNodes = [];

	for(var i=0, len=arr.length; i<len; i++) {
		var node = arr[i];
		var jaxNode = JAX(node);
		
		if (jaxNode.exists()) {
			this.length++;
			this._jaxNodes.push(JAX(node)); 
			continue;
		}
	}

	if (this.length != arr.length) {
		console.error("First argument can be only html node, JAX node, array of them or instance of JAX.NodeArray.");
	}
};

JAX.NodeArray.prototype.exist = function() {
	if (!this._jaxNodes.length) { return false; }
	
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		if (!this._jaxNodes[i].exists()) { return false; }
	}

	return true;
};

/**
 * @method vrátí konkrétní prvek (uzel) v poli
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("*");
 * var elms = jaxElms.jaxNode(2);
 *
 * @param {Number} index který prvek
 * @returns {JAX.Node }
 */
JAX.NodeArray.prototype.item = function(index) {
	var index = index || 0;
	return this._jaxNodes[index];
};

/**
 * @method vrátí konkrétní rozpětí v poli nebo, pokud je volána bez parametru, tak celé pole
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("*");
 * var elms = jaxElms.jaxNode(0,2); // vrati dva prvky [0],[1]
 *
 * @param {Number} from od indexu
 * @param {Number} to po index
 * @returns {JAX.Node[]}
 */
JAX.NodeArray.prototype.items = function(from, to) {
	if (!arguments.length) { return this._jaxNodes.slice(); }
	var from = typeof(from) == "number" || from ? from : 0;
	var to = typeof(to) == "number" || to ? to : this._jaxNodes.length;
	return this._jaxNodes.slice(from, to);
};

JAX.NodeArray.prototype.limit = function(from, to) {
	return new JAX.NodeArray(this.items.apply(this, arguments));
};

JAX.NodeArray.prototype.index = function(item) {
	var item = JAX(item);
	var nodeTarget = item.node();

	for (var i=0, len = this._jaxNodes.length; i<len; i++) {
		var nodeSource = this._jaxNodes[i].node();
		if (nodeSource == nodeTarget) { return i; }
	}

	return -1;
};

/**
 * @method nastaví všem prvkům, které si drží, určitou classu
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("*").addClass("trida");
 *
 * @param {String | String[]} classNames třída nebo třídy oddělené mezerou | pole řetězců obsahující názvy tříd
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.addClass = function(classNames) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.addClass(classNames); 
	}
	return this;
};

/**
 * @method zjistí, jestli všechny prvky v poli mají nastavenu konkrétní classu
 * @example
 * document.body.innerHTML = "<span>1</span><span class='trida'>2</span><div id='cisla'></div>";
 * console.log(JAX.all("span").haveClass("trida")); // vraci false
 *
 * @param {String} classNames třída
 * @returns {Boolean}
 */
JAX.NodeArray.prototype.haveClass = function(className) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		if (!this._jaxNodes[i].hasClass(className)) { return false; } 
	}
	return true;
};

/**
 * @method pokud element classu má, tak i odebere, jinak ji přidá
 * @example
 * JAX("body").html("<span></span><span></span>");
 * JAX.all("body *").toggleClass("trida");
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.toggleClass = function(className) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].toggleClass(className);
	}
	return this;	
};

/**
 * @method odebere všem prvkům, které si drží, určitou classu
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("*").removeClass("trida");
 *
 * @param {String | String[]} classNames třída nebo třídy oddělené mezerou | pole řetězců obsahující názvy tříd
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.removeClass = function(classNames) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeClass(classNames); 
	}
	return this;
};

/**
 * @method nastaví html atributy
 * @example
 * document.body.innerHTML = "<input type='text' value='aaa'><input type='text' value='bbb'>";
 * var jaxElms = JAX("body input");
 * jaxElms.attr({"data-word":"demo"}); // nastavi vsem attribut data-word
 *
 * @param {String | Array | Object} property název atributu | pole názvů atributů | asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {value} value provede se nastavení příslušného atributu na určitou hodnotu
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.attr = function(property, value) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.attr(property, value);
	}
	return this;
};

JAX.NodeArray.prototype.removeAttr = function(properties) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeAttr(properties);
	}
	return this;
};

/**
 * @method nastaví css (style) vlastnost(i) všem elementům v poli
 * @example
 * document.body.innerHTML = "<input type='text' value='aaa'><input type='text' value='bbb'>";
 * var jaxElms = JAX("body input");
 * jaxElms.css("display", "none"); // skryje elementy
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {display:"block", color:"red"}
 * @param {value} value provede se nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.css = function(property, value) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.css(property, value);
	}
	return this;
};

/**
 * @method nastaví vlastnost(i) všem elementům v poli
 * @example
 * document.body.innerHTML = "<input type='text' value='aaa'><input type='text' value='bbb'>";
 * var jaxElms = JAX("body input");
 * jaxElms.prop("value","ccc"); // nastavi value na "ccc"
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {value} value nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.prop = function(property, value) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.prop(property, value);
	}
	return this;
};

/**
 * @method připne všechny prvky do zadaného nodu
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("span").appendTo(JAX("#cisla"));
 *
 * @param {HTMLElm} node element, do kterého se mají elementy připnout
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].appendTo(node);
	}
	return this;
};

/**
 * @method připne všechny prvky před zadaný uzel
 *
 * @param {object} node element, před který se mají elementy připnout
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.before = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].before(node);
	}
	return this;
}

/**
 * @method odebere všechny prvky z DOMu
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = JAX.all("span").remove();
 *
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.remove = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.remove(); 
	}
	return this;
};

/**
 * @method zjistí, jestli všechny prvky jsou přímým nebo nepřímým potomkem zadaného prvku
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * if (JAX.all("span").areIn(JAX("#cisla"))) { alert("Jsou!"); } else { alert("Nejsou!"); }
 *
 * @param {HTMLElm} node element, který se bude testovat, jestli obsahuje pole prvků
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.areIn = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (!jaxNode.isIn(node)) { return false; }
	}

	return true;
};

/**
 * @method "zničí" všechny nody, které si drží. Čili odvěsí posluchače, odebere z DOMu a zruší veškeré reference na ně v JAXu
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * JAX.all("span").destroyNodes();
 *
 * @returns {void}
 */
JAX.NodeArray.prototype.destroyNodes = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].$destructor(); 
	}
	this._jaxNodes = [];
	return;
};

JAX.NodeArray.prototype.listen = function(type, obj, funcMethod, bindData) {
	var len = this._jaxNodes.length;
	var listeners = new Array(len);
	for(var i=0; i<len; i++) {
		listeners[i] = this._jaxNodes[i].listen(type, obj, funcMethod, bindData);
	}
	return new JAX.ListenerArray(listeners);
};

JAX.NodeArray.prototype.stopListening = function(type) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].stopListening(type);
	}
	return this;
};

/**
 * @method nad každým elementem zavolá funkci a předá jej jako parametr
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * JAX.all("span").forEachItem(function(elm) { elm.html("0"); });
 *
 * @param {Function} func funkce, která se má provádět. Jako parametr je předána instance JAX.Node, aktuálně zpracovávaný index a jako třetí parametr je samotné pole
 * @param {Object} obj context, ve kterém se má fce provést
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.forEachItem = function(func, obj) {
	this._jaxNodes.forEach(func, obj || this);
	return this;
};

/**
 * @method provede filtraci pole skrze zadanou funkci. Princip funguje podobně jako u <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter">Array.filter</a>
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * JAX.all("*").filterItems(function(elm) { return elm.eq("span"); }); // v poli zustanou jen span elementy
 *
 * @param {Function} func funkce, která se má provádět. Jako parametr je předána instance JAX.Node
 * @param {Object} obj context, ve kterém se má fce provést
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.filterItems = function(func, obj) {
	var filtered = this._jaxNodes.filter(func, obj || this);
	return new JAX.NodeArray(filtered);
};

/**
 * @method vrátí první prvek v poli
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.firstItem = function() {
	var jaxNode = this._jaxNodes[0];
	return jaxNode ? jaxNode : new JAX.NullNode();
};

/**
 * @method vrátí poslední prvek v poli
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.lastItem = function() {
	var jaxNode = this._jaxNodes[this.length - 1];
	return jaxNode ? jaxNode : new JAX.NullNode();
};

/**
 * @method přidá prvek do pole
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var nodes = JAX.all("span").pushItem(JAX("#cisla")); // prida ke spanum i div
 *
 * @param {Node | JAX.Node} node uzel | instance JAX.Node
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

/**
 * @method odebere a vrátí poslední prvek v poli
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var lastSpan = JAX.all("span").popItem(); // vrati posledni span a odebere ho z pole
 *
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

/**
 * @method odebere a vrátí první prvek z pole
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var firstSpan = JAX.all("span").shiftItem(); // vrati prvni span a odebere ho z pole
 *
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

/**
 * @method vloží prvek před stávající první prvek v poli
 * @example 
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var firstSpan = JAX.all("span").unshiftItem(JAX("#cisla")); // vlozi div na prvni misto
 *
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	this._jaxNodes.unshift(JAXNode);
	return this;
};

JAX.NodeArray.prototype.animate = function(type, duration, start, end) {
	var count = this._jaxNodes.length;
	var fxs = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		fxs[i] = this._jaxNodes[i].animate(type, duration, start, end);
	}
	return new JAX.FXArray(fxs);
};

/** 
 * @method animuje průhlednost dle typu
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").fade("out", 2);
 *
 * @param {String} type typ "in" nebo "out"
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.fade = function(type, duration) {
	var count = this._jaxNodes.length;
	var fxs = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		fxs[i] = this._jaxNodes[i].fade(type, duration);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method animuje průhlednost do určité hodnoty
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").fadeTo(0.5, 2);
 *
 * @param {Number} opacityValue do jaké hodnoty od 0 do 1 se má průhlednost animovat
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration) {
	var count = this._jaxNodes.length;
	var fxs = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		fxs[i] = this._jaxNodes[i].fadeTo(opacityValue, duration);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method zobrazí element pomocí animace výšky nebo šířky
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").slide("down", 1);
 *
 * @param {String} type udává typu efektu - "down", "up", "left" nebo "right"
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.slide = function(type, duration) {
	var count = this._jaxNodes.length;
	var fxs = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		fxs[i] = this._jaxNodes[i].slide(type, duration).getPromise();
	}
	return new JAX.FXArray(fxs);
};

JAX.NodeArray.prototype.scroll = function(type, value, duration) {
	var count = this._jaxNodes.length;
	var fxs = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		fxs[i] = this._jaxNodes[i].scroll(type, value, duration);
	}
	return new JAX.FXArray(fxs);
};
 
/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.05
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.1"
});

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": 			{ defaultUnit:"px" },
	"maxWidth": 		{ defaultUnit:"px" },
	"minWidth": 		{ defaultUnit:"px" },
	"height": 			{ defaultUnit:"px" },
	"maxHeight": 		{ defaultUnit:"px" },
	"minHeight": 		{ defaultUnit:"px" },
	"top": 				{ defaultUnit:"px" },
	"left": 			{ defaultUnit:"px" },
	"bottom": 			{ defaultUnit:"px" },
	"right": 			{ defaultUnit:"px" },
	"fontSize": 		{ defaultUnit:"px" },
	"opacity": 			{ defaultUnit:""   },
	"color": 			{ defaultUnit:""   },
	"backgroundColor": 	{ defaultUnit:""   }
};

JAX.FX._SUPPORTED_METHODS = [
	"ease",
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"cubic-bezier"
];

/**
 * @method constructor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 *
 * @param {HTMLElm} elm html element, který se má animovat
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._jaxElm = JAX(elm);

	if (!this._jaxElm.exists()) { 
		throw new Error("I can not continue because I got null node. Check your code. please."); 
	}

	this._settings = [];
	this._reversed = false;
	this._running = false;

	this._maxDuration = 0;
	this._startTime = 0;
	this._currentTime = 0;

	this._promise = {
		finished: null
	};

	this._processor = null;
};

/**
 * @method Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit. <br>
 * Podporované css vlasnosti pro animaci: width, height, top, left, bottom, right, fontSize, opacity, color a backgroundColor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @param {String} setting css vlastnost, která se má animovat
 * @param {Number | String} duration délka animace - lze zadat i jednotky s nebo ms
 * @param {String} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {String} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {String} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	var durationValue = this._parseValue(duration);
	var durationUnit = this._parseUnit(duration) || "ms";
	var method = JAX.FX.CSS3.isSupported ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		throw new Error("For first argument I expected string"); 
	}
	if (!isFinite(durationValue) || durationValue < 0) { 
		throw new Error("For second argument I expected positive number"); 
	}
	if (start && typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { 
		throw new Error("For third argument I expected string, number or null for automatic checking"); 
	}
	if (end && typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { 
		throw new Error("For fourth argument I expected string or number"); 
	}
	if (start == null && end == null) {
		throw new Error("At least one of start and end values must be defined."); 	
	}
	if (typeof(method) != "string") { 
		throw new Error("For fifth argument I expected string"); 
	}

	this._checkSupportedProperty(property);
	this._checkSupportedMethod(method);

	if (end || (typeof(end) == "number" && isFinite(end))) {
		var cssEnd = this._parseCSSValue(property, end);
	} else {
		var cssEnd = this._foundCSSValue(property);
	}

	if (start || (typeof(start) == "number" && isFinite(start))) { 
		var cssStart = this._parseCSSValue(property, start);
	} else {
		var cssStart = this._foundCSSValue(property);
	}

	var duration = {
		value: durationUnit == "ms" ? durationValue : durationValue * 1000,
		unit: "ms"
	};

	this._maxDuration = Math.max(duration.value, this._maxDuration);

	this._settings.push({
		property: property,
		startValue: cssStart.value,
		startUnit: cssStart.unit,
		endValue: cssEnd.value,
		endUnit: cssEnd.unit,
		durationValue: duration.value,
		durationUnit: duration.unit,
		method: method
	});

	return this;
};

/**
 * @method Spustí animaci
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @returns {JAK.Promise}
 */
JAX.FX.prototype.run = function() {
	if (this.isRunning()) { return this._promise.finished; }

	this._processor = JAX.FX.CSS3.isSupported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(this._settings);

	this._running = true;

	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this;
};

JAX.FX.prototype.then = function(onfulfill, onreject) {
	this._promise.finished.then(onfulfill, onreject);
};

/**
 * @method Spustí animaci "pozpátku", tedy provede zpětný chod.
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 10000, 0, 200);
 * fx.addProperty("height", 10000, 0, 100);
 * fx.run();
 * setTimeout(function() { fx.reverse(); }, 5000); // po peti sekundach se zpusti zpetny chod
 *
 * @returns {JAK.Promise}
 */
JAX.FX.prototype.reverse = function() {
	if (this.isRunning()) { this.stop(); }

	this._reversed = !this._reversed;
	var reversedSettings = [];

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var property = setting.property;
		var method = setting.method;

		var parsedCss = this._parseCSSValue(property, this._jaxElm.computedCss(this._styleToCSSProperty(property)));
		var startValue = parsedCss.value;
		var startUnit = parsedCss.unit;

		var durationUnit = setting.durationUnit;

		if (this._reversed) {
			var durationValue = Math.min(this._currentTime, setting.durationValue);
			var endValue = setting.startValue;
			var endUnit = setting.startUnit;
		} else {
			var durationValue = Math.max(setting.durationValue - this._currentTime, 0);
			var endValue = setting.endValue;
			var endUnit = setting.endUnit;
		}

		var reversedSetting = {
			property: property,
			startValue: startValue,
			startUnit: startUnit,
			endValue: endValue,
			endUnit: endUnit,
			durationValue: durationValue,
			durationUnit: durationUnit,
			method: method
		};

		reversedSettings.push(reversedSetting);
	}

	this._processor = JAX.FX.CSS3.isSupported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(reversedSettings);

	this._running = true;

	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this;
};

/**
 * @method Zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * @method Stopne (zabije) animaci
 * 
 * @returns {JAX.FX}
 */
JAX.FX.prototype.stop = function() {
	this._processor.stop();
	return this;
};

JAX.FX.prototype._checkSupportedProperty = function(property) {
	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];

		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { 
			properties.push(p); 
		}

		throw new Error("First argument must be supported setting: " + properties.join(", ")); 
	}
};

JAX.FX.prototype._checkSupportedMethod = function(method) {
	var method = method.toLowerCase();
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method) > -1 || method.indexOf("cubic-bezier") == 0) {
		return;
	}

	var methods = [];
	for (var i=0, len=JAX.FX._SUPPORTED_METHODS.length; i<len; i++) { methods.push(JAX.FX._SUPPORTED_METHODS[i]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	if (property == "backgroundColor" || property == "color") {
		var value = cssValue;
	} else {
		var value = this._parseValue(cssValue);
		var unit = this._parseUnit(cssValue) || unit;
	}

	return { 
		value: value, 
		unit: unit 
	};
};

JAX.FX.prototype._parseValue = function(value) {
	return parseFloat(value);
};

JAX.FX.prototype._parseUnit = function(value) {
	var val = parseFloat(value);
	return (value+"").replace(val, "");
};

JAX.FX.prototype._foundCSSValue = function(setting) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[setting].defaultUnit;

	switch(setting) {
		case "width":
		case "height":
			value = this._jaxElm.size(setting);
		break;
		case "backgroundColor":
		case "color":
			var value = this._jaxElm.computedCss(this._styleToCSSProperty(setting));
		break;
		default:
			var cssValue = this._jaxElm.computedCss(this._styleToCSSProperty(setting));
			var value = parseFloat(cssValue);
	}

	return {
		value:value,
		unit: unit
	}
};

JAX.FX.prototype._finishAnimation = function() {
	var passedTime = new Date().getTime() - this._startTime;

	if (!this._reversed) {
		this._currentTime += passedTime;
		this._currentTime = Math.min(this._currentTime, this._maxDuration);
	} else {
		this._currentTime -= passedTime;
		this._currentTime = Math.max(this._currentTime, 0);
	}

	this._startTime = 0;
	this._isRunning = false;
};

JAX.FX.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
 

JAX.FXArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.FXArray",
	VERSION: "1.0"
});

JAX.FXArray.prototype.$constructor = function(fxArray) {
	this._fxArray = fxArray;
};

JAX.FXArray.prototype.then = function(onFulfill, onReject) {
	var len = this._fxArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._fxArray[i].getPromise();
	}

	var fulfill = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onFulfill(nodeArray);
	};

	var reject = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onReject(nodeArray);
	};

	return JAK.Promise.when(fxPromises).then(fulfill, reject);
};

JAX.FXArray.prototype.stop = function() {
	var len = this._fxArray.length;

	for (var i=0; i<len; i++) {
		this._fxArray[i].stop();
	}

	return this;
};

JAX.FXArray.prototype.reverse = function() {
	var len = this._fxArray.length;
	var fxPromises = new Array(len);

	for (var i=0; i<len; i++) {
		fxPromises[i] = this._fxArray[i].reverse();
	}

	return JAK.Promise.when(fxPromises);
};
 
JAX.FX.CSS3 = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.CSS3",
	VERSION:"1.0"
});

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd",
      "MSTransition":"MSTransitionEnd"
    };

	for (var p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX.CSS3._TRANSITION_PROPERTY = p;
			JAX.FX.CSS3._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX.CSS3.isSupported = !!JAX.FX.CSS3._TRANSITION_PROPERTY;

JAX.FX.CSS3.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._transitionCount = 0;
	this._ecTransition = null;
	this._promise = {
		finished: null
	};
};

JAX.FX.CSS3.prototype.set = function(settings) {
	this._settings = settings;
};

JAX.FX.CSS3.prototype.run = function() {
	this._promise.finished = new JAK.Promise();

	var tp = JAX.FX.CSS3._TRANSITION_PROPERTY;
	var te = JAX.FX.CSS3._TRANSITION_EVENT;
	var tps = [];
	var node = this._jaxElm.node();
	var style = node.style;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var cssStartValue = setting.startValue + setting.startUnit;
		var transitionParam = this._styleToCSSProperty(setting.property) + " " + setting.durationValue + setting.durationUnit + " " + setting.method;

		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	var render = node.offsetHeight; /* trick pro prerenderovani */

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._jaxElm.listen(te, this, "_finishTransitionAnimation");

		for (var i=0, len=this._settings.length; i<len; i++) {
			var setting = this._settings[i];
			var cssEndValue = setting.endValue + setting.startUnit;
			style[setting.property] = cssEndValue;
		}
	}.bind(this), 0);

	return this._promise.finished;
};

JAX.FX.CSS3.prototype.stop = function() {
	var node = this._jaxElm.node();
	var style = node.style;

	for(var i=0, len=this._settings.length; i<len; i++) {
		var property = this._settings[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(this._styleToCSSProperty(property));
		style[property] = value;
	}

	while(this._transitionCount) { this._endTransition(); }
	this._promise.finished.reject(this._jaxElm);
};

JAX.FX.CSS3.prototype._endTransition = function() {
	this._transitionCount--;
	if (this._transitionCount) { return; }

	this._ecTransition.unregister();
	this._ecTransition = null;
	this._jaxElm.node().style[JAX.FX.CSS3._TRANSITION_PROPERTY] = "";
};

JAX.FX.CSS3.prototype._finishTransitionAnimation = function() {
	this._endTransition();
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
 
JAX.FX.Interpolator = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.Interpolator",
	VERSION:"1.0",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

JAX.FX.Interpolator.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._interpolators = [];
	this._interpolatorsCount = 0;
	this._settings = [];
	this._promise = {
		finished: null
	};
};

JAX.FX.Interpolator.prototype.set = function(settings) {
	this._settings = settings;
};

JAX.FX.Interpolator.prototype.run = function() {
	this._promise.finished = new JAK.Promise();
	this._interpolators = [];
	this._start();
	return this._promise.finished;
};

JAX.FX.Interpolator.prototype.stop = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._destroyInterpolator(i); }
	this._promise.finished.reject(this._jaxElm);
};

JAX.FX.Interpolator.prototype._start = function() {
	for(var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var durationValue = setting.durationValue;

		var interpolator = new JAK.CSSInterpolator(this._jaxElm.node(), durationValue, { 
			"interpolation": setting.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(setting.property) != -1) {
			interpolator.addColorProperty(setting.property, setting.startValue, setting.endValue);
		} else {
			interpolator.addProperty(setting.property, setting.startValue, setting.endValue, setting.startUnit);
		}
		interpolator.start();
		this._interpolatorsCount++;
	}
};

JAX.FX.Interpolator.prototype._endInterpolator = function(index) {
	this._destroyInterpolator(index);

	if (this._interpolatorsCount) { return; }

	this._interpolators = [];
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.Interpolator.prototype._destroyInterpolator = function(index) {
	var interpolator = this._interpolators[index];
	
	if (interpolator) {
		interpolator.stop();
		this._interpolators[index] = null;
		this._interpolatorsCount--;
	}
};
 
/**
 * @fileOverview fx-scrolling.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.05
 */

/**
 * Pomocník pro animaci scrollování
 * @class JAX.FX
 */ 
JAX.FX.Scrolling = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX.Scrolling",
	VERSION: "1.0"
});


JAX.FX.Scrolling.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._promises = {
		animationFinished: null
	};
	this._maxDuration = 0;
	this._startTime = 0;
	this._currentTime = 0;
	this._interpolators = [];
	this._runningInterpolatorCount = 0;
	this._reversed = false;
	this._isRunning = false;
	this._onScrollingFinished = this._onScrollingFinished.bind(this);
};

JAX.FX.Scrolling.prototype.addProperty = function(property, value, duration) {
	if (property != "left" && property != "top") {
		console.error("You are trying to use unsupported property: " + property + ".", this._jaxElm.node());
		return;
	}
	this._settings.push({property:property, defValue: null, value:value, duration:duration});
	this._maxDuration = Math.max(this._maxDuration, duration);
	return this;
};

JAX.FX.Scrolling.prototype.run = function() {
	if (this._promises.animationFinished) { 
		return this._promises.animationFinished; 
	}

	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var defValue = this._jaxElm.scroll(setting.property);
		setting.defValue = defValue;
		this._startInterval(setting.property, setting.value, setting.duration);
	}

	this._isRunning = true;
	this._reversed = false;
	this._startTime = new Date().getTime();

	return this;
};

JAX.FX.Scrolling.prototype.then = function(onFulfill, onReject) {
	return this._promises.animationFinished.then(onFulfill, onReject);
};

JAX.FX.Scrolling.prototype.stop = function() {
	if (!this._isRunning) { return this; }

	while(this._runningInterpolatorCount) {
		this._onScrollingFinished();
	}
	
	return this;
};

JAX.FX.Scrolling.prototype.reverse = function() {
	if (this._isRunning) {
		this.stop();
	}

	this._reversed = !this._reversed;
	this._promises.animationFinished = new JAK.Promise();
	this._runningInterpolatorCount = 0;

	for (var i=0, len=this._settings.length; i<len; i++) {
		var setting = this._settings[i];
		var duration = this._reversed ? Math.min(setting.duration, this._currentTime) : Math.max(setting.duration - this._currentTime, 0);
		this._startInterval(setting.property, this._reversed ? setting.defValue : setting.value, duration);
	}

	this._isRunning = true;
	this._startTime = new Date().getTime();

	return this;
};

JAX.FX.Scrolling.prototype._startInterval = function(property, value, duration) {
	var property = property;
	var defValue = this._jaxElm.scroll(property);

	var scrollFunc = function(value) {
		this._jaxElm.scroll(property, value);
	}.bind(this);

	var interpolator = new JAK.Interpolator(defValue, value, duration, scrollFunc, {endCallback:this._onScrollingFinished});
		interpolator.start();

	this._interpolators.push(interpolator);
	this._runningInterpolatorCount++;
};

JAX.FX.Scrolling.prototype._onScrollingFinished = function() {
	this._runningInterpolatorCount--;
	if (this._runningInterpolatorCount) { return; }
	this._interpolators = [];

	var passedTime = new Date().getTime() - this._startTime;

	if (!this._reversed) {
		this._currentTime += passedTime;
		this._currentTime = Math.min(this._currentTime, this._maxDuration);
	} else {
		this._currentTime -= passedTime;
		this._currentTime = Math.max(this._currentTime, 0);
	}

	this._startTime = 0;
	this._isRunning = false;

	this._promises.animationFinished.fulfill(this._jaxElm);
	this._promises.animationFinished = null;
};
 
