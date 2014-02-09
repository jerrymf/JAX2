/**
 * @fileOverview fxarray.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.FXArray
 * je třída rezrezentující pole JAX.FX instancí. Implementuje rozhraní {@link JAX.IIterable}
 *
 * @param {array} fxArray pole instancí JAX.FX
 */ 
JAX.FXArray = function(fxArray) {
	this.length = fxArray.length

	for (var i=0; i<this.length; i++) {
		this[i] = fxArray[i];
	}
};

JAX.mixin(JAX.FXArray, JAX.IIterable);

/**
 * spustí animace
 * 
 * @returns {JAX.FXArray}
 */ 
JAX.FXArray.prototype.run = function() {
	for (var i=0; i<this.length; i++) {
		this[i].run();
	}

	return this;
};

/**
 * funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulFill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {JAK.Promise}
 */ 
JAX.FXArray.prototype.then = function(onFulfill, onReject) {
	var fxPromises = new Array(this.length);

	var func = function(jaxElm) {
		return jaxElm;
	};

	for (var i=0; i<this.length; i++) {
		fxPromises[i] = this[i].then(func, func);
	}

	var finalFulfill = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onFulfill(nodeArray);
	};

	var finalReject = function(array) {
		var nodeArray = new JAX.NodeArray(array);
		onReject(nodeArray);
	};

	return JAK.Promise.when(fxPromises).then(finalFulfill, finalReject);
};

/**
 * stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 *
 * @returns {JAX.FXArray}
 */
JAX.FXArray.prototype.stop = function() {
	for (var i=0; i<this.length; i++) {
		this[i].stop();
	}

	return this;
};

/**
 * stopne animaci a spustí její zpětný chod
 *
 * @returns {JAX.FXArray}
 */
JAX.FXArray.prototype.reverse = function() {
	for (var i=0; i<this.length; i++) {
		this[i].reverse();
	}

	return this;
};
