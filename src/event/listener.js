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
 * @returns {object.<JAX.Listener>}
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
 * @returns {object.<JAX.Node>}
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
