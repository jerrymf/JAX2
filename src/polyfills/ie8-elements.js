/**
 * @fileOverview ie8-elements.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * JAXovský polyfill pro doplnění atributů {first,last}ElementChild a {previous,next}ElementSibling
 */
(function(){
	if (!("firstElementChild" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "firstElementChild", {
			get : function () {
				var elm = this.firstChild;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.nextSibling;
				}
		        return null;
			}
		});
	}

	if (!("lastElementChild" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "lastElementChild", {
			get : function () {
				var elm = this.lastChild;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.previousSibling;
				}
		        return null;
			}
		});
	}

	if (!("nextElementSibling" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "nextElementSibling", {
			get : function () {
				var elm = this.nextSibling;
				while(elm) {
					if(elm.nodeType == 1) { return elm; }
					elm = elm.nextSibling;
		        };
		        return null;
			}
		});
	}

	if (!("previousElementSibling" in document.createElement("div"))) {
		Object.defineProperty(Element.prototype, "previousElementSibling", {
			get : function () {
				var elm = this.previousSibling;
				while(elm){
					if(elm.nodeType == 1) { return elm; }
					elm = elm.previousSibling;
		        };
		        return null;
			}
		});
	}
})();
