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

			if (isProportional && element.parentElement) { 
				size = element.parentElement != element.ownerDocument ? getBaseFontSize(element.parentElement) : 16; 
			}

			return getRecountedPixelSize(size, suffix);
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

			if (property == "fontSize") {
				rootSize = fontSize;
			} else {
				var parentElement = element.parentElement != element.ownerDocument ? element.parentElement : element.ownerDocument.documentElement;
				rootSize = parentElement.clientWidth;
			}

			return getRecountedPixelSize(size, suffix, rootSize, fontSize);
		};

		function getPixelPosition(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 

			return getRecountedPixelSize(size, suffix, rootSize, fontSize);
		};

		function setPixelSizeWH(property, style, fontSize, offsetLength) {
			var boxSizing = style.boxSizing,
				paddingX = 0,
				paddingY = 0,
				borderX = 0,
				borderY = 0,
				paddingPropertyX = "padding" + (property == "width" ? "Left" : "Top"),
				paddingPropertyY = "padding" + (property == "width" ? "Right" : "Bottom"),
				borderPropertyX = "border" + (property == "width" ? "LeftWidth" : "Top"),
				borderPropertyY = "border" + (property == "width" ? "RightWidth" : "Bottom"),
				value = offsetLength;

			if (!boxSizing || boxSizing == "content-box") {
				paddingX = parseFloat(style[paddingPropertyX]);
				paddingY = parseFloat(style[paddingPropertyY]);
			}
			
			if (boxSizing != "border-box") {
				borderX = parseFloat(style[borderPropertyX]);
				borderY = parseFloat(style[borderPropertyY]);
			}
			
			if (paddingX && isFinite(paddingX)) { value -= paddingX; }
			if (paddingY && isFinite(paddingY)) { value -= paddingY; }
			if (borderX && isFinite(borderX)) { value -= borderX; }
			if (borderY && isFinite(borderY)) { value -= borderY; }

			style[property] = value + "px";
		};

		function getRecountedPixelSize(size, suffix, rootSize, fontSize) {
			switch (suffix) {
				case "em":
					return size * fontSize;
				case "in":
					return size * 96;
				case "pt":
					return size * 96 / 72;
				case "pc":
					return size * 12 * 96 / 72;
				case "cm":
					return size * 0.3937 * 96;
				case "mm":
					return size * 0.3937 * 96 / 10;
				case "%":
					return size / 100 * rootSize;
				default:
					return size;
			}
		};

		function CSSStyleDeclaration(element) {
			var currentStyle = element.currentStyle;
			var fontSize = getBaseFontSize(element);
			var index = 0;

			for (property in currentStyle) {
				this[index] = denormalize(property);
				if (/margin.|padding.|border.+W|^fontSize$/.test(property) && currentStyle[property] != "auto") {
					this[property] = getPixelSize(element, currentStyle, property, fontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = currentStyle[property];
				} else if (["left","right","top","bottom"].indexOf(property) != -1 && ["absolute","relative","fixed"].indexOf(currentStyle["position"]) != -1 && currentStyle[property] != "auto") {
					this[property] = getPixelPosition(element, currentStyle, property, fontSize) + "px";
				} else {
					this[property] = currentStyle[property];
				}
				index++;
			}

			this.length = index + 1;

			setPixelSizeWH("width", this, fontSize, element.offsetWidth);
			setPixelSizeWH("height", this, fontSize, element.offsetHeight);
		};

		CSSStyleDeclaration.prototype.getPropertyPriority =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		};

		CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
			return this[normalize(prop)] || "";
		};

		CSSStyleDeclaration.prototype.item = function(index) {
			return this[index];
		};

		CSSStyleDeclaration.prototype.removeProperty =  function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		};

		CSSStyleDeclaration.prototype.setProperty =  function () {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
		};

		CSSStyleDeclaration.prototype.getPropertyCSSValue =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
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
