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
	var nodesLength = nodes.length;
	this.length = nodesLength;

	for(var i=0; i<nodesLength; i++) {
		var node = nodes[i];
		var jaxNode = node instanceof JAX.Node ? node : JAX(node);
		this[i] = jaxNode; 
	}
};

JAX.NodeArray.prototype.exist = function() {
	return !!this.length;
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
	return this[index];
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
	var from = parseFloat(from) || 0;
	var to = parseFloat(to) || this._jaxNodes.length;
	var items = new Array(this.length);

	for (var i=from; i<to; i++) {
		items[i] = this[i];
	}

	return items; 
};

JAX.NodeArray.prototype.limit = function(from, to) {
	return new JAX.NodeArray(this.items.apply(this, arguments));
};

JAX.NodeArray.prototype.index = function(item) {
	var item = item instanceof JAX.Node ? item : JAX(item);
	var nodeTarget = item.node();

	for (var i=0; i<this.length; i++) {
		var nodeSource = this[i].node();
		if (nodeSource == nodeTarget) { return i; }
	}

	return -1;
};

JAX.NodeArray.prototype.firstElement = function() {
	for (var i=0; i<this.length; i++) {
		if (this[i].jaxNodeType == 1) { return this[i]; }
	}

	return new JAX.NullNode();
};

JAX.NodeArray.prototype.lastElement = function() {
	for (var i=this.length; i>=0; i--) {
		if (this[i].jaxNodeType == 1) { return this[i]; }
	}

	return new JAX.NullNode();
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) { 
		if (!this[i].hasClass(className)) { return false; } 
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
	for (var i=0; i<this.length; i++) { 
		this[i].toggleClass(className);
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
		jaxNode.attr(property, value);
	}
	return this;
};

JAX.NodeArray.prototype.removeAttr = function(properties) {
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) {
		this[i].appendTo(node);
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
	for (var i=0; i<this.length; i++) {
		this[i].before(node);
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
	for (var i=0; i<this.length; i++) { 
		var jaxNode = this[i];
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
	for (var i=0; i<this.length; i++) {
		var jaxNode = this[i];
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
		listeners[i] = this[i].listen(type, obj, funcMethod, bindData);
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
	var func = obj ? func.bind(obj) : func;

	for (var i=0; i<this.length; i++) {
		func(this[i], i, this);
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

/**
 * @method vrátí první prvek v poli
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.firstItem = function() {
	return this[0] || new JAX.NullNode();
};

/**
 * @method vrátí poslední prvek v poli
 * @returns {JAX.Node}
 */
JAX.NodeArray.prototype.lastItem = function() {
	return this[this.length - 1] || new JAX.NullNode();
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
	var jaxNode = jaxNode instanceof JAX.Node ? node : JAX(node);
	this.length++;
	this[this.length - 1] = jaxNode;
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
	if (this.length > 0) {
		var jaxNode = this[this.length - 1];
		delete this[this.length - 1];
		this.length--;
		return jaxNode;
	}
	return new JAX.NullNode();
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
	var jaxNode = this[0];
	if (jaxNode) {
		this.length--;
		for (var i=0; i<this.length; i--) {
			this[i] = this[i+1];
		}
		return jaxNode;
	}

	return new JAX.NullNode();
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
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	this.length++;
	for (var i=this.length - 1; i>0; i--) {
		this[i] = this[i - 1];
	}
	this[0] = jaxNode;

	return this;
};

JAX.NodeArray.prototype.animate = function(type, duration, start, end) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		fxs[i] = this[i].animate(type, duration, start, end);
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
		fxs[i] = this[i].fade(type, duration);
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
		fxs[i] = this[i].fadeTo(opacityValue, duration);
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
		fxs[i] = this[i].slide(type, duration).getPromise();
	}
	return new JAX.FXArray(fxs);
};

JAX.NodeArray.prototype.scroll = function(type, value, duration) {
	var count = this.length;
	var fxs = new Array(count);

	for (var i=0; i<this.length; i++) {
		fxs[i] = this[i].scroll(type, value, duration);
	}
	return new JAX.FXArray(fxs);
};
