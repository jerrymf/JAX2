/**
 * @fileOverview promise.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.Promise
 * je třída, která rozšiřuje možnosti JAK.Promise o její zrušení (zastavení vykonávání všech akcí po naplnění Promise).
 *
 */

JAX.Promise = JAK.ClassMaker.makeClass({
 	NAME: "JAX.Promise",
 	VERSION: "1.0",
 	EXTEND: JAK.Promise
});

JAX.Promise.prototype.$constructor = function() {
	this.$super();
	this._canceled = false;
	this._followingPromises = [];
};

/**
 * @param {function} onFulfilled je funkce zavolána ihned, jak je promise fulfillnuta
 * @param {function} onRejected je funkce zavolána ihned, jak je promise rejectnuta
 * @returns {JAX.Promise}
 */
JAX.Promise.prototype.then = function(onFulfilled, onRejected) {
	if (this._canceled) { return this; }

	this._cb.fulfilled.push(onFulfilled);
	this._cb.rejected.push(onRejected);

	var thenPromise = new JAX.Promise();

	this._thenPromises.push(thenPromise);
	this._followingPromises.push(thenPromise);

	if (this._state > 0) {
		setTimeout(this._processQueue.bind(this), 0);
	}

	/* 3.2.6. then must return a promise. */
	return thenPromise;
};

/**
 * zruší vykonávání akcí navázané po naplnění Promise i jejích následníků (promise vracených z volání JAX.Promise.then)
 * @returns {JAX.Promise}
 */
JAX.Promise.prototype.cancel = function() {
	if (this._canceled) { return this; }

	this._canceled = true;

	while(this._followingPromises.length) {
		var promise = this._followingPromises.shift();
		promise.cancel();
	}

	this._thenPromises = [];
	this._cb.fulfilled = [];
	this._cb.rejected = [];

	return this;
};

/**
 * je tato promise zrušená?
 * @returns {boolean}
 */
JAX.Promise.prototype.isCanceled = function() {
	return this._canceled;
};

/**
 * čeká, až budou naplněny všechny promisy v poli. Jedna selže => výsledná promise selže také.
 * @param {array} all array of JAX.Promise
 * @returns {JAX.Promise}
 */
JAX.Promise.when = function(all) {
	var promise = new this();
	var counter = 0;
	var results = [];

	for (var i=0;i<all.length;i++) {
		counter++;
		all[i].then(function(index, result) {
			results[index] = result;
			counter--;
			if (!counter && !promise.isCanceled()) { promise.fulfill(results); }
		}.bind(null, i), function(reason) {
			counter = 1/0;
			if (!promise.isCanceled()) { promise.reject(reason); }
		});
	}

	return promise;
};
