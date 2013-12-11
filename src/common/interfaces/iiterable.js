/**
 * @fileOverview iiterable.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pri iterovatelé prvky, které je svým chováním velice podobné datovému typu Array
 * @class JAX.IIterable
 */

JAX.IIterable = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IIterable",
	VERSION: "1.0"
});

JAX.IIterable.prototype.exist = function() {
	return !!this.length;
};

JAX.IIterable.prototype.item = function(index) {
	var index = index || 0;
	return this[index];
};

JAX.IIterable.prototype.items = function() {
	var from = parseFloat(from) || 0;
	var to = parseFloat(to) || this.length;
	var items = new Array(to-from);

	for (var i=from; i<to; i++) {
		items[i] = this[i];
	}

	return items;
};

JAX.IIterable.prototype.firstItem = function() {
	return this[0];
};

JAX.IIterable.prototype.lastItem = function() {
	return this[this.length - 1];
};

JAX.IIterable.prototype.pushItem = function(item) {
	this.length++;
	this[this.length - 1] = item;
	return this;
};

JAX.IIterable.prototype.popItem = function() {
	if (this.length > 0) {
		var item = this[this.length - 1];
		delete this[this.length - 1];
		this.length--;
		return item;
	}
	return null;
};

JAX.IIterable.prototype.shiftItem = function() {
	var item= this[0];
	if (item) {
		this.length--;
		for (var i=0; i<this.length; i++) {
			this[i] = this[i+1];
		}
		return item;
	}

	return null;
};

JAX.IIterable.prototype.unshiftItem = function(item) {
	this.length++;
	for (var i=this.length - 1; i>0; i--) {
		this[i] = this[i - 1];
	}
	this[0] = item;

	return this;
};

JAX.IIterable.prototype.index = function(item) {
	for (var i=0; i<this.length; i++) {
		var myItem = this[i];
		if (myItem == item) { return i; }
	}

	return -1;
};

JAX.IIterable.prototype.forEachItem = function(func, obj) {
	var func = obj ? func.bind(obj) : func;

	for (var i=0; i<this.length; i++) {
		func(this[i], i, this);
	}

	return this;
};

JAX.IIterable.prototype.filterItems = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return filtered;
};
