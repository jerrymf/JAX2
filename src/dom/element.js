/**
 * @fileOverview element.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.Element
 * je třída reprezentující HTML Element
 *
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
 * @see JAX.ISearchableNode
 * @see JAX.IMoveableNode
 * @see JAX.INodeWithChildren
 * @see JAX.IListening
 * @see JAX.IAnimateableNode
 * @see JAX.IScrollableNode
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
 * přidá zadané css třídu nebo třídy k elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {JAX.Node}
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
 * odstraní zadané css třídu nebo třídy z elementu
 *
 * @param {string} classNames css třída nebo třídy oddělené mezerou (píše se bez tečky na začátku)
 * @returns {JAX.Node}
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
 * zjistí, jestli element má nastavenu zadanou css třídu
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {boolean}
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
 * pokud má element css třídu již nastavenu, tak ji odebere, pokud nikoliv, tak ji přidá
 *
 * @param {string} className css třída (píše se bez tečky na začátku)
 * @returns {JAX.Node}
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
 * volání bez parametru zjistíme, jaké id má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} id id elementu
 * @returns {string || JAX.Node}
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
 * volání bez parametru zjistíme, jaké innerHTML má element nastaveno, voláním s parametrem ho nastavíme
 *
 * @param {string || undefined} id innerHTML elementu
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
}

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
	if ("innerHTML" in this._node) {
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
