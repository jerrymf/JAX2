/**
 * @fileOverview node-getcomputedstyle.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 0.1
 */

/**
 * JAXovský polyfill pro window.getComputedStyle do IE8
 */
(function() {
	if (!window.getComputedStyle) {

		function normalize(property) {
﻿		 ﻿ return property.replace(/-([a-z])/g, function(match, letter) { return letter.toUpperCase(); });
		};

		function denormalize(property) {
﻿		 ﻿ return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
		};

		function getBaseFontSize(element) {
			var style = element.currentStyle;
			var cssValue = style["fontSize"];
			var size = parseFloat(cssValue);
			var suffix = cssValue.split(/\d/)[0];
			var isProportional = /%|em/.test(suffix);
			var isPt = /pt/.test(suffix);
			var isIn = /in/.test(suffix);

			if (isProportional && element.parentElement) { 
				size = element.parentElement != element.ownerDocument ? getBaseFontSize(element.parentElement) : 16; 
			}

			if (isPt) {
				size = size * 96 / 72;
			}

			if (isIn) {
				size = size * 96;
			}

			return size;
		};

		function getFirstNonStaticElementSize(element, property) {
			while(element.parentElement && element.parentElement.currentStyle) {
				element = element.parentElement;
				var position = element.currentStyle.position || "";
				if (["absolute","relative","fixed"].indexOf(position) != -1) { return element[property]; }
			}

			return element.ownerDocument.documentElement[property];
		};

		function getPixelSize(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			if (["left", "right", "top", "bottom"].indexOf(property) != -1) {
				rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 
			} else {
				rootSize = property == "fontSize" ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;
			}

			switch (suffix) {
				case "em":
					return size * fontSize;
				case "in":
					return size * 96;
				case "pt":
					return size * 96 / 72;
				case "%":
					return Math.round(size / 100 * rootSize);
				default:
					return size;
			}

		};

		function setShortStyleProperty(style, property) {
			var
			borderSuffix = property == "border" ? "Width" : "",
			t = property + "Top" + borderSuffix,
			r = property + "Right" + borderSuffix,
			b = property + "Bottom" + borderSuffix,
			l = property + "Left" + borderSuffix;

			style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
			: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
			: style[l] == style[r] ? [style[t], style[r], style[b]]
			: [style[t], style[r], style[b], style[l]]).join(" ");
		};

		function CSSStyleDeclaration(element) {
			var currentStyle = element.currentStyle;
			var fontSize = getBaseFontSize(element);
			var index = 0;

			for (property in currentStyle) {
				this[index] = denormalize(property);
				if (/width|height|margin.|padding.|border.+W|^fontSize$/.test(property) && currentStyle[property] != "auto") {
					this[property] = getPixelSize(element, currentStyle, property, fontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = currentStyle[property];
				} else if (["left","right","top","bottom"].indexOf(property) != -1 && ["absolute","relative","fixed"].indexOf(currentStyle["position"]) != -1 && currentStyle[property] != "auto") {
					this[property] = getPixelSize(element, currentStyle, property, fontSize) + "px";
				} else {
					this[property] = currentStyle[property];
				}
				index++;
			}

			this.length = index + 1;

			setShortStyleProperty(this, "margin");
			setShortStyleProperty(this, "padding");
			setShortStyleProperty(this, "border");
		};

		CSSStyleDeclaration.prototype.getPropertyPriority =  function () {

		};

		CSSStyleDeclaration.prototype.getPropertyValue = function (prop) {
			return this[normalize(prop)] || "";
		};

		CSSStyleDeclaration.prototype.item = function (index) {
			return this[index];
		};

		CSSStyleDeclaration.prototype.removeProperty =  function () {

		};

		CSSStyleDeclaration.prototype.setProperty =  function () {

		};

		CSSStyleDeclaration.prototype.getPropertyCSSValue =  function () {

		};

		JAX.Node.getComputedStyle = function(element) {
			return new CSSStyleDeclaration(element);
		}
	} else {	
		JAX.Node.getComputedStyle = function(element) {
			return element.ownerDocument.defaultView.getComputedStyle(element, "");
		}
	}
})();
