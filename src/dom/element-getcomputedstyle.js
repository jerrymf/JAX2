/**
 * @fileOverview node-getcomputedstyle.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
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

		function getBaseFontSize(element) {
			if (!element) { return 16; }

			var style = element.currentStyle;
			var cssValue = style["fontSize"];
			var size = parseFloat(cssValue);
			var suffix = cssValue.split(/\d/)[0];
			var isProportional = /%|em/.test(suffix);

			if (isProportional) { 
				return getBaseFontSize(element.parentElement); 
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

			if (property == "fontSize") {
				var rootSize = fontSize;
			} else if (element.parentElement != element.ownerDocument) {
				var parentElement = element.parentElement;
				/* dirty trick, how to quickly find out width of parent element */
				var temp = document.createElement("jaxtempxyz");
					temp.style.display = "block";
					parentElement.appendChild(temp);
				var rootSize = temp.offsetWidth;
					parentElement.removeChild(temp);
			} else {
				var rootSize = element.parentElement.documentElement.clientWidth;
			}

			return getRecountedPixelSize(size, suffix, rootSize, fontSize) || 0;
		};

		function getPixelPosition(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 

			return getRecountedPixelSize(size, suffix, rootSize, fontSize);
		};

		function getPixelSizeWH(property, style, fontSize, offsetLength) {
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

			return value;
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
				} else if (["left","right","top","bottom"].indexOf(property) > -1 && ["absolute","relative","fixed"].indexOf(currentStyle["position"]) > -1 && currentStyle[property] != "auto") {
					this[property] = getPixelPosition(element, currentStyle, property, fontSize) + "px";
				} else {
					try {
						/* IE8 crashes in case of getting some properties (outline, outlineWidth, ...) */
						this[property] = currentStyle[property];
					} catch(e) {
						this[property] = "";
					}
				}
				index++;
			}

			this.length = index;

			var currentStyleWidth = currentStyle["width"];
			if (currentStyleWidth != "auto") {
				this["width"] = currentStyleWidth.indexOf("px") > -1 ? currentStyleWidth : getPixelSizeWH("width", this, fontSize, element.offsetWidth) + "px";
			} else {
				this["width"] = currentStyleWidth;
			}

			var currentStyleHeight = currentStyle["height"];
			if (currentStyleHeight != "auto") {
				this["height"] = currentStyleHeight.indexOf("px") > -1 ? currentStyleHeight : getPixelSizeWH("height", this, fontSize, element.offsetHeight) + "px";
			} else {
				this["height"] = currentStyleHeight;
			}
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

		JAX.Element.getComputedStyle = function(element) {
			return new CSSStyleDeclaration(element);
		}
	} else {	
		JAX.Element.getComputedStyle = function(element) {
			return element.ownerDocument.defaultView.getComputedStyle(element, "");
		}
	}
})();
