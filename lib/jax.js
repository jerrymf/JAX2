/**
 * @fileOverview core.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * @method Najde element, který odpovídá selector a vrátí instanci JAX.Node
 * @example
 * var jaxNode = JAX("#ads"); // vrati element s id ads
 *
 * @param {String|Node|JAX.Node} selector Řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.Node|null}
 */
var JAX = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.Node.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return JAX.Node.create(selector);
	} else if (selector && selector instanceof JAX.Node) {
		return selector;
	}

	return null;
};

/**
 * @method Najde elementy, které odpovídají selectoru a vrátí instanci JAX.NodeArray
 * @example
 * var jaxNodes = JAX.all("div.example"); // najde vsechny divy s className example a vrati instanci JAX.NodeArray
 *
 * @param {String|Node|JAX.Node} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.NodeArray|null}
 */
JAX.all = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.Node.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX.Node.create(selector));
	} else if (selector && selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return null;
};

/**
 * @method Vytvoří element na základě zadaných parametrů a vrátí JAX.Node instanci
 * @example
 * var elm = JAX.make("div#ads.column"); // vytvori element div s id ads a className column
 *
 * @param {String} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) !== "string") { 
		throw new Error("First argument must be string."); 
	}
	if (typeof(attrs) !== "object") { 
		throw new Error("Second argument must be associative array."); 
	}
	if (typeof(styles) !== "object") { 
		throw new Error("Third argument must be associative array."); 
	}
	if (typeof(srcDocument) !== "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) === -1) { 
		throw new Error("Fourth argument must be document element."); 
	}

	var tagName = tagString.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/g) || [];

	if (tagName.length === 1) {
		tagString = tagString.substring(tagName[0].length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
	}
	
	var attrType = "";
	for (var i=0, len=tagString.length; i<len; i++) {
		var ch = tagString[i];
		if (ch === "#") { 
			attrType = "id"; 
			attrs["id"] = "";
		} else if (ch === ".") { 
			attrType = "className";
			if (attrs["className"]) { 
				attrs["className"] += " ";
			} else {
				attrs["className"] = "";
			}
		} else if (attrType) {
			attrs[attrType] += ch;
		}	
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.Node.prototype);
	f._init(createdNode);
	
	return f;
};

/**
 * @method Vytvoří textový uzel a vrátí JAX.Node instanci
 * @example
 * var textNode = JAX.makeText("Hellow world");
 *
 * @param {String} text text, který má uzel obsahovat
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.makeText = function(text, srcDocument) {
	return JAX.Node.create((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 * @example
 * console.log(JAX.getTypeOf(10)); // vrati "number"
 * console.log(JAX.getTypeOf("10")); // vrati "string"
 *
 * @param value testovana hodnota
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) === "number") {
		return "number";
	} else if (typeof(value) === "string") {
		return "string";
	} else if (typeof(value) === "undefined") {
		return "undefined";
	} else if (typeof(value) === "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult === "[object Array]") {
		return "array";	
	} else if (toStringResult === "[object Date]") {
		return "date";
	}

	return "object";
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
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.0"
});

JAX.Node.ELEMENT_NODE = 1;
JAX.Node.TEXT_NODE = 3;
JAX.Node.COMMENT_NODE = 8;
JAX.Node.DOCUMENT_NODE = 9;
JAX.Node.DOCUMENT_FRAGMENT_NODE = 11;

JAX.Node.instances = {};
JAX.Node.instances[JAX.Node.ELEMENT_NODE] = {};
JAX.Node.instances[JAX.Node.TEXT_NODE] = {};
JAX.Node.instances[JAX.Node.COMMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_FRAGMENT_NODE] = {};

JAX.Node._ids = {};
JAX.Node._ids[JAX.Node.ELEMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.TEXT_NODE] = 0;
JAX.Node._ids[JAX.Node.COMMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_FRAGMENT_NODE] = 0;

JAX.Node._MEASUREABLEVALUE_REGEXP = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;
JAX.Node._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i
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

/**
 * @static Tovární metoda. Slouží k vytvoření instance JAX.Node. Používejte, prosím, tuto metodu. Nevolejte JAX.Node s operátorem new.
 * @example
 * var jaxElm = JAX.Node.create(document.body.firstChild);
 *
 * @param {HTMLElm} node DOM uzel
 * @returns {JAX.Node}
 */
JAX.Node.create = function(node) {
	if (typeof(node) === "object" && node.nodeType) {
		var nodeType = node.nodeType;

		if (nodeType in JAX.Node.instances) {
			switch(nodeType) {
				case JAX.Node.ELEMENT_NODE:
					var jaxId = parseInt(node.getAttribute("data-jax-id"),10);
					if (typeof(jaxId) !== "number") { jaxId = -1; }
					if (jaxId > -1) {
						var item = JAX.Node.instances[JAX.Node.ELEMENT_NODE][jaxId];
						if (item) {
							if (item.instance.node() == node) { return item.instance; }
							node.removeAttribute("data-jax-id");
						}
					}
				break;
				default:
					var index = -1;
					var instances = JAX.Node.instances[nodeType];
					for (var i in instances) { 
						if (node === instances[i].node) { index = i; break; }
					}
					if (index > -1) { return JAX.Node.instances[nodeType][index].instance; }
			}
		}

		var f = Object.create(JAX.Node.prototype);
		f._init(node);
		return f;
	}
	
	throw new Error("First argument must be html element");
};

JAX.Node.prototype.$constructor = function() {
	throw new Error("You can not call this class with operator new. Use JAX.Node.create factory method instead of it");
};

/**
 * @method destructor - odvěsí všechny události, odebere uzel z DOMu, a odstraní všechny reference na něj z JAXu. Voláme, pokud víme, že uzel už se do DOMu nikdy více nepřipne.
 * @example
 * JAX("#nejakeId").$destructor();
 */
JAX.Node.prototype.$destructor = function() {
	if ([1,9].indexOf(this._node.nodeType) !== -1) { this.stopListening(); }
	if ([1,3,8].indexOf(this._node.nodeType) !== -1) { this.remove(); }

	if (this._node.nodeType in JAX.Node.instances) { delete JAX.Node.instances[this._node.nodeType][this._jaxId]; }

	this._node = null;
	this._storage = null;
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
 * @method přídá css třídu k elementu, lze zadat i více tříd oddělených mezerou a nebo pole tříd
 * @example
 * JAX("#nejakeId").addClass("trida"); // piseme bez tecky
 *
 * @param {String | Array} className jméno třídy nebo jména tříd oddělená mezerou | pole se jmény tříd
 * @returns {JAX.Node}
 */
JAX.Node.prototype.addClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.addClass","You can not use this method for this node. Doing nothing.", this._node);
		return this; 
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.addClass","Given arguments can be string or array of strings. Trying convert to string: " + cName, this._node);
		}
		JAK.DOM.addClass(this._node, cName);
	}
	
	return this;
};

/**
 * @method odebere css třídu od elementu, lze zadat i více tříd oddělených mezerou a nebo pole tříd
 * @example
 * JAX("#nejakeId").removeClass("trida"); // piseme bez tecky
 *
 * @param {String | Array} className jméno třídy nebo jména tříd oddělená mezerou | pole se jmény tříd
 * @returns {JAX.Node}
 */
JAX.Node.prototype.removeClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.removeClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.removeClass","Given arguments can be string, array of strings. Trying convert to string: " + cName, this._node);
		}
		JAK.DOM.removeClass(this._node, cName);
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.hasClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(className) !== "string") {  
		className += "";
		JAX.Report.show("error","JAX.Node.hasClass","For first argument I expected string. Trying convert to string: " + className, this._node);
	}

	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (this._node.className.indexOf(name) === -1) { return false; }
	}

	return true;
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.id","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this.attr("id"); 
	}

	if (typeof(id) !== "string") {
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
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.html","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this._node.innerHTML; 
	}

	if (typeof(innerHTML) !== "string" && typeof(innerHTML) !== "number") {
		innerHTML += "";
		JAX.Report.show("warn","JAX.Node.html","For first argument I expected string or number. Trying convert to string: " + innerHTML, this._node);
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
	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
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
 * @param {Node | Node[] | JAX.NodeArray} nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.Node}
 */
JAX.Node.prototype.add = function(nodes) {
	if (nodes instanceof JAX.NodeArray) {
		nodes = nodes.items();
	} else if (!(nodes instanceof Array)) { 
		nodes = [].concat(nodes); 
	}
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !(node instanceof JAX.Node)) { throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them."); }
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
	if (node && typeof(node) !== "object" || (!node.nodeType && !(node instanceof JAX.Node))) { 
		throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); 
	}
	if (nodeBefore && typeof(nodeBefore) !== "object" || (!nodeBefore.nodeType && !(nodeBefore instanceof JAX.Node))) { 
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
 * var jaxElm = JAX.make("span").appendBefore(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.appendBefore = function(node) {
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
 * var jaxElm = JAX.make("span").appendAfter(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.Node} node DOM uzel | instance JAX.Node
 * @returns {JAX.Node}
 */
JAX.Node.prototype.appendAfter = function(node) {
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
		this.appendBefore(node);
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
	if ([9,11].indexOf(this._node.nodeType) !== -1) { 
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
	if (this._node.nodeType !== 1) { 
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

	return JAX.Node.create(clone);
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
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.listen","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (!funcMethod) {
		var funcMethod = obj;
		obj = window;
	}

	if (typeof(type) !== "string") { 
		type += "";
		JAX.Report.show("error","JAX.Node.listen","For first argument I expected string. Trying convert to string: " + type, this._node);
	}

	if (typeof(funcMethod) !== "string" && typeof(funcMethod) !== "function") { 
		throw new Error("For second argument I expected string or function"); 
	}

	if (typeof(obj) !== "object") { 
		throw new Error("For third argument I expected referred object"); 
	}

	if (typeof(funcMethod) === "string") {
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("Given method in second argument was not found in referred object given in third argument"); } 
		funcMethod = funcMethod.bind(obj);
	}

	var f = function(e, node) { funcMethod(new JAX.Event(e), JAX(node), bindData); };
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	var objListener = new JAX.Listener(this, listenerId);
	evtListeners.push(objListener);
	this._storage.events[type] = evtListeners;

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
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.stopListening","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		this._storage.events = {};
		return this;
	}

	if (typeof(listener) == "string") {
		var eventListeners = this._storage.events[listener]; 
		if (eventListeners) { 
			this._destroyEvents(eventListeners);
			this._storage.events[listener] = [];
			return this;
		}
	}

	if (listener instanceof JAX.Listener) {
		for (var p in this._storage.events) {
			var eventListeners = this._storage.events[p];
			var index = eventListeners.indexOf(listener);
			if (index > -1) {
				this._destroyEvents([eventListeners[index]]);
				eventListeners.splice(index, 1);
				if (!eventListeners.length) { delete this._storage.events[p]; }
				return this;
			}
		}
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
	if (typeof(property) === "string") { 
		if (arguments.length === 1) { 
			return this._node[property]; 
		}
		this._node[property] = value;
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.attr","Too much arguments.", this._node);
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.attr","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") { 
		if (arguments.length === 1) { 
			return this._node.getAttribute(property); 
		}
		this._node.setAttribute(property, value + "");
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.attr","Too much arguments.", this._node);
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.css","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") {
		if (arguments.length === 1) { 
			return property === "opacity" ? this._getOpacity() : this._node.style[property]; 
		}
		this._node.style[property] = value; 
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.css","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var css = {};
		for (var i=0, len=property.length; i<len; i++) {
			var p = property[i];
			if (p === "opacity") { css[p] = this._getOpacity(); continue; }
			css[p] = this._node.style[p];
		}
		return css;
	}

	for (var p in property) {
		var value = property[p];
		if (p === "opacity") { this._setOpacity(value); continue; }
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
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.computedCss","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(properties) === "string") {
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
	if ([1].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.fullSize","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (arguments.length === 1) { 
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
	if ([1].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.fullSize","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (arguments.length === 1) { 
		var size = parseInt(this.computedCss(sizeType), 10);
		if (isFinite(size)) { return size; }

		var backupStyle = this.css(["display","visibility","position"]);
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

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
	if (this._node.parentNode) { return JAX.Node.create(this._node.parentNode); }
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
 * console.log(body.childs().length);
 *
 * @returns {JAX.NodeArray}
 */
JAX.Node.prototype.childs = function() {
	if (!this._node.childNodes) { return []; }
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		nodes.push(JAX(childNode));
	}
	return new JAX.NodeArray(nodes);
};

/** 
 * @method vrací první uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body span").first().jaxNodeType == JAX.Node.TEXT_NODE);
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.first = function() {
	return this._node.firstChild ? JAX(this._node.firstChild) : null;
};

/** 
 * @method vrací poslední uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body span").first() == JAX("body span").last());
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.last = function() {
	return this._node.lastChild ? JAX(this._node.lastChild) : null;
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
	if ([1,3,11].indexOf(this._node.nodeType) === -1) { 
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

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node() : node;
		return elm == this._node;
	} else if (typeof(node) === "string") {
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

	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm === this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	} else if (typeof(node) === "string") {
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

	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	} else if (typeof(node) === "string") {
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
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.animate","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (typeof(property) !== "string") {
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
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(type) !== "string") {
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
	if (this._node.nodeType !== 1) {
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
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.slide","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (typeof(type) !== "string") {
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

JAX.Node.prototype._init = function(node) {
	this._node = node;
	this.jaxNodeType = this._node.nodeType;

	/* set jax id for new (old) node */
	var oldJaxId = -1;
	if (node.getAttribute) { 
		var oldJaxId = parseInt(node.getAttribute("data-jax-id"),10);
		if (typeof(oldJaxId) !== "number") { oldJaxId = -1; }
	}

	if (oldJaxId > -1) {
		this._jaxId = oldJaxId;
		this._storage = JAX.Node.instances[JAX.Node.ELEMENT_NODE][this._jaxId];
		this._storage.instance = this;
		return;
	}

	if (this._node.nodeType in JAX.Node.instances) {
		switch(this._node.nodeType) {
			case JAX.Node.ELEMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.ELEMENT_NODE]++;
				this._node.setAttribute("data-jax-id", this._jaxId);

				var storage = {
					instance: this,
					events: {}
				};

				JAX.Node.instances[JAX.Node.ELEMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.TEXT_NODE:
			case JAX.Node.COMMENT_NODE:
			case JAX.Node.DOCUMENT_FRAGMENT_NODE:
				var nodeType = this._node.nodeType;
				this._jaxId = JAX.Node._ids[nodeType]++;

				var storage = { instance: this, node: node };

				JAX.Node.instances[nodeType][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.DOCUMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.DOCUMENT_NODE]++;

				var storage = { 
					instance: this,
					events: {},
					node: node
				};

				JAX.Node.instances[JAX.Node.DOCUMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
		}
	}
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

	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) {
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

	if (arguments.length === 1) {
		var value = (sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight);
	}

	if (!boxSizing || boxSizing === "content-box") {
		paddingX = parseFloat(this.computedCss(paddingPropertyX));
		paddingY = parseFloat(this.computedCss(paddingPropertyY));
	}
	
	if (boxSizing !== "border-box") {
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

/**
 * @fileOverview nodearray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující pole prvků v DOMu a poskytující rozšířené metody pro práci s ním
 * @class JAX.NodeArray
 */
JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "1.0"
});

/**
 * @method $constructor
 * @example
 * document.body.innerHTML = "<span>1</span><span>2</span><div id='cisla'></div>";
 * var all = new JAX.NodeArray(document.getElementsByTagName("*")); // slozitejsi alternativa
 * var all = JAX.all("*"); // pouziti JAX.all je lepsi varianta, jak ziskat pole prvku!
 *
 * @param {Node[] | JAX.Node[]} nodes pole uzlů | pole instancí JAX.Node
 */
JAX.NodeArray.prototype.$constructor = function(nodes) {
	var nodes = [].concat(nodes);
	var len = nodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var node = nodes[i];
		if (typeof(node) === "object" && node.nodeType) { this._jaxNodes[i] = JAX(node); continue; }
		if (node instanceof JAX.Node) { this._jaxNodes[i] = node; continue; }

		throw new Error("First argument must be array of JAX.Node instances or html nodes");
	}
	this.length = len;
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
 * @returns {JAX.Node | JAX.Node[]}
 */
JAX.NodeArray.prototype.items = function(from, to) {
	if (!arguments.length) { return this._jaxNodes.slice(); }
	var from = from || 0;
	var to = to || this._jaxNodes.length;
	return this._jaxNodes.slice(from, to);
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
		jaxNode.removeFromDOM(); 
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
	return listeners;
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

/** 
 * @method animuje průhlednost dle typu
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").fade("out", 2);
 *
 * @param {String} type typ "in" nebo "out"
 * @param {Number} duration délka animace v sec
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.fade = function(type, duration) {
	var count = this._jaxNodes.length;
	var promises = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		promises[i] = this._jaxNodes[i].fade(type, duration);
	}
	return JAK.Promise.when(promises);
};

/**
 * @method animuje průhlednost do určité hodnoty
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").fadeTo(0.5, 2);
 *
 * @param {Number} opacityValue do jaké hodnoty od 0 do 1 se má průhlednost animovat
 * @param {Number} duration délka animace v sec
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration) {
	var count = this._jaxNodes.length;
	var promises = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		promises[i] = this._jaxNodes[i].fadeTo(opacityValue, duration);
	}
	return JAK.Promise.when(promises);
};

/**
 * @method zobrazí element pomocí animace výšky nebo šířky
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div><div><span>4</span><span>5<em>6</em></span></div>";
 * JAX.all("body div").slide("down", 1);
 *
 * @param {String} type udává typu efektu - "down", "up", "left" nebo "right"
 * @param {Number} duration délka animace v sec
 * @returns {JAK.Promise}
 */
JAX.NodeArray.prototype.slide = function(type, duration) {
	var count = this._jaxNodes.length;
	var promises = new Array(count);

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		promises[i] = this._jaxNodes[i].slide(type, duration);
	}
	return JAK.Promise.when(promises);
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
JAX.Event.prototype.cancel = function() {
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

JAX.Listener.prototype.$constructor = function(jaxElm, id) {
	this._jaxElm = jaxElm;
	this._id = id;
};

JAX.Listener.prototype.unregister = function() {
	if (!this._id) { return; }
	this._jaxElm.stopListening(this);
	this._id = null;
};

JAX.Listener.prototype.node = function() {
	return this._node;
};

JAX.Listener.prototype.id = function() {
	return this._id;
};
/**
 * @fileOverview dombuilder.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Pomocník pro vytváření DOM elementů
 * @class JAX.DOMBuilder
 */ 
JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "2.0"
});

/** 
 * @example 
 * var db = new JAX.DOMBuilder();
 *
 * @param {documentElement} document element, ve kter0m se budou nové elementy vytvářet
 */
JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: JAX.Node.create(document.createDocumentFragment()) };
	this._pointerJaxNode = null;
	this._stack = [];
};

/**
 * @method Vytvoří nový element a nastaví na něj interně ukazatel, takže další vytvářené elementy se budou přidávat do tohoto elementu
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("div",{},{width:"100px"});
 * db.add("span");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	if (typeof(element) === "string" || (typeof(element) === "object" && element.nodeType)) {
		this._stack.push(this._pointerJaxNode);
		this._pointerJaxNode = this.add(element, attributes, styles);
		return this._pointerJaxNode;
	}

	throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
};

/**
 * @method Vytvoří nový element a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("div");
 * db.add("span");
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	var jaxNode = node;

	if (typeof(node) === "string") {
		jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) === "object" && node.nodeType) {
		jaxNode = JAX(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	}

	if (!(jaxNode instanceof JAX.Node) || jaxNode.jaxNodeType === 9) {
		throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.css(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

/**
 * @method Vytvoří nový textový uzel a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String} txt text, který se má uložit do textového uzlu
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) === "string") {
		var jaxNode = JAX.makeText(txt);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	throw new Error("First argument must be a string");
};

/**
 * @method "Uzavře aktuálně otevřený element metodou JAX.DOMBuilder.open". Znamená to, že ukazatel se nastaví na rodičovský prvek tohoto elementu, pokud existuje.
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.close(); // vyhodí výjimku, snažíme se uzavřít prvek, ale žádný už otevřen není
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return this;
	}

	throw new Error("There is no opened element so you can not close anything");
};

/**
 * @method Vezme svůj HTML obsah a připne ho do cílového prvku
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.appendTo(document.body); // pripne vytvoreny span do document.body
 * console.log(db.getContainer());
 *
 * @param {HTMLNode} node prvek, kam se má celý obsah připnout
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if ((typeof(node) === "object" && node.nodeType) || typeof(node) === "string") {
		var jaxNode = JAX(node);
	} else if (node instanceof JAX.Node && node.jaxNodeType === 1) {
		var jaxNode = node;
	}

	if (!jaxNode) {
		throw new Error("You are trying to append me to unsupported or null element. I can be appended only to html element or documentFragment element.");
	}

	this._jax.container.appendTo(jaxNode);
	return this;
};

/**
 * @method Vrací instance JAX.Node s HTML obsahem
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 *
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

/**
 * @method Vymaže HTML obsah
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 * db.clear();
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
	return this;
};

/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.0",
	DEPEND: [{
		sClass: JAK.CSSInterpolator,
		ver: "2.1"
	}]
});

JAX.FX._TRANSITION_PROPERTY = "";
JAX.FX._TRANSITION_EVENT = "";

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
			JAX.FX._TRANSITION_PROPERTY = p;
			JAX.FX._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": {
		defaultUnit:"px", 
		css:"width" 
	},
	"height": {
		defaultUnit:"px", 
		css:"height" 
	},
	"top": {
		defaultUnit:"px", 
		css:"top" 
	},
	"left": {
		defaultUnit:"px", 
		css:"left" 
	},
	"bottom": {
		defaultUnit:"px", 
		css:"bottom" 
	},
	"right": {
		defaultUnit:"px", 
		css:"right" 
	},
	"fontSize": {
		defaultUnit:"px", 
		css:"font-size" 
	},
	"opacity": {
		defaultUnit:"", 
		css:"opacity" 
	},
	"color": {
		defaultUnit:"", 
		css:"color" 
	},
	"backgroundColor": {
		defaultUnit:"", 
		css:"background-color" 
	}
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
	this._elm = elm instanceof JAX.Node ? elm : JAX.Node.create(elm);
	this._properties = [];
	this._interpolators = [];
	this._transitionCount = 0;
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
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
 * @param {string} property css vlastnost, která se má animovat
 * @param {number} duration délka v sekundách, lze zadat i desetinné číslo, např. 1.2
 * @param {string} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	var duration = parseInt(duration);
	var method = this._transitionSupport ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { 
		throw new Error("For first argument I expected string"); 
	}
	if (!isFinite(duration) || duration < 0) { 
		throw new Error("For second argument I expected positive number"); 
	}
	if (start && typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { 
		throw new Error("For third argument I expected string, number or null for automatic checking"); 
	}
	if (end && typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { 
		throw new Error("For fourth argument I expected string or number"); 
	}
	if (start === null && end === null) {
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
		var cssEnd = this._foundCSSValue(property);;
	}

	if (start || (typeof(start) == "number" && isFinite(start))) { 
		var cssStart = this._parseCSSValue(property, start);
	} else {
		var cssStart = this._foundCSSValue(property);
	}

	this._properties.push({
		property: property,
		cssStart: cssStart,
		cssEnd: cssEnd,
		duration: (duration || 1),
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
 * @eturns {JAX.FX}
 */
JAX.FX.prototype.run = function() {
	this._running = true;
	this._promise = new JAK.Promise();
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this._promise;
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
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._checkSupportedProperty = function(property) {
	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];

		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { 
			properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); 
		}

		throw new Error("First argument must be supported property: " + properties.join(", ")); 
	}
};

JAX.FX.prototype._checkSupportedMethod = function(method) {
	var method = method.toLowerCase();
	if (JAX.FX._SUPPORTED_METHODS.indexOf(method) > -1 || method.indexOf("cubic-bezier") == 0) {
		return;
	}

	var methods = [];
	for (var p in JAX.FX._SUPPORTED_METHODS) { methods.concat(JAX.FX._SUPPORTED_METHODS[p]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
}

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) !== -1) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
	this._promise.reject(this._elm);
};

JAX.FX.prototype._initTransition = function() {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		tps.push(JAX.FX._SUPPORTED_PROPERTIES[property.property].css + " " + property.duration + "s " + property.method);
		this._transitionCount++;
	}

	setTimeout(function() {
		node.style[tp] = tps.join(",");
		this._ecTransition = this._elm.listen(te, this, "_endTransition");

		for (var i=0, len=this._properties.length; i<len; i++) {
			var property = this._properties[i];
			style[property.property] = property.cssEnd.value + property.cssStart.unit;
		}
	}.bind(this), 0);
};

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
	this._promise.reject(this._elm);
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	if (property == "backgroundColor" || property == "color") {
		var value = cssValue;
	} else {
		var value = parseFloat(cssValue);
		var foundUnit = (cssValue+"").replace(value, "");
		if (foundUnit) { unit = foundUnit; }
	}

	return { 
		value: value, 
		unit: unit 
	};
};

JAX.FX.prototype._foundCSSValue = function(property) {
	var unit = JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit;

	switch(property) {
		case "width":
		case "height":
			value = this._elm.size(property);
		break;
		case "backgroundColor":
		case "color":
			var value = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		break;
		default:
			var cssValue = this._elm.computedCss(JAX.FX._SUPPORTED_PROPERTIES[property].css);
			var value = parseFloat(cssValue);
	}

	return {
		value:value,
		unit: unit
	}
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	this._promise.fulfill(this._elm);
};

JAX.FX.prototype._endTransition = function() {
	this._transitionCount--;
	if (this._transitionCount) { return; }

	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	this._promise.fulfill(this._elm);
};

JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.show = function(type, func, msg, node) {
	console.DEBUG = 1;

	if (console[type]) {
		console[type]("[" + func + "] » " + msg);
		if (node) { console.log("Node: ", node); }
		return;
	}
	throw new Error("Bad console type: " + type); 
};

