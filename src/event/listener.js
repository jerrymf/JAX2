/**
 * @fileOverview listener.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.Listener
 * je třída rezrezentující posluchač události
 */ 
JAX.Listener = JAK.ClassMaker.makeClass({
	NAME: "JAX.Listener",
	VERSION: "1.0"
});

/**
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
