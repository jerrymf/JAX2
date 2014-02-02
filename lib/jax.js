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

	if (selector instanceof JAX.Node) {
		return selector;
	}

	if (typeof(selector) == "string") {
		srcElement = srcElement || document;

		if (srcElement != document) {
			var jaxSrcElement = JAX(srcElement);

			if (!jaxSrcElement.n) {
				console.error("JAX: Second argument must be valid element.");
				return new JAX.NullNode(typeof(selector) == "string" ? selector : "");
			}

			srcElement = jaxSrcElement.n;
		}

		var foundElm = srcElement.querySelector(selector);
		var nodeType = foundElm ? foundElm.nodeType : -1;
	} else if (typeof(selector) == "object") {
		var nodeType = JAX.NULL;
		var foundElm = null;

		var isWindow = selector == window || (selector.Window && selector instanceof selector.Window) || (selector.constructor.toString().indexOf("DOMWindow") > -1); /* toString - fix pro Android */

		if (isWindow) { 
			var nodeType = JAX.WINDOW;
			var foundElm = selector;	
		} else {
			var win = selector.defaultView || selector.parentWindow || (selector.ownerDocument ? (selector.ownerDocument.defaultView || selector.ownerDocument.parentWindow) : null);

			if (win) {
				var isElement = (win.HTMLElement && selector instanceof win.HTMLElement) || (win.Element && selector instanceof win.Element);
				var isDocument = (win.HTMLDocument && selector instanceof win.HTMLDocument) || (win.Document && selector instanceof win.Document);
				var isDocumentFragment = win.DocumentFragment && selector instanceof win.DocumentFragment;
				var isText = win.Text && selector instanceof win.Text;

				if (isElement || isDocument || isDocumentFragment || isText) {
					var nodeType = selector.nodeType;
					var foundElm = selector;
				}
			}
		}
	}

	switch(nodeType) {
		case JAX.WINDOW:
			return new JAX.Window(foundElm);
		case JAX.NULL:
			return new JAX.NullNode(typeof(selector) == "string" ? selector : "");
		case JAX.HTML_ELEMENT:
			return new JAX.Element(foundElm);
		case JAX.TEXT:
		case JAX.COMMENT:
			return new JAX.TextNode(foundElm);
		case JAX.DOCUMENT:
			return new JAX.Document(foundElm);
		case JAX.DOCUMENT_FRAGMENT:
			return new JAX.DocumentFragment(foundElm);
	}
};

JAX.WINDOW = -2; /* konstanta pro objekt window */
JAX.NULL = -1; /* konstanta pro nulový objekt */
JAX.HTML_ELEMENT = 1; /* konstanta pro nulový objekt */
JAX.TEXT = 3; /* konstanta pro textový node */
JAX.COMMENT = 8; /* konstanta pro komentářový node */
JAX.DOCUMENT = 9; /* konstanta pro objekt document */
JAX.DOCUMENT_FRAGMENT = 11; /* konstanta pro objekt document fragment */

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
			var jaxSrcElement = srcElement instanceof JAX.Node ? srcElement : JAX(srcElement);

			if (!jaxSrcElement.n) {
				console.error("JAX.all: Second argument must be valid element.");
				return new JAX.NullNode();
			}

			srcElement = jaxSrcElement.n;
		}

		var foundElms = srcElement.querySelectorAll(selector);

		return new JAX.NodeArray(foundElms);
	} else if (selector instanceof Array || (window.NodeList && selector instanceof window.NodeList) || selector instanceof JAX.NodeArray) {
		return new JAX.NodeArray(selector);
	} else if (selector.length && selector[0] && selector[selector.length - 1]) {
		/* IE8 can't detect NodeList, so if we have something iterable we will pass it */
		return new JAX.NodeArray(selector);
	} else if (selector instanceof JAX.Node || (typeof(selector) == "object" && JAX(selector).n)) {
		return new JAX.NodeArray([selector]);
	}
	
	return new JAX.NodeArray([]);
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
		console.error("JAX.make: First argument must be string.");
		return JAX(null); 
	}
	if (typeof(attrs) != "object") { 
		console.error("JAX.make: Second argument must be associative array."); 
		attrs = {};
	}
	if (typeof(styles) != "object") { 
		console.error("JAX.make: Third argument must be associative array."); 
		styles = {};
	}
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { 
		console.error("JAX.make: Fourth argument must be document element."); 
		srcDocument = document;
	}

	var parts = tagString.match(/[#.]?[a-z0-9_-]+/ig) || [];
	var tagName = parts[0];

	if (!tagName || !/^[a-z0-9]+$/ig.test(tagName)) {
		console.error("JAX.make: Tagname must be first in element definition.");
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
 * @method Najde platnou CSS vlasnost. Lze použít při hledání platné CSS hodnoty s vendor prefixem. Zadávají se oddělené mezerou.
 *
 * @param {String} property CSS vlasnosti oddělené mezereou
 * @returns {String}
 */
JAX.findCSSProperty = function(property) {
	var properties = property.trim().split(" ");
	var style = document.createElement("div").style;

	for (var i=0, len=properties.length; i<len; i++) {
		var property = properties[i];
		if (property in style) { return property; }
	}

	return "";
};
/**
 * @fileOverview iiterable.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro iterovatelé prvky, které je svým chováním velice podobné datovému typu Array
 * @class JAX.IIterable
 */

JAX.IIterable = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IIterable",
	VERSION: "1.0"
});

/**
 * @method vrací true v případě, že je pole nenulové
 */
JAX.IIterable.prototype.exist = function() {
	return !!this.length;
};

/**
 * @method vrací konkrétní prvek v poli určený dle číselného indexu
 *
 * @param {number} index
 * @returns {any}
 */
JAX.IIterable.prototype.item = function(index) {
	var index = index || 0;
	return this[index];
};

/**
 * @method vrací pole prvků určené rozmezím od - do a to včetně těchto prvků
 *
 * @param {number} from od kterého prvku
 * @param {number} to do kterého prvku
 * @returns {array}
 */
JAX.IIterable.prototype.items = function(from, to) {
	var from = arguments.length ? parseFloat(from) : 0;
	var to = arguments.length > 1 ? parseFloat(to) : this.length;

	from = Math.min(Math.max(from, 0), this.length -1);
	to = Math.max(Math.min(to, this.length - 1), 0);

	from = !isFinite(from) ? 0 : from;
	to = !isFinite(to) ? 0 : to;

	if (from == to) {
		return [this[from]];
	}

	var items = new Array(to-from);

	for (var i=from; i<=to; i++) {
		items[i] = this[i];
	}

	return items;
};

/**
 * @method vrací první prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.firstItem = function() {
	return this[0];
};

/**
 * @method vrací poslední prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.lastItem = function() {
	return this[this.length - 1];
};

/**
 * @method přidá prvek do pole a umístí ho na konec pole
 *
 * @param {any} item
 * @returns {any}
 */
JAX.IIterable.prototype.pushItem = function(item) {
	this.length++;
	this[this.length - 1] = item;
	return this;
};

/**
 * @method odebere prvek z konce pole a zmenší velikost pole o 1 prvek
 *
 * @returns {any}
 */
JAX.IIterable.prototype.popItem = function() {
	if (this.length > 0) {
		var item = this[this.length - 1];
		delete this[this.length - 1];
		this.length--;
		return item;
	}
	return null;
};

/**
 * @method odebere první prvek a zmenší velikost pole o 1 prvek
 *
 * @returns {any}
 */
JAX.IIterable.prototype.shiftItem = function() {
	var item = this[0];
	if (item) {
		this.length--;
		for (var i=0; i<this.length; i++) {
			this[i] = this[i+1];
		}
		return item;
	}

	return null;
};

/**
 * @method vloží prvek na první místo v poli a zvětší velikost pole o 1 prvek
 *
 * @param {any} item
 * @returns {any}
 */
JAX.IIterable.prototype.unshiftItem = function(item) {
	this.length++;
	for (var i=this.length - 1; i>0; i--) {
		this[i] = this[i - 1];
	}
	this[0] = item;

	return this;
};

/**
 * @method zjistí, na kolikátém místě se prvek v poli nachází (číslováno od nuly). Pokud nenajde, vrací -1.
 *
 * @param {any} item
 * @returns {number}
 */
JAX.IIterable.prototype.index = function(item) {
	for (var i=0; i<this.length; i++) {
		var myItem = this[i];
		if (myItem == item) { return i; }
	}

	return -1;
};

/**
 * @method iteruje postupně všechny prvky v poli a volá nad nimi zadanou funkci
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {number}
 */
JAX.IIterable.prototype.forEachItem = function(func, obj) {
	var func = obj ? func.bind(obj) : func;

	for (var i=0; i<this.length; i++) {
		func(this[i], i, this);
	}

	return this;
};

/**
 * @method pomocí zadané funkce vrací vyfiltrované pole. Do funkce jsou prvky v každé iteraci jednotlivě předány a pokud splní podmínku, prvek se do vráceného filtrovaného pole zařadí.
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {object} JAX.NodeArray
 */
JAX.IIterable.prototype.filterItems = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return JAX.all(filtered);
};
/**
 * @fileOverview ilistening.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Rozhrani implementujici praci s navesovanim a odvesovanim udalosti
 * @class JAX.IListening
 */
JAX.IListening = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IListening",
	VERSION: "2.0"
});

JAX.IListening._listeners = {};

/**
 * @method navěsí posluchač události na element a vrátí instanci JAX.Listener. Při vyvolání události pak do funkce předává jako parametr instanci JAX.Event.
 *
 * @param {string} type typ události ("click", "mousedown", ...)
 * @param {object || function} obj objekt, ve kterém se metoda nachází nebo připravená funkce
 * @param {string || function} func název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {boolean} useCapture hodnata použitá jako argument capture pro DOM zachytávání
 * @returns {object} JAX.Listener
 */
JAX.IListening.prototype.listen = function(type, obj, func, useCapture) {
	var eventFunc = null;

	if (typeof(type) != "string") {
		console.error("JAX.IListening.listen: The first argument must be string describing event name. I got " + typeof(type));
		type = "";
	}

	if (!obj) {
		console.error("JAX.IListening.listen: The second argument must be object or function. I got " + typeof(obj));
		eventFunc = function() {};
	}

	if (typeof(obj) == "function" || (typeof(obj) == "object" && !func)) {
		eventFunc = obj;
	} else if (typeof(obj) == "object" && typeof(func) == "string") {
		eventFunc = obj[func];

		if (eventFunc) {
			eventFunc = eventFunc.bind(obj);
		} else {
			console.error("JAX.IListening.listen: The third argument must be function or string with function name placed in object of second argument. I got " + func);	
		}
	} else if (typeof(obj) == "object" && typeof(func) == "function") {
		eventFunc = func.bind(obj);
	} else {
		console.error("JAX.IListening.listen: The second argument must be object or function. I got " + typeof(obj));
		eventFunc = function() {};
	}

	if (typeof(eventFunc) == "function") {
		var f = function(e) {
			eventFunc(new JAX.Event(e));
		};
	} else {
		var f = {
			handleEvent: function(e) {
				eventFunc.handleEvent(new JAX.Event(e));
			}
		}
	}
	
	this._node.addEventListener(type, f, useCapture);
	var objListener = new JAX.Listener(this, type, f);

	if (!JAX.IListening._listeners[type]) {
		JAX.IListening._listeners[type] = [];
	}

	JAX.IListening._listeners[type].push(objListener);

	return objListener;
};

/**
 * @method odvěsí posluchač na základě parametru, což může být typ události ("click", "mousedown", ...), případně lze předat instanci JAX.Listener, kterou vrátila metoda listen nebo metodu zavolat bez parametrů a tím se odvěsí všechny posluchaču na elementu navěšené
 *
 * @param {string || object} listener typ události nebo instance JAX.Listener
 * @returns {object} JAX.Node
 */
JAX.IListening.prototype.stopListening = function(listener) {
	if (!listener && arguments.length) {
		console.error("JAX.IListening.stopListening: Argument must be string with event type or instance of JAX.Listener.");
		type = "";
	}

	if (!arguments.length) {
		for (var i in JAX.IListening._listeners) {
			this.stopListening(i);
		}
		return this;
	}

	if (typeof(listener) == "string") {
		var type = listener;
		var listeners = JAX.IListening._listeners[type] || [];
		var deleteIndexes = [];

		for (var i=0, len=listeners.length; i<len; i++) {
			var l = listeners[i];
			if (l.jaxElm().n == this._node) {
				this._node.removeEventListener(type, l.method());
				deleteIndexes.push(i);
			}
		}

		for (var i=0, len=deleteIndexes.length; i<len; i++) {
			var deleteIndex = deleteIndexes[i];
			listeners.splice(deleteIndex, 1);
		}

		return this;
	} 

	if (listener instanceof JAX.Listener && listener.method()) {
		var type = listener.type();
		this._node.removeEventListener(type, listener.method());

		var listeners = JAX.IListening._listeners[type] || [];
		var deleteIndex = listeners.indexOf(listener);

		if (deleteIndex > -1) {
			listeners.splice(deleteIndex, 1);
		} else {
			console.warn("JAX.IListening.stopListening: I did not find given listener object in my storage. You probably called new JAX.Listener in your code and that's not good practice. Use listen and stopListening method all the time.");
		}

		return this;
	}

	console.error("JAX.IListening.stopListening: For the first argument I expected instance of JAX.Listener, string with event type or you can call it without arguments to stop all events listening.");
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
 * @param {object} e událost window.Event
 */
JAX.Event.prototype.$constructor = function(e) {
	this._e = e;
};

/**
 * @method vrací event object
 *
 * @returns {object} window.Event
 */
JAX.Event.prototype.event = function() {
	return this._e;
};

/**
 * @method zruší výchozí provedení události
 *
 * @returns {object} JAX.Event
 */
JAX.Event.prototype.prevent= function() {
	this._e.preventDefault();
	return this;
};

/**
 * @method stopne probublávání
 *
 * @returns {object} JAX.Event
 */
JAX.Event.prototype.stop = function() {
	this._e.stopPropagation();
	return this;
};

/**
 * @method vrací cílový element
 *
 * @returns {object} JAX.Node
 */
JAX.Event.prototype.target = function() {
	return JAX(this._e.target);
};

/**
 * @method vrací element, na který byla událost zavěšena
 *
 * @returns {object} JAX.Node
 */
JAX.Event.prototype.currentTarget = function() {
	return JAX(this._e.currentTarget);
};

/**
 * @method vrací typ události
 *
 * @returns {string}
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
 * Třída rezrezentující posluchač události
 * @class JAX.Listener
 */ 
JAX.Listener = JAK.ClassMaker.makeClass({
	NAME: "JAX.Listener",
	VERSION: "1.0"
});

/**
 * @method konstruktor
 *
 * @param {object} jaxElm instance JAX.Node
 * @param {string} type typ události
 * @param {function || object} method funkce nebo object, který byl předán jako reakce na událost
 */ 
JAX.Listener.prototype.$constructor = function(jaxElm, type, method) {
	this._jaxElm = jaxElm;
	this._type = type;
	this._method = method;
};

/**
 * @method odvěsí posluchač
 *
 * @returns {object} JAX.Listener
 */ 
JAX.Listener.prototype.unregister = function() {
	if (!this._method) { return; }
	this._jaxElm.stopListening(this);
	this._method = null;
	return this;
};

/**
 * @method vrací element, na kterém je událost navěšena
 *
 * @returns {object} JAX.Node
 */ 
JAX.Listener.prototype.jaxElm = function() {
	return this._jaxElm;
};

/**
 * @method vrací funkci nebo object s metodou handleEvent, která se má po nastání události zavolat
 *
 * @returns {object || function}
 */ 
JAX.Listener.prototype.method = function() {
	return this._method;
};

/**
 * @method vrací typ události
 *
 * @returns {string}
 */ 
JAX.Listener.prototype.type = function() {
	return this._type;
};
/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující pole posluchačů
 * @class JAX.ListenerArray
 * @see JAX.IIterable
 */ 
JAX.ListenerArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.ListenerArray",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @constructor
 * 
 * @param {array} listeners pole instanci JAX.Listener
 */ 
JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

/**
 * @method odregistruje všechny posluchače v poli a z pole je odstraní.
 * 
 * returns {object} JAX.ListenerArray
 */ 
JAX.ListenerArray.prototype.unregister = function() {
	var item = null;

	while(item = this.popItem()) {
		item.unregister();
	}

	return this;
};
/**
 * @fileOverview imoveablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, kterými jde manipulovat v rámci DOMu
 * @class JAX.IMoveableNode
 */
JAX.IMoveableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IMoveableNode",
	VERSION: "1.0"
});

/**
 * @method přesune element na konec zadaného elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.appendTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		jaxNode.n.appendChild(this._node);
		return this;
	}
	
	console.error("JAX.IMoveableNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method přesune element před zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.before = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;
		n.parentNode.insertBefore(this._node, n);
		return this;
	}
	
	console.error("JAX.IMoveableNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method přesune element za zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.after = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.nextSibling) {
			n.parentNode.insertBefore(this._node, n.nextSibling);
		} else {
			n.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("JAX.IMoveableNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method vloží element do zadaného elementu na první místo
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.insertFirstTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.childNodes && n.firstChild) {
			n.insertBefore(this._node, n.firstChild);
		} else if (n.childNodes) {
			n.appendChild(this._node);
		} else {
			console.error("JAX.IMoveableNode.insertFirstTo: Given element can not have child nodes.", this._node);
		}

		return this;
	}

	console.error("JAX.IMoveableNode.insertFirstTo: I could not find given element. For first argument I expected html element or JAX node.");
	return this;
};

/**
 * @method vymění element za zadaný element v DOMu a původní element z DOMu smaže
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.replaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var n = jaxNode.n;
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.IMoveableNode.replaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method vymění element za zadaný element v DOMu, prohodí si místa
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var targetNode = jaxNode.n;
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var thisParent = this._node.parentNode;
		var thisSiblingNode = this._node.nextSibling;

		this.remove();
		jaxNode.remove();

		if (thisParent) {
			if (thisSiblingNode) {
				thisParent.insertBefore(targetNode, thisSiblingNode);
			} else {
				thisParent.appendChild(targetNode);
			}
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

	console.error("JAX.IMoveableNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 *
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.remove = function() {
	if (this._node.parentNode && this._node.parentNode.nodeType != 11) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.IMoveableNode.remove: I can not remove node with no parentNode.");
	return this;
};

/**
 * @method naklonuje element a vrátí ho jako JAXový node
 *
 * @param {boolean} withContent mám naklonovat včet obsahu včetně obsahu
 * @returns {object} JAX.Node
 */
JAX.IMoveableNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);
	
	return new this.constructor(clone);
};

/**
 * @method zjistí, jestli je element umístěn v zadaném elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {boolean}
 */
JAX.IMoveableNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			return !!JAK.DOM.findParent(this._node, node);
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.n && jaxNode.contains(this);
};

/**
 * @method bez zadaného parametru vrací přímo rodiče; se zadaným zjednodušeným css selectorem vrací rodiče, který jako první odpovídá pravidlu
 *
 * @param {string || undefined} selector řetězec splňující pravidla: tag#id.trida, kde id a třída mohou být zadány vícenásobně nebo vůbec | HTMLElement | JAX.Node
 * @returns {object}
 */
JAX.IMoveableNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			var node = JAK.DOM.findParent(this._node, selector);
			return node ? JAX(node) : null;
		}
	}
	
	var jaxNode = JAX(this._node.parentNode);
	return jaxNode.n ? jaxNode : null;
};

/** 
 * @method vrací následující node
 *
 * @param {string || number || undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {object || null} JAX.Node
 */
JAX.IMoveableNode.prototype.next = function(selector) {
	var n = this._node.nextSibling;

	if (typeof(selector) == "number") {
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.nextSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (n.nodeType == JAX.HTML_ELEMENT && this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.nextSibling;
			}
		}
		return null;
	}

	var jaxNode = JAX(n);
	return jaxNode.n ? jaxNode : null;
};

/** 
 * @method vrací předchazející node
 *
 * @param {string || number || undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {object || null} JAX.Node
 */
JAX.IMoveableNode.prototype.previous = function(selector) {
	var n = this._node.previousSibling;

	if (typeof(selector) == "number") {
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.previousSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (n.nodeType == JAX.HTML_ELEMENT && this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.previousSibling;
			}
		}
		return null;
	}

	var jaxNode = JAX(n);
	return jaxNode.n ? jaxNode : null;
};

JAX.IMoveableNode.prototype._matches = function(n, selector) {
	var parts = (selector || "").match(/[#.]?[a-z0-9_-]+/ig) || [];
	var ok = true;

	for (var i=0;i<parts.length;i++) {
		var part = parts[i];
		switch (part.charAt(0)) {
			case "#":
				if (n.id != part.substring(1)) { ok = false; }
			break;
			case ".":
				if (!JAK.DOM.hasClass(n, part.substring(1))) { ok = false; }
			break;
			default:
				if (n.nodeName.toLowerCase() != part.toLowerCase()) { ok = false; }
			break;
		}
	}
	

	return ok;
};

/**
 * @fileOverview inodewithchildren.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které mohou mít potomky
 * @class
 */
JAX.INodeWithChildren = JAK.ClassMaker.makeInterface({
	NAME: "JAX.INodeWithChildren",
	VERSION: "1.0"
});

/**
 * @method přidává do elementu další uzly vždy na konec, lze zadat i jako html string, který se následně připne
 *
 * @param {string || object || array} nodes HTML string || HTMLElement || Text || HTMLDocumetFragment || pole elementů || instance JAX.NodeArray
 * @returns {object} JAX.Node
 */
JAX.INodeWithChildren.prototype.add = function(nodes) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.add: My element can not have children.", this._node);
		return this;
	}

	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("beforeend", nodes);
			return this;
		}
		
		JAX.makeFromHTML(nodes).appendTo(this);
		return this;
	}
		
	JAX.all(nodes).appendTo(this);
	
	return this;
};

/**
 * @method vloží zadané uzly před první uzel v elementu, lze zadat i jako html string, který se následně připne před první element
 *
 * @param {string || object || array}
 * @returns {object} JAX.Node
 */
JAX.INodeWithChildren.prototype.insertFirst = function(nodes) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.insertFirst: My element can not have children.", this._node);
		return this;
	}

	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("afterbegin", nodes);
			return this;
		} 
	}

	if (typeof(nodes) == "string") {
		var jaxNodes = JAX.makeFromHTML(nodes);
	} else {
		var jaxNodes = JAX.all(nodes);
	}

	if (!jaxNodes.length) {
		return this;
	}

	for (var i=0;i<jaxNodes.length; i++) {
		var n = jaxNodes[i].n;

		if (this._node.firstChild) {
			this._node.insertBefore(n, this._node.firstChild);
		} else {
			this._node.appendChild(n);
		}
	}
	
	return this;
};

/**
 * @method vloží uzel před jiný
 *
 * @param {object || string} node element nebo css selector, jak se k elementu dostat
 * @param {object || string} nodeBefore element nebo css selector, jak se k elementu dostat
 * @returns {object} JAX.Node
 */
JAX.INodeWithChildren.prototype.addBefore = function(node, nodeBefore) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.addBefore: My element can not have children.", this._node);
		return this;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	var jaxNodeBefore = nodeBefore instanceof JAX.Node ? nodeBefore : JAX(nodeBefore);

	if (!jaxNode.n) { 
		console.error("JAX.INodeWithChildren.addBefore: For first argument I expected html element, text node, documentFragment or JAX.Node.");
		return this;
	}
	if (!jaxNodeBefore.n) { 
		console.error("JAX.INodeWithChildren.addBefore: For second argument I expected html element, text node or JAX.Node."); 
		return this;
	}
	
	this._node.insertBefore(jaxNode.n, jaxNodeBefore.n);
	return this;
};

/** 
 * @method zjistí, jestli element obsahuje nody podle zadaných kritérií
 *
 * @param {object || string} nodes HTMLElement || Text || pole elementů || instance JAX.NodeArray || CSS 3 (CSS 2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.INodeWithChildren.prototype.contains = function(nodes) {
	if (!nodes) { return false; }

	if (typeof(nodes) == "string") {
		return !!this.findAll(nodes).length;
	}

	var jaxNodes = JAX.all([].concat(nodes));

	if (!jaxNodes.length) { return false; }

	for (var i=0, len=jaxNodes.length; i<len; i++) {
		var n = jaxNodes[i].n;
		if (!n) { return false; }

		if (this._node.contains && !this._node.contains(n)) {
			return false;
		} else {
			if (!this._contains(n)) {
				return false;
			}
		}
	}
	
	return true;
};

/** 
 * @method vrací JAXové pole (JAX.NodeArray) přímých potomků; pokud je ale zadán parametr index, vrací právě jeden JAXový node
 *
 * @param {number || undefined} index číselný index požadovaného potomku
 * @returns {object || null} JAX.Node || JAX.NodeArray
 */
JAX.INodeWithChildren.prototype.children = function(index) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.children: My element can not have children.", this._node);
		return new JAX.NodeArray([]);
	}

	if (!arguments.length) {
		var nodes = [];
		var childNodes = this._node.childNodes;
		for (var i=0, len=childNodes.length; i<len; i++) {
			nodes.push(JAX(childNodes[i]));
		}
		return new JAX.NodeArray(nodes);
	}

	var child = this._node.childNodes[index];
	if (child) {
		return JAX(child);
	}

	return null;
};

/** 
 * @method vrací první HTMLElement jako JAXový node
 *
 * @returns {object || null} JAX.Node
 */
JAX.INodeWithChildren.prototype.first = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.first: My element can not have children.", this._node);
		return null;
	}

	if ("firstElementChild" in this._node) {
		return this._node.firstElementChild ? JAX(this._node.firstElementChild) : null;
	}

	if (!this._node.childNodes.length) { return null; }
	
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return null;
};

/** 
 * @method vrací poslední HTMLElement jako JAXový node
 *
 * @returns {object || null} JAX.Node
 */
JAX.INodeWithChildren.prototype.last = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.last: My element can not have children.", this._node);
		return null;
	}

	if ("lastElementChild" in this._node) {
		return this._node.lastElementChild ? JAX(this._node.lastElementChild) : null;
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return null; }
	
	for (var i=this._node.childNodes.length - 1; i>-1; i--) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return null;
};

/** 
 * @method promaže element, odstraní jeho přímé potomky
 *
 * @returns {object} JAX.Node
 */
JAX.INodeWithChildren.prototype.clear = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.clear: My element can not have children.", this._node);
		return this;
	}

	JAK.DOM.clear(this._node);

	return this;
};

JAX.INodeWithChildren.prototype._contains = function(node) {
	var n = node;

	while(n && n.nodeType != 11 && n.nodeType != 9) {
		if (n == this._node) { return true; }
		n = n.parentNode;
	}

	return false;
};
/**
 * @fileOverview isearchablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které lze prohledávat pomocí querySelector a querySelectorAll
 * @class
 */
JAX.ISearchableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.ISearchableNode",
	VERSION: "1.0"
});

/**
 * @method najde element odpovídající selectoru v rámci tohoto elementu
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object}
 */
JAX.ISearchableNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto elementu
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object)
 * @returns {object}
 */
JAX.ISearchableNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};/**
 * @fileOverview ianimateablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které lze animovat
 * @class
 */
JAX.IAnimateableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IAnimateableNode",
	VERSION: "1.0"
});

/**
 * @method animuje konkrétní css vlastnost
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.IAnimateableNode.prototype.animate = function(property, duration, start, end, method) {
	if (typeof(property) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	var fx = new JAX.FX(this);
	fx.addProperty.apply(fx, arguments);
	fx.run();

	return fx;
};

/**
 * @method animuje průhlednost
 * @param {string} type "in" (od 0 do 1) nebo "out" (od 1 do 0)
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.IAnimateableNode.prototype.fade = function(type, duration, method) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	switch(type) {
		case "in":
			return this.animate("opacity", duration, 0, 1, method);
		break;
		case "out":
			return this.animate("opacity", duration, 1, 0, method);
		break;
		default:
			console.error("I got unsupported type '" + type + "'.", this._node);
			var fx = new JAX.FX(null);
			fx.run();
			return fx;
	}
};

/**
 * @method animuje průhlednost do určité hodnoty
 * @param {string || number} opacityValue hodnota průhlednosti, do které se má animovat. Jako výchozí se bere aktuální hodnota
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.IAnimateableNode.prototype.fadeTo = function(opacityValue, duration, method) {
	var opacityValue = parseFloat(opacityValue) || 0;

	if (opacityValue<0) {
		opacityValue = 0;
		console.error("For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	return this.animate("opacity", duration, null, opacityValue, method);
};

/**
 * @method zobrazí element pomocí animace výšky nebo šířky
 * @param {string} type "down" nebo "up" pro animaci výšky nebo "left", "right" pro animaci šířky
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.IAnimateableNode.prototype.slide = function(type, duration, method) {
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
			var fx = new JAX.FX(null);
			fx.run();
			return fx;
	}

	this.css("overflow", "hidden");

	var func = function() { this.css(backupStyles); }.bind(this);
	var fx = this.animate(property, duration, start, end, method);
	fx.then(func);

	return fx;
};
/**
 * @fileOverview iscrollablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, u který lze scrollovat obsahem
 * @class
 */
JAX.IScrollableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IScrollableNode",
	VERSION: "1.0"
});

/**
 * @method nascrolluje obsah na zadanou hodnotu. Lze zadat type "left" nebo "top", podle toho, kterým posuvníkem chceme hýbat. Pokud se zadá i duration, scrollování bude animované.
 * @param {string} type "top" nebo "left", podle toho, jestli chceme hýbat s vertikálním nebo horizontálním posuvníkem
 * @param {number} value hodnota v px, kam se má scrollbar posunout
 * @param {string || number} duration délka animace; pokud není zadáno, neanimuje se
 * @returns {object} JAX.Node || JAX.FX.Scrolling
 */
JAX.IScrollableNode.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var pos = this._getScrollPos();
	var left = pos.left;
	var top = pos.top;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'top' or 'left'.", this._node);
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
		var pos = {};

		switch(type) {
			case "top":
				pos.top = value;
				pos.left = left;
			break;
			case "left":
				pos.left = value;
				pos.top = top;
			break;
		}

		this._setScrollPos(pos);
		return this;
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or String with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		fx.run();
		
	return fx;
};

JAX.IScrollableNode.prototype._getScrollPos = function() {
	if (this.isWindow && "pageXOffset" in this._node) {
		var left = this._node.pageXOffset;
		var top = this._node.pageYOffset;
	} else if (this.isWindow || this.isDocument) {
		var scrollPosDoc = JAK.DOM.getScrollPos();
		var left = scrollPosDoc.x;
		var top = scrollPosDoc.y;
	} else {
		var left = this._node.scrollLeft;
		var top = this._node.scrollTop;
	}

	return {left:left, top:top};
};

JAX.IScrollableNode.prototype._setScrollPos = function(pos) {
	if (this.isWindow) {
		this._node.scrollTo(pos.left, pos.top);
	} else if (this.isDocument) {
		if ("top" in pos) {
			this._node.documentElement.scrollTop = pos.top;
		}

		if ("left" in pos) {
			this._node.documentElement.scrollLeft = pos.left;
		}
	} else {
		if ("top" in pos) {
			this._node.scrollTop = pos.top;
		}

		if ("left" in pos) {
			this._node.scrollLeft = pos.left;
		}
	}
};
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * Obecná třída reprezentující základ JAXovských elementů
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "2.0"
});

/**
 * @param {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node.prototype.$constructor = function(node) {
	// verejne atributy
	this.n = node;	
	this.jaxNodeType = node && node.nodeType ? node.nodeType : 0;

	this.isWindow = false;
	this.isNull = false
	this.isElement = false;
	this.isText = false;
	this.isDocument = false;
	this.isDocumentFragment = false;

	this.isMoveable = false;
	this.isRemoveable = false;
	this.isSearchable = false;
	this.isListenable = false;
	this.isScrollable = false;
	this.canHaveChildren = false;

	// privatni atribut
	this._node = node;
};

JAX.Node.prototype.$destructor = function() {
	this.n = null;
	this.jaxNodeType = 0;
	
	this.isWindow = false;
	this.isNull = false
	this.isElement = false;
	this.isText = false;
	this.isDocument = false;
	this.isDocumentFragment = false;

	this.isMoveable = false;
	this.isRemoveable = false;
	this.isSearchable = false;
	this.isListenable = false;
	this.isScrollable = false;
	this.canHaveChildren = false;

	this._node = null;
};

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
 * @method získá nebo nastaví vlastnost nodu
 *
 * @param {string || array || object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {} value nastavená hodnota
 * @returns {string || object}
 */
JAX.Node.prototype.prop = function(property, value) {
	if (!property) { 
		return this; 
	}

	var argLength = arguments.length;

	if (argLength == 1) {
		if (typeof(property) == "string") {
			return this._node[property]; 
		} else if (typeof(property) == "object") {
			for (var p in property) {
				this._node[p] = property[p];
			}
			return this;
		} else if (property instanceof Array) {
			var props = {};
			for (var i=0, len=property.length; i<len; i++) { 
				var p = property[i];
				props[p] = this._node[p];
			}
			return props;
		}
	}

	if (argLength == 2 && (value || value === "")) {
		if (typeof(property) == "string") {
			this._node[property] = value;
			return this;
		} else if (property instanceof Array) {
			for (var i=0, len=property.length; i<len; i++) { 
				this._node[property[i]] = value;
			}
			return this;
		}
	}

	console.error("JAX.MoveableNode.prop: Unsupported arguments: ", arguments);
	return this;
};
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující prvek v DOMu a poskytující rozšířené metody pro práci s ním
 * @class JAX.Node
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
 */
JAX.Element = JAK.ClassMaker.makeClass({
	NAME: "JAX.Element",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening, JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]
});

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

/** 
 * @constructor
 *
 * @param {object} node objekt typu window.HTMLElement
 */
JAX.Element.prototype.$constructor = function(node) {
	this.$super(node);

	this.isElement = true;

	this.isSearchable = true;
	this.isListenable = true;
	this.isScrollable = true;
	this.isMoveable = true;
	this.isRemoveable = true;
	this.canHaveChildren = true;
};

/**
 * @destructor - odvěsí všechny události a odstraní všechny reference na svůj node uvnitř instance. Voláme, pokud víme, že s touto instancí nechceme už více pracovat.
 */
JAX.Element.prototype.$destructor = function() {
	this.stopListening();
	this.$super();
};

/**
 * @method přidá zadané css třídu nebo třídy k elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {object}
 */
JAX.Element.prototype.addClass = function(classNames) {
	var classNames = classNames.trim();

	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.addClass: Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");
	
	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		this._node.classList.add(cName);
	}
	
	return this;
};

/**
 * @method odstraní zadané css třídu nebo třídy z elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {object}
 */
JAX.Element.prototype.removeClass = function(classNames) {
	var classNames = classNames.trim();

	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.removeClass: Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");
	
	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		this._node.classList.remove(cName);
	}
	
	return this;
};

/**
 * @method zjistí, jestli element má nastavenu zadanou css třídu
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {object}
 */
JAX.Element.prototype.hasClass = function(className) {
	var className = className.trim();

	if (className == "") { return true; }

	if (typeof(className) != "string") {
		className += "";  
		console.error("JAX.Element.hasClass: For my argument I expected string.", this._node);
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
 * @method pokud má element css třídu již nastavenu, tak ji odebere, pokud nikoliv, tak ji přidá
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {object}
 */
JAX.Element.prototype.toggleClass = function(className) {
	var className = className.trim();

	if (className == "") { return this; }

	if (typeof(className) != "string") {
		className += "";
		console.error("JAX.Element.toggleClass: For my argument I expected string.", this._node);
	}

	this._node.classList.toggle(className);
	
	return this;
};

/**
 * @method volání bez parametru zjistíme, jaké id má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} id id elementu
 * @returns {string || object}
 */
JAX.Element.prototype.id = function(id) {
	if (!arguments.length) { 
		return this.attr("id"); 
	}

	if (typeof(id) != "string") {
		id += "";
		console.error("JAX.Element.id: For my argument I expected string.", this._node);
	}

	this.attr({id:id}); 
	return this;
};

/**
 * @method volání bez parametru zjistíme, jaké innerHTML má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} id innerHTML elementu
 * @returns {string || object}
 */
JAX.Element.prototype.html = function(innerHTML) {
	if (!arguments.length) { 
		return this._node.innerHTML; 
	}

	if (typeof(innerHTML) != "string" && typeof(innerHTML) != "number") {
		console.error("JAX.Element.html: For my argument I expected string or number.", this._node);
	}

	this._node.innerHTML = innerHTML + "";
	return this;
};

/**
 * @method volání bez parametru zjistíme, jaký čistý text element obsahuje (bez html tagů), voláním s parametrem ho nastavíme; pozn.: při získávání textu je zahrnut veškerý text, tedy i ten, který není na stránce vidět
 *
 * @param {string || undefined} text text, který chceme nastavit
 * @returns {object || string}
 */
JAX.Element.prototype.text = function(text) {
	if (text && typeof(text) != "string" && typeof(text) != "number") {
		console.error("JAX.Element.text: For my argument I expected string or number.", this._node);
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
 * @method nastaví nebo získá hodnoty vlastností html atributů (ekvivaletní s metodou elm.setAttribute)
 *
 * @param {string || array || object} property název atributu (pokud není zadán druhý parametr, vrátí hodnotu atributu) || pole názvů atributů || asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {string || undefined} value nastaví hodnotu atributu; v případě že první parametr je pole, potom tuto hodnotu nastaví všem atributům v poli
 * @returns {string || object}
 */
JAX.Element.prototype.attr = function(property, value) {
	if (!property) { 
		return this; 
	}

	var argLength = arguments.length;

	if (argLength == 1) {
		if (typeof(property) == "string") {
			return this._node.getAttribute(property);
		} else if (typeof(property) == "object") {
			for (var p in property) {
				this._node.setAttribute(p, property[p] + "");
			}
			return this;
		} else if (property instanceof Array) {
			var attrs = {};
			for (var i=0, len=property.length; i<len; i++) { 
				var p = property[i];
				attrs[p] = this._node.getAttribute(p);
			}
			return attrs;	
		}
	}

	if (argLength == 2 && (value || value === "")) {
		if (typeof(property) == "string") {
			this._node.setAttribute(property, value + "");
			return this;
		} else if (property instanceof Array) {
			for (var i=0, len=property.length; i<len; i++) { 
				this._node.setAttribute(property[i], value + "");
			}
			return this;
		}
	}

	console.error("JAX.Element.attr: Unsupported arguments: ", arguments);
	return this;
};

/**
 * @method odstraní atribut(y)
 *
 * @param {string || array} property název atributu || pole názvů atributů
 * @returns {object} JAX.Node
 */
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

	console.error("JAX.Element.removeAttr: For argument I expected string or array of strings.", this._node);
	return this;
}

/**
 * @method nastaví nebo získá hodnoty vlastností atributu elm.style
 *
 * @param {string || array || object} property název vlasnosti || pole názvů vlastností || asociativní pole, např. {display:"none", width:"100px"}
 * @param {string} value nastaví hodnotu vlastnosti; v případě že první parametr je pole, potom tuto hodnotu nastaví všem vlastnostem v poli
 * @returns {string || object}
 */
JAX.Element.prototype.css = function(property, value) {
	if (!property) { 
		return this; 
	}

	var argLength = arguments.length;

	if (argLength == 1) {
		if (typeof(property) == "string") {
			if (!property) { return ""; }
			return property == "opacity" ? this._getOpacity() : this._node.style[property]; 
		} else if (typeof(property) == "object") {
			for (var p in property) {
				var value = property[p];
				if (p == "opacity") { 
					this._setOpacity(value); 
					continue; 
				}
				this._node.style[p] = value;
			}	
			return this;
		} else if (property instanceof Array) {
			var css = {};

			for (var i=0, len=property.length; i<len; i++) {
				var p = property[i];
				if (p == "opacity") { 
					css[p] = this._getOpacity(); 
					continue; 
				}
				css[p] = this._node.style[p];
			}

			return css;
		}
	}

	if (argLength == 2 && (value || value === "")) {
		if (typeof(property) == "string") {
			if (property == "opacity") {
				this._setOpacity(value);
				return this;
			}
				
			this._node.style[property] = value;

			return this;
		} else if (property instanceof Array) {
			for (var i=0, len=property.length; i<len; i++) {
				var p = property[i];
				if (p == "opacity") { 
					this._setOpacity(value); 
					continue; 
				}
				this._node.style[p] = value;
			}

			return this;
		}
	}

	console.error("JAX.Element.css: Unsupported arguments: ", arguments);
	return this;
};

/**
 * @method ekvivalent k window.getComputedStyle (<a href="https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle">https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle</a>)
 *
 * @param {string || array} property název vlasnosti || pole názvů vlastností
 * @returns {string || object}
 */
JAX.Element.prototype.computedCss = function(properties) {
	if (!properties) {
		return "";
	}

	if (typeof(properties) == "string") {
		var value = JAX.Element.getComputedStyle(this._node).getPropertyValue(properties);
		return value;
	}

	if (properties instanceof Array) {
		var css = {};
		for (var i=0, len=properties.length; i<len; i++) {
			var p = properties[i];
			var value = JAX.Element.getComputedStyle(this._node).getPropertyValue(p);
			css[p] = value;
		}
		return css;
	}

	return "";
};

/** 
 * @method zjistí nebo nastaví skutečnou výšku nebo šířku elementu včetně paddingu a borderu
 *
 * @param {string} sizeType "width" nebo "height"
 * @param {number} value hodnota (v px)
 * @returns {number || object}
 */
JAX.Element.prototype.fullSize = function(sizeType, value) {
	if (arguments.length == 1) {
		var size = sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight;
		return size; 
	}

	var value = this._getSizeWithBoxSizing(sizeType, value);
	this._node.style[sizeType]= Math.max(value,0) + "px";
	return this;
};

/** 
 * @method zjistí nebo nastaví style vlastnost width nebo height. V případě, že width nebo height nejsou nijak nastaveny, tak při zjišťování spočítá velikost obsahu na základě vlastnosti box-sizing.
 *
 * @param {string} sizeType "width" nebo "height"
 * @param {number} value hodnota (v px)
 * @returns {number || object}
 */
JAX.Element.prototype.size = function(sizeType, value) {
	if (arguments.length == 1) { 
		var size = parseInt(this.computedCss(sizeType), 10);
		if (isFinite(size)) { return size; }

		size = this._getSizeWithBoxSizing(sizeType);
		return size; 
	}

	var value = parseInt(value, 10);
	this._node.style[sizeType]= Math.max(value,0) + "px";
	return this;
};

/** 
 * @method promaže element
 *
 * @returns {object} JAX.Node
 */
JAX.Element.prototype.clear = function() {
	if ("innerHTML" in this._node) {
		JAK.DOM.clear(this._node);
	}

	return this;
};

/** 
 * @method porovná, jestli element odpovídá zadaným kritériím
 *
 * @param {string || object} node DOM uzel || instance JAX.Node || CSS3 (2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.Element.prototype.eq = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[a-zA-Z0-9]+$/g.test(node)) { return !!(this._node.tagName && this._node.tagName.toLowerCase() == node); }
		return !!this.parent().findAll(node).filterItems(jaxElm.eq.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.n == this._node;
};

JAX.Element.prototype._setOpacity = function(value) {
	var property = "";
	var newValue = "";

	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		if (value != "") {
			newValue = Math.round(100*value) + "";
			newValue = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + newValue + ");";
		}
	} else {
		newValue = value + "";
		property = "opacity";
	}

	this._node.style[property] = newValue;
};

JAX.Element.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.ELEMENT._OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseFloat(value)/100) + "" : value;
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

		function getOpacity(currentStyle) {
			var value = "";

			currentStyle.filter.replace(/alpha\(opacity=['"]?([0-9]+)['"]?\)/i, function(match1, match2) {
				value = match2;
			});

			return value ? (parseFloat(value)/100) + "" : value;
		};

		function normalize(property) {
﻿		 ﻿ return property.replace(/-([a-z])/g, function(match, letter) { return letter.toUpperCase(); });
		};

		function denormalize(property) {
﻿		 ﻿ return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
		};

		function sizeToPixels(size, suffix, rootSize, fontSize) {
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
			do {
				var style = element.currentStyle;
				var cssValue = style["fontSize"];
				var suffix = cssValue.split(/\d/)[0];
				var isProportional = /%|em/.test(suffix);
				var element = element.parentNode;
			} while(isProportional && element && element.nodeType != 11);

			if (isProportional && (!element || element.nodeType == 11)) { 
				return 16; 
			}

			var size = parseFloat(cssValue);
			return sizeToPixels(size, suffix);
		};

		function getFirstNonStaticElementSize(element, property) {
			var positions = ["absolute","relative","fixed"];

			while(element.parentElement && element.parentElement.currentStyle) {
				element = element.parentElement;
				var position = element.currentStyle.position || "";
				if (positions.indexOf(position) != -1) { return element[property]; }
			}

			return element.ownerDocument.documentElement[property];
		};

		function getSizeInPixels(element, style, property, fontSize) {
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

			return sizeToPixels(size, suffix, rootSize, fontSize) || 0;
		};

		function getPositionInPixels(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 

			return sizeToPixels(size, suffix, rootSize, fontSize);
		};

		function getSizeInPixelsWH(property, style, fontSize, offsetLength) {
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
			var baseFontSize = getBaseFontSize(element);
			var count = 0;
			var regexMeasureable = /margin.|padding.|border.+W|^fontSize$/;
			var positions = ["absolute","relative","fixed"];
			var sides = ["left","right","top","bottom"];

			for (property in currentStyle) {
				/*this[count] = denormalize(property);*/
				var value = currentStyle[property];

				if (regexMeasureable.test(property) && value != "auto") {
					this[property] = getSizeInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = value;
				} else if (property == "height" || property == "width") {
					var valueLower = value.toLowerCase();
					var isMeasurable = value != "auto";
					var isInPixels = valueLower.indexOf("px") > -1;

					if (!isMeasurable || isInPixels) {
						this[property] = value;
					} else {
						this[property] = getSizeInPixelsWH(property, this, baseFontSize, element.offsetWidth) + "px";
					}
				} else if (sides.indexOf(property) > -1 && positions.indexOf(currentStyle["position"]) > -1 && value != "auto") {
					this[property] = getPositionInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else {
					try {
						/* IE8 crashes in case of getting some properties (outline, outlineWidth, ...) */
						this[property] = value;
					} catch(e) {
						this[property] = "";
					}
				}

				count++;
			}

			this.length = count;

			this["opacity"] = getOpacity(currentStyle);
		};

		CSSStyleDeclaration.prototype.getPropertyPriority =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		};

		CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
			return this[normalize(prop)] || "";
		};

		CSSStyleDeclaration.prototype.item = function(index) {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
			/*return this[index];*/
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
 * Třída reprezentující text node a comment node (elm.nodeType == 3 || elm.nodeType == 8)
 * @class JAX.TextNode
 *
 * @see JAX.IMoveableNode
 */
JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.TextNode",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IMoveableNode]
});

/** 
 * @constructor
 *
 * @param {object} node objekt typu window.Text
 */
JAX.TextNode.prototype.$constructor = function(node) {
	this.$super(node);

	this.isText = true;

	this.isMoveable = true;
	this.isRemoveable = true;
};

/**
 * @method nastaví nebo vrátí textovou hodnotu uzlu
 *
 * @param {string || undefined} text textový řetězec
 * @returns {object || string} JAX.Node
 */
JAX.TextNode.prototype.text = function(text) {
	if (!arguments.length) { 
		return this._node.nodeValue;
	}

	this._node.nodeValue = text;

	return this;
};

/**
 * @method nastaví textovou hodnotu na prázdný řetězec
 *
 * @returns {object} JAX.Node
 */
JAX.TextNode.prototype.clear = function() {
	this._node.nodeValue = "";
	return this;
};

/**
 * @method porovná sama sebe se zadaným parametrem. Pokud se jedná o stejný node, vrátí true.
 *
 * @param {object} node DOM uzel nebo instance JAX.Node
 * @returns {boolean}
 */
JAX.TextNode.prototype.eq = function(node) {
	if (!node) { return false; }
	var jaxElm = node instanceof JAX.Node ? node : JAX(node);
	return jaxElm.n == this._node;
};
/**
 * @fileOverview document.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující instanci window.Document
 * @class JAX.Document
 *
 * @see JAX.ISearchableNode
 * @see JAX.IListening
 * @see JAX.IScrollableNode
 */
JAX.Document = JAK.ClassMaker.makeClass({
	NAME: "JAX.Document",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening, JAX.ISearchableNode, JAX.IScrollableNode]
});

/** 
 * @constructor
 *
 * @param {object} doc objekt typu window.Document
 */
JAX.Document.prototype.$constructor = function(doc) {
	this.$super(doc);

	this.isDocument = true;

	this.isListenable = true;
	this.isSearchable = true;
	this.isScrollable = true;
};

/** 
 * @method zjistí, jestli element obsahuje nody podle zadaných kritérií
 *
 * @param {object || string} node HTMLElement || Text ||  CSS 3 (CSS 2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.Document.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		return !!this.find(node).n;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	if (jaxNode.n) { 
		var n = jaxNode.n;
		return this._node.contains(n);
	}
	
	console.error("JAX.Element.contains: For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node.");
	return false;
};

/**
 * @method zjistí velikost dokumentu dle zadaného typu, tedy šířku nebo výšku
 *
 * @param {string} sizeType "width" nebo "height"
 * @returns {number}
 */
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
/**
 * @fileOverview documentfragment.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující instanci window.DocumentFragment
 * @class JAX.DocumentFragment
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 */
JAX.DocumentFragment = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentFragment",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode]
});

/** 
 * @constructor
 *
 * @param {object} doc objekt typu window.DocumentFragment
 */
JAX.DocumentFragment.prototype.$constructor = function(doc) {
	this.$super(doc);

	this.isDocumentFragment = true;

	this.canHaveChildren = true;
	this.isMoveable = true;
	this.isSearchable = true;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#remove
 *
 * @returns {object} JAX.Node
 */
JAX.DocumentFragment.prototype.remove = function() {
	console.error("You can not remove documentFragment node.")

	return this;
};

/**
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#swapPlaceWith
 * @returns {object} JAX.Node
 */
JAX.DocumentFragment.prototype.swapPlaceWith = function() {
	console.error("You can not switch place with documentFragment node. Use replaceWith() method instead this.")

	return this;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#isIn
 * @returns {boolean} false
 */
JAX.DocumentFragment.prototype.isIn = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method isIn().")

	return false;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#parent
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.parent = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method parent(). It is always null.")

	return null;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#next
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.next = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method next(). It is always null.")

	return null;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#previous
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.previous = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method previous(). It is always null.")

	return null;
};
/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.NullNode
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
 */
JAX.NullNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.NullNode",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IMoveableNode, JAX.INodeWithChildren, JAX.IListening, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]
});

JAX.NullNode.prototype.$constructor = function(selector) {
	this.$super(null);
	this._selector = selector || "";

	this.jaxNodeType = JAX.NULL;
	
	this.isNull = true;
	
	this.isSearchable = false;
	this.isListenable = false;
	this.isScrollable = false;
	this.isMoveable = false;
	this.isRemoveable = false;
	this.canHaveChildren = false;
};

JAX.NullNode.prototype.find = function() {
	this._showMessage("find");

	return JAX(null);
};

JAX.NullNode.prototype.findAll = function() {
	this._showMessage("findAll");

	return new JAX.NodeArray([]);
};

JAX.NullNode.prototype.addClass = function() {
	this._showMessage("addClass");

	return this;
};

JAX.NullNode.prototype.removeClass = function() {
	this._showMessage("removeClass");

	return this;
};

JAX.NullNode.prototype.hasClass = function() {
	this._showMessage("hasClass");

	return false;
};

JAX.NullNode.prototype.toggleClass = function() {
	this._showMessage("toggleClass");

	return this;
}

JAX.NullNode.prototype.id = function() {
	this._showMessage("id");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.html = function() {
	this._showMessage("html");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.text = function() {
	this._showMessage("text");

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.add = function() {
	this._showMessage("add");

	return this;
};

JAX.NullNode.prototype.insertFirst = function() {
	this._showMessage("inserFirst");

	return this;
};

JAX.NullNode.prototype.insertFirstTo = function() {
	this._showMessage("inserFirstTo");

	return this;
};

JAX.NullNode.prototype.addBefore = function() {
	this._showMessage("addBefore");

	return this;
};

JAX.NullNode.prototype.appendTo = function() {
	this._showMessage("appendTo");

	return this;
};

JAX.NullNode.prototype.before = function() {
	this._showMessage("before");

	return this;
};

JAX.NullNode.prototype.after = function() {
	this._showMessage("after");

	return this;
};

JAX.NullNode.prototype.replaceWith = function() {
	this._showMessage("replaceWith");

	return this;
};

JAX.NullNode.prototype.swapPlaceWith = function() {
	this._showMessage("swapPlaceWith");

	return this;
};

JAX.NullNode.prototype.remove = function() {
	this._showMessage("remove");

	return this;
};

JAX.NullNode.prototype.clone = function() {
	this._showMessage("clone");

	return this;
};

JAX.NullNode.prototype.listen = function() {
	this._showMessage("listen");

	return new JAX.Listener(this, null, arguments[0], arguments[2]);
};

JAX.NullNode.prototype.stopListening = function() {
	this._showMessage("stopListening");

	return this;
};

JAX.NullNode.prototype.prop = function() {
	this._showMessage("prop");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.attr = function() {
	this._showMessage("attr");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.css = function() {
	this._showMessage("css");

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.computedCss = function() {
	this._showMessage("computedCss");

	return typeof(arguments[0]) ? "" : {};
};

JAX.NullNode.prototype.fullSize = function() {
	this._showMessage("fullSize");

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.size = function() {
	this._showMessage("size");

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.parent = function() {
	this._showMessage("parent");

	return null;
};

JAX.NullNode.prototype.next = function() {
	this._showMessage("next");

	return null;
};

JAX.NullNode.prototype.previous = function() {
	this._showMessage("previous");

	return null;
};

JAX.NullNode.prototype.children = function() {
	this._showMessage("children");

	return arguments.length ? null : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.first = function() {
	this._showMessage("first");

	return null;
};

JAX.NullNode.prototype.last = function() {
	this._showMessage("last");

	return null;
};

JAX.NullNode.prototype.clear = function() {
	this._showMessage("clear");

	return null;
};

JAX.NullNode.prototype.eq = function() {
	this._showMessage("eq");

	return false;
};

JAX.NullNode.prototype.contains = function() {
	this._showMessage("contains");

	return false;
};

JAX.NullNode.prototype.isIn = function() {
	this._showMessage("isIn");

	return false;
};

JAX.NullNode.prototype.animate = function() {
	this._showMessage("animate");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fade = function() {
	this._showMessage("fade");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fadeTo = function() {
	this._showMessage("fadeTo");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.slide = function() {
	this._showMessage("slide");

	return new JAX.FX(null);
};

JAX.NullNode.prototype.scroll = function() {
	this._showMessage("scroll");

	return  new JAX.FX.Scrolling(null);
};

JAX.NullNode.prototype._showMessage = function(method) {
	if (this._selector) {
		console.error("You are trying to work with null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
	}
};
/**
 * @fileOverview window.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující object Window
 * @class JAX.Window
 *
 * @see JAX.IListening
 * @see JAX.IScrollableNode
 */
JAX.Window = JAK.ClassMaker.makeClass({
	NAME: "JAX.Window",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.IListening, JAX.IScrollableNode]
});

/** 
 * @constructor
 *
 * @param {object} win window
 */
JAX.Window.prototype.$constructor = function(win) {
	this.$super(win);

	this.jaxNodeType = JAX.WINDOW;

	this.isWindow = true;
	this.isListenable = true;
	this.isScrollable = true;
};

/**
 * @method zjistí velikost okna dle zadaného typu, tedy šířku nebo výšku
 *
 * @param {string} sizeType "width" nebo "height"
 * @returns {number}
 */
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
/**
 * @fileOverview nodearray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Třída reprezentující pole instancí JAX.Node a poskytující metody pro hromadné zpracování
 * @class JAX.NodeArray
 */
JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "2.1",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @constructor
 *
 * @param {object || array} nodes Array of nodes || NodeList || JAX.NodeArray 
 */
JAX.NodeArray.prototype.$constructor = function(nodes) {
	this.length = nodes.length;

	for(var i=0; i<this.length; i++) {
		var node = nodes[i];
		var jaxNode = node instanceof JAX.Node ? node : JAX(node);
		this[i] = jaxNode; 
	}
};

/**
 * @method najde element odpovídající selectoru v rámci tohoto pole elementů
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {object}
 */
JAX.NodeArray.prototype.find = function(selector) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		var node = item.n;
		var parentNode = node.parentNode;

		if (!item.isSearchable) { continue; }

		if (!parentNode) {
			parentNode = document.createDocumentFragment();
			parentNode.appendChild(node);

			var foundElm = JAX(parentNode).find(selector);

			parentNode.removeChild(node);
		} else {
			var foundElm = JAX(parentNode).find(selector);
		}

		if (!foundElm.n) { continue; }
		return foundElm;
	}

	return JAX(null);
};

/**
 * @method najde elementy odpovídají selectoru v rámci tohoto pole elementů
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object)
 * @returns {object}
 */
JAX.NodeArray.prototype.findAll = function(selector) {
	var foundElms = [];
	var parentNodes = [];
	var documentFragments = [];

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		var node = item.n;
		var parentNode = node.parentNode;

		if (!item.isSearchable) { continue; }

		if (!parentNode) {
			parentNode = document.createDocumentFragment();
			parentNode.appendChild(node);
			documentFragments.push(parentNode);
		} else {
			if (parentNodes.indexOf(parentNode) == -1) {
				parentNodes.push(parentNode);
			}
		}
	}

	for (var i=0, len=parentNodes.length; i<len; i++) {
		var parentNode = parentNodes[i];
		var elms = parentNode.querySelectorAll(selector);

		for (var j=0, len2=elms.length; j<len2; j++) {
			var elm = elms[j];
			var found = false;

			for(var k=0, len3=foundElms.length; k<len3; k++) {
				if (foundElms[k] == elm || foundElms[--len3] == elm) { 
					found = true; 
					break; 
				}
			}

			if (!found) { foundElms.push(elm); }
		}
	}

	for (var i=0, len=documentFragments.length; i<len; i++) {
		var parentNode = documentFragments[i];
		var elms = parentNode.querySelectorAll(selector);

		for (var j=0, len2=elms.length; j<len2; j++) {
			var elm = elms[j];
			var found = false;

			for(var k=0, len3=foundElms.length; k<len3; k++) {
				if (foundElms[k] == elm || foundElms[--len3] == elm) { 
					found = true; 
					break; 
				}
			}

			if (!found) { foundElms.push(elm); }
		}

		parentNode.removeChild(parentNode.firstChild);
	}

	return new JAX.NodeArray(foundElms);
};

/**
 * @method přidá prvek do pole
 *
 * @param {object} node uzel || JAX.Node
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.pushItem = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	this.length++;
	this[this.length - 1] = jaxNode;
	return this;
};

/**
 * @method vloží prvek na začátek pole
 *
 * @param {object} node uzel || JAX.Node
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.unshiftItem = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	this.length++;
	for (var i=this.length - 1; i>0; i--) {
		this[i] = this[i - 1];
	}
	this[0] = jaxNode;

	return this;
};

/**
 * @method umožňuje pracovat pouze s vybranou částí (rozsahem)
 *
 * @param {number} from od indexu - včetně
 * @param {number} to po index - včetně
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.limit = function(from, to) {
	return new JAX.NodeArray(this.items.apply(this, arguments));
};

/**
 * @method vrací pořadové číslo zadaného uzlu v poli nebo -1, pokud není nalezeno
 *
 * @param {object} node uzel || JAX.Node
 * @returns {number}
 */
JAX.NodeArray.prototype.index = function(node) {
	var item = node instanceof JAX.Node ? node : JAX(node);
	var nodeTarget = item.n;

	for (var i=0; i<this.length; i++) {
		var nodeSource = this[i].n;
		if (nodeSource == nodeTarget) { return i; }
	}

	return -1;
};

/**
 * @method iteruje pouze HTML elementy v poli a volá nad nimi zadanou funkci
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {number}
 */
JAX.NodeArray.prototype.forEachElm = function(func, obj) {
	var func = obj ? func.bind(obj) : func;

	for (var i=0; i<this.length; i++) {
		var elm = this[i];
		if (!elm.isElement) { continue; }
		func(elm, i, this);
	}

	return this;
};

/**
 * @method pomocí zadané funkce vrací vyfiltrované pole. Prochází pouze HTML elementy, které jsou do funkce v každé iteraci jednotilvě předány a pokud splní podmínku, element se do vráceného filtrovaného pole zařadí.
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.filterElms = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		var elm = this[i];
		if (!elm.isElement) { continue; }
		if (func(elm, i, this)) {
			filtered.push(elm);
		}
	}

	return JAX.all(filtered);
};

/**
 * @method nastaví elementům classname
 *
 * @param {string} classNames třída nebo třídy oddělené mezerou
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.addClass = function(classNames) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		this[i].addClass(classNames); 
	}
	return this;
};

/**
 * @method vrací true, pokud všechny elementy mají nastavenu zadanou classname
 *
 * @param {string} classNames třída
 * @returns {boolean}
 */
JAX.NodeArray.prototype.haveClass = function(className) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		if (!this[i].hasClass(className)) { return false; } 
	}
	return true;
};

/**
 * @method pokud element classname má, tak jej odebere, jinak jej přidá
 *
 * @param {string} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.toggleClass = function(className) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		this[i].toggleClass(className);
	}
	return this;	
};

/**
 * @method odebere všem prvkům zadaný classname
 *
 * @param {string} classNames třída nebo třídy oddělené mezerou
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.removeClass = function(classNames) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		this[i].removeClass(classNames); 
	}
	return this;
};

/**
 * @method nastaví nebo získá hodnoty vlastností html atributů (ekvivaletní s metodou elm.setAttribute)
 *
 * @param {string || array || object} property název atributu || pole názvů atributů || asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {string || undefined} value nastaví hodnotu atributu; v případě že první parametr je pole, potom tuto hodnotu nastaví všem atributům v poli
 * @returns {string || object}
 */
JAX.NodeArray.prototype.attr = function(property, value) {
	var arrLength = arguments.length;

	if (arrLength == 1 && (!property || typeof(property) != "object" || property instanceof Array)) {
		return this;
	}

	if (arrLength > 1) {
		if (typeof(property) == "string" || property instanceof Array) {
			value += "";
		}
	}

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		if (arrLength == 1) {
			item.attr(property); // z vykonostniho hlediska se nepouziva Function.apply, ale ifuje se na parametry
		} else if (arrLength == 2) {
			item.attr(property, value);
		}
	}
	return this;
};

/**
 * @method odstraní html atribut(y)
 *
 * @param {string || array} property název atributu nebo pole názvů atributů
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.removeAttr = function(properties) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		item.removeAttr(properties);
	}
	return this;
};

/**
 * @method nastaví css (vlastnost elm.style) všem elementům v poli
 *
 * @param {string || array || object} property název vlastnosti || pole názvů vlastností || asociativní pole, např. {display:"block", color:"red"}
 * @param {string} value nastaví hodnotu vlastnosti; v případě že první parametr je pole, potom tuto hodnotu nastaví všem vlastnostem v poli
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.css = function(property, value) {
	var arrLength = arguments.length;

	if (arrLength == 1 && (!property || typeof(property) != "object" || property instanceof Array)) {
		return this;
	}

	if (arrLength > 1) {
		if (typeof(property) == "string" || property instanceof Array) {
			value += "";
		}
	}

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		if (arrLength == 1) {
			item.css(property); // z vykonostniho hlediska se nepouziva Function.apply, ale ifuje se na parametry
		} else if (arrLength == 2) {
			item.css(property, value);	
		}
	}
	return this;
};

/**
 * @method nastaví vlastnost(i) všem elementům v poli
 *
 * @param {string || array || object} property název vlastnosti || pole názvů vlastností || asociativní pole, např. {id:"mojeId", checked:true}
 * @param {string} value nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.prop = function(property, value) {
	var arrLength = arguments.length;

	if (arrLength == 1 && (!property || typeof(property) != "object" || property instanceof Array)) {
		return this;
	}

	if (arrLength > 1) {
		if (typeof(property) == "string" || property instanceof Array) {
			value += "";
		}
	}

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (arrLength == 1) {
			item.prop(property); // z vykonostniho hlediska se nepouziva Function.apply, ale ifuje se na parametry
		} else if (arrLength == 2) {
			item.prop(property, value);
		}
	}

	return this;
};

/**
 * @method připne všechny prvky do zadaného nodu na konec
 *
 * @param {object} node element || JAX.Node, do kterého se mají elementy připnout
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isMoveable) { continue; }
		this[i].appendTo(node);
	}
	return this;
};

/**
 * @method vloží všechny prvky do zadaného nodu na začátek
 *
 * @param {object} node element || JAX.Node, do kterého se mají elementy připnout
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.insertFirstTo = function(node) {
	for (var i=this.length - 1; i>=0; i--) {
		var item = this[i];
		if (!item.isMoveable) { continue; }
		this[i].insertFirstTo(node);
	}
	return this;
};

/**
 * @method vloží všechny prvky před zadaný node
 *
 * @param {object} node element || JAX.Node, před který se mají elementy připnout
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.before = function(node) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isMoveable) { continue; }
		this[i].before(node);
	}
	return this;
}

/**
 * @method odebere všechny prvky z DOMu
 *
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.remove = function() {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isRemoveable) { continue; }
		item.remove(); 
	}
	return this;
};

/**
 * @method zjistí, jestli všechny prvky jsou přímým nebo nepřímým potomkem zadaného elementu
 *
 * @param {object} node element || JAX.Node, který se bude testovat, jestli obsahuje pole prvků
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.areIn = function(node) {
	for (var i=0; i<this.length; i++) {
		if (!item.isMoveable) { continue; }
		if (!this[i].isIn(node)) { return false; }
	}

	return true;
};

/**
 * @method "zničí" všechny nody, které si drží. Odvěsí posluchače a zruší veškeré reference na uložené uzly v JAXu.
 *
 * @returns {undefined}
 */
JAX.NodeArray.prototype.destroyNodes = function() {
	var item = null;

	while(item = this.popItem()) {
		item.$destructor();
	}

	return;
};

/**
 * @method navěsí posluchač události na elementy a vrátí instanci JAX.ListenerArray, které obsahuje pole navěšených listenerů
 *
 * @param {string} type typ události ("click", "mousedown", ...)
 * @param {object || function} obj objekt, ve kterém se metoda nachází nebo připravená funkce
 * @param {string || function} func název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {boolean} useCapture hodnata použitá jako argument capture pro DOM zachytávání
 * @returns {object} JAX.ListenerArray
 */
JAX.NodeArray.prototype.listen = function(type, obj, funcMethod, useCapture) {
	var listeners = new Array(this.length);
	for(var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isListenable) { continue; }
		listeners[i] = item.listen.apply(item, arguments);
	}
	return new JAX.ListenerArray(listeners);
};

/**
 * @method odvěsí posluchače na základě typu události ("click", "mousedown", ...)
 *
 * @param {string} listener typ události
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.stopListening = function(type) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isListenable) { continue; }
		item.stopListening(type);
	}
	return this;
};

/**
 * @method provede filtraci pole skrze zadanou funkci. Princip funguje podobně jako u <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter">Array.filter</a>
 *
 * @param {function} func funkce, která se má provádět. Jako parametr je předána instance JAX.Node
 * @param {object} obj context, ve kterém se má fce provést
 * @returns {object} JAX.NodeArray
 */
JAX.NodeArray.prototype.filterItems = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return new JAX.NodeArray(filtered);
};

/**
 * @method vrátí první element (tedy s node.nodeType == 1) v poli
 *
 * @returns {object} JAX.Node
 */
JAX.NodeArray.prototype.firstElement = function() {
	for (var i=0; i<this.length; i++) {
		if (this[i].isElement) { return this[i]; }
	}

	return null;
};

/**
 * @method vrátí poslední element (tedy s node.nodeType == 1) v poli
 *
 * @returns {object} JAX.Node
 */
JAX.NodeArray.prototype.lastElement = function() {
	for (var i=this.length - 1; i>=0; i--) {
		if (this[i].isElement) { return this[i]; }
	}

	return null;
};

/**
 * @method animuje konkrétní css vlastnost. Aplikuje se na všechny animovatelné prvky v poli.
 *
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FXArray
 */
JAX.NodeArray.prototype.animate = function(type, duration, start, end) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		fxs[i] = item.animate.apply(item, arguments);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method animuje průhlednost. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string} type "in" (od 0 do 1) nebo "out" (od 1 do 0)
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FXArray
 */
JAX.NodeArray.prototype.fade = function(type, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		fxs[i] = item.fade.apply(item, arguments);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method animuje průhlednost do určité hodnoty. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string || number} opacityValue hodnota průhlednosti, do které se má animovat. Jako výchozí se bere aktuální hodnota
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FXArray
 */
JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		fxs[i] = item.fadeTo.apply(item, arguments);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method zobrazí element pomocí animace výšky nebo šířky. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string} type "down" nebo "up" pro animaci výšky nebo "left", "right" pro animaci šířky
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FXArray
 */
JAX.NodeArray.prototype.slide = function(type, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		fxs[i] = item.slide.apply(item, arguments);
	}
	return new JAX.FXArray(fxs);
};

/**
 * @method nascrolluje obsah na zadanou hodnotu. Lze zadat type "left" nebo "top", podle toho, kterým posuvníkem chceme hýbat. Pokud se zadá i duration, scrollování bude animované. Aplikuje se na všechny scrollovatelné prvky v poli.
 * @param {string} type "top" nebo "left", podle toho, jestli chceme hýbat s vertikálním nebo horizontálním posuvníkem
 * @param {number} value hodnota v px, kam se má scrollbar posunout
 * @param {string || number} duration délka animace; pokud není zadáno, neanimuje se
 * @returns {object} JAX.FXArray
 */
JAX.NodeArray.prototype.scroll = function(type, value, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isScrollable) { continue; }
		fxs[i] = item.scroll.apply(item, arguments);
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

JAX.FX.isCSS3Supported = null; 

(function() {
	var style = document.createElement("div").style;
	JAX.FX.isCSS3Supported = "transition" in  style || "MozTransition" in style || "WebkitTransition" in style || "OTransition" in style || "MSTransition" in style;
})();

JAX.FX.TRANSFORM = "";

(function() {
	var transforms = [
		"transform",
		"WebkitTransform",
		"OTransform",
		"MozTransform",
		"MSTransform"
	];

	for (var i=0, len=transforms.length; i<len; i++) {
		var transform = transforms[i];
		if (transform in document.createElement("div").style) {
			JAX.FX.TRANSFORM = transform;
			break; 
		}
	}
})();

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
	"paddingTop": 		{ defaultUnit:"px" },
	"paddingBottom": 	{ defaultUnit:"px" },
	"paddingLeft": 		{ defaultUnit:"px" },
	"paddingRight": 	{ defaultUnit:"px" },
	"marginTop": 		{ defaultUnit:"px" },
	"marginBottom": 	{ defaultUnit:"px" },
	"marginLeft": 		{ defaultUnit:"px" },
	"marginRight": 		{ defaultUnit:"px" },
	"fontSize": 		{ defaultUnit:"px" },
	"transform": 		{ defaultUnit:""   },
	"WebkitTransform": 	{ defaultUnit:""   },
	"MozTransform": 	{ defaultUnit:""   },
	"MSTransform": 		{ defaultUnit:""   },
	"OTransform": 		{ defaultUnit:""   },
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
 * @constructor
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._jaxElm = JAX(elm);
	this._canBeAnimated = this._jaxElm.isElement;

	if (!this._jaxElm.n) { 
		console.error("JAX.FX: I got null node. Check your code please."); 
	}

	if (!this._jaxElm.isElement) {
		console.error("JAX.FX: I got node that can not be animated."); 	
	}

	this._settings = [];
	this._wasRun = false;
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
 * @method Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit.
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	if (!this._canBeAnimated) { return this; }

	var durationValue = this._parseValue(duration);
	var durationUnit = this._parseUnit(duration) || "ms";
	var method = JAX.FX.isCSS3Supported ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		console.error("JAX.FX.addProperty: For first argument I expected string"); 
		return this;
	}
	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) {
		console.error("JAX.FX.addProperty: First argument must be supported property. You are trying to give me '" + property + "' which is unsupoorted.");
		return this;
	}
	if (!isFinite(durationValue) || durationValue < 0) { 
		console.error("JAX.FX.addProperty: For second argument I expected positive number"); 
		return this;
	}
	if (start && typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { 
		console.error("JAX.FX.addProperty: For third argument I expected string, number or null for automatic checking"); 
		return this;
	}
	if (end && typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { 
		console.error("JAX.FX.addProperty: For fourth argument I expected string or number"); 
		return this;
	}
	if (start == null && end == null) {
		console.error("JAX.FX.addProperty: At least one of start and end values must be defined."); 	
		return this;
	}
	if (typeof(method) != "string") { 
		console.error("JAX.FX.addProperty: For fifth argument I expected string"); 
		return this;
	}
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method.toLowerCase()) == -1 && method.toLowerCase().indexOf("cubic-bezier") != 0) {
		console.error("JAX.FX.addProperty: Fifth argument must be supported method. You are trying to give me '" + method + "' which is unsupoorted."); 
		method = JAX.FX.isCSS3Supported ? "linear" : "LINEAR";
	}

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
 * @method Přidá transformační vlastnost (translateX, translateY, translateZ). Používá fallback pro prohlížeče, které transformace neumí a to přes elm.style.top a elm.style.left.
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {object} start počáteční hodnoty
 * @param {number || string} start.x hodnota translateX - lze zadat i jednotky (px, %, ...), def. px
 * @param {number || string} start.y hodnota translateY - lze zadat i jednotky (px, %, ...), def. px
 * @param {number || string} start.z hodnota translateZ - lze zadat i jednotky (px, %, ...), def. px
 * @param {object} end koncové hodnoty
 * @param {number || string} end.x hodnota translateX - lze zadat i jednotky (px, %, ...), def. px
 * @param {number || string} end.y hodnota translateY - lze zadat i jednotky (px, %, ...), def. px
 * @param {number || string} end.z hodnota translateZ - lze zadat i jednotky (px, %, ...), def. px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {object} JAX.FX
 */
JAX.FX.prototype.addTranslateProperty = function(duration, start, end, method) {
	if (!this._canBeAnimated) { return this; }

	if (!JAX.FX.isCSS3Supported) {
		var translates = {
			"x":"left",
			"y":"top",
			"z":""
		};

		for (var i in start) {
			var translate = translates[i];
			if (!translate) { continue; }
			this.addProperty(translate, duration, start[i], end[i], method);
		};

		console.info("JAX.FX.addTranslateProperty: There is no CSS3 transition support. I will use top or left instead of transform attribute. Element should have non-static position.");
		return this;
	}

	var translates = {
		"x":"translateX(%v)",
		"y":"translateY(%v)",
		"z":"translateZ(%v)"
	};

	var tvalues = [];
	for (var i in start) {
		var value = this._parseValue(start[i] || 0);
		var unit = this._parseUnit(start[i] || 0) || "px";
		var translate = translates[i];

		if (!translate) { continue; }
		tvalues.push(translate.replace("%v", value + unit));
	}

	if (!tvalues.length) {
		console.error("JAX.FX.addTranslateProperty: I got unsupported start translate axis. Supported: x, y or z.")
		return this; 
	}
	var s = tvalues.join(" ");

	var tvalues = [];
	for (var i in end) {
		var value = this._parseValue(end[i] || 0);
		var unit = this._parseUnit(end[i] || 0) || "px";
		var translate = translates[i];

		if (!translate) { continue; }
		tvalues.push(translate.replace("%v", value + unit));
	}

	if (!tvalues.length) { 
		console.error("JAX.FX.addTranslateProperty: I got unsupported end translate axis. Supported: x, y or z.")
		return this; 
	}
	var e = tvalues.join(" ");

	this.addProperty(JAX.FX.TRANSFORM, duration, s, e, method);

	return this;
};

/**
 * @method spustí animaci
 *
 * @returns {object} JAK.Promise
 */
JAX.FX.prototype.run = function() {
	if (!this._canBeAnimated) { return new JAK.Promise.reject(this._jaxElm); }
	if (this.isRunning()) { return this._promise.finished; }

	if (!this._settings.length) {
		this._promise.finished = new JAK.Promise().reject(this._jaxElm);
		console.error("JAX.FX.run: I have no added properties. FX will not run.");
		return this;
	}

	this._processor = JAX.FX.isCSS3Supported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(this._settings);

	this._running = true;
	this._wasRun = true;
	
	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this._promise.finished;
};

/**
 * @method funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onfulfill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onreject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {object} JAK.Promise
 */ 
JAX.FX.prototype.then = function(onfulfill, onreject) {
	return this._promise.finished.then(onfulfill, onreject);
};

/**
 * @method stopne animaci a spustí její zpětný chod
 *
 * @returns {object} JAK.Promise
 */
JAX.FX.prototype.reverse = function() {
	if (!this._canBeAnimated) { return new JAK.Promise.reject(this._jaxElm); }
	if (!this._wasRun) { return this.run(); }
	if (this.isRunning()) { this.stop(); }

	if (!this._settings.length) {
		this._promise.finished = new JAK.Promise().reject(this._jaxElm);
		console.error("JAX.FX.reverse: I have no added properties. FX will not run in reversed mode.");
		return this;
	}

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

	this._processor = JAX.FX.isCSS3Supported ? new JAX.FX.CSS3(this._jaxElm) : new JAX.FX.Interpolator(this._jaxElm);
	this._processor.set(reversedSettings);

	this._running = true;

	this._startTime = new Date().getTime();

	this._promise.finished = this._processor.run();
	this._promise.finished.then(this._finishAnimation.bind(this), this._finishAnimation.bind(this));

	return this._promise.finished;
};

/**
 * @method zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * @method stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 * 
 * @returns {object} JAX.FX
 */
JAX.FX.prototype.stop = function() {
	if (this._running) { 
		this._processor.stop();
	}
	return this;
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	if (property == "backgroundColor" || property == "color" || property.toLowerCase().indexOf("transform") > -1) {
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
/**
 * @fileOverview fxarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující pole JAX.FX instancí
 * @class JAX.FXArray
 * @see JAX.IIterable
 */ 
JAX.FXArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.FXArray",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @constructor
 * 
 * @param {array} fxArray pole instancí JAX.FX
 */ 
JAX.FXArray.prototype.$constructor = function(fxArray) {
	this.length = fxArray.length

	for (var i=0; i<this.length; i++) {
		this[i] = fxArray[i];
	}
};

/**
 * @method spustí animace
 * 
 * @returns {object} JAX.FXArray
 */ 
JAX.FXArray.prototype.run = function() {
	for (var i=0; i<this.length; i++) {
		this[i].run();
	}

	return this;
};

/**
 * @method funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulFill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {object} JAK.Promise
 */ 
JAX.FXArray.prototype.then = function(onFulfill, onReject) {
	var fxPromises = new Array(this.length);

	var func = function(jaxElm) {
		return jaxElm;
	};

	for (var i=0; i<this.length; i++) {
		fxPromises[i] = this[i].then(func, func);
	}

	var finalFulfill = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onFulfill(nodeArray);
	};

	var finalReject = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onReject(nodeArray);
	};

	return JAK.Promise.when(fxPromises).then(finalFulfill, finalReject);
};

/**
 * @method stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 *
 * @returns {object} JAX.FXArray
 */
JAX.FXArray.prototype.stop = function() {
	for (var i=0; i<this.length; i++) {
		this[i].stop();
	}

	return this;
};

/**
 * @method stopne animaci a spustí její zpětný chod
 *
 * @returns {object} JAX.FXArray
 */
JAX.FXArray.prototype.reverse = function() {
	for (var i=0; i<this.length; i++) {
		this[i].reverse();
	}

	return this;
};
/**
 * @fileOverview fx-css3.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro animaci pomocí CSS3 transitions
 * @class JAX.FX.CSS3
 */
JAX.FX.CSS3 = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.CSS3",
	VERSION:"1.0"
});

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

(function() {
	var transitions = {
		"transition":"transitionend",
		"WebkitTransition":"webkitTransitionEnd",
		"OTransition":"oTransitionEnd",
		"MozTransition":"transitionend",
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

/**
 * @constructor
 *
 * @param {object} jaxElm JAX.Node
 */
JAX.FX.CSS3.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._settings = [];
	this._maxDuration = 0;
	this._transitionCount = 0;
	this._ecTransition = null;
	this._promise = {
		finished: null
	};
	this._timeout = null;
};

/**
 * @method očekává pole objektů s nastavením jednotlivých animací
 *
 * @param {array} settings
 * @param {string} settings.property
 * @param {number || string} settings.startValue
 * @param {string} settings.startUnit
 * @param {number} settings.endValue
 * @param {string} settings.endUnit
 * @param {number} settings.durationValue
 * @param {string} settings.durationUnit
 * @param {string} settings.method
 */
JAX.FX.CSS3.prototype.set = function(settings) {
	this._settings = settings;
};

/**
 * @method spustí CSS3 transition
 *
 * @returns {object} JAK.Promise
 */
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
		this._maxDuration = Math.max(this._maxDuration, setting.durationValue);
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
			var cssEndValue = setting.endValue + setting.endUnit;
			style[setting.property] = cssEndValue;
		}

		this._timeout = setTimeout(this._fallback.bind(this), this._maxDuration + 50); /* sometimes transitioend is not fired, we must use fallback :-/ */
	}.bind(this), 0);

	return this._promise.finished;
};

/**
 * @method stopne transition
 *
 */
JAX.FX.CSS3.prototype.stop = function() {
	var node = this._jaxElm.node();
	var style = node.style;

	for(var i=0, len=this._settings.length; i<len; i++) {
		var property = this._settings[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(this._styleToCSSProperty(property));
		style[property] = value;
	}

	while(this._transitionCount) { this._endTransition(); }
	clearTimeout(this._timeout);
	this._timeout = null;
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
	if (this._transitionCount) {
		this._endTransition();
		return;
	}

	clearTimeout(this._timeout);
	this._timeout = null;
	this._promise.finished.fulfill(this._jaxElm);
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};

JAX.FX.CSS3.prototype._fallback = function() {
	while(this._transitionCount) {
		this._endTransition();
	}

	this._finishTransitionAnimation();
};
/**
 * @fileOverview fx-interpolator.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro animaci pomocí interpolátoru
 * @class JAX.FX.Interpolator
 */
JAX.FX.Interpolator = JAK.ClassMaker.makeClass({
	NAME:"JAX.FX.Interpolator",
	VERSION:"1.0",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

/**
 * @constructor
 *
 * @param {object} jaxElm JAX.Node
 */
JAX.FX.Interpolator.prototype.$constructor = function(jaxElm) {
	this._jaxElm = jaxElm;
	this._interpolators = [];
	this._interpolatorsCount = 0;
	this._settings = [];
	this._promise = {
		finished: null
	};
};

/**
 * @method očekává pole objektů s nastavením jednotlivých animací
 *
 * @param {array} settings
 * @param {string} settings.property
 * @param {number || string} settings.startValue
 * @param {string} settings.startUnit
 * @param {number} settings.endValue
 * @param {string} settings.endUnit
 * @param {number} settings.durationValue
 * @param {string} settings.durationUnit
 * @param {string} settings.method
 */
JAX.FX.Interpolator.prototype.set = function(settings) {
	this._settings = settings;
};

/**
 * @method spustí interpolátor
 *
 * @returns {object} JAK.Promise
 */
JAX.FX.Interpolator.prototype.run = function() {
	this._promise.finished = new JAK.Promise();
	this._interpolators = [];
	this._start();
	return this._promise.finished;
};

/**
 * @method stopne interpolátor
 *
 */
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
		} else if (setting.startUnit != setting.endUnit) {
			var property = setting.property;
			var cssProperty = this._styleToCSSProperty(property);
			var backupPropertyValue = this._jaxElm.css(property);

			this._jaxElm.css(property, setting.startValue + setting.startUnit);
			var sValue = parseFloat(this._jaxElm.computedCss(cssProperty));
			this._jaxElm.css(property, setting.endValue + setting.endUnit);
			var eValue = parseFloat(this._jaxElm.computedCss(cssProperty));

			this._jaxElm.css(property, backupPropertyValue);
			interpolator.addProperty(property, sValue, eValue, "px");
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

JAX.FX.Interpolator.prototype._styleToCSSProperty = function(property) {
﻿	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};
/**
 * @fileOverview fx-scrolling.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro animaci scrollování
 * @class JAX.FX
 */ 
JAX.FX.Scrolling = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX.Scrolling",
	VERSION: "1.0"
});

/**
 * @constructor
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.Scrolling.prototype.$constructor = function(jaxElm) {
	this._jaxElm = JAX(jaxElm);
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

/**
 * @method přidá atribut pro scrollování, který se bude animovat. Pro každou vlastnost lze zadat různou délku animace.
 * @param {string} property "left" nebo "top" pro scrollLeft respektive scrollTop
 * @param {number} value koncová hodnota v px
 * @param {number} duration délka animace v ms
 * @returns {object} JAX.FX.Scrolling
 */
JAX.FX.Scrolling.prototype.addProperty = function(property, value, duration) {
	if (property != "left" && property != "top") {
		console.error("JAX.FX.Scrolling: You are trying to use unsupported property: " + property + ".", this._jaxElm.node());
		return this;
	}

	if (!isFinite(parseFloat(duration))) {
		console.error("JAX.FX.Scrolling: Duration must be number! You gave me " + typeof(duration) + ".", this._jaxElm.node());
		return this;
	}

	this._settings.push({property:property, defValue: null, value:value, duration:duration});
	this._maxDuration = Math.max(this._maxDuration, duration);
	return this;
};

/**
 * @method spustí animaci
 *
 * @returns {object} JAK.Promise
 */
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

	return this._promises.animationFinished;
};

/**
 * @method funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulfill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {object} JAK.Promise
 */ 
JAX.FX.Scrolling.prototype.then = function(onFulfill, onReject) {
	return this._promises.animationFinished.then(onFulfill, onReject);
};

/**
 * @method stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 * 
 * @returns {object} JAX.FX.Scrolling
 */
JAX.FX.Scrolling.prototype.stop = function() {
	if (!this._isRunning) { return this; }

	while(this._runningInterpolatorCount) {
		this._onScrollingFinished();
	}
	
	return this;
};

/**
 * @method stopne animaci a spustí její zpětný chod
 *
 * @returns {object} JAK.Promise
 */
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

	return this._promises.animationFinished;
};

/**
 * @method zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.Scrolling.prototype.isRunning = function() {
	return this._isRunning;
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

