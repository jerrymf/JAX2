/**
 * @fileOverview fxarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující pole JAX.FX instancí
 * @class JAX.FXArray
 * @see JAX.IIterable
 */ 
JAX.FXArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.FXArray",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @constructor
 * 
 * @param {array} fxArray pole instancí JAX.FX
 */ 
JAX.FXArray.prototype.$constructor = function(fxArray) {
	this.length = fxArray.length

	for (var i=0; i<this.length; i++) {
		this[i] = fxArray[i];
	}
};

/**
 * @method spustí animace
 * 
 * @returns {object.<JAX.FXArray>}
 */ 
JAX.FXArray.prototype.run = function() {
	for (var i=0; i<this.length; i++) {
		this[i].run();
	}

	return this;
};

/**
 * @method funkce, která se zavolá, jakmile animace skončí. V případě prvního parametru se jedná o úspěšné dokončení, v případě druhého o chybu.
 *
 * @param {function} onFulFill funkce, která se zavolá po úspěšném ukončení animace
 * @param {function} onReject funkce, která se zavolá, pokud se animaci nepodaří provést
 * @returns {object.<JAK.Promise>}
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
 * @method stopne animaci, hodnoty zůstanou nastavené v takovém stavu, v jakém se momentálně nacházejí při zavolání metody
 *
 * @returns {object.<JAX.FXArray>}
 */
JAX.FXArray.prototype.stop = function() {
	for (var i=0; i<this.length; i++) {
		this[i].stop();
	}

	return this;
};

/**
 * @method stopne animaci a spustí její zpětný chod
 *
 * @returns {object.<JAX.FXArray>}
 */
JAX.FXArray.prototype.reverse = function() {
	for (var i=0; i<this.length; i++) {
		this[i].reverse();
	}

	return this;
};
