/**
 * @fileOverview promisechain.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.PromiseChain
 * je třída, která umožňuje zpracovat po sobě jdoucí a přitom na sobě závislé promisy
 *
 */

JAX.PromiseChain = function() {
	this._running = false;
	this._canceled = false;
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
};

JAX.PromiseChain.prototype.cancel = function() {
	this._canceled = true;
	return this;
};

JAX.PromiseChain.prototype.run = function() {
	if (this._running) { return this; }
	this._processWaiting();
	return this;
};

JAX.PromiseChain.prototype.waitFor = function(item) {
	if (!item || (typeof(item) != "function" && !(item instanceof JAK.Promise) && !(item instanceof JAX.FX))) {
		console.error("JAX.PromiseChain: Sorry, but I got unsupported item: " + typeof(item) + ". I expected function, instance of JAK.Promise or instance of JAX.FX.");
		return this;
	}

	this._waitings.push({
		waiting: item,
		thenActions: []
	});

	return this;
};

JAX.PromiseChain.prototype.then = function(onFulfill, onReject) {
	this._running = false;

	var customOnFulfill = function(value) {
		if (this._canceled) { return; }
		if (typeof(onFulfill) == "function") {
			return onFulfill(value);
		}
	}.bind(this);

	var customOnReject = function(value) {
		if (this._canceled) { return; }
		if (typeof(onReject) == "function") {
			return onReject(value);
		}
	}.bind(this);

	var length = this._waitings.length;

	if (length) {
		var lastWaiting = this._waitings[length - 1];
		lastWaiting.thenActions.push({onFulfill:customOnFulfill, onReject:customOnReject});
	}

	return this;
};

JAX.PromiseChain.prototype._processWaiting = function() {
	var waitingData = this._waitings.shift();
	if (!waitingData) { return; }

	var item = waitingData.waiting;

	if (typeof(item) == "function") {
		var promise = item();
	} else {
		var promise = item;
	}

	this._currentPromise = promise;
	this._promises.push(promise);

	var thenActions = waitingData.thenActions;

	for (var i=0, len=thenActions.length; i<len; i++) {
		var thenAction = thenActions[i];
		this._currentPromise.then(thenAction.onFulfill, thenAction.onReject);
	}
	
	var finishingAction = function() {
		if (this._canceled) { return; }
		this._processWaiting();
	}.bind(this);

	this._currentPromise.then(finishingAction, finishingAction);

	this._running = true;
};
