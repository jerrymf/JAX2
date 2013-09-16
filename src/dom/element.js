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
	EXTEND: JAX.Node,
	IMPLEMENT: JAX.IListening
});

JAX.Element._events = [];
JAX.Element._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i;
JAX.Element._BOX_SIZING = null;

(function() {
	var boxSizing = {
		"boxSizing": "box-sizing",
		"mozBoxSizing": "-moz-box-sizing",
		"WebkitBoxSizing": "-webkit-box-sizing"
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
	if (typeof(classNames) != "string") {
		classNames += "";
		JAX.Report.error("Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");
	
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
	if (typeof(classNames) != "string") {
		classNames += "";
		JAX.Report.error("Given argument can be only string.", this._node);
	}

	var cNames = classNames.split(" ");
	
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
	if (typeof(className) != "string") {
		className += "";  
		JAX.Report.error("For my argument I expected string.", this._node);
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
	if (typeof(className) != "string") {
		className += "";
		JAX.Report.error("For my argument I expected string.", this._node);
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
		JAX.Report.error("For my argument I expected string.", this._node);
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
		JAX.Report.error("For my argument I expected string or number.", this._node);
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
		JAX.Report.error("For my argument I expected string or number.", this._node);
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

	JAX.Report.error("For first argument I expected string or array of strings.", this._node);
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
	
	JAX.Report.error("For first argument I expected html element, text node, string with CSS3 compatible selector or JAX node.");
	return false;
};

JAX.Element.prototype.animate = function(property, duration, start, end) {
	if (typeof(property) != "string") {
		type += "";
		JAX.Report.error("For first argument I expected string.", this._node); 
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
		JAX.Report.error("For first argument I expected string.", this._node); 
	}

	switch(type) {
		case "in":
			return this.animate("opacity", duration, 0, 1);	
		break;
		case "out":
			return this.animate("opacity", duration, 1, 0);
		break;
		default:
			JAX.Report.error("I got unsupported type '" + type + "'.", this._node);
			return new JAK.Promise().reject(this._node);
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
		JAX.Report.error("For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
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
		JAX.Report.error("For first argument I expected string.", this._node);
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
			JAX.Report.error("I got unsupported type '" + type + "'.", this._node);
			return this;
	}

	this.css("overflow", "hidden");

	var func = function() { this.css(backupStyles); }.bind(this);
	var promise = this.animate(property, duration, start, end);
	promise.then(func);

	return promise;
};

JAX.Element.prototype.scrollMax = function(type) {
	if (typeof(type) != "string") {
		JAX.Report.error("I expected string for my argument.", this._node);
		type += "";
	}

	switch(type.toLowerCase()) {
		case "x":
			return this._node.scrollWidth - this._node.clientWidth;
		case "y":
			return this._node.scrollHeight - this._node.clientHeight;
		default:
			JAX.Report.error("You gave me an unsupported type. I expected 'x' or 'y'.", this._node);
			return 0;
	}
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
		this._node.style.filter.replace(JAX.NODE.OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Element.prototype._getSizeWithBoxSizing = function(sizeType, value) {
	var boxSizing = JAX.Node._BOX_SIZING ? this.computedCss(JAX.Node._BOX_SIZING) : null;

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
		if (tagName == "br") { text += "\n"; continue; }
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
