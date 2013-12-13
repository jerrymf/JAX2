
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

		for (var j=0, len=attributes.length; j<len; j++) {
			var attr = attributes[j];
			var attrName = attr.name;
			if (attrName.indexOf("data-jax") > -1) {
				node.removeAttribute(attrName);
			}
		}

		var children = node.querySelectorAll("*");
		for (var i=0, len=children.length; i<len; i++) {
			var childNode = children[i];
			var attributes = Array.prototype.slice.call(childNode.attributes);

			for (var j=0, len=attributes.length; j<len; j++) {
				var attr = attributes[j];
				var attrName = attr.name;
				if (attrName.indexOf("data-jax") > -1) {
					childNode.removeAttribute(attrName);
				}
			}
		}

		return node;
	}
})();
