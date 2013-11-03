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

		function getOpacity(currentStyle) {
			var value = "";

			currentStyle.filter.replace(/alpha\(opacity=['"]?([0-9]+)['"]?\)/i, function(match1, match2) {
				value = match2;
			});

			return value ? (parseFloat(value)/100) + "" : value;
		};

		function normalize(property) {
﻿		 ﻿ return property.replace(/-([a-z])/g, function(match, letter) { return letter.toUpperCase(); });
		};

		function denormalize(property) {
﻿		 ﻿ return property.replace(/([A-Z])/g, function(match, letter) { return "-" + letter.toLowerCase(); });
		};

		function sizeToPixels(size, suffix, rootSize, fontSize) {
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
			do {
				var style = element.currentStyle;
				var cssValue = style["fontSize"];
				var suffix = cssValue.split(/\d/)[0];
				var isProportional = /%|em/.test(suffix);
				var element = element.parentNode;
			} while(isProportional && element && element.nodeType != 11);

			if (isProportional && (!element || element.nodeType == 11)) { 
				return 16; 
			}

			var size = parseFloat(cssValue);
			return sizeToPixels(size, suffix);
		};

		function getFirstNonStaticElementSize(element, property) {
			var positions = ["absolute","relative","fixed"];

			while(element.parentElement && element.parentElement.currentStyle) {
				element = element.parentElement;
				var position = element.currentStyle.position || "";
				if (positions.indexOf(position) != -1) { return element[property]; }
			}

			return element.ownerDocument.documentElement[property];
		};

		function getSizeInPixels(element, style, property, fontSize) {
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

			return sizeToPixels(size, suffix, rootSize, fontSize) || 0;
		};

		function getPositionInPixels(element, style, property, fontSize) {
			var value = style[property];
			var size = parseFloat(value);
			var suffix = value.split(/\d/)[0];
			var rootSize = 0;

			rootSize = getFirstNonStaticElementSize(element, property == "left" || property == "right" ? "clientWidth" : "clientHeight"); 

			return sizeToPixels(size, suffix, rootSize, fontSize);
		};

		function getSizeInPixelsWH(property, style, fontSize, offsetLength) {
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
			var baseFontSize = getBaseFontSize(element);
			var count = 0;
			var regexMeasureable = /margin.|padding.|border.+W|^fontSize$/;
			var positions = ["absolute","relative","fixed"];
			var sides = ["left","right","top","bottom"];

			for (property in currentStyle) {
				/*this[count] = denormalize(property);*/
				if (regexMeasureable.test(property) && currentStyle[property] != "auto") {
					this[property] = getSizeInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else if (property == "styleFloat") {
					this["float"] = currentStyle[property];
				} else if (property == "height" || property == "width") {
					var value = currentStyle[property];
					var valueLower = value.toLowerCase();
					var isMeasurable = value != "auto";
					var isInPixels = valueLower.indexOf("px") > -1;

					if (!isMeasurable || isInPixels) {
						this[property] = value;
					} else {
						this[property] = getSizeInPixelsWH(property, this, baseFontSize, element.offsetWidth) + "px";
					}
				} else if (sides.indexOf(property) > -1 && positions.indexOf(currentStyle["position"]) > -1 && currentStyle[property] != "auto") {
					this[property] = getPositionInPixels(element, currentStyle, property, baseFontSize) + "px";
				} else {
					try {
						/* IE8 crashes in case of getting some properties (outline, outlineWidth, ...) */
						this[property] = currentStyle[property];
					} catch(e) {
						this[property] = "";
					}
				}
				count++;
			}

			this.length = count;

			this["opacity"] = getOpacity(currentStyle);
		};

		CSSStyleDeclaration.prototype.getPropertyPriority =  function () {
			throw new Error('NotSupportedError: DOM Exception 9');
		};

		CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
			return this[normalize(prop)] || "";
		};

		CSSStyleDeclaration.prototype.item = function(index) {
			throw new Error('NoModificationAllowedError: DOM Exception 7');
			/*return this[index];*/
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
