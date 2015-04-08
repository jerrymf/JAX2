/**
 * @fileOverview getcomputedstyle.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
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
				var temp = element.ownerDocument.createElement("jaxtempxyz");
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
				this[count] = denormalize(property);
				var value = currentStyle[property];

				if (regexMeasureable.test(property) && value != "auto") {
					this[property] = getSizeInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = value;
				} else if (sides.indexOf(property) > -1 && positions.indexOf(currentStyle["position"]) > -1 && value != "auto") {
					this[property] = getPositionInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else {
					this[property] = value;
				}

				count++;
			}

			var sizes = ["height", "width"];

			while(sizes.length) {
				var property = sizes.pop();
				var valueLower = value.toLowerCase();
				var isMeasurable = value != "auto";
				var isInPixels = isMeasurable && valueLower.indexOf("px") > -1;

				if (!isMeasurable || isInPixels) {
					this[property] = value;
				} else {
					this[property] = getSizeInPixelsWH(property, this, baseFontSize, property == "height" ? element.offsetHeight : element.offsetWidth) + "px";
				}
			}

			this["opacity"] = getOpacity(currentStyle);

			this.length = count;
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

		window.getComputedStyle = function(element, pseudoElt) {
			if (pseudoElt) {
				throw new Error("Optional argument pseudoElt is not allowed in getComputedStyle polyfill.");
			}
			return new CSSStyleDeclaration(element);
		};
	}
})();
/**
 * @fileOverview ie8-elements.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * JAXovský polyfill pro doplnění atributů {first,last}ElementChild a {previous,next}ElementSibling
 */
(function(){
	if (!("firstElementChild" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "firstElementChild", {
			get : function () {
				var elm = this.firstChild;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.nextSibling;
				}
		        return null;
			}
		});
	}

	if (!("lastElementChild" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "lastElementChild", {
			get : function () {
				var elm = this.lastChild;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.previousSibling;
				}
		        return null;
			}
		});
	}

	if (!("nextElementSibling" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "nextElementSibling", {
			get : function () {
				var elm = this.nextSibling;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.nextSibling;
		        };
		        return null;
			}
		});
	}

	if (!("previousElementSibling" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "previousElementSibling", {
			get : function () {
				var elm = this.previousSibling;
				while(elm){
					if(elm.nodeType == 1) { return elm; }
					elm = elm.previousSibling;
		        };
		        return null;
			}
		});
	}
})();
/**
 * @fileOverview jax.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.25.7
 * @group jak-util
 */

/**
 * @class JAX
 * je jmenný prostor a také funkce, která najde element, který odpovídá selectoru nebo obalí zadaný objekt vlastní třídou (wrapperem)
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @param {string || object} [srcElement=window.document] element, ve kterém se má hledat
 * @returns {JAX.Node}
 */
var JAX = function(selector, srcElement) {
	if (!selector) {
		return new JAX.NullNode();
	}

	if (selector instanceof JAX.Node) {
		return selector;
	}

	var nodeType = JAX.NULL;
	var foundElm = null;

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
		var nodeType = foundElm ? foundElm.nodeType : nodeType;
	} else if (typeof(selector) == "object") {
		var doc = selector.ownerDocument || selector;
		var win = doc.defaultView || doc.parentWindow || {};
		var isInstanceOfWindow = win.Window && ((typeof(win.Window) == "function" && win instanceof win.Window) || (typeof(win.Window) == "object" && win.Window == win)); /* testovani na rovnosti objektu pro IE8 */
		var hasWindow = isInstanceOfWindow || (win.constructor.toString().indexOf("DOMWindow") > -1); /* toString - fix pro Android */

		if (hasWindow && selector.nodeType) {
			var nodeType = selector.nodeType;
			var foundElm = selector;
		} else if (selector.nodeType) {
			var htmlElementCtor = window.Element || window.HTMLElement;
			var textCtor = window.Text;
			var documentCtor = window.Document || window.HTMLDocument;
			var documentFragmentCtor = window.DocumentFragment;

			var isElement = htmlElementCtor && selector instanceof htmlElementCtor;
			var isText = textCtor && selector instanceof textCtor;
			var isDocument = documentCtor && selector instanceof documentCtor;
			var isDocumentFragment = documentFragmentCtor && selector instanceof documentFragmentCtor;

			if (isElement || isText || isDocument || isDocumentFragment) {
				var nodeType = selector.nodeType;
				var foundElm = selector;
			}
		} else {
			var isWindow = selector == window || (selector.Window && selector instanceof selector.Window) || (selector.constructor.toString().indexOf("DOMWindow") > -1); /* toString - fix pro Android */
			if (isWindow) {
				var nodeType = JAX.WINDOW;
				var foundElm = selector;
			}
		}
	}

	switch(nodeType) {
		case JAX.HTML_ELEMENT:
			return new JAX.Element(foundElm);
		case JAX.DOCUMENT:
			return new JAX.Document(foundElm);
		case JAX.WINDOW:
			return new JAX.Window(foundElm);
		case JAX.DOCUMENT_FRAGMENT:
			return new JAX.DocumentFragment(foundElm);
		case JAX.TEXT:
		case JAX.COMMENT:
			return new JAX.TextNode(foundElm);
		default: 
			return new JAX.NullNode(typeof(selector) == "string" ? selector : "");
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
 * najde elementy, které odpovídají selectoru
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | JAX.Node) | JAX.NodeArray
 * @param {object || string} [srcElement=window.document] CSS3 (CSS2.1) selector nebo element, ve kterém se má hledat
 * @returns {JAX.NodeArray}
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
 * vytvoří element na základě zadaných parametrů
 *
 * @param {string} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {object} attrs asociativní pole atributů tagu
 * @param {object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {object} [srcDocument=window.document] documentElement, ve kterém se má vytvářet
 * @returns {JAX.Node}
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

	if (!tagName || !/^[a-z0-9]+$/i.test(tagName)) {
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
 * vytvoří z HTML stringu elementy - *zhmotní* html string.
 *
 * @param {string} html html string, který má být transformováno na uzly
 * @returns {JAX.NodeArray}
 */
JAX.makeFromHTML = function(html) {
	if (!html) { return new JAX.NodeArray([]); }

	var temp = JAX.make("div").html(html);
	var children = temp.children();

	return children;
};

/**
 * vytvoří textový uzel
 *
 * @param {string} text text, který má uzel obsahovat
 * @param {object} [srcDocument=window.document] documentElement node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.makeText = function(text, srcDocument) {
	return new JAX.TextNode((srcDocument || document).createTextNode(text));
};

/**
 * zjistí, jakého typu je zadaný parametr
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
 * rozšíří třídu potomka o metody rodiče
 *
 * @param {function} target potomek
 * @param {function} src rodič
 */
JAX.extend = function(target, src) {
	target.prototype = Object.create(src.prototype);

	for (var p in src.prototype) {
		if (typeof src.prototype[p] != "object") { continue; }
		target.prototype[p] = JSON.parse(JSON.stringify(src.prototype[p]));
	}

	target.prototype.constructor = target;
	target.prototype.___parent___ = src;
};

/**
 * implementuje tzv. mixin nebo také lze říci rozhraní, kdy třídu obohatí o nové metody, ale nedědí je, nýbrž si vyrobí jejich kopie
 *
 * @param {function} target třída, která metody získá
 * @param {function || array} src třída s metodami, které chceme implementovat || pole tříd
 */
JAX.mixin = function(target, src) {
	if (src instanceof Array) {
		while(src.length) { JAX.mixin(target, src.shift()); }
		return;
	}
	
	for (var p in src.prototype) {
		if (typeof src.prototype[p] == "object") {
			target.prototype[p] = JSON.parse(JSON.stringify(src.prototype[p]));
		} else {
			target.prototype[p] = src.prototype[p];
		}
	}
};
/**
 * @fileOverview iiterable.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.1
 */

/**
 * @class JAX.IIterable
 * tvoří rozhraní pro iterovatelé prvky, které je svým chováním velice podobné datovému typu Array
 */

JAX.IIterable = function() {};

/**
 * vrací true v případě, že je pole nenulové
 *
 * @returns {boolean}
 */
JAX.IIterable.prototype.exist = function() {
	return !!this.length;
};

/**
 * vrací konkrétní prvek v poli určený dle číselného indexu
 *
 * @param {number} index
 * @returns {any}
 */
JAX.IIterable.prototype.item = function(index) {
	var index = index || 0;
	return this[index];
};

/**
 * vrací pole prvků určené rozmezím od - do a to včetně těchto prvků
 *
 * @param {number} from od kterého prvku
 * @param {number} to do kterého prvku
 * @returns {array}
 */
JAX.IIterable.prototype.items = function(from, to) {
	from = parseFloat(from);
	from = !isFinite(from) ? 0 : from;
	to = parseFloat(to);
	to = !isFinite(to) ? Math.max(this.length - 1, 0) : to;

	var items = [];

	for (var i=from; i<=to; i++) {
		var item = this[i];
		if (item) { items.push(item); }
	}

	return items;
};

/**
 * vrací první prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.firstItem = function() {
	return this[0];
};

/**
 * vrací poslední prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.lastItem = function() {
	return this[this.length - 1];
};

/**
 * přidá prvek do pole a umístí ho na konec pole
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
 * odebere prvek z konce pole a zmenší velikost pole o 1 prvek
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
 * odebere první prvek a zmenší velikost pole o 1 prvek
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
 * vloží prvek na první místo v poli a zvětší velikost pole o 1 prvek
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
 * zjistí, na kolikátém místě se prvek v poli nachází (číslováno od nuly). Pokud nenajde, vrací -1.
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
 * iteruje postupně všechny prvky v poli a volá nad nimi zadanou funkci
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
 * pomocí zadané funkce vrací vyfiltrované pole. Do funkce jsou prvky v každé iteraci jednotlivě předány a pokud splní podmínku, prvek se do vráceného filtrovaného pole zařadí.
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {object}
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
 * @fileOverview asyncsequence.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.é
 */

/**
 * @class JAX.Async
 * je třída, která umožňuje zpracovat sekvenci nejen Promisů, ale i animací pomocí JAX.FX. Umožňuje tak vývojáři plnou kontrolu nad jejich synchronizací a správnou návazností.
 *
 */

JAX.Async = function() {
	this._running = false;
	this._canceled = false;
	this._pending = false;
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
};

/**
 * přidá Promise na konec fronty
 *
 * @param {function || object} item nabindovaná funkce vracející instanci JAK.Promise || instance JAX.FX || instance JAX.Async
 * @returns {JAX.Async}
 */
JAX.Async.prototype.waitFor = function(item) {
	if (this._canceled) { return this; }

	var isSupported = item && (typeof(item) == "function" || item instanceof JAK.Promise || item instanceof JAX.FX || item instanceof JAX.Async);
	if (!isSupported) {
		console.error("JAX.Async: Sorry, but I got unsupported item: " + typeof(item) + ". I expected function, instance of JAK.Promise or instance of JAX.FX.");
		return this;
	}

	this._waitings.push({
		waiting: item,
		thenActions: []
	});

	if (this._running && !this._pending) {
		this._processWaiting();
	}

	return this;
};

/**
 * co se má stát po fulfillnutí a po rejectnutí poslední nastavované Promise. Týká se vždy naposledy předané Promise přes waitFor metodu.
 *
 * @param {function} onFulfill fce se zavolá při fulfillnutí Promise
 * @param {function} onReject fce se zavolá při rejectnutí Promise
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.after = function(onFulfill, onReject) {
	if (this._canceled) { return this; }

	var customOnFulfill = function(value) {
		if (this._canceled) { return; }
		if (typeof(onFulfill) == "function") {
			return onFulfill(value);
		}
	}.bind(this);

	var customOnReject = function(value) {
		if (this._canceled) { return; }
		if (typeof(onReject) == "function") {
			return onReject(value);
		}
	}.bind(this);

	var afterAction = {onFulfill:customOnFulfill, onReject:customOnReject};
	var length = this._waitings.length;

	if (length) {
		var lastWaiting = this._waitings[length - 1];
		lastWaiting.thenActions.push(afterAction);
	} else if (this._currentPromise) {
		this._processThenActions([afterAction]);
	}

	return this;
};

/**
 * spustí celou proceduru. Postupně se začnou provádět všechny asynchronní operace. Další operace začne běžet teprve, až se dokončí předchozí.
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.run = function() {
	if (this._running || this._canceled) { return this; }
	this._canceled = false;
	this._pending = false;
	this._running = true;
	this._processWaiting();
	return this;
};

/**
 * zastaví čekání na dokončení všech navěšených akcí. Asynchronní operace, které doposud nebyly vykonány již vykonány nebudou.
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.cancel = function() {
	this._canceled = true;
	return this;
};

/**
 * je sekvence běžící?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isRunning = function() {
	return this._running;
};

/**
 * je sekvence zrušena?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isCanceled = function() {
	return this._canceled;
};

/**
 * čeká se na nějakou asynchronní akce?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isPending = function() {
	return this._pending;
};

JAX.Async.prototype._processWaiting = function() {
	this._pending = false;

	var waitingData = this._waitings.shift();
	if (!waitingData) { return; }

	var item = waitingData.waiting;

	if (typeof(item) == "function") {
		var promise = item();
	} else {
		var promise = item;
	}

	if (!(promise instanceof JAK.Promise) && !(promise instanceof JAX.FX) && !(promise instanceof JAX.Async)) {
		console.error("JAX.Async: when I tried to process next waiting Promise, I got unsupported stuff", promise);
		return;
	}

	this._currentPromise = promise;
	this._promises.push(promise);

	this._processThenActions(waitingData.thenActions);

	this._pending = true;
};

JAX.Async.prototype._processThenActions = function(thenActions) {
	for (var i=0, len=thenActions.length; i<len; i++) {
		var thenAction = thenActions[i];
		this._addAfterAction(thenAction.onFulfill, thenAction.onReject);
	}

	var finishingAction = function() {
		if (this._canceled) { this._clear(); return; }
		this._processWaiting();
	}.bind(this);

	this._addAfterAction(finishingAction, finishingAction);
};

JAX.Async.prototype._clear = function() {
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
	this._running = false;
	this._pending = false;
};

JAX.Async.prototype._addAfterAction = function(onFulfill, onReject) {
	if (this._currentPromise instanceof JAX.Async) {
		this._currentPromise.after(onFulfill, onReject);
		return;
	}
	this._currentPromise.then(onFulfill, onReject);
};
/**
 * @fileOverview ilistening.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.1
 */

/**
 * @class JAX.IListening
 * tvoří rozhrani implementujicí práci s navěšováním a odvěšováním událostí
 */
JAX.IListening = function() {};

JAX.IListening._listeners = {};

/**
 * navěsí posluchač události na element a vrátí instanci JAX.Listener. Při vyvolání události pak do funkce předává jako parametr instanci JAX.Event.
 *
 * @param {string} type typ události ("click", "mousedown", ...)
 * @param {object || function} obj objekt, ve kterém se metoda nachází nebo připravená funkce
 * @param {string || function} func název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {boolean} useCapture hodnota použitá jako argument capture pro DOM zachytávání
 * @returns {JAX.Listener}
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
 * odvěsí posluchač na základě parametru, což může být jednak typ události ("click", "mousedown", ...) nebo lze předat instanci JAX.Listener. Metodu lze také zavolat bez parametrů a tím se odvěsí všechny posluchače na elementu.
 *
 * @param {string || object} listener typ události nebo instance JAX.Listener
 * @returns {JAX.Node}
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.Event
 * je třída obalující window.Event pro snadnější práci se stavem událostí
 *
 * @param {object} e událost window.Event
 */
JAX.Event = function(e) {
	this._e = e;
};

/**
 * vrací event object
 *
 * @returns {window.Event}
 */
JAX.Event.prototype.event = function() {
	return this._e;
};

/**
 * zruší výchozí provedení události
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.prevent= function() {
	this._e.preventDefault();
	return this;
};

/**
 * stopne probublávání
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.stop = function() {
	this._e.stopPropagation();
	return this;
};

/**
 * vrací cílový element
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.target = function() {
	return JAX(this._e.target);
};

/**
 * vrací element, na který byla událost zavěšena
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.currentTarget = function() {
	return JAX(this._e.currentTarget);
};

/**
 * vrací typ události
 *
 * @returns {string}
 */
JAX.Event.prototype.type = function() {
	return this._e.type;
};
/**
 * @fileOverview listener.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.Listener
 * je třída rezrezentující posluchač události
 *
 * @param {object} jaxElm instance JAX.Node
 * @param {string} type typ události
 * @param {function || object} method funkce nebo object, který byl předán jako reakce na událost
 */ 
JAX.Listener = function(jaxElm, type, method) {
	this._jaxElm = jaxElm;
	this._type = type;
	this._method = method;
};

/**
 * odvěsí posluchač
 *
 * @returns {JAX.Listener}
 */ 
JAX.Listener.prototype.unregister = function() {
	if (!this._method) { return; }
	this._jaxElm.stopListening(this);
	this._method = null;
	return this;
};

/**
 * vrací element, na kterém je událost navěšena
 *
 * @returns {JAX.Node}
 */ 
JAX.Listener.prototype.jaxElm = function() {
	return this._jaxElm;
};

/**
 * vrací funkci nebo object s metodou handleEvent, která se má po nastání události zavolat
 *
 * @returns {object || function}
 */ 
JAX.Listener.prototype.method = function() {
	return this._method;
};

/**
 * vrací typ události
 *
 * @returns {string}
 */ 
JAX.Listener.prototype.type = function() {
	return this._type;
};
/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.ListenerArray
 * je třída rezrezentující pole posluchačů. Implementuje rozhraní {@link JAX.IIterable}
 *
 * @param {array} listeners pole instanci JAX.Listener
 */ 
JAX.ListenerArray = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

JAX.mixin(JAX.ListenerArray, JAX.IIterable);

/**
 * odregistruje všechny posluchače v poli a z pole je odstraní.
 * 
 * @returns {JAX.ListenerArray}
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.1
 */

/**
 * @class JAX.IMoveableNode
 * tvoří rozhraní pro nody, kterými jde manipulovat v rámci DOMu
 */
JAX.IMoveableNode = function() {};

/**
 * přesune element na konec zadaného elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * přesune element před zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * přesune element za zadaný element
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * vloží element do zadaného elementu na první místo
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * vymění element za zadaný element v DOMu a původní element z DOMu smaže
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * vymění element za zadaný element v DOMu, prohodí si místa
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * odstraní element z DOMu
 *
 * @returns {JAX.Node}
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
 * naklonuje element a vrátí ho jako JAXový node
 *
 * @param {boolean} withContent mám naklonovat včet obsahu včetně obsahu
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);
	
	return new this.constructor(clone);
};

/**
 * zjistí, jestli je element umístěn v zadaném elementu
 *
 * @param {string || object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {boolean}
 */
JAX.IMoveableNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			try {
				var result = !!JAK.DOM.findParent(this._node, node); // FIXME - opravit v JAKu pro IE8
				return result;
			} catch(e) {
				return false;
			}
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.n && jaxNode.contains(this);
};

/**
 * bez zadaného parametru vrací přímo rodiče; se zadaným zjednodušeným css selectorem vrací rodiče, který jako první odpovídá pravidlu
 *
 * @param {string || undefined} selector řetězec splňující pravidla: tag#id.trida, kde id a třída mohou být zadány vícenásobně nebo vůbec | HTMLElement | JAX.Node
 * @returns {JAX.Node || null}
 */
JAX.IMoveableNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			try {
				var node = JAK.DOM.findParent(this._node, selector); // FIXME - opravit v JAKu pro IE8
				return node ? JAX(node) : null;
			} catch(e) {
				return null;
			}
		}
	}

	var jaxNode = JAX(this._node.parentNode);
	return jaxNode.n ? jaxNode : null;
};

/** 
 * vrací následující node
 *
 * @param {string || number || undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {JAX.Node || null}
 */
JAX.IMoveableNode.prototype.next = function(selector) {
	if (typeof(selector) == "number") {
		var n = this._node.nextSibling;
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.nextSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		var n = this._node.nextElementSibling;
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.nextElementSibling;
			}
		}
		return null;
	}

	var n = this._node.nextSibling;
	return n ? JAX(n) : null;
};

/**
 * vrací předchazející node
 *
 * @param {string || number || undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {JAX.Node || null}
 */
JAX.IMoveableNode.prototype.previous = function(selector) {
	if (typeof(selector) == "number") {
		var n = this._node.previousSibling;
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.previousSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		var n = this._node.previousElementSibling;
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.previousElementSibling;
			}
		}
		return null;
	}

	var n = this._node.previousSibling;
	return n ? JAX(n) : null;
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.INodeWithChildren
 * tvoří rozhraní pro nody, které mohou mít potomky
 */
JAX.INodeWithChildren = function() {};

/**
 * přidává do elementu další uzly vždy na konec, lze zadat i jako html string, který se následně připne
 *
 * @param {string || object || array} nodes HTML string || HTMLElement || Text || HTMLDocumetFragment || pole elementů || instance JAX.NodeArray
 * @returns {JAX.Node}
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
 * vloží zadané uzly před první uzel v elementu, lze zadat i jako html string, který se následně připne před první element
 *
 * @param {string || object || array} nodes HTML string || HTMLElement || Text || HTMLDocumetFragment || pole elementů || instance JAX.NodeArray
 * @returns {JAX.Node}
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
 * vloží uzel před jiný
 *
 * @param {object || string} node element nebo css selector, jak se k elementu dostat
 * @param {object || string} nodeBefore element nebo css selector, jak se k elementu dostat
 * @returns {JAX.Node}
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
 * zjistí, jestli element obsahuje nody podle zadaných kritérií
 *
 * @param {object || string} nodes HTMLElement || Text || pole elementů || instance JAX.NodeArray || CSS 3 (CSS 2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.INodeWithChildren.prototype.contains = function(nodes) {
	if (!nodes) { return false; }

	if (typeof(nodes) == "string") {
		return !!this.find(nodes).n;
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
 * vrací JAXové pole (JAX.NodeArray) přímých potomků; pokud je ale zadán parametr index, vrací právě jeden JAXový node
 *
 * @param {number || undefined} index číselný index požadovaného potomku
 * @returns {JAX.Node || JAX.NodeArray || null}
 */
JAX.INodeWithChildren.prototype.children = function(index) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.children: My element can not have children.", this._node);
		return new JAX.NodeArray([]);
	}

	if (!arguments.length) {
		var childNodes = this._node.childNodes;
		var length = childNodes.length;
		var nodes = new Array(length);
		
		for (var i=0; i<length; i++) {
			nodes[i] = JAX(childNodes[i]);
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
 * vrací JAXové pole (JAX.NodeArray) přímých elementů (node.nodeType == 1); pokud je ale zadán parametr index, vrací právě jeden JAXový element
 *
 * @param {number || undefined} index číselný index požadovaného elementu
 * @returns {JAX.Node || JAX.NodeArray || null}
 */
JAX.INodeWithChildren.prototype.elements = function(index) {
	if (!this._node.children && !this._node.childNodes) {
		console.error("JAX.INodeWithChildren.elements: My element can not have any element.", this._node);
		return new JAX.NodeArray([]);
	}

	var children = this._node.children || this._node.childNodes; /* IE8 - zahrnuje comment nody do children, Safari na mobilu nepodporuje u documentFragmentu children */
	var length = children.length;

	if (!arguments.length) {	
		var elms = [];
		
		for (var i=0; i<length; i++) {
			var child = children[i];
			if (child.nodeType == 1) { elms.push(JAX(child)); }
		}

		return new JAX.NodeArray(elms);
	}

	var counter = 0;
	for (var i=0; i<length; i++) {
		var child = children[i];
		if (counter == index) {
			return JAX(child);
		}
		counter++;
	}

	return null;
};

/** 
 * vrací první HTMLElement jako JAXový node
 *
 * @returns {JAX.Node || null}
 */
JAX.INodeWithChildren.prototype.first = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.first: My element can not have children.", this._node);
		return null;
	}

	return this._node.firstElementChild ? JAX(this._node.firstElementChild) : null;
};

/** 
 * vrací poslední HTMLElement jako JAXový node
 *
 * @returns {JAX.Node || null}
 */
JAX.INodeWithChildren.prototype.last = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.last: My element can not have children.", this._node);
		return null;
	}

	return this._node.lastElementChild ? JAX(this._node.lastElementChild) : null;
};

/** 
 * promaže element, odstraní jeho přímé potomky
 *
 * @returns {JAX.Node}
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.ISearchableNode
 * tvoří rozhraní pro nody, které lze prohledávat pomocí querySelector a querySelectorAll
 */
JAX.ISearchableNode = function() {};

/**
 * najde element odpovídající selectoru v rámci tohoto elementu
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.ISearchableNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * najde elementy odpovídají selectoru v rámci tohoto elementu
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object)
 * @returns {JAX.NodeArray}
 */
JAX.ISearchableNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};/**
 * @fileOverview ianimateablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.1
 */

/**
 * @class JAX.IAnimateableNode
 * tvoří rozhraní pro nody, které lze animovat
 */
JAX.IAnimateableNode = function() {};

/**
 * animuje konkrétní css vlastnost
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
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
 * animuje průhlednost
 * @param {string} type "in" (od 0 do 1) nebo "out" (od 1 do 0)
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
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
 * animuje průhlednost do určité hodnoty
 * @param {string || number} opacityValue hodnota průhlednosti, do které se má animovat. Jako výchozí se bere aktuální hodnota
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
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
 * zobrazí element pomocí animace výšky nebo šířky
 * @param {string} type "down" nebo "up" pro animaci výšky nebo "left", "right" pro animaci šířky
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.IAnimateableNode.prototype.slide = function(type, duration, method) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node);
	}

	var backupStyles = null;
	switch(type) {
		case "down":
			backupStyles = this.css(["overflow", "height"]);
			var property = "height";
			var start = 0;
			var end = null;
		break;
		case "up":
			backupStyles = this.css(["overflow"]);
			var property = "height";
			var start = null;
			var end = 0;
		break;
		case "left":
			backupStyles = this.css(["overflow"]);
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

	var fx = this.animate(property, duration, start, end, method);
	this.css("overflow", "hidden");

	if (backupStyles) {
		var func = function() { this.css(backupStyles); }.bind(this);
		fx.then(func);
	}

	return fx;
};
/**
 * @fileOverview iscrollablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.IScrollableNode
 * tvoří rozhraní pro nody, u který lze scrollovat obsahem
 */
JAX.IScrollableNode = function() {};

/**
 * nascrolluje obsah na zadanou hodnotu. Lze zadat type "left" nebo "top", podle toho, kterým posuvníkem chceme hýbat. Pokud se zadá i duration, scrollování bude animované.
 * @param {string} type "top" nebo "left", podle toho, jestli chceme hýbat s vertikálním nebo horizontálním posuvníkem
 * @param {number} value hodnota v px, kam se má scrollbar posunout
 * @param {string || number} duration délka animace; pokud není zadáno, neanimuje se
 * @returns {JAX.Node || JAX.FX.Scrolling}
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
 * @class JAX.Node
 * je obecná třída reprezentující základ JAXovských elementů
 *
 * @param {object} HTMLElement | Text | HTMLDocument | Window
 */
JAX.Node = function(node) {
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
	this.isNull = true;
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
 * vrací uzel, který si instance drží
 *
 * @returns {HTMLElement || Text || HTMLDocument || Window}
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * zjišťuje, zda-li je obsah platný nebo nikoliv.
 *
 * @returns {boolean}
 */
JAX.Node.prototype.exists = function() {
	return !!this._node;
};

/**
 * získá nebo nastaví vlastnost nodu
 *
 * @param {string || array || object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {} value nastavená hodnota
 * @returns {string || JAX.Node || object}
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

	if (argLength == 2) {
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
 * @fileOverview element.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.2
 */

/**
 * @class JAX.Element
 * je třída reprezentující HTML Element. Implementuje následující rozhraní: {@link JAX.INodeWithChildren}, {@link JAX.IMoveableNode}, {@link JAX.ISearchableNode}, {@link JAX.IListening}, {@link JAX.IAnimateableNode}, {@link JAX.IScrollableNode}
 *
 * @param {object} node objekt typu window.HTMLElement
 */
JAX.Element = function(node) {
	this.___parent___.call(this, node);

	this.isElement = true;

	this.isSearchable = true;
	this.isListenable = true;
	this.isScrollable = true;
	this.isMoveable = true;
	this.isRemoveable = true;
	this.canHaveChildren = true;
};

JAX.extend(JAX.Element, JAX.Node);
JAX.mixin(JAX.Element, [JAX.IListening, JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]);

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
 * přidá zadané css třídu nebo třídy k elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {JAX.Node}
 */
JAX.Element.prototype.addClass = function(classNames) {
	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.addClass: Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");

	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		if (!cName) { continue; }
		this._node.classList.add(cName);
	}

	return this;
};

/**
 * odstraní zadané css třídu nebo třídy z elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {JAX.Node}
 */
JAX.Element.prototype.removeClass = function(classNames) {
	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.removeClass: Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");

	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		if (!cName) { continue; }
		this._node.classList.remove(cName);
	}

	return this;
};

/**
 * zjistí, jestli element má nastavenu zadanou css třídu
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {boolean}
 */
JAX.Element.prototype.hasClass = function(classNames) {
	if (classNames == "") { return true; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.hasClass: For my argument I expected string.", this._node);
	}

	var cNames = classNames.split(" ");

	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		if (!cName) { continue; }
		if (!this._node.classList.contains(cName)) { return false; }
	}

	return true;
};

/**
 * pokud má element css třídu již nastavenu, tak ji odebere, pokud nikoliv, tak ji přidá
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {JAX.Node}
 */
JAX.Element.prototype.toggleClass = function(classNames) {
	if (classNames == "") { return this; }

	if (typeof(classNames) != "string") {
		classNames += "";
		console.error("JAX.Element.toggleClass: For my argument I expected string.", this._node);
	}

	var cNames = classNames.split(" ");

	for (var i=0, len=cNames.length; i<len; i++) {
		var cName = cNames[i];
		if (!cName) { continue; }
		this._node.classList.toggle(cName);
	}

	return this;
};

/**
 * volání bez parametru zjistíme, jaké id má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} id id elementu
 * @returns {string || JAX.Node}
 */
JAX.Element.prototype.id = function(id) {
	if (!arguments.length) {
		return this._node.id;
	}

	if (typeof(id) != "string") {
		id += "";
		console.error("JAX.Element.id: For my argument I expected string.", this._node);
	}

	this._node.id = id;
	return this;
};

/**
 * volání bez parametru zjistíme, jaké innerHTML má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} innerHTML innerHTML elementu
 * @returns {string || JAX.Node}
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
 * volání bez parametru zjistíme, jaký čistý text element obsahuje (bez html tagů), voláním s parametrem ho nastavíme; pozn.: při získávání textu je zahrnut veškerý text, tedy i ten, který není na stránce vidět
 *
 * @param {string || undefined} text text, který chceme nastavit
 * @returns {JAX.Node || string}
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
 * nastaví nebo získá hodnoty vlastností html atributů (ekvivaletní s metodou elm.setAttribute)
 *
 * @param {string || array || object} property název atributu (pokud není zadán druhý parametr, vrátí hodnotu atributu) || pole názvů atributů || asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {string || undefined} value nastaví hodnotu atributu; v případě že první parametr je pole, potom tuto hodnotu nastaví všem atributům v poli
 * @returns {string || JAX.Node || object}
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

	if (argLength == 2 && (value || (typeof(value) == "string" || typeof(value) == "number"))) {
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
 * má element nastavený atribut?
 *
 * @param {string} property název atributu
 * @returns {Boolean}
 */
JAX.Element.prototype.hasAttr = function(property) {
	return this._node.hasAttribute(property);
};

/**
 * odstraní atribut(y)
 *
 * @param {string || array} property název atributu || pole názvů atributů
 * @returns {JAX.Node}
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
};

/**
 * nastaví nebo získá hodnoty vlastností atributu elm.style
 *
 * @param {string || array || object} property název vlasnosti || pole názvů vlastností || asociativní pole, např. {display:"none", width:"100px"}
 * @param {string} value nastaví hodnotu vlastnosti; v případě že první parametr je pole, potom tuto hodnotu nastaví všem vlastnostem v poli
 * @returns {string || JAX.Node || object}
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
		}
	}

	if (argLength == 2 && (value || (typeof(value) == "string" || typeof(value) == "number"))) {
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
 * ekvivalent k window.getComputedStyle (<a href="https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle">https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle</a>)
 *
 * @param {string || array} property název vlasnosti || pole názvů vlastností
 * @returns {string || object}
 */
JAX.Element.prototype.computedCss = function(properties) {
	if (!properties) {
		return "";
	}

	if (typeof(properties) == "string") {
		var win = (this._node.ownerDocument.defaultView || this._node.ownerDocument.parentWindow);
		var getComputedStyle = win.getComputedStyle || window.getComputedStyle;
		var value = getComputedStyle(this._node).getPropertyValue(properties);
		return value;
	}

	if (properties instanceof Array) {
		var css = {};
		for (var i=0, len=properties.length; i<len; i++) {
			var p = properties[i];
			var win = (this._node.ownerDocument.defaultView || this._node.ownerDocument.parentWindow);
			var getComputedStyle = win.getComputedStyle || window.getComputedStyle;
			var value = getComputedStyle(this._node).getPropertyValue(p);
			css[p] = value;
		}
		return css;
	}

	return "";
};

/**
 * zjistí nebo nastaví skutečnou výšku nebo šířku elementu včetně paddingu a borderu
 *
 * @param {string} sizeType "width" nebo "height"
 * @param {number} value hodnota (v px)
 * @returns {number || JAX.Node}
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
 * zjistí nebo nastaví style vlastnost width nebo height. V případě, že width nebo height nejsou nijak nastaveny, tak při zjišťování spočítá velikost obsahu na základě vlastnosti box-sizing.
 *
 * @param {string} sizeType "width" nebo "height"
 * @param {number} value hodnota (v px)
 * @returns {number || JAX.Node}
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
 * promaže element
 *
 * @returns {JAX.Node}
 */
JAX.Element.prototype.clear = function() {
	if (this._node.firstChild) {
		JAK.DOM.clear(this._node);
	}

	return this;
};

/**
 * porovná, jestli element odpovídá zadaným kritériím
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
 * @fileOverview textnode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.TextNode
 * je třída reprezentující text node a comment node (elm.nodeType == 3 || elm.nodeType == 8). Implementuje rozhraní {@link JAX.IMoveableNode}
 *
 * @param {object} node objekt typu window.Text
 */
JAX.TextNode = function(node) {
	this.___parent___.call(this, node);

	this.isText = true;

	this.isMoveable = true;
	this.isRemoveable = true;
};

JAX.extend(JAX.TextNode, JAX.Node);
JAX.mixin(JAX.TextNode, JAX.IMoveableNode);

/**
 * nastaví nebo vrátí textovou hodnotu uzlu
 *
 * @param {string || undefined} text textový řetězec
 * @returns {JAX.Node || string} JAX.Node
 */
JAX.TextNode.prototype.text = function(text) {
	if (!arguments.length) { 
		return this._node.nodeValue;
	}

	this._node.nodeValue = text;

	return this;
};

/**
 * nastaví textovou hodnotu na prázdný řetězec
 *
 * @returns {JAX.Node}
 */
JAX.TextNode.prototype.clear = function() {
	this._node.nodeValue = "";
	return this;
};

/**
 * porovná sama sebe se zadaným parametrem. Pokud se jedná o stejný node, vrátí true.
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.Document
 * je třída reprezentující instanci window.Document. Implementuje následující rozhraní: {@link JAX.IListening}, {@link JAX.IScrollableNode}, {@link JAX.ISearchableNode}
 *
 * @param {object} doc objekt typu window.Document
 */
JAX.Document = function(doc) {
	this.___parent___.call(this, doc);

	this.isDocument = true;

	this.isListenable = true;
	this.isSearchable = true;
	this.isScrollable = true;
};

JAX.extend(JAX.Document, JAX.Node);
JAX.mixin(JAX.Document, [JAX.IListening, JAX.ISearchableNode, JAX.IScrollableNode]);

/** 
 * zjistí, jestli element obsahuje nody podle zadaných kritérií
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
 * zjistí velikost dokumentu dle zadaného typu, tedy šířku nebo výšku
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.DocumentFragment
 * je třída reprezentující instanci window.DocumentFragment. Implementuje následující rozhraní: {@link JAX.INodeWithChildren}, {@link JAX.IMoveableNode}, {@link JAX.ISearchableNode}
 *
 * @param {object} doc objekt typu window.DocumentFragment
 */
JAX.DocumentFragment = function(doc) {
	this.___parent___.call(this, doc);

	this.isDocumentFragment = true;

	this.canHaveChildren = true;
	this.isMoveable = true;
	this.isSearchable = true;
};

JAX.extend(JAX.DocumentFragment, JAX.Node);
JAX.mixin(JAX.DocumentFragment, [JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode]);

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#remove
 *
 * @returns {JAX.Node}
 */
JAX.DocumentFragment.prototype.remove = function() {
	console.error("You can not remove documentFragment node.")

	return this;
};

/**
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#swapPlaceWith
 * @returns {JAX.Node}
 */
JAX.DocumentFragment.prototype.swapPlaceWith = function() {
	console.error("You can not switch place with documentFragment node. Use replaceWith() method instead this.")

	return this;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#isIn
 * @returns {boolean} false
 */
JAX.DocumentFragment.prototype.isIn = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method isIn().")

	return false;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#parent
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.parent = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method parent(). It is always null.")

	return null;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#next
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.next = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method next(). It is always null.")

	return null;
};

/** 
 * nepodporováno u window.DocumentFragment
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.NullNode
 * je třída reprezentující nullový node - návrhový vzor Null object. Implementuje následující rozhraní: {@link JAX.INodeWithChildren}, {@link JAX.IMoveableNode}, {@link JAX.ISearchableNode}, {@link JAX.IListening}, {@link JAX.IAnimateableNode}, {@link JAX.IScrollableNode}
 *
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
 *
 * @param {string} selector CSS3 (CSS 2.1) selector, který selhal
 */
JAX.NullNode = function(selector) {
	this.___parent___.call(this, null);

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

JAX.extend(JAX.NullNode, JAX.Node);
JAX.mixin(JAX.NullNode, [JAX.IMoveableNode, JAX.INodeWithChildren, JAX.IListening, JAX.ISearchableNode, JAX.IAnimateableNode, JAX.IScrollableNode]);

JAX.NullNode.prototype.find = function() {
	this._showMessage("find", Array.prototype.slice.call(arguments));

	return JAX(null);
};

JAX.NullNode.prototype.findAll = function() {
	this._showMessage("findAll", Array.prototype.slice.call(arguments));

	return new JAX.NodeArray([]);
};

JAX.NullNode.prototype.addClass = function() {
	this._showMessage("addClass", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.removeClass = function() {
	this._showMessage("removeClass", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.hasClass = function() {
	this._showMessage("hasClass", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.toggleClass = function() {
	this._showMessage("toggleClass", Array.prototype.slice.call(arguments));

	return this;
}

JAX.NullNode.prototype.id = function() {
	this._showMessage("id", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.html = function() {
	this._showMessage("html", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.text = function() {
	this._showMessage("text", Array.prototype.slice.call(arguments));

	if (arguments.length) {
		return this;
	}

	return "";
};

JAX.NullNode.prototype.add = function() {
	this._showMessage("add", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.insertFirst = function() {
	this._showMessage("inserFirst", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.insertFirstTo = function() {
	this._showMessage("inserFirstTo", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.addBefore = function() {
	this._showMessage("addBefore", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.appendTo = function() {
	this._showMessage("appendTo", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.before = function() {
	this._showMessage("before", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.after = function() {
	this._showMessage("after", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.replaceWith = function() {
	this._showMessage("replaceWith", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.swapPlaceWith = function() {
	this._showMessage("swapPlaceWith", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.remove = function() {
	this._showMessage("remove", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.clone = function() {
	this._showMessage("clone", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.listen = function() {
	this._showMessage("listen", Array.prototype.slice.call(arguments));

	return new JAX.Listener(this, null, arguments[0], arguments[2]);
};

JAX.NullNode.prototype.stopListening = function() {
	this._showMessage("stopListening", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.prop = function() {
	this._showMessage("prop", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.attr = function() {
	this._showMessage("attr", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.removeAttr = function() {
	this._showMessage("removeAttr", Array.prototype.slice.call(arguments));

	return this;
};

JAX.NullNode.prototype.css = function() {
	this._showMessage("css", Array.prototype.slice.call(arguments));

	if (typeof(arguments[0]) == "string") { return ""; }
	if (arguments[0] instanceof Array) { return {}; }
	return this;
};

JAX.NullNode.prototype.computedCss = function() {
	this._showMessage("computedCss", Array.prototype.slice.call(arguments));

	return typeof(arguments[0]) ? "" : {};
};

JAX.NullNode.prototype.fullSize = function() {
	this._showMessage("fullSize", Array.prototype.slice.call(arguments));

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.size = function() {
	this._showMessage("size", Array.prototype.slice.call(arguments));

	return arguments.length == 1 ? 0 : this;
};

JAX.NullNode.prototype.parent = function() {
	this._showMessage("parent", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.next = function() {
	this._showMessage("next", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.previous = function() {
	this._showMessage("previous", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.children = function() {
	this._showMessage("children", Array.prototype.slice.call(arguments));

	return arguments.length ? null : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.elements = function() {
	this._showMessage("elements", Array.prototype.slice.call(arguments));

	return arguments.length ? null : new JAX.NodeArray([]);
};

JAX.NullNode.prototype.first = function() {
	this._showMessage("first", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.last = function() {
	this._showMessage("last", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.clear = function() {
	this._showMessage("clear", Array.prototype.slice.call(arguments));

	return null;
};

JAX.NullNode.prototype.eq = function() {
	this._showMessage("eq", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.contains = function() {
	this._showMessage("contains", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.isIn = function() {
	this._showMessage("isIn", Array.prototype.slice.call(arguments));

	return false;
};

JAX.NullNode.prototype.animate = function() {
	this._showMessage("animate", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fade = function() {
	this._showMessage("fade", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.fadeTo = function() {
	this._showMessage("fadeTo", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.slide = function() {
	this._showMessage("slide", Array.prototype.slice.call(arguments));

	return new JAX.FX(null);
};

JAX.NullNode.prototype.scroll = function() {
	this._showMessage("scroll", Array.prototype.slice.call(arguments));

	return  new JAX.FX.Scrolling(null);
};

JAX.NullNode.prototype._showMessage = function(method, args) {
	var argsSerialized = "";
	for (var i=0, len=args.length; i<len; i++) {
		if (i) { argsSerialized += ", "; }
		
		try {
			argsSerialized += JSON.stringify(args[i]);
		} catch(e) {
			argsSerialized += "probably cyclic object";
		}
	}

	if (this._selector) {
		console.error("Hey man! You are trying to call '" + method + "(" + argsSerialized + ")' for null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Shit, it's screwed up! You are trying to call '" + method + "(" + argsSerialized + ")' for object that is not node (probably it is null or undefined).");
	}
};
/**
 * @fileOverview window.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0.1
 */

/**
 * @class JAX.Window
 * je třída reprezentující object Window. Implementuje následující rozhraní: {@link JAX.IListening}, {@link JAX.IScrollableNode}
 *
 * @param {object} win window
 */
JAX.Window = function(win) {
	this.___parent___.call(this, win);

	this.jaxNodeType = JAX.WINDOW;

	this.isWindow = true;
	this.isListenable = true;
	this.isScrollable = true;
};

JAX.extend(JAX.Window, JAX.Node);
JAX.mixin(JAX.Window, [JAX.IListening, JAX.IScrollableNode]);

/**
 * zjistí velikost okna dle zadaného typu, tedy šířku nebo výšku
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
 * @version 2.1
 */

/**
 * @class JAX.NodeArray
 * je třída reprezentující pole instancí JAX.Node a poskytující metody pro hromadné zpracování. Implementuje rozhraní {@link JAX.IIterable}
 *
 * @param {object || array} nodes Array of nodes || NodeList || JAX.NodeArray 
 */
JAX.NodeArray = function(nodes) {
	this.length = nodes.length;

	for(var i=0; i<this.length; i++) {
		var node = nodes[i];
		var jaxNode = node instanceof JAX.Node ? node : JAX(node);
		this[i] = jaxNode; 
	}
};

JAX.mixin(JAX.NodeArray, JAX.IIterable);

/**
 * najde element odpovídající selectoru v rámci tohoto pole elementů
 *
 * @param {string || object} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
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
 * najde elementy odpovídají selectoru v rámci tohoto pole elementů
 *
 * @param {string || object || array} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | Array of (HTMLElement | Text | HTMLDocument | Window | object)
 * @returns {JAX.NodeArray}
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
 * přidá prvek do pole
 *
 * @param {object} node uzel || JAX.Node
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.pushItem = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	this.length++;
	this[this.length - 1] = jaxNode;
	return this;
};

/**
 * vloží prvek na začátek pole
 *
 * @param {object} node uzel || JAX.Node
 * @returns {JAX.NodeArray}
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
 * umožňuje pracovat pouze s vybranou částí (rozsahem)
 *
 * @param {number} from od indexu - včetně
 * @param {number} to po index - včetně
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.limit = function(from, to) {
	return new JAX.NodeArray(this.items.apply(this, arguments));
};

/**
 * vrací pořadové číslo zadaného uzlu v poli nebo -1, pokud není nalezeno
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
 * provede filtraci pole skrze zadanou funkci. Princip funguje podobně jako u <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter">Array.filter</a>
 *
 * @param {function} func funkce, která se má provádět. Jako parametr je předána instance JAX.Node
 * @param {object} obj context, ve kterém se má fce provést
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.filterItems = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (func(item, i, this)) {
			filtered.push(item);
		}
	}

	return new JAX.NodeArray(filtered);
};

/**
 * iteruje pouze HTML elementy v poli a volá nad nimi zadanou funkci
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
 * pomocí zadané funkce vrací vyfiltrované pole. Prochází pouze HTML elementy, které jsou do funkce v každé iteraci jednotilvě předány a pokud splní podmínku, element se do vráceného filtrovaného pole zařadí.
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {JAX.NodeArray}
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
 * nastaví elementům classname
 *
 * @param {string} classNames třída nebo třídy oddělené mezerou
 * @returns {JAX.NodeArray}
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
 * vrací true, pokud všechny elementy mají nastavenu zadanou classname
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
 * pokud element classname má, tak jej odebere, jinak jej přidá
 *
 * @param {string} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.NodeArray}
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
 * odebere všem prvkům zadaný classname
 *
 * @param {string} classNames třída nebo třídy oddělené mezerou
 * @returns {JAX.NodeArray}
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
 * nastavuje innerHTML HTMLElementům v poli
 *
 * @param {string} innerHTML innerHTML elementu
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.html = function(innerHTML) {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (!item.isElement) { continue; }
		this[i].html(innerHTML);
	}
	return this;
};

/**
 * nastaví nebo získá hodnoty vlastností html atributů (ekvivaletní s metodou elm.setAttribute)
 *
 * @param {string || array || object} property název atributu || pole názvů atributů || asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {string || undefined} value nastaví hodnotu atributu; v případě že první parametr je pole, potom tuto hodnotu nastaví všem atributům v poli
 * @returns {string || JAX.NodeArray || object}
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
 * odstraní html atribut(y)
 *
 * @param {string || array} property název atributu nebo pole názvů atributů
 * @returns {JAX.NodeArray}
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
 * nastaví css (vlastnost elm.style) všem elementům v poli
 *
 * @param {string || array || object} property název vlastnosti || pole názvů vlastností || asociativní pole, např. {display:"block", color:"red"}
 * @param {string} value nastaví hodnotu vlastnosti; v případě že první parametr je pole, potom tuto hodnotu nastaví všem vlastnostem v poli
 * @returns {JAX.NodeArray}
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
 * nastaví vlastnost(i) všem elementům v poli
 *
 * @param {string || array || object} property název vlastnosti || pole názvů vlastností || asociativní pole, např. {id:"mojeId", checked:true}
 * @param {string} value nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {JAX.NodeArray}
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
 * připne všechny prvky do zadaného nodu na konec
 *
 * @param {object} node element || JAX.Node, do kterého se mají elementy připnout
 * @returns {JAX.NodeArray}
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
 * vloží všechny prvky do zadaného nodu na začátek
 *
 * @param {object} node element || JAX.Node, do kterého se mají elementy připnout
 * @returns {JAX.NodeArray}
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
 * vloží všechny prvky před zadaný node
 *
 * @param {object} node element || JAX.Node, před který se mají elementy připnout
 * @returns {JAX.NodeArray}
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
 * odebere všechny prvky z DOMu
 *
 * @returns {JAX.NodeArray}
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
 * zjistí, jestli všechny prvky jsou přímým nebo nepřímým potomkem zadaného elementu
 *
 * @param {object} node element || JAX.Node, který se bude testovat, jestli obsahuje pole prvků
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.areIn = function(node) {
	for (var i=0; i<this.length; i++) {
		if (!item.isMoveable) { continue; }
		if (!this[i].isIn(node)) { return false; }
	}

	return true;
};

/**
 * navěsí posluchač události na elementy a vrátí instanci JAX.ListenerArray, které obsahuje pole navěšených listenerů
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
 * odvěsí posluchače na základě typu události ("click", "mousedown", ...)
 *
 * @param {string} listener typ události
 * @returns {JAX.NodeArray}
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
 * vrátí první element (tedy s node.nodeType == 1) v poli
 *
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.firstElement = function() {
	for (var i=0; i<this.length; i++) {
		var item = this[i];
		if (item.isElement) { return item; }
	}

	return null;
};

/**
 * vrátí poslední element (tedy s node.nodeType == 1) v poli
 *
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.lastElement = function() {
	for (var i=this.length - 1; i>=0; i--) {
		var item = this[i];
		if (item.isElement) { return item; }
	}

	return null;
};

/** 
 * promaže nodům v poli jejich obsah (nepromazává samotné pole!)
 *
 * @returns {JAX.NodeArray}
 */
JAX.NodeArray.prototype.clear = function() {
	for (var i=this.length - 1; i>=0; i--) {
		var item = this[i];
		if (item.canHaveChildren || item.isText) { item.clear(); }
	}

	return this;
};

/**
 * animuje konkrétní css vlastnost. Aplikuje se na všechny animovatelné prvky v poli.
 *
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FXArray}
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
 * animuje průhlednost. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string} type "in" (od 0 do 1) nebo "out" (od 1 do 0)
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FXArray}
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
 * animuje průhlednost do určité hodnoty. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string || number} opacityValue hodnota průhlednosti, do které se má animovat. Jako výchozí se bere aktuální hodnota
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FXArray}
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
 * zobrazí element pomocí animace výšky nebo šířky. Aplikuje se na všechny animovatelné prvky v poli.
 * @param {string} type "down" nebo "up" pro animaci výšky nebo "left", "right" pro animaci šířky
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FXArray}
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
 * nascrolluje obsah na zadanou hodnotu. Lze zadat type "left" nebo "top", podle toho, kterým posuvníkem chceme hýbat. Pokud se zadá i duration, scrollování bude animované. Aplikuje se na všechny scrollovatelné prvky v poli.
 * @param {string} type "top" nebo "left", podle toho, jestli chceme hýbat s vertikálním nebo horizontálním posuvníkem
 * @param {number} value hodnota v px, kam se má scrollbar posunout
 * @param {string || number} duration délka animace; pokud není zadáno, neanimuje se
 * @returns {JAX.FXArray}
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.2
 */

/**
 * @class JAX.FX
 * je pomocník pro snadnější tvorbu animací
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX = function(elm) {
	this._jaxElm = elm instanceof JAX.Node ? elm : JAX(elm);
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
 * Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit.
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
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
 * Přidá transformační vlastnost (translateX, translateY, translateZ). Používá fallback pro prohlížeče, které transformace neumí a to přes elm.style.top a elm.style.left.
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
 * @returns {JAX.FX}
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
 * spustí animaci
 *
 * @returns {JAK.Promise}
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
 * funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onfulfill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onreject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {JAK.Promise}
 */ 
JAX.FX.prototype.then = function(onfulfill, onreject) {
	return this._promise.finished.then(onfulfill, onreject);
};

/**
 * stopne animaci a spustí její zpětný chod
 *
 * @returns {JAK.Promise}
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
 * zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 * 
 * @returns {JAX.FX}
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.FXArray
 * je třída rezrezentující pole JAX.FX instancí. Implementuje rozhraní {@link JAX.IIterable}
 *
 * @param {array} fxArray pole instancí JAX.FX
 */ 
JAX.FXArray = function(fxArray) {
	this.length = fxArray.length

	for (var i=0; i<this.length; i++) {
		this[i] = fxArray[i];
	}
};

JAX.mixin(JAX.FXArray, JAX.IIterable);

/**
 * spustí animace
 * 
 * @returns {JAX.FXArray}
 */ 
JAX.FXArray.prototype.run = function() {
	for (var i=0; i<this.length; i++) {
		this[i].run();
	}

	return this;
};

/**
 * funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulFill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {JAK.Promise}
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
 * stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 *
 * @returns {JAX.FXArray}
 */
JAX.FXArray.prototype.stop = function() {
	for (var i=0; i<this.length; i++) {
		this[i].stop();
	}

	return this;
};

/**
 * stopne animaci a spustí její zpětný chod
 *
 * @returns {JAX.FXArray}
 */
JAX.FXArray.prototype.reverse = function() {
	for (var i=0; i<this.length; i++) {
		this[i].reverse();
	}

	return this;
};
/**
 * @fileOverview fx-css3.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.3
 */

/**
 * @class JAX.FX.CSS3
 * je pomocník pro animaci pomocí CSS3 transitions
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.CSS3 = function(elm) {
	this._jaxElm = elm instanceof JAX.Node ? elm : JAX(elm);
	this._settings = [];
	this._maxDuration = 0;
	this._transitionCount = 0;
	this._ecTransition = null;
	this._fallbackTimeout = null;
	this._promise = {
		finished: null
	};
};

JAX.FX.CSS3._TRANSITION_PROPERTY = "";
JAX.FX.CSS3._TRANSITION_EVENT = "";

(function() {
	if (JAK.Browser.platform == "and") {
		/* protoze nektere android browsery chybne poskytuji detekci transition bez prefixu, budeme preferovat tu s prefixem, ktera funguje korektne */
		if ("WebkitTransition" in document.createElement("div").style) {
			JAX.FX.CSS3._TRANSITION_PROPERTY = "WebkitTransition";
			JAX.FX.CSS3._TRANSITION_EVENT = "webkitTransitionEnd";
			return;
		}
	}

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
			return; 
		}
	}
})();

/**
 * očekává pole objektů s nastavením jednotlivých animací
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
 * spustí CSS3 transition
 *
 * @returns {JAK.Promise}
 */
JAX.FX.CSS3.prototype.run = function() {
	this._promise.finished = new JAK.Promise();

	var tp = JAX.FX.CSS3._TRANSITION_PROPERTY;
	var te = JAX.FX.CSS3._TRANSITION_EVENT;
	var tps = [];
	var node = this._jaxElm.node();
	var style = node.style;
	var setting = null;

	for (var i=0, len=this._settings.length; i<len; i++) {
		setting = this._settings[i];
		var cssStartValue = setting.startValue + setting.startUnit;
		var transitionParam = this._styleToCSSProperty(setting.property) + " " + setting.durationValue + setting.durationUnit + " " + setting.method;
		this._maxDuration = Math.max(this._maxDuration, setting.durationValue);
		style[setting.property] = cssStartValue;
		tps.push(transitionParam);
		this._transitionCount++;
	}

	node.offsetHeight;

	setTimeout(function() {
		var style = node.style;
		style[tp] = tps.join(",");
		this._ecTransition = this._jaxElm.listen(te, this, "_finishTransitionAnimation");

		for (i=0, len=this._settings.length; i<len; i++) {
			var setting = this._settings[i];
			var cssEndValue = setting.endValue + setting.endUnit;
			style[setting.property] = cssEndValue;
		}

		this._fallbackTimeout = setTimeout(this._fallbackTerminate.bind(this), this._maxDuration + 100); /* fallback must be, because sometime css animation crash in FF */
	}.bind(this), 0);

	return this._promise.finished;
};

/**
 * stopne transition
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
	if (this._promise) {
		this._promise.finished.reject(this._jaxElm);
		this._promise = null;
	}

	this._clearTimeout();
};

JAX.FX.CSS3.prototype._fallbackTerminate = function() {
	while(this._transitionCount) { this._endTransition(); }

	this._finishTransitionAnimation();
};

JAX.FX.CSS3.prototype._endTransition = function() {
	if (!this._transitionCount) { return; }
	this._transitionCount--;
	if (this._transitionCount) { return; }

	this._ecTransition.unregister();
	this._ecTransition = null;
	this._jaxElm.node().style[JAX.FX.CSS3._TRANSITION_PROPERTY] = "";
};

JAX.FX.CSS3.prototype._finishTransitionAnimation = function() {
	this._endTransition();

	if (this._transitionCount) { return; }

	if (this._promise) {
		this._promise.finished.fulfill(this._jaxElm);
		this._promise = null;
	}

	this._clearTimeout();
};

JAX.FX.CSS3.prototype._styleToCSSProperty = function(property) {
	return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
};

JAX.FX.CSS3.prototype._clearTimeout = function() {
	if (this._fallbackTimeout) {
		clearTimeout(this._fallbackTimeout);
	}
	this._fallbackTimeout = null;
};
/**
 * @fileOverview fx-interpolator.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

(function() {
	if (!JAK || !JAK.CSSInterpolator || parseFloat(JAK.CSSInterpolator.VERSION) < 2.0) {
		throw new Error("Fatal error: JAK.CSSInterpolator was not found.");
	} 	
})();

/**
 * @class JAX.FX.Interpolator
 * je pomocník pro animaci pomocí interpolátoru
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.Interpolator = function(elm) {
	this._jaxElm = elm instanceof JAX.Node ? elm : JAX(elm);
	this._interpolators = [];
	this._interpolatorsCount = 0;
	this._settings = [];
	this._promise = {
		finished: null
	};
};

/**
 * očekává pole objektů s nastavením jednotlivých animací
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
 * spustí interpolátor
 *
 * @returns {JAK.Promise}
 */
JAX.FX.Interpolator.prototype.run = function() {
	this._promise.finished = new JAK.Promise();
	this._interpolators = [];
	this._start();
	return this._promise.finished;
};

/**
 * stopne interpolátor
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
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

(function() {
	if (!JAK || !JAK.Interpolator || parseFloat(JAK.Interpolator.VERSION) < 2.1) {
		throw new Error("Fatal error: JAK.Interpolator was not found.");
	} 	
})();

/**
 * @class JAX.FX.Scrolling
 * je pomocník pro animaci scrollování
 *
 * @param {object} elm HTMLElement || JAX.Node
 */
JAX.FX.Scrolling = function(elm) {
	this._jaxElm = elm instanceof JAX.Node ? elm : JAX(elm);
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
 * přidá atribut pro scrollování, který se bude animovat. Pro každou vlastnost lze zadat různou délku animace.
 * @param {string} property "left" nebo "top" pro scrollLeft respektive scrollTop
 * @param {number} value koncová hodnota v px
 * @param {number} duration délka animace v ms
 * @returns {JAX.FX.Scrolling}
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
 * spustí animaci
 *
 * @returns {JAK.Promise}
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
 * funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulfill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {JAK.Promise}
 */ 
JAX.FX.Scrolling.prototype.then = function(onFulfill, onReject) {
	return this._promises.animationFinished.then(onFulfill, onReject);
};

/**
 * stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 * 
 * @returns {JAX.FX.Scrolling}
 */
JAX.FX.Scrolling.prototype.stop = function() {
	if (!this._isRunning) { return this; }

	while(this._runningInterpolatorCount) {
		this._onScrollingFinished();
	}
	
	return this;
};

/**
 * stopne animaci a spustí její zpětný chod
 *
 * @returns {JAK.Promise}
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
 * zjistí, jestli animace právě běží
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

