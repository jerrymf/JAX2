JAX.INode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.Node",
	VERSION: "0.1"
});

JAX.INode.prototype.appendTo = function(node) {};
JAX.INode.prototype.appendBefore = function(node) {};
JAX.INode.prototype.removeFromDOM = function() {};
JAX.INode.prototype.parent = function() {};
JAX.INode.prototype.node = function() {};

