
(function() {
	if (window.Element) {
		var oldCloneNode = window.Element.prototype.cloneNode;
		var nodePrototype = window.Element.prototype;	
	} else if (window.Node) {
		var oldCloneNode = window.Node.prototype.cloneNode;
		var nodePrototype = window.Node.prototype;
	} else {
		return;
	}
	
	nodePrototype.cloneNode = function() {
		var node = oldCloneNode.apply(this, arguments);
		var attributes = Array.prototype.slice.call(node.attributes);

		for (var i=0, len=attributes.length; i<len; i++) {
			var attr = attributes[i];
			var attrName = attr.name;
			if (attrName.indexOf("data-jax") > -1) {
				node.removeAttribute(attrName);
			}
		}

		return node;
	}
})();
