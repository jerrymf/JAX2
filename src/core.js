JAX = {
	VERSION: "1.91b"
};

JAX.$ = function(query, element, filter) {
	if (typeof(query) != "string") { throw new Error("JAX.$ accepts only String as the first parameter. See doc for more information.")};
	if (!("querySelectorAll" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$ accepts only HTML element with querySelectorAll support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElms = (sourceElm instanceof JAX.Element ? sourceElm.getElm() : elm).querySelectorAll(query);
	var jaxelms = foundElms.length ? new JAX.Elements(foundElms) : null;

	if (filter) { jaxelms = jaxelms.filter(filter, this); }

	return jaxelms; 
};

JAX.$$ = function(query, element) {
	if (typeof(query) != "string") { throw new Error("JAX.$$ accepts only String as the first parameter.")};
	if (!("querySelector" in element) && !(element instanceof JAX.Element)) { 
		throw new Error("JAX.$$ accepts only HTML element with querySelector support or JAX.Element instance as the second parameter. See doc for more information."); 
	}

	var sourceElm = element || document;
	var foundElm = (sourceElm instanceof JAX.Element ? sourceElm.getElm() : elm).querySelector(query);
	var jaxelm = foundElm ? new JAX.Element(foundElm) : null;

	return jaxelm;
};

JAX.make = function(tagString, html, srcDocument) {
	var html = html || "";
	var tagName = "";
	var type="";
	var foundString = ""; 
	var classNames = [];
	var ids = [];

	if (typeof(html) != "string") { throw new Error("JAX.make: Second parameter 'html' must be a string"); }

	for (var i=0, len=tagString.length; i<len; i++) {
		if (".#".indexOf(tagString[i]) > -1 || i == len - 1) {
			if (i == 0) { throw new Error("JAX.make: Classname or id can not be first. First must be tagname."); }
			if (foundString && type == "") { tagName = foundString; }
			if (foundString && type == "class") { classNames.push(foundString); }
			if (foundString && type == "id") { ids.push(foundString); }
			foundString = "";
			type = tagString[i] == "#" ? "id" : "class"; 
			continue; 
		}
		foundString += ("" + tagString[i]);
	}

	var elm = new JAX.Element(JAK.mel(tagName, {innerHTML:html}, {}, srcDocument || document));
	if (ids.length) { elm.setId(ids.join(" ")); }
	if (classNames.length) { elm.addClass(classNames.join(" ")); }

	return elm;
};

