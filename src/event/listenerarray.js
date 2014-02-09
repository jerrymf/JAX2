/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.ListenerArray
 * je třída rezrezentující pole posluchačů
 */

/**
 * @see JAX.IIterable
 *
 * @param {array} listeners pole instanci JAX.Listener
 */ 
JAX.ListenerArray = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

JAX.mixin(JAX.IIterable, JAX.ListenerArray);

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
