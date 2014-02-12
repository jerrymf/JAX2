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
