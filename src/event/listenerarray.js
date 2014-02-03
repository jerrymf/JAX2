/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.ListenerArray
 * je třída rezrezentující pole posluchačů
 */ 
JAX.ListenerArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.ListenerArray",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @see JAX.IIterable
 *
 * @param {array} listeners pole instanci JAX.Listener
 */ 
JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

/**
 * odregistruje všechny posluchače v poli a z pole je odstraní.
 * 
 * @returns {JAX.ListenerArray}
 */ 
JAX.ListenerArray.prototype.unregister = function() {
	var item = null;

	while(item = this.popItem()) {
		item.unregister();
	}

	return this;
};
