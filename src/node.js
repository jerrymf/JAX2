/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.02
 */

/**
 * Třída reprezentující prvek v DOMu a poskytující rozšířené metody pro práci s ním
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.02"
});

JAX.Node.ELEMENT_NODE = 1;
JAX.Node.TEXT_NODE = 3;
JAX.Node.COMMENT_NODE = 8;
JAX.Node.DOCUMENT_NODE = 9;
JAX.Node.DOCUMENT_FRAGMENT_NODE = 11;

JAX.Node._events = [];
JAX.Node._MEASUREABLEVALUE_REGEXP = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;
JAX.Node._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i;
JAX.Node._BOX_SIZING = null;

(function() {
	var boxSizing = {
		"boxSizing": "box-sizing",
		"mozBoxSizing": "-moz-box-sizing",
		"WebkitBoxSizing": "-webkit-box-sizing"
	};

	var tempDiv = document.createElement("div");

	for (var i in boxSizing) {
		if (i in tempDiv.style) { JAX.Node._BOX_SIZING = boxSizing[i]; break; }
	}
})();

JAX.Node.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

/**
 * @method destructor - odvěsí všechny události a odstraní všechny reference na něj z JAXu. Voláme, pokud víme, že uzel už se do DOMu nikdy více nepřipne.
 * @example
 * JAX("#nejakeId").$destructor();
 */
JAX.Node.prototype.$destructor = function() {
	if ([1,9].indexOf(this._node.nodeType) != -1) { this.stopListening(); }

	this._node = null;
	this._jaxId = -1;
};

/**
 * @method vrací uzel, který si instance drží
 * @example
 * JAX("#nejakeId").node();
 *
 * @returns {DOMNode}
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * @method vyhledá a vrátí jeden DOM prvek, který odpovídá zadanému CSS3 (pro IE8 CSS2.1) selectoru
 * @example
 * JAX("#nejakeId").find(".trida"); // vrati prvni nalezeny prvek s classou trida v danem elementu
 *
 * @param {String} selector CSS3 (pro IE8 CSS2.1) selector
 * @returns {JAX.Node}
 */
JAX.Node.prototype.find = function(selector) {
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
JAX.Node.prototype.findAll = function(selector) {
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
JAX.Node.prototype.addClass = function(classNames) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.addClass","You can not use this method for this node. Doing nothing.", this._node);
		return this; 
	}
	
	if (typeof(classNames) != "string") { 
		classNames += "";
		JAX.Report.show("error","JAX.Node.addClass","Given arguments can be string, array of strings. Trying convert to string: " + classNames, this._node);
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
JAX.Node.prototype.removeClass = function(classNames) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.removeClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (typeof(classNames) != "string") {
		classNames += "";
		JAX.Report.show("error","JAX.Node.removeClass","Given arguments can be string, array of strings. Trying convert to string: " + classNames, this._node);
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
JAX.Node.prototype.hasClass = function(className) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.hasClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(className) != "string") {  
		className += "";
		JAX.Report.show("error","JAX.Node.hasClass","For first argument I expected string. Trying convert to string: " + className, this._node);
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
 * @method pokud element classu má, tak i odebere, jinak ji přidá
 * @example
 * JAX("body").toggleClass("trida");
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {JAX.Node}
 */
JAX.Node.prototype.toggleClass = function(className) {
	if (this.hasClass(className)) {
		this.removeClass(className);
	} else {
		this.addClass(className);
	}

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
JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.id","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this.attr("id"); 
	}

	if (typeof(id) != "string") {
		id += "";
		JAX.Report.show("warn","JAX.Node.id","For first argument I expected string. Trying convert to string: " + id, this._node);
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
JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.html","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this._node.innerHTML; 
	}

	if (typeof(innerHTML) != "string" && typeof(innerHTML) != "number") {
		innerHTML += "";
		JAX.Report.show("error","JAX.Node.html","For first argument I expected string or number. Trying convert to string: " + innerHTML, this._node);
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
JAX.Node.prototype.text = function(text) {
	if ([1,3,8].indexOf(this._node.nodeType) == -1) {
		JAX.Report.show("warn","JAX.Node.text","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		if ("innerHTML" in this._node) { return this._getText(this._node); }
		return this._nodeValue;
	}

	if ("innerHTML" in this._node) { 
		this.clear();
		this._node.appendChild(this._node.ownerDocument.createTextNode(text));
	} else if ("nodeValue" in this._node) {
		this._node.nodeValue = text;
	}

	return this;
};

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {String | Node | Node[] | JAX.NodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.Node}
 */
JAX.Node.prototype.add = function(nodes) {
	if (nodes instanceof JAX.NodeArray) {
		nodes = nodes.items();
	} else if (typeof(nodes) == "string") {
		var div = document.createElement("div");
		div.innerHTML = nodes;
		nodes = div.childNodes || [];
	} else if (!(nodes instanceof Array)) { 
		nodes = [].concat(nodes); 
	} 
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !(node instanceof JAX.Node)) { 
			throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them."); 
		}
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @param {Node | JAX.Node} nodeBefore DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	if (node && typeof(node) != "object" || (!node.nodeType && !(node instanceof JAX.Node))) { 
		throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); 
	}
	if (nodeBefore && typeof(nodeBefore) != "object" || (!nodeBefore.nodeType && !(nodeBefore instanceof JAX.Node))) { 
		throw new Error("For second argument I expected html element, text node or JAX.Node instance"); 
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
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.appendTo = function(node) {
	var node = JAX(node);

	if (node) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	throw new Error("I could not find given element. For first argument I expected html element, documentFragment or JAX.Node instance");
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").before(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.before = function(node) {
	var node = JAX(node);

	if (node) {
		var node = node.jaxNodeType ? node.node() : node;
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	throw new Error("I could not find given element. For first argument I expected html element, text node or JAX.Node instance");
};

/**
 * @method připne (přesune) element za jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").after(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.after = function(node) {
	var node = JAX(node);

	if (node) {
		var node = node.jaxNodeType ? node.node() : node;

		if (node.nextSibling) {
			node.parentNode.insertBefore(this._node, node.nextSibling);
		} else {
			node.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	throw new Error("I could not find given element. For first argument I expected html element, text node or JAX.Node instance");
};

/**
 * @method odstraní zadaný element z DOMu a nahradí ho za sebe
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span.novy").replaceWith(document.body.lastChild); // odstrani prvek a nahradi ho za sebe
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.replaceWith = function(node) {
	var node = JAX(node);

	if (node) { 
		var node = node.jaxNodeType ? node.node() : node;
		this.before(node);
		node.parentNode.removeChild(node);
		return this;
	}

	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.remove = function() {
	if ([9,11].indexOf(this._node.nodeType) != -1) { 
		JAX.Report.show("warn","JAX.Node.remove","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	this._node.parentNode.removeChild(this._node);

	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.Node
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.Node}
 */
JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.clone","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);

	if (clone.removeAttribute) {
		clone.removeAttribute("data-jax-id");
	}

	if (clone.querySelectorAll) {
		var nodeList = clone.querySelectorAll("*[data-jax-id]");
		for (var i=0, len=nodeList.length; i<len; i++) { nodeList[i].removeAttribute("data-jax-id"); }
	}

	return new JAX.Node(clone);
};

/**
 * @method navěsí posluchač události na element a vrátí event id. Pokud událost proběhne, vyvolá se zadané funkce. Do této funkce jsou pak předány parametry event (window.Event), jaxlm (instance JAX.Node) a bindData
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var func = function(jaxE, jaxElm) { alert(jaxElm.html()); };
 * var eventId = JAX(document.body.firstChild).listen("click", func); // navesi udalost click na span
 *
 * @param {String} type typ události, na kterou chceme reagovat ("click", "mousedown", ...)
 * @param {Object} obj objekt, ve které se metoda uvedená pomocí stringu nachází. Pokud je funcMethod function, tento parameter lze nechat prázdný nebo null
 * @param {String | Function} funcMethod název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {any} bindData pokud je potřeba přenést zároveň s tím i nějakou hodnotu (String, Number, Asociativní pole, ...)
 * @returns {String} Event ID
 */
JAX.Node.prototype.listen = function(type, obj, funcMethod, bindData) {
	if ([1,9].indexOf(this._node.nodeType) == -1) { 
		JAX.Report.show("warn","JAX.Node.listen","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (!funcMethod) {
		var funcMethod = obj;
		obj = window;
	}

	if (typeof(type) != "string") { 
		type += "";
		JAX.Report.show("error","JAX.Node.listen","For first argument I expected string. Trying convert to string: " + type, this._node);
	}

	if (typeof(funcMethod) != "string" && typeof(funcMethod) != "function") { 
		throw new Error("For second argument I expected string or function"); 
	}

	if (typeof(obj) != "object") { 
		throw new Error("For third argument I expected referred object"); 
	}

	if (typeof(funcMethod) == "string") {
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("Given method in second argument was not found in referred object given in third argument"); } 
		funcMethod = funcMethod.bind(obj);
	}

	var f = function(e) { 
		funcMethod(new JAX.Event(e), bindData); 
	};
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var objListener = new JAX.Listener(this, listenerId, type, f);
	var allNodes = JAX.Node._events;
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
JAX.Node.prototype.stopListening = function(listener) {
	if ([1,9].indexOf(this._node.nodeType) == -1) { 
		JAX.Report.show("warn","JAX.Node.stopListening","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var allNodes = JAX.Node._events;
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

	JAX.Report.show("error","JAX.Node.stopListening","For first argument I expected JAX.Listener instance , string with event type or you can call it without arguments.");

	return this;
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
 * @returns {String | Object | JAX.Node}
 */
JAX.Node.prototype.prop = function(property, value) {
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
JAX.Node.prototype.attr = function(property, value) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.attr","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

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
JAX.Node.prototype.css = function(property, value) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.css","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

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
JAX.Node.prototype.computedCss = function(properties) {
	if (this._node.nodeType != 1) { 
		JAX.Report.show("warn","JAX.Node.computedCss","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(properties) == "string") {
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
JAX.Node.prototype.fullSize = function(sizeType, value) {
	if ([1].indexOf(this._node.nodeType) == -1) { 
		JAX.Report.show("warn","JAX.Node.fullSize","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (arguments.length == 1) { 
		var backupStyle = this.css(["display","visibility","position"]);

		this.css({"display":"", "visibility":"hidden", "position":"absolute"});

		var size = sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight;
		this.css(backupStyle);
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
JAX.Node.prototype.size = function(sizeType, value) {
	if ([1].indexOf(this._node.nodeType) == -1) { 
		JAX.Report.show("warn","JAX.Node.fullSize","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (arguments.length == 1) { 
		var size = parseInt(this.computedCss(sizeType), 10);
		if (isFinite(size)) { return size; }

		var backupStyle = this.css(["display","visibility","position"]);
		var isFixedPosition = this.computedCss("position").indexOf("fixed") == 0;
		var isDisplayNone = this.css("display").indexOf("none") == 0;

		if (!isFixedPosition) { this.css("position","absolute"); }
		if (isDisplayNone) { this.css("display",""); }		
		this.css("visibility","hidden");

		size = this._getSizeWithBoxSizing(sizeType);
		this.css(backupStyle);
		return size; 
	}

	var value = parseInt(value, 10);
	this._node.style[sizeType]= Math.max(value,0) + "px";
	return this;
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.parent = function() {
	if (this._node.parentNode) { return new JAX.Node(this._node.parentNode); }
	return null;
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.next = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : null;
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.previous = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : null;
};

/** 
 * @method vrací instanci JAX.NodeArray, která obsahuje všechny přímé potomky uzlu
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(body.children().length);
 *
 * @returns {JAX.NodeArray}
 */
JAX.Node.prototype.children = function(index) {
	if (!this._node.childNodes) { return null; }

	if (!arguments.length) {
		var nodes = [];
		for (var i=0, len=this._node.childNodes.length; i<len; i++) {
			nodes.push(JAX(this._node.childNodes[i]));
		}
		return new JAX.NodeArray(nodes);
	}

	var child = this._node.childNodes[index];
	if (child) {
		return new JAX.Node(child);
	}

	return null;
};

/** 
 * @method vrací první html element (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body").first().prop("tagName") == "span");
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.first = function() {
	if ("firstElementChild" in this._node) {
		return this._node.firstElementChild ? new JAX.Node(this._node.firstElementChild) : null;
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return null; }
	
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return new JAX.Node(childNode); }
	}

	return null;
};

/** 
 * @method vrací poslední uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").last().node() == JAX("body span").first().node();
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.last = function() {
	if ("lastElementChild" in this._node) {
		return this._node.lastElementChild ? new JAX.Node(this._node.lastElementChild) : null;
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return null; }
	
	for (var i=this._node.childNodes.length - 1; i>-1; i--) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return new JAX.Node(childNode); }
	}

	return null;
};

/** 
 * @method promaže element
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * body.clear();
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.clear = function() {
	if ([1,3,11].indexOf(this._node.nodeType) == -1) { 
		JAX.Report.show("warn","JAX.Node.clear","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (this._node.nodeType == 3) {
		this._node.nodeValue = "";
		return this;
	}

	JAK.DOM.clear(this._node);

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
JAX.Node.prototype.eq = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node() : node;
		return elm == this._node;
	} else if (typeof(node) == "string") {
		if (/^[a-zA-Z0-9]+$/g.test(node)) { return !!(this._node.tagName && this._node.tagName.toLowerCase() == node); }
		return !!this.parent().findAll(node).filterItems(
			function(jaxElm) { return jaxElm.eq(this._node); }.bind(this)
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
JAX.Node.prototype.contains = function(node) {
	if (!node) { return false; }

	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) == "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	} else if (typeof(node) == "string") {
		return !!this.find(node);
	}
	
	throw new Error("For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node instance");
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * if (JAX("em").isIn("span")) { alert("Span obsahuje em"); }
 *
 * @param {Node | JAX.Node | String} node uzel | instance JAX.Node | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.Node.prototype.isIn = function(node) {
	if (!node) { return false; }

	if ([1,3,8].indexOf(this._node.nodeType) == -1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) == "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node : new JAX.Node(node);
		return elm.contains(this);
	} else if (typeof(node) == "string") {
		if (/^[a-zA-Z0-9]+$/g.test(node)) { 
			var parent = this._node;
			node = node.toLowerCase();
			while((parent = parent.parentNode)) {
				if (parent.tagName && parent.tagName.toLowerCase() == node) { return true; }
			}
			return false;
		}
		return !!JAX.all(node).filterItems(
			function(jaxElm) { return jaxElm.contains(this._node); }.bind(this)
		).length;
	}
	
	throw new Error("For first argument I expected html element or JAX.Node instance");
};

JAX.Node.prototype.animate = function(property, duration, start, end) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.animate","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (typeof(property) != "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.animate","For first argument I expected string. Trying convert to string: " + type, this._node); 
	}

	if (duration < 0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.animate","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
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
 * @param {Number} duration délka animace v sec
 * @returns {JAX.FX}
 */
JAX.Node.prototype.fade = function(type, duration) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(type) != "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.fade","For first argument I expected string. Trying convert to string: " + type, this._node); 
	}

	var duration = parseFloat(duration) || 0;
	if (duration < 0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fade","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	switch(type) {
		case "in":
			return this.animate("opacity", duration, 0, 1);	
		break;
		case "out":
			return this.animate("opacity", duration, 1, 0);
		break;
		default:
			JAX.Report.show("warn","JAX.Node.fade","I got unsupported type '" + type + "'.", this._node);
			return this;
	}
};

/**
 * @method animuje průhlednost do určité hodnoty
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * JAX("body div").fadeTo(0.5, 2);
 *
 * @param {Number} opacityValue do jaké hodnoty od 0 do 1 se má průhlednost animovat
 * @param {Number} duration délka animace v sec
 * @returns {JAX.FX}
 */
JAX.Node.prototype.fadeTo = function(opacityValue, duration) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.fadeTo","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	var opacityValue = parseFloat(opacityValue) || 0;
	var duration = parseFloat(duration) || 0;

	if (opacityValue<0) {
		opacityValue = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}
	if (duration<0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
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
 * @param {Number} duration délka animace v sec
 * @returns {JAX.FX}
 */
JAX.Node.prototype.slide = function(type, duration) {
	if (this._node.nodeType != 1) {
		JAX.Report.show("warn","JAX.Node.slide","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (typeof(type) != "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.slide","For first argument I expected string. Trying convert to string: " + type, this._node);
	}
	if (duration<0) {
		duration = 0;
		JAX.Report.show("error","JAX.Node.slide","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
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
			JAX.Report.show("warn","JAX.Node.slide","I got unsupported type '" + type + "'.", this._node);
			return this;
	}

	this.css("overflow", "hidden");

	var func = function() { this.css(backupStyles); }.bind(this);

	return this.animate(property, duration, start, end).then(func);
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

	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.NODE.OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Node.prototype._getSizeWithBoxSizing = function(sizeType, value) {
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
	
	if (paddingX && isFinite(paddingX)) { value =- paddingX; }
	if (paddingY && isFinite(paddingY)) { value =- paddingY; }
	if (borderX && isFinite(borderX)) { value =- borderX; }
	if (borderY && isFinite(borderY)) { value =- borderY; }

	return value;
};

JAX.Node.prototype._getText = function(node) {
	var text = "";
	for (var i=0, len=node.childNodes.length; i<len; i++) {
		var child = node.childNodes[i];
		var tagName = child.tagName ? child.tagName.toLowerCase() : "";
		if (child.childNodes && child.childNodes.length) { text += this._getText(child); continue; }
		if (tagName == "br") { text += "\n"; continue; }
		if (child.nodeValue) { text += child.nodeValue; }
	}
	return text;
};

JAX.Node.prototype._destroyEvents = function(eventListeners) {
	for (var i=0, len=eventListeners.length; i<len; i++) { 
		var eventListener = eventListeners[i].id();
		JAK.Events.removeListener(eventListener);
	}
};

