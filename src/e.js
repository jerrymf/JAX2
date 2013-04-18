JAX.E = JAK.ClassMaker.makeClass({
	NAME: "JAX.D",
	VERSION: "0.1"
});

JAX.E.prototype.$constructor = function(data) {
	this._data = data || {};
	this._message = "";
	this._output = "";
};

JAX.E.prototype.message = function(forThe, expected, got) {
	this._message = "For " + forThe + " ";
	this._message += "I expected " + expected + ". ";
	this._message += "I got " + got + " from you. ";
	return this;
};

JAX.E.prototype.show = function() {
	this._generateOutput();
	throw new Error(this._output);
}

JAX.E.prototype._generateOutput = function() {
	if (this._data.funcName && typeof(this._data.funcName) == "string") { 
		this._output += "Function " + this._data.funcName + ": "; 
	}
	if (this._message) {
		this._output += this._message;
	}
	if (this._data.value) { 
		this._output += "Your value is: " + this._data.value + " and its type is " + typeof(this._data.value);
	}
	if (this._data.node) { 
		this._output += "\n\nNode: " + this._stringifyNode();
	}
};

JAX.E.prototype._stringifyNode = function() {
	var output = "";
	var nodeStart = "";
	var nodeBody = "";
	var nodeEnd = "";

	var f = function(match, p1, p2) {
		nodeStart = p1;
		nodeEnd = p2;

    	return match;
	};
	var regexp = /(<[^>]*>).*(<\/[^<>]*>)/i;
	this._data.node.outerHTML.replace(regexp, f);

	if (nodeStart) { output += nodeStart; }
	if (this._data.node.innerHTML) { output += this._data.node.innerHTML.substring(0,10) + "..."; }
	if (nodeEnd) { output += nodeEnd; }

	return output;
};

