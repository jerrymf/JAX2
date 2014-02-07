/**
 * @fileOverview nodearray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * @class JAX.NodeArray
 * je třída reprezentující pole instancí JAX.Node a poskytující metody pro hromadné zpracování
 */
JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "2.1",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @see JAX.IIterable
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
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return new JAX.NodeArray(filtered);
};

/**
 * vrátí první element (tedy s node.nodeType == 1) v poli
 *
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.firstElement = function() {
	for (var i=0; i<this.length; i++) {
		if (this[i].isElement) { return this[i]; }
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
		if (this[i].isElement) { return this[i]; }
	}

	return null;
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
