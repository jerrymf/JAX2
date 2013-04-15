JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "0.1"
});

JAX.NodeArray.prototype.$constructor = function(jaxNodes) {
	this._jaxNodes = jaxNodes;
};

JAX.NodeArray.prototype.addClass = function() {
	for (var i=0, len=this.length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
};

JAX.NodeArray.prototype.removeClass = function() {
	for (var i=0, len=this.length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
};

