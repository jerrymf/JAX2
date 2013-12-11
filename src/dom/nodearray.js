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
 * @method $constructor
 *
 * @param {Object || Array} nodes Array || NodeList || JAX.NodeArray 
 */
JAX.NodeArray.prototype.$constructor = function(nodes) {
	this.length = nodes.length;

	for(var i=0; i<this.length; i++) {
		var node = nodes[i];
		var jaxNode = node instanceof JAX.Node ? node : JAX(node);
		this[i] = jaxNode; 
	}
};

JAX.NodeArray.prototype.find = function(selector) {
	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		var node = jaxElm.n;
		var parentNode = node.parentNode;

		if ([1,9,11].indexOf(jaxElm.jaxNodeType) == -1) { continue; }

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

JAX.NodeArray.prototype.findAll = function(selector) {
	var foundElms = [];

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		var node = jaxElm.n;
		var parentNode = node.parentNode;

		if ([1,9,11].indexOf(jaxElm.jaxNodeType) == -1) { continue; }

		if (!parentNode) {
			parentNode = document.createDocumentFragment();
			parentNode.appendChild(node);

			var jaxElms = JAX(parentNode).findAll(selector);

			parentNode.removeChild(node);
		} else {
			var jaxElms = JAX(parentNode).findAll(selector);
		}

		if (!jaxElms.length) { continue; }
		foundElms = foundElms.concat(jaxElms.items());
	}

	foundElms = foundElms.filter(function(elm, index, array) {
		for (var i=0, len=array.length; i<len; i++) {
			if (foundElms[i].n != elm.n) { continue; }
			return i == index;
		}
	});

	return JAX.all(foundElms);
};

/**
 * @method přidá prvek do pole
 *
 * @param {Object} node uzel || JAX.Node
 * @returns {Object} JAX.NodeArray
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
 * @returns {Object} JAX.NodeArray
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
 * @param {Number} from od indexu
 * @param {Number} to po index
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.limit = function(from, to) {
	return new JAX.NodeArray(this.items.apply(this, arguments));
};

/**
 * @method vrací pořadové číslo zadaného uzlu v poli nebo -1, pokud není nalezeno
 *
 * @returns {Number}
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
 * @method nastaví elementům classname
 *
 * @param {String} classNames třída nebo třídy oddělené mezerou
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.addClass = function(classNames) {
	for (var i=0; i<this.length; i++) { 
		this[i].addClass(classNames); 
	}
	return this;
};

/**
 * @method vrací true, pokud všechny elementy mají nastavenu zadanou classname
 *
 * @param {String} classNames třída
 * @returns {Boolean}
 */
JAX.NodeArray.prototype.haveClass = function(className) {
	for (var i=0; i<this.length; i++) { 
		if (!this[i].hasClass(className)) { return false; } 
	}
	return true;
};

/**
 * @method pokud element classname má, tak jej odebere, jinak jej přidá
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.toggleClass = function(className) {
	for (var i=0; i<this.length; i++) { 
		this[i].toggleClass(className);
	}
	return this;	
};

/**
 * @method odebere všem prvkům zadaný classname
 *
 * @param {String} classNames třída nebo třídy oddělené mezerou
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.removeClass = function(classNames) {
	for (var i=0; i<this.length; i++) { 
		this[i].removeClass(classNames); 
	}
	return this;
};

/**
 * @method nastaví html atribut(y)
 *
 * @param {String || Array || Object} property název atributu nebo pole názvů atributů nebo asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {String} value hodnota atributu
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.attr = function(property, value) {
	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		jaxElm.attr.apply(jaxElm, arguments);
	}
	return this;
};

/**
 * @method odstraní html atribut(y)
 *
 * @param {String || Array} property název atributu nebo pole názvů atributů
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.removeAttr = function(properties) {
	for (var i=0; i<this.length; i++) { 
		this[i].removeAttr(properties);
	}
	return this;
};

/**
 * @method nastaví css (vlastnost style) všem elementům v poli
 *
 * @param {String || Array || Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {display:"block", color:"red"}
 * @param {String} value provede se nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.css = function(property, value) {
	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i]; 
		jaxElm.css.apply(jaxElm, arguments);
	}
	return this;
};

/**
 * @method nastaví vlastnost(i) všem elementům v poli
 *
 * @param {String || Array || Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {String} value nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.prop = function(property, value) {
	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		jaxElm.prop.apply(jaxElm, arguments);
	}
	return this;
};

/**
 * @method připne všechny prvky do zadaného nodu
 *
 * @param {Object} node element, do kterého se mají elementy připnout
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0; i<this.length; i++) {
		this[i].appendTo(node);
	}
	return this;
};

/**
 * @method připne všechny prvky před zadaný uzel
 *
 * @param {Object} node element, před který se mají elementy připnout
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.before = function(node) {
	for (var i=0; i<this.length; i++) {
		this[i].before(node);
	}
	return this;
}

/**
 * @method odebere všechny prvky z DOMu
 *
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.remove = function() {
	for (var i=0; i<this.length; i++) { 
		this[i].remove(); 
	}
	return this;
};

/**
 * @method zjistí, jestli všechny prvky jsou přímým nebo nepřímým potomkem zadaného elementu
 *
 * @param {Object} node element, který se bude testovat, jestli obsahuje pole prvků
 * @returns {Object} JAX.NodeArray
 */
JAX.NodeArray.prototype.areIn = function(node) {
	for (var i=0; i<this.length; i++) {
		if (!this[i].isIn(node)) { return false; }
	}

	return true;
};

/**
 * @method "zničí" všechny nody, které si drží. Čili odvěsí posluchače, odebere z DOMu a zruší veškeré reference na ně v JAXu
 *
 * @returns {Undefined}
 */
JAX.NodeArray.prototype.destroyNodes = function() {
	for (var i=0; i<this.length; i++) {
		this[i].$destructor();
		delete this[i];
		this.length--;
	}

	return;
};

JAX.NodeArray.prototype.listen = function(type, obj, funcMethod, bindData) {
	var listeners = new Array(this.length);
	for(var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		listeners[i] = jaxElm.listen.apply(jaxElm, arguments);
	}
	return new JAX.ListenerArray(listeners);
};

JAX.NodeArray.prototype.stopListening = function(type) {
	for (var i=0; i<this.length; i++) {
		this[i].stopListening(type);
	}
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
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return new JAX.NodeArray(filtered);
};

JAX.NodeArray.prototype.firstElement = function() {
	for (var i=0; i<this.length; i++) {
		if (this[i].jaxNodeType == 1) { return this[i]; }
	}

	return null;
};

JAX.NodeArray.prototype.lastElement = function() {
	for (var i=this.length - 1; i>=0; i--) {
		if (this[i].jaxNodeType == 1) { return this[i]; }
	}

	return null;
};

JAX.NodeArray.prototype.animate = function(type, duration, start, end) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		fxs[i] = jaxElm.animate.apply(jaxElm, arguments);
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
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		fxs[i] = jaxElm.fade.apply(jaxElm, arguments);
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
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		fxs[i] = jaxElm.fadeTo.apply(jaxElm, arguments);
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
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		fxs[i] = jaxElm.slide.apply(jaxElm, arguments);
	}
	return new JAX.FXArray(fxs);
};

JAX.NodeArray.prototype.scroll = function(type, value, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		var jaxElm = this[i];
		fxs[i] = jaxElm.scroll.apply(jaxElm, arguments);
	}
	return new JAX.FXArray(fxs);
};
