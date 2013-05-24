/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Deklarace "jmenného prostoru" knihoven JAK. Dále obsahuje rozšíření
 * práce s poli dle definice JavaScriptu verze 1.6. Při použití této knihovny je
 * nutné pole vždy procházet pomocí for (var i=0; arr.length > i; i++).  
 * @author jelc 
 */ 

/**
 * @name JAK
 * @group jak
 * @namespace
 * JAK statický objekt, který se používá pro "zapouzdření"
 * všech definic a deklarací. V podmínce se nalezá pro
 * jistotu, protože může být definován ještě před svou
 * deklarací při použití slovníků, nebo konfigurací. 
 */
if (typeof(window.JAK) != 'object'){
	window.JAK = {NAME: "JAK", _idCnt: 0};
};

/**
 * generátor unikátních ID
 * @static
 * @returns {string} unikátní ID
 */
JAK.idGenerator = function() {
	this._idCnt = (this._idCnt < 10000000 ? this._idCnt : 0);
	var id = 'm' +  new Date().getTime().toString(16) +  'm' + this._idCnt.toString(16);
	this._idCnt++;
	return id;
};

if (!Function.prototype.bind) {
	/**
	 * ES5 Function.prototype.bind
	 * Vrací funkci zbindovanou do zadaného kontextu.
	 * Zbylé volitelné parametry jsou předány volání vnitřní funkce.
	 * @param {object} thisObj Nový kontext
	 * @returns {function}
	 */
	Function.prototype.bind = function(thisObj) {
		var fn = this;
		var args = Array.prototype.slice.call(arguments, 1); 
		return function() { 
			return fn.apply(thisObj, args.concat(Array.prototype.slice.call(arguments))); 
		}
	}
};

if (!Date.now) {
	/** 
	 * aktuální timestamp dle ES5 - http://dailyjs.com/2010/01/07/ecmascript5-date/
	 */
	Date.now = function() { return +(new Date); }
}

if (!Object.create) {
	/** 
	 * Object.create dle ES5 - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
	 */
	Object.create = function (o) {
		if (arguments.length > 1) { throw new Error("Object.create polyfill only accepts the first parameter"); }
		var tmp = function() {};
		tmp.prototype = o;
		return new tmp();
	};
}

/** 
 * rozšíření polí v JS 1.6 dle definice na http://dev.mozilla.org
 */
if (!Array.prototype.indexOf) { 
	Array.prototype.indexOf = function(item, from) {
	    var len = this.length;
	    var i = from || 0;
	    if (i < 0) { i += len; }
	    for (;i<len;i++) {
			if (i in this && this[i] === item) { return i; }
	    }
	    return -1;
	}
}
if (!Array.indexOf) {
	Array.indexOf = function(obj, item, from) { return Array.prototype.indexOf.call(obj, item, from); }
}

if (!Array.prototype.lastIndexOf) { 
	Array.prototype.lastIndexOf = function(item, from) {
	    var len = this.length;
		var i = (from === undefined ? len-1 : from);
		if (i < 0) { i += len; }
	    for (;i>-1;i--) {
			if (i in this && this[i] === item) { return i; }
	    }
	    return -1;
	}
}
if (!Array.lastIndexOf) {
	Array.lastIndexOf = function(obj, item, from) {
		if (arguments.length > 2) {
			return Array.prototype.lastIndexOf.call(obj, item, from);
		} else {
			return Array.prototype.lastIndexOf.call(obj, item);
		}
	}
}

if (!Array.prototype.forEach) { 
	Array.prototype.forEach = function(cb, _this) {
	    var len = this.length;
	    for (var i=0;i<len;i++) { 
			if (i in this) { cb.call(_this, this[i], i, this); }
		}
	}
}
if (!Array.forEach) { 
	Array.forEach = function(obj, cb, _this) { Array.prototype.forEach.call(obj, cb, _this); }
}

if (!Array.prototype.every) { 
	Array.prototype.every = function(cb, _this) {
	    var len = this.length;
	    for (var i=0;i<len;i++) {
			if (i in this && !cb.call(_this, this[i], i, this)) { return false; }
	    }
	    return true;
	}
}
if (!Array.every) { 
	Array.every = function(obj, cb, _this) { return Array.prototype.every.call(obj, cb, _this); }
}

if (!Array.prototype.some) { 
	Array.prototype.some = function(cb, _this) {
		var len = this.length;
		for (var i=0;i<len;i++) {
			if (i in this && cb.call(_this, this[i], i, this)) { return true; }
		}
		return false;
	}
}
if (!Array.some) { 
	Array.some = function(obj, cb, _this) { return Array.prototype.some.call(obj, cb, _this); }
}

if (!Array.prototype.map) { 
	Array.prototype.map = function(cb, _this) {
		var len = this.length;
		var res = new Array(len);
		for (var i=0;i<len;i++) {
			if (i in this) { res[i] = cb.call(_this, this[i], i, this); }
		}
		return res;
	}
}
if (!Array.map) { 
	Array.map = function(obj, cb, _this) { return Array.prototype.map.call(obj, cb, _this); }
}

if (!Array.prototype.filter) { 
	Array.prototype.filter = function(cb, _this) {
		var len = this.length;
	    var res = [];
			for (var i=0;i<len;i++) {
				if (i in this) {
					var val = this[i]; // in case fun mutates this
					if (cb.call(_this, val, i, this)) { res.push(val); }
				}
			}
	    return res;
	}
}
if (!Array.filter) { 
	Array.filter = function(obj, cb, _this) { return Array.prototype.filter.call(obj, cb, _this); }
}

/** 
 * Doplneni zadanym znakem zleva na pozadovanou delku
 */
String.prototype.lpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return s+this.toString();
}


/** 
 * Doplneni zadanym znakem zprava na pozadovanou delku
 */
String.prototype.rpad = function(character, count) {
	var ch = character || "0";
	var cnt = count || 2;

	var s = "";
	while (s.length < (cnt - this.length)) { s += ch; }
	s = s.substring(0, cnt-this.length);
	return this.toString()+s;
}

/** 
 * Oriznuti bilych znaku ze zacatku a konce retezce
 */
String.prototype.trim = function() {
	return this.match(/^\s*([\s\S]*?)\s*$/)[1];
}
if (!String.trim) {
	String.trim = function(obj) { return String.prototype.trim.call(obj);}
}

/** 
 * porovnani retezcu na zaklade znaku z ceske abecedy
 */
String.prototype.CS_ALPHABET = "0123456789AÁBCČDĎEĚÉFGHCHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽaábcčdďeěéfghchiíjklmnňoópqrřsštťuúůvwxyýzž";

String.prototype.localeCSCompare = function(value) {
	value += ""; // explicitne prevedeme na string
	if (this+"" === value) { return 0; } // pokud jsou retezce totozne, neni co resit, vracime 0

	/* chceme vzdy jako parametr zpracovavat primarne kratsi retezec */
	if (this.length < value.length) { return -value.localeCSCompare(this); }

	/* zjistime, ktery retezec je kratsi a pomoci nej se bude cyklus ridit */
	var i = 0;
	var j = 0;
	var length = value.length;
	var charValue = '';
	var charThis = '';
	var indexValue = 0;
	var indexThis = 0;

	while (i < length) {
		/* nacteme vzdy jeden znak z kazdeho z retezcu */
		charValue = value.charAt(i);
		charThis = this.charAt(j);

		/* c je podezrely znak, protoze po nem muze nasledovat h a mame najednou znak ch */
		if (charThis.toLowerCase() == 'c') {
			var tempString = this.substring(j, j + 2);
			if (tempString == "ch" || tempString == "CH") {
				j++;
				charThis = tempString;
			}
		}

		/* to stejne plati i pro druhy retezec, c je podezrely znak pouze v pripade, ze neni na konci retezce */
		if (charValue.toLowerCase() == 'c') {
			var tempString = value.substring(i, i + 2);
			if (tempString == "ch" || tempString == "CH") {
				i++;
				charValue = tempString;
			}
		}

		/* zjistime si, kde se v nasi abecede nachazi */
		indexValue = this.CS_ALPHABET.indexOf(charValue);
		indexThis = this.CS_ALPHABET.indexOf(charThis);

		/* pokud jsme narazili na ruzne znaky, koncime */
		if (charValue != charThis) { break; }

		/* jinak zvetsime o jednicku a pokracujeme */
		i++; j++;
	}
	
	if (i == length) { return 1; } /* zadny rozdil => this je nadmnozina value */

	if (indexValue == indexThis) { /* oba mimo abecedu */
		return charThis.localeCompare(charValue);
	} else if (indexThis == -1) { /* tento mimo abecedu */
		return -1;
	} else if (indexValue == -1) { /* druhy mimo abecedu */
		return 1;
	} else {
		return indexThis - indexValue; /* rozdil indexu v abecede */
	}
}

/** 
 * Doplneni toISOString kde neni, viz https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toISOString
 */
if (!Date.prototype.toISOString) {  
	(function() {  
		function pad(number) {  
			var r = String(number);  
			if ( r.length === 1 ) {  
				r = '0' + r;  
			}  
			return r;  
		}  
   
		Date.prototype.toISOString = function() {  
			return this.getUTCFullYear()  
				+ '-' + pad( this.getUTCMonth() + 1 )  
				+ '-' + pad( this.getUTCDate() )  
				+ 'T' + pad( this.getUTCHours() )  
				+ ':' + pad( this.getUTCMinutes() )  
				+ ':' + pad( this.getUTCSeconds() )  
				+ '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )  
				+ 'Z';  
		};  
	}());  
} 

Date.prototype._dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
Date.prototype._dayNamesShort = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
Date.prototype._monthNames = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
Date.prototype._monthNamesShort = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Črc", "Srp", "Zář", "Říj", "Lis", "Pro"];

/** 
 * Formatovani data shodne s http://php.net/date
 */
Date.prototype.format = function(str) {
	var suffixes = {
		1:"st",
		2:"nd",
		3:"rd",
		21:"st",
		22:"nd",
		23:"rd",
		31:"st"
	};
	var result = "";
	var escape = false;
	for (var i=0;i<str.length;i++) {
		var ch = str.charAt(i);
		if (escape) {
			escape = false;
			result += ch;
			continue;
		}
		switch (ch) {
			case "\\":
				if (escape) {
					escape = false;
					result += ch;
				} else {
					escape = true;
				}
			break;
			case "d": result += this.getDate().toString().lpad(); break;
			case "j": result += this.getDate(); break;
			case "w": result += this.getDay(); break;
			case "N": result += this.getDay() || 7; break;
			case "S": 
				var d = this.getDate();
				result += suffixes[d] || "th";
			break;
			case "D": result += this._dayNamesShort[(this.getDay() || 7)-1]; break;
			case "l": result += this._dayNames[(this.getDay() || 7)-1]; break;
			case "z":
				var t = this.getTime();
				var d = new Date(t);
				d.setDate(1);
				d.setMonth(0);
				var diff = t - d.getTime();
				result += diff / (1000 * 60 * 60 * 24);
			break;
			
			case "W":
				var d = new Date(this.getFullYear(), this.getMonth(), this.getDate());
				var day = d.getDay() || 7;
				d.setDate(d.getDate() + (4-day));
				var year = d.getFullYear();
				var day = Math.floor((d.getTime() - new Date(year, 0, 1, -6).getTime()) / (1000 * 60 * 60 * 24));
				result += (1 + Math.floor(day / 7)).toString().lpad();
			break;

			case "m": result += (this.getMonth()+1).toString().lpad(); break;
			case "n": result += (this.getMonth()+1); break;
			case "M": result += this._monthNamesShort[this.getMonth()]; break;
			case "F": result += this._monthNames[this.getMonth()]; break;
			case "t":
				var t = this.getTime();
				var m = this.getMonth();
				var d = new Date(t);
				var day = 0;
				do {
					day = d.getDate();
					t += 1000 * 60 * 60 * 24;
					d = new Date(t);
				} while (m == d.getMonth());
				result += day;
			break;

			case "L":
				var d = new Date(this.getTime());
				d.setDate(1);
				d.setMonth(1);
				d.setDate(29);
				result += (d.getMonth() == 1 ? "1" : "0");
			break;
			case "Y": result += this.getFullYear().toString().lpad(); break;
			case "y": result += this.getFullYear().toString().lpad().substring(2); break;

			case "a": result += (this.getHours() < 12 ? "am" : "pm"); break;
			case "A": result += (this.getHours() < 12 ? "AM" : "PM"); break;
			case "G": result += this.getHours(); break;
			case "H": result += this.getHours().toString().lpad(); break;
			case "g": result += this.getHours() % 12; break;
			case "h": result += (this.getHours() % 12).toString().lpad(); break;
			case "i": result += this.getMinutes().toString().lpad(); break;
			case "s": result += this.getSeconds().toString().lpad(); break;
			
			case "Z": result += -60*this.getTimezoneOffset(); break;
			
			case "O": 
			case "P": 
				var base = this.getTimezoneOffset()/-60;
				var o = Math.abs(base).toString().lpad();
				if (ch == "P") { o += ":"; }
				o += "00";
				result += (base >= 0 ? "+" : "-")+o;
			break;

			case "U": result += this.getTime()/1000; break; 
			case "u": result += "0"; break; 
			case "c": result += arguments.callee.call(this, "Y-m-d")+"T"+arguments.callee.call(this, "H:i:sP"); break; 
			case "r": result += arguments.callee.call(this, "D, j M Y H:i:s O"); break; 

			default: result += ch; break;
		}
	}
	return result;
}

if (!window.JSON) {
	(function(){
        var escapes = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"' : '\\"',
			'\\': '\\\\'
        };	
        var re = "[";
        for (var p in escapes) { re += "\\"+p; }
        re += "]";
        re = new RegExp(re, "g");

		var stringifyString = function(value) {
			var v = value.replace(re, function(ch) {
				return escapes[ch];
			});
			return '"' + v + '"';
		}
		
		var stringifyValue = function(value, replacer, space, depth) {
			var indent = new Array(depth+1).join(space);
			if (value === null) { return "null"; }

			switch (typeof(value)) {
				case "string":
					return stringifyString(value);
				break;
				
				case "boolean":
				case "number":
					return value.toString();
				break;
				
				case "object":
					var result = "";
					if (value instanceof Date) {
						result = stringifyString(value.toISOString());
					} else if (value instanceof Array) {
						result += "["; /* oteviraci se neodsazuje */
						for (var i=0;i<value.length;i++) {
							var v = value[i];

							if (i > 0) {
								result += ",";
								if (space.length) { result += "\n" + indent + space; } /* polozky se odsazuji o jednu vic */
							}
							result += arguments.callee(v, replacer, space, depth+1);
						}
						if (value.length > 1 && space.length) { result += "\n" + indent; } /* zaviraci se odsazuje na aktualni uroven */
						result += "]";

					} else {
						result += "{";
						var count = 0;
						for (var p in value) {
							var v = value[p];
							
							if (count > 0) { result += ","; }
							if (space.length) { result += "\n" + indent + space; } /* polozky se odsazuji o jednu vic */
							
							result += stringifyString(p)+":"+arguments.callee(v, replacer, space, depth+1);
							count++;
						}
						if (count > 0 && space.length) { result += "\n" + indent; } /* zaviraci se odsazuje na aktualni uroven */
						result += "}";
					}

					return result;
				break;
				
				case "undefined": 
				default:
					return "undefined";
				break;
			}
		}
		
		window.JSON = {
			parse: function(text) {
				return eval("("+text+")");
			},
			stringify: function(value, replacer, space) {
				var sp = "";
				if (typeof(space) == "number" && space > 1) {
					sp = new Array(space+1).join(" ");
				} else if (typeof(space) == "string") {
					sp = space;
				}
				
				return stringifyValue(value, replacer, sp, 0);
				
			}
		};
	})();
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Statická třída sestavující dědičnost rozšiřováním prototypového objektu
 * doplňováním základních metod a testováním závislostí. 
 * @version 5.1
 * @author jelc, zara, aichi
 */   

/**
 * Konstruktor se nevyužívá. Vždy rovnou voláme metody, tedy např.: JAK.ClassMaker.makeClass(...).
 * @namespace
 * @group jak
 */    
JAK.ClassMaker = {};

/** 
 * @field {string} verze třídy 
 */
JAK.ClassMaker.VERSION = "5.1";
/** 
 * @field {string} název třídy 
 */
JAK.ClassMaker.NAME = "JAK.ClassMaker";
	
/**
 * Vlastní metoda pro vytvoření třídy, v jediném parametru se dozví informace o třídě, kterou má vytvořit.
 * @param {object} params parametry pro tvorbu nové třídy
 * @param {string} params.NAME povinný název třídy
 * @param {string} [params.VERSION="1.0"] verze třídy
 * @param {function} [params.EXTEND=false] reference na rodičovskou třídu
 * @param {function[]} [params.IMPLEMENT=[]] pole referencí na rozhraní, jež tato třída implementuje
 * @param {object[]} [params.DEPEND=[]] pole závislostí
 */
JAK.ClassMaker.makeClass = function(params) {
	var p = this._makeDefaultParams(params);
	
	var constructor = function() { /* normalni trida */
		if (this.$constructor) { this.$constructor.apply(this, arguments); }
	}

	return this._addConstructorProperties(constructor, p);
}

/**
 * Vlastní metoda pro vytvoření Jedináčka (Singleton), odlišnost od tvorby třídy přes makeClass je, 
 * že třídě vytvoří statickou metodu getInstance, která vrací právě jednu instanci a dále, že konstruktor
 * nelze zavolat pomocí new (resp. pokud je alespoň jedna instance vytvořena.) Instance je uschována do 
 * vlastnosti třídy _instance
 * @see JAK.ClassMaker.makeClass
 */ 
JAK.ClassMaker.makeSingleton = function(params) {
	var p = this._makeDefaultParams(params);
	
	var constructor = function() { /* singleton, nelze vytvaret instance */
		throw new Error("Cannot instantiate singleton class");
	}
	
	constructor._instance = null;
	constructor.getInstance = this._getInstance;

	return this._addConstructorProperties(constructor, p);
}

/**
 * Vlastní metoda pro vytvoření "třídy" charakterizující rozhranní
 * @see JAK.ClassMaker.makeClass
 */
JAK.ClassMaker.makeInterface = function(params) {
	var p = this._makeDefaultParams(params);
	
	var constructor = function() {
		throw new Error("Cannot instantiate interface");
	}
	
	return this._addConstructorProperties(constructor, p);	
}

/**
 * Vlastní metoda pro vytvoření statické třídy, tedy jmeného prostoru
 * @param {object} params parametry pro tvorbu nové třídy
 * @param {string} params.NAME povinný název třídy
 * @param {string} params.VERSION verze třídy
 */
JAK.ClassMaker.makeStatic = function(params) {
	var p = this._makeDefaultParams(params);

	var obj = {};
	obj.VERSION = p.VERSION;
	obj.NAME = p.NAME;
	return obj;
}

/**
 * Vytvoření defaultních hodnot objektu params, pokud nejsou zadané autorem
 * @param {object} params parametry pro tvorbu nové třídy 
 */ 
JAK.ClassMaker._makeDefaultParams = function(params) {
	if ('EXTEND' in params) {
		if (!params.EXTEND) {
			throw new Error("Cannot extend non-exist class");
		}
		if (!('NAME' in params.EXTEND)) {
			throw new Error("Cannot extend non-JAK class");
		}
	}

	params.NAME = params.NAME || false;
	params.VERSION = params.VERSION || "1.0";
	params.EXTEND = params.EXTEND || false;
	params.IMPLEMENT = params.IMPLEMENT || [];
	params.DEPEND = params.DEPEND || [];
	
	/* implement muze byt tez jeden prvek */
	if (!(params.IMPLEMENT instanceof Array)) { params.IMPLEMENT = [params.IMPLEMENT]; }
	
	this._preMakeTests(params);
	
	return params;
}

/**
 * Otestování parametrů pro tvorbu třídy
 * @param {object} params parametry pro tvorbu nové třídy 
 */ 
JAK.ClassMaker._preMakeTests = function(params) {
    if (!params.NAME) { throw new Error("No NAME passed to JAK.ClassMaker.makeClass()"); }
	
	/* test zavislosti */
	var result = false;
	if (result = this._testDepend(params.DEPEND)) { throw new Error("Dependency error in class " + params.NAME + " ("+result+")"); }
}

/**
 * Vytvořenému konstruktoru nové třídy musíme do vínku dát výchozí hodnoty a metody
 */ 
JAK.ClassMaker._addConstructorProperties = function(constructor, params) {
	/* staticke vlastnosti */
	for (var p in params) { constructor[p] = params[p]; }
	
	/* zdedit */
	this._setInheritance(constructor);
	
	/* classMaker dava instancim do vinku tyto vlastnosti a metody */
	constructor.prototype.constructor = constructor;
	constructor.prototype.$super = this._$super;
	
	return constructor;	
}

/**
 * Statická metoda pro všechny singletony
 */
JAK.ClassMaker._getInstance = function() {
	if (!this._instance) { 
		this._instance = Object.create(this.prototype); 
		if ("$constructor" in this.prototype) { this._instance.$constructor(); }
	}
	return this._instance;
}
	
/**
 * Volá vlastní kopírování prototypových vlastností jednotlivých rodičů
 * @param {array} extend pole rodicovskych trid
*/
JAK.ClassMaker._setInheritance = function(constructor) {
	if (constructor.EXTEND) { this._makeInheritance(constructor, constructor.EXTEND); }
	for (var i=0; i<constructor.IMPLEMENT.length; i++) {
		this._makeInheritance(constructor, constructor.IMPLEMENT[i], true);
	}
}

/**
 * Provádí vlastní kopírovaní prototypových vlastností z rodiče do potomka 
 * pokud je prototypová vlastnost typu object zavolá metodu, která se pokusí
 * vytvořit hlubokou kopii teto vlastnosti
 * @param {object} constructor Potomek, jehož nové prototypové vlastnosti nastavujeme
 * @param {object} parent Rodič, z jehož vlastnosti 'protype' budeme kopírovat	  	 
 * @param {bool} noSuper Je-li true, jen kopírujeme vlasnosti (IMPLEMENT)
*/
JAK.ClassMaker._makeInheritance = function(constructor, parent, noSuper){
	/* nastavit funkcim predka referenci na predka */
	for (var p in parent.prototype) {
		var item = parent.prototype[p];
		if (typeof(item) != "function") { continue; }
		if (!item.owner) { item.owner = parent; }
	}

	if (!noSuper) { /* extend */
		constructor.prototype = Object.create(parent.prototype);
		for (var p in parent.prototype) {
			if (typeof parent.prototype[p] != "object") { continue; }
			constructor.prototype[p] = JSON.parse(JSON.stringify(parent.prototype[p]));
		}
		return;
	}

	for (var p in parent.prototype) { /* implement */
		if (typeof parent.prototype[p] == "object") {
			constructor.prototype[p] = JSON.parse(JSON.stringify(parent.prototype[p]));
		} else {
			constructor.prototype[p] = parent.prototype[p];
		}
	}
}
	
/**
 * Testuje závislosti vytvářené třídy, pokud jsou nastavené
 * @param {array} depend Pole závislostí, ktere chceme otestovat
 * @returns {bool|string} false = ok, string = error  
*/
JAK.ClassMaker._testDepend = function(depend){
	for(var i = 0; i < depend.length; i++) {
		var item = depend[i];
		if (!item.sClass) { return "Unsatisfied dependency"; }
		if (!item.ver) { return "Version not specified in dependency"; }
		var depMajor = item.sClass.VERSION.split('.')[0];
		var claMajor = item.ver.split('.')[0];
		if (depMajor != claMajor) { return "Version conflict in "+item.sClass.NAME; }
	}
	return false;
}

/**
 * Další pokus o volání předka. Přímo volá stejně pojmenovanou metodu předka a předá jí zadané parametry.
 */
JAK.ClassMaker._$super = function() {
	var caller = arguments.callee.caller; /* nefunguje v Opere < 9.6 ! */
	if (!caller) { throw new Error("Function.prototype.caller not supported"); }
	
	var owner = caller.owner || this.constructor; /* toto je trida, kde jsme "ted" */

	var callerName = false;
	for (var name in owner.prototype) {
		if (owner.prototype[name] == caller) { callerName = name; break; }
	}
	if (!callerName) { throw new Error("Cannot find supplied method in constructor"); }
	
	var parent = owner.EXTEND;
	if (!parent) { throw new Error("No super-class available"); }
	if (!parent.prototype[callerName]) { throw new Error("Super-class doesn't have method '"+callerName+"'"); }

	var func = parent.prototype[callerName];
	return func.apply(this, arguments);
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Třída sloužící ke zpracovavaní udalostí a časovačů poskytovaných DOM modelem.
 * @version 3.3
 * @author jelc, zara
 */   

/**
 * Jmenný prostor pro správu událostí
 * @group jak
 * @namespace
 */   
JAK.Events = JAK.ClassMaker.makeStatic({
	NAME: "JAK.Events",
	VERSION: "3.3"
});

/**
 * do této vlastnosti ukládáme všechny události pro odvěšení
 */ 
JAK.Events._events = {};
JAK.Events._domReadyCallbacks = [];

/**
 * Metoda kterou použijeme, pokud chceme navěsit vlastní kód na událost, kdy je DOM strom připraven k použití.
 * Je možné navěsit libovolný počet volaných funkcí.   
 * @param {object} obj kontext, tj. "this" pro funkci
 * @param {function || string} func funkce, která se bude provádět jako posluchač  
 */ 
JAK.Events.onDomReady = function(obj, func) {
	var f = (typeof(func) == "function" ? func : obj[func]);
	if (obj) { f = f.bind(obj); }

	if (document.readyState == "complete") { return setTimeout(f, 0); } /* uz bylo, jen asynchronne vykoname */

	if (!this._domReadyCallbacks.length) { /* prvni volani - navesit relevantni posluchac */
		var process = function() {
			while (this._domReadyCallbacks.length) { this._domReadyCallbacks.shift()(); }
		}
		process = process.bind(this);

		if (window.addEventListener) {
			window.addEventListener("DOMContentLoaded", process);
		} else {
			document.attachEvent("onreadystatechange", function() {
				if (document.readyState == "complete") { process(); }
			});
		}
	}

	this._domReadyCallbacks.push(f);
}

/**
 * Zavěšuje posluchače na danou událost; vytváří a ukládá si anonymní funkci
 * která provede vlastní volání registroveného posluchače tak, aby se provedl ve správném
 * oboru platnosti. (this uvnitř posluchače se bude vztahovat k objektu, jehož je naslouchající funkce metodou; 
 * jako parametry se předá odkaz na vzniklou událost a prvek, na kterém se naslouchalo.)<br/>
 *
 * Možno volat následujícími způsoby: 
 * <ul>
 * <li>addListener(node, "click", obj)</li>
 * <li>addListener(node, "click", fce)</li>
 * <li>addListener(node, "click", obj, fce)</li>
 * <li>addListener(node, "click", obj, "nazevFce")</li>
 * </ul>
 *
 * @param {node} elm element, který událost zachytává
 * @param {string} type název události (bez předpony "on"); možno zadat víc událostí naráz oddělených mezerami
 * @param {object || function} obj 1) objekt, jehož metodu budeme volat, 2) objekt s metodou handleEvent, 3) funkce
 * @param {function || string} func funkce, která se bude provádět jako posluchač;
 * <em>string</em> pokud jde o metodu <em>obj</em> nebo reference na funkci, která se zavolá
 * jako metoda <em>obj</em>  
 * @param {boolean} capture hodnata použitá jako argument capture pro DOM zachytávání, pro IE je ignorována 
 * @returns {string} identifikátor handleru v <em>_events</em>, prostřednictvím kterého se událost odvěšuje
 *
 * @throws {error} Events.addListener: arguments[3] must be method of arguments[2]
 */
JAK.Events.addListener = function(elm, type, obj, func, capture) {
	obj = obj || window;
	capture = capture || false;

	var id = JAK.idGenerator();

	/* nasledujici sada podminek zpracuje vsechny povolene kombinace vstupu do jedineho spravneho handleru "action" */
	var action = obj;
	if (func) {
		if (typeof(func) == "string") { /* zadano jako string */
			if (typeof(obj[func]) != "function") { throw new Error("Events.addListener: arguments[3] must be method of arguments[2]"); }
			action = function(e) { obj[func](e, elm, id); }
		} else { /* zadano referenci na fci */
			action = function(e) { func.call(obj, e, elm, id); }
		}
	} else if (typeof(obj) == "function") { /* zadano referenci na fci bez objektu */
		action = function(e) { obj(e, elm, id); }
	} else if (!document.addEventListener) { /* varianta handleEvent, ale bez nativni podpory */
		action = function(e) { obj.handleEvent(e); }
	}

	this._addListener(elm, type, action, capture);

	this._events[id] = {
		elm: elm,
		type: type,
		action: action, 
		capture: capture
	};

	return id;
}

/**
 * Vlastní zavěšení posluchače buď DOM kompatibilně, nebo přes attachEvent pro IE 
 * @param {node} elm element, který událost zachytává
 * @param {string} type typ události bez předpony "on"; možno zadat víc událostí naráz oddělených mezerami
 * @param {function || object} action funkce/metoda která se bude provádět
 * @param {boolean} capture hodnota použitá jako argument capture pro DOM zachytávání
 */    
JAK.Events._addListener = function(elm, type, action, capture) {
	var types = type.split(" ");
	for (var i=0;i<types.length;i++) {
		var t = types[i];
		if (document.addEventListener) {
			elm.addEventListener(t, action, capture);
		} else {
			elm.attachEvent("on"+t, action);
		}
	}
}

/**
 * Odebírání posluchačů události zadáním <em>id</em>, které vrací medoda <em>addListener</em>
 * @param {id} id ID události
 */    
JAK.Events.removeListener = function(id) {
	if (!(id in this._events)) { throw new Error("Cannot remove non-existent event ID '"+id+"'"); }

	var obj = this._events[id];
	this._removeListener(obj.elm, obj.type, obj.action, obj.capture);
	delete this._events[id];
}

/**
 * provádí skutečné odvěšení posluchačů DOM kompatibilně či pro IE
 * @param {object} elm element na kterém se naslouchalo
 * @param {string} type událost, která se zachytávala; možno zadat víc událostí naráz oddělených mezerami
 * @param {function} action skutečná funkce, která zpracovávala událost
 * @param {boolean} capture pro DOM zpracovávání stejna hodota jako při zavěšování
 */    
JAK.Events._removeListener = function(elm, type, action, capture) {
	var types = type.split(" ");
	
	for (var i=0;i<types.length;i++) {
		var t = types[i];
		if (document.removeEventListener) {
			elm.removeEventListener(t, action, capture);
		} else {
			elm.detachEvent("on"+t, action);
		}
	}
}

/**
 * Provede odvěšení událostí podle jejich <em>id</em> uložených v poli
 * @param {id[]} array pole ID událostí jak je vrací metoda <em>addListener</em>
 */  
JAK.Events.removeListeners = function(array) {
	while (array.length) { this.removeListener(array.shift()); }
}


/**
 * Provede odvěšení všech posluchačů, kteří jsou uloženi v <em>_events</em>
 */   
JAK.Events.removeAllListeners = function() {
	for (var id in this._events) { this.removeListener(id); }
}

/**
 * Zastaví probublávaní události stromem dokumentu
 * @param {object} e zpracovávaná událost 
 */  
JAK.Events.stopEvent = function(e) {
	var e = e || window.event;
	if (e.stopPropagation){
		e.stopPropagation();
	} else { 
		e.cancelBubble = true;
	}
}

/**
 * Zruší výchozí akce (definované klientem) pro danou událost (např. prokliknutí odkazu)
 * @param {object} e zpracovávaná událost 
 */   
JAK.Events.cancelDef = function(e) {
	var e = e || window.event;
	if(e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
}

/**
 * Vrací cíl události, tedy na kterém DOM elementu byla vyvolána.
 * @param {object} e událost 
 */  
JAK.Events.getTarget = function(e) {
	var e = e || window.event;
	return e.target || e.srcElement; 
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Detekce klientského prostředí v závislosti na vlastnostech JavaScriptu
 * (pokud je to možné, jinak dle vlastnosti navigator.userAgent).
 * @version 3.0
 * @author jelc, zara
 */   

/**
 * Statická třída obsahující vlastnosti <em>platform</em>, <em>client</em>,  
 * <em>version</em> a <em>agent</em>, které určují uživatelovo prostředí
 * @namespace
 * @group jak
 */
JAK.Browser = JAK.ClassMaker.makeStatic({
	NAME: "JAK.Browser",
	VERSION: "3.0"
});

/** @field {string} platform system uzivatele */
JAK.Browser.platform = '';
/** @field {string} client prohlizec uzivatele */
JAK.Browser.client = '';
/** @field {string} version verze prohlizece */
JAK.Browser.version = 0;
/** @field {string} agent hodnota systemove promene "navigator.userAgent" */
JAK.Browser.agent = '';
/** @field {object} mouse objekt s vlastnostmi left, right, middle které lze použít k identifikaci stisknutého tlačítka myši */
JAK.Browser.mouse = {};

/**
 * Zjistuje system uzivatele
 * @private
 * @returns {string} ktery popisuje pouzivany system:
 * <ul>
 * <li>nix - Linux, BSD apod.</li>
 * <li>mac - Apple</li>
 * <li>win - Windows pro PC</li>
 * <li>oth - vsechno ostatni</li>  
 * </ul>    
 *
 */   
JAK.Browser._getPlatform = function(){
	if((this._agent.indexOf('iPhone') != -1)
	|| (this._agent.indexOf('iPod') != -1)
	|| (this._agent.indexOf('iPad') != -1)){
		return 'ios';
	} else if(this._agent.indexOf('Android') != -1){
		return 'and';
	} else if((this._agent.indexOf('X11') != -1)
	|| (this._agent.indexOf('Linux') != -1)){
		return 'nix';
	} else if(this._agent.indexOf('Mac') != -1){
		return 'mac';
	} else if(this._agent.indexOf('Win') != -1){
		return 'win';
	} else {
		return 'oth';
	}
};

/**
 * Zjistuje typ prohlizece
 * @private
 * @returns {string} ktery popisuje pouzivany prohlizec
 * <ul>
 * <li>opera - Opera</li>
 * <li>ie - Internet Explorer</li>
 * <li>gecko - Mozilla like</li>
 * <li>konqueror - Konqueror</li>  
 * <li>safari - Safari</li>  
 * <li>chrome - Google Chrome</li>  
 * <li>oth - vsechno ostatni/neznamy</li>  
 * </ul>  
 */   
JAK.Browser._getClient = function(){
	if (window.opera) {
		return "opera";
	} else if (window.chrome) {
		return "chrome";
	} else if(document.attachEvent && (typeof navigator.systemLanguage != "undefined")) {
		return "ie";
	} else if (document.getAnonymousElementByAttribute) {
		return "gecko";
	} else if (this._agent.indexOf("KHTML") != -1) {
		if (this._vendor == "KDE") {
			return "konqueror";
		} else if (this._vendor.indexOf("Apple") != -1) { 
			return "safari";
		} else {
			return "oth";
		}
	} else {
		return "oth";
	}
};

/**
 * Nastavuje identifikaci leveho a praveho tlacitka mysi
 * @private 
 * @returns {object} jako asociativni pole s vlastnostmi
 * <em>left</em> a <em>right</em>, ktere obsahuji ciselny identifikator
 * stisknuteho tlacitka mysi jak ho klient vraci ve vlastnosti udalosti
 * <em>e.button</em>
 */
JAK.Browser._getMouse = function(){
	var left;
	var right;
	var middle;
	if (JAK.Browser.client == 'ie' && parseFloat(JAK.Browser.version) < 9) {
		left = 1;
		middle = 4;
		right = 2;
	} else if(JAK.Browser.client == 'konqueror') {
		var ver = parseFloat(JAK.Browser.version);
		if(ver < 4 ) {
			left = 1;
			middle = 4;
			right = 2;
		} else {
			left = 0;
			middle = 1;
			right = 2;
		}
	} else if((JAK.Browser.client == 'opera') && (JAK.Browser.version > 7) && (JAK.Browser.version < 9)) {
		left = 1;
		middle = 4;
		right = 2;
	} else if (JAK.Browser.client == 'safari'){
		if (parseInt(JAK.Browser.version) > 2) {
			left = 0;
			middle = 0;
			right = 2;
		} else {
			left = 1;
			middle = 1;
			right = 2;
		}
	} else {
		left = 0;
		middle = 1;
		right = 2;
	}
	
	return {left:left,right:right, middle:middle};	
}

/**
 * Zjistuje verzi daneho prohlizece, detekovaneho metodou "_getClient"
 * @private
 * @returns {string} navratova hodnota metod jejich nazev je slozeny z retezcu
 * '_get_' + vlastnost <em>client</em>  + '_ver'
 * @example  <pre>
 * pro Internet Exlporer je volana metoda <em>this._get_ie_ver()</em>
 *</pre>    
 */   
JAK.Browser._getVersion = function(){
	var out = 0;
	var fncName = '_get_' + this.client + '_ver';
	
	if(typeof this[fncName] == 'function'){
		return this[fncName]();
	} else {
		return 0;
	}
};

/**
 * Detekce verze Internet Exploreru
 * @private
 * @returns {string} verze prohlizece od 5.0 do 7 (IE 8 bude detekovano jako 7)
 */   
JAK.Browser._get_ie_ver = function(){
	if(typeof Function.prototype.call != 'undefined'){
		if("draggable" in document.createElement('div')) {
			return '10';
		} else if (document.addEventListener) {
			return '9';
		} else if (Object.prototype.toString.call(window.JSON) === "[object JSON]") {
			return '8';
		} else if(window.XMLHttpRequest){
			return '7';
		} else if (typeof document.doctype == 'object'){
			return '6';
		} else {
			return '5.5';
		}
	} else {
		return '5.0';
	}
};

/**
 * Detekce verze Opery
 * Od 6 do aktualni verze. od verze 7.6+ je podporovana vlastnost
 * window.opera.version() vracejici aktualni verzi, napr. 9.63  
 * @see http://www.howtocreate.co.uk/operaStuff/operaObject.html 
 * @private
 * @returns {string} verze prohlizece 
 */  
JAK.Browser._get_opera_ver = function(){
	if(window.opera.version){
		return window.opera.version();
	} else { 
		if(document.createComment){
			return '7';
		} else {
			return '6';
		}
	}
};

/**
 * Detekce verze Gecko prohlizecu
 * @private
 * @returns {string} verze prohlizece od 1.5 do 7 (> 7 bude detekovano jako 7)
 */ 
JAK.Browser._get_gecko_ver = function() {
	if ("textOverflow" in document.createElement("div").style) { 
		return "7";
	} else if (window.EventSource) { 
		return "6";
	} else if ("onloadend" in new XMLHttpRequest()) { 
		return "5";
	} else if (history.pushState) { 
		return "4";
	} else if (document.getBoxObjectFor === undefined) { 
		return "3.6";
	} else if (navigator.geolocation) {
		return "3.5";
	} else if (document.getElementsByClassName) {
		return "3";
	} else if (window.external){
		return "2";
	} else {
		return "1.5";
	}
};

/**
 * Detekce verze Konqueroru
 * @private
 * @returns {string} verze prohlizece na zaklade hodnot uvedenych v navigator.userAgent
 * detekuji se prvni dve cisla (3.4,3.5,3.6 atd...) 
 */ 
JAK.Browser._get_konqueror_ver = function(){
	var num = this._agent.indexOf('KHTML') + 6;
	var part =  this._agent.substring(num);
	var end = part.indexOf(' ')
	var x = part.substring(0,end - 2);
	return x;
	
};

/**
 * Detekce verze Safari
 * @private
 * @returns {string} verze
 */ 
JAK.Browser._get_safari_ver = function(){
	var ver = this._agent.match(/version\/([0-9]+)/i);
	return (ver ? ver[1] : "3");
};

/**
 * Detekce verze Google Chrome
 * @private
 * @returns {string} verze
 */ 
JAK.Browser._get_chrome_ver = function(){
	var ver = this._agent.match(/Chrome\/([0-9]+)/i);
	return (ver ? ver[1] : null);
};

/**
 * Je tento prohlížeč moc starý na používání JAKu?
 */
JAK.Browser.isOld = function() {
	if (this.client == "ie" && parseFloat(this.version) <= 5.5) { return true; }
	if (this.client == "opera" && parseFloat(this.version) < 9.5) { return true; }
	if (this.client == "gecko" && parseFloat(this.version) < 2) { return true; }
	/* *
	 * if (this.client == "safari" && parseFloat(this.version) < 2) { return true; } 
	 * Zahozeno, aby se predeslo konfliktum s webkit-based browsery
	 */ 
	if (this.client == "konqueror" && parseFloat(this.version) < 3.5) { return true; }
	if (!document.documentElement) { return true; }
	if (!document.documentElement.addEventListener && !document.documentElement.attachEvent) { return true; }
	var f = function() {};
	if (!f.call || !f.apply) { return true; }
	return false;
}

/**
 * Implicitní konkstruktor, je volán při načtení skriptu 
 */   
JAK.Browser.getBrowser = function(){
	this._agent = this.agent = navigator.userAgent;
	this._platform = navigator.platform;
	this._vendor = navigator.vendor;
	this.platform = this._getPlatform();
	this.client = this._getClient();
	this.version = this._getVersion();
	this.mouse = this._getMouse();
};
JAK.Browser.getBrowser();
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Statická třída posytující některé praktické metody na úpravy a práci s DOM stromem, např. vytváření a získávání elementů.
 * @version 5.0
 * @author zara, koko, jelc
 */

/**
 * Statický konstruktor, nemá smysl vytvářet jeho instance.
 * @namespace
 * @group jak
 */
JAK.DOM = JAK.ClassMaker.makeStatic({
	NAME: "JAK.DOM",
	VERSION: "5.0"
});

/**
 * Vytvoří DOM node, je možné rovnou zadat CSS třídu a id.
 * Etymologie: cel = cREATE elEMENT
 * @param {string} tagName jméno tagu (lowercase)
 * @param {string} className název CSS tříd(y)
 * @param {string} id id uzlu
 * @param {object} [doc] dokument, v jehož kontextu se node vyrobí (default: document)
 * @returns {node}
 */
JAK.cel = function(tagName, className, id, doc) {
	var d = doc || document;
	var node = d.createElement(tagName);
	if (className) { node.className = className; }
	if (id) { node.id = id; }
	return node;
}
	
/**
 * Vytvoří DOM node, je možné rovnou zadat vlastnosti a css vlastnosti.
 * Etymologie: mel = mAKE elEMENT
 * @param {string} tagName jméno tagu (lowercase)
 * @param {object} properties asociativní pole vlastností a jejich hodnot
 * @param {object} styles asociativní pole CSS vlastností a jejich hodnot
 * @param {object} [doc] dokument, v jehož kontextu se node vyrobí (default: document)
 * @returns {node}
 */
JAK.mel = function(tagName, properties, styles, doc) {
	var d = doc || document;
	var node = d.createElement(tagName);
	if (properties) {
		for (var p in properties) { node[p] = properties[p]; }
	}
	if (styles) { JAK.DOM.setStyle(node, styles); }
	return node;
}

/**
 * Alias pro document.createTextNode.
 * Etymologie: ctext = cREATE text
 * @param {string} str řetězec s textem
 * @param {object} doc dokument, v jehož kontextu se node vyrobí (default: document)
 * @returns {node}
 */
JAK.ctext = function(str, doc) {
	var d = doc || document;
	return d.createTextNode(str);
}
	
/**
 * Zjednodušený přístup k metodě DOM document.getElementById.
 * Etymologie: gel = gET elEMENT
 * @param {string || node} id id HTML elementu, který chceme získat nebo element
 * @param {object} [doc] dokument, v jehož kontextu se node vyrobí (default: document)
 * @returns {node} HTML element s id = id, pokud existuje, NEBO element specifikovaný jako parametr
 */
 JAK.gel = function(id, doc) {
	var d = doc || document;
	if (typeof(id) == "string") {
		return d.getElementById(id);
	} else { return id; }
}


/**
 * Vrací pole prvků vyhovujících zadanému CSS2 selektoru
 * @param {string} query CSS2 selektor
 * @param {node} [root=document] Rodičovský prvek
 * @obsolete
 * @returns {node[]}
 */
JAK.query = function(query, root) {
	return [].slice.call((root || document).querySelectorAll(query));
}

/**
 * Propoji zadané DOM uzly
 * @param {Array} pole1...poleN libovolný počet polí; pro každé pole se vezme jeho první prvek a ostatní 
 *   se mu navěsí jako potomci
 */
JAK.DOM.append = function() { /* takes variable amount of arrays */
	for (var i=0;i<arguments.length;i++) {
		var arr = arguments[i];
		var head = arr[0];
		for (var j=1;j<arr.length;j++) {
			head.appendChild(arr[j]);
		}
	}
}

/**
 * Otestuje, má-li zadany DOM uzel danou CSS třídu
 * @param {Object} element DOM uzel
 * @param {String} className CSS třída
 * @return {bool} true|false
 */
JAK.DOM.hasClass = function(element,className) {
	var arr = element.className.split(" ");
	for (var i=0;i<arr.length;i++) { 
		if (arr[i].toLowerCase() == className.toLowerCase()) { return true; } 
	}
	return false;
}

/**
 * Přidá DOM uzlu CSS třídu. Pokud ji již má, pak neudělá nic.
 * @param {Object} element DOM uzel
 * @param {String} className CSS třída
 */
JAK.DOM.addClass = function(element,className) {
	if (JAK.DOM.hasClass(element,className)) { return; }
	element.className += " "+className;
}

/**
 * Odebere DOM uzlu CSS třídu. Pokud ji nemá, neudělá nic.
 * @param {Object} element DOM uzel
 * @param {String} className CSS třída
 */
JAK.DOM.removeClass = function(element,className) {
	var names = element.className.split(" ");
	var newClassArr = [];
	for (var i=0;i<names.length;i++) {
		if (names[i].toLowerCase() != className.toLowerCase()) { newClassArr.push(names[i]); }
	}
	element.className = newClassArr.join(" ");
}

/**
 * Vymaže (removeChild) všechny potomky daného DOM uzlu
 * @param {Object} element DOM uzel
 */
JAK.DOM.clear = function(element) {
	while (element.firstChild) { element.removeChild(element.firstChild); }
}

/**
 * vrací velikost dokumentu, lze použít ve standardním i quirk módu 
 * @returns {object} s vlastnostmi:
 * <ul><li><em>width</em> - šířka dokumentu</li><li><em>height</em> - výška dokumentu</li></ul> 
 */    
JAK.DOM.getDocSize = function(){
	var x = 0;
	var y = 0;		
	if (document.compatMode != 'BackCompat') {
		
		if(document.documentElement.clientWidth && JAK.Browser.client != 'opera'){
			x = document.documentElement.clientWidth;
			y = document.documentElement.clientHeight;
		} else if(JAK.Browser.client == 'opera') {
			if(parseFloat(JAK.Browser.version) < 9.5){
				x = document.body.clientWidth;
				y = document.body.clientHeight;
			} else {
				x = document.documentElement.clientWidth;
				y = document.documentElement.clientHeight;
			}
		} 
		
		if ((JAK.Browser.client == 'safari') || (JAK.Browser.client == 'konqueror')){
			y = window.innerHeight; 
		}
	} else {
		x = document.body.clientWidth;
		y = document.body.clientHeight;
	}
	
	return {width:x,height:y};
};

/**
 * vrací polohu "obj" ve stránce nebo uvnitř objektu který předám jako druhý 
 * argument
 * @param {object} obj HTML element, jehož pozici chci zjistit
 * @param {object} [ref] <strong>volitelný</strong> HTML element, vůči kterému chci zjistit pozici <em>obj</em>, element musí být jeho rodič
 * @param {bool} fixed <strong>volitelný</strong> flag, má-li se brát ohled na "fixed" prvky
 * @returns {object} s vlastnostmi :
 * <ul><li><em>left</em>(px) - horizontální pozice prvku</li><li><em>top</em>(px) - vertikální pozice prvku</li></ul> 
 */
JAK.DOM.getBoxPosition = function(obj, ref){
	var top = 0;
	var left = 0;
	var refBox = ref || obj.ownerDocument.body;
	
	if (obj.getBoundingClientRect && !ref) { /* pro IE a absolutni zjisteni se da pouzit tenhle trik od eltona: */
		var de = document.documentElement;
		var box = obj.getBoundingClientRect();
		var scroll = JAK.DOM.getBoxScroll(obj);
		return {left:box.left+scroll.x-de.clientLeft, top:box.top+scroll.y-de.clientTop};
	}

	while (obj && obj != refBox) {
		top += obj.offsetTop;
		left += obj.offsetLeft;

		/*pro FF2, safari a chrome, pokud narazime na fixed element, musime se u nej zastavit a pripocitat odscrolovani, ostatni prohlizece to delaji sami*/
		if ((JAK.Browser.client == 'gecko' && JAK.Browser.version < 3) || JAK.Browser.client == 'safari') {
			if (JAK.DOM.getStyle(obj, 'position') == 'fixed') {
				var scroll = JAK.DOM.getScrollPos();
				top += scroll.y;
				left += scroll.x;
				break;
			}
		}

		obj = obj.offsetParent;
	}
	return {top:top,left:left};
}

/*
	Par noticek k výpočtům odscrollovaní:
	- rodič body je html (documentElement), rodič html je document
	- v strict mode má scroll okna nastavené html
	- v quirks mode má scroll okna nastavené body
	- opera dává vždy do obou dvou
	- safari dává vždy jen do body
*/

/**
 * vrací polohu "obj" v okně nebo uvnitř objektu který předáme jako druhý 
 * argument, zahrnuje i potencialni odskrolovani kdekoliv nad objektem 
 *	Par noticek k výpočtům odscrollovaní:<ul>
 *	<li>rodič body je html (documentElement), rodič html je document</li>
 *	<li>v strict mode má scroll okna nastavené html</li>
 *	<li>v quirks mode má scroll okna nastavené body</li>
 *	<li>opera dává vždy do obou dvou</li>
 *	<li>safari dává vždy jen do body </li></ul>
 * @param {object} obj HTML elmenet, jehož pozici chci zjistit
 * @param {object} parent <strong>volitelný</strong> HTML element, vůči kterému chci zjistit pozici <em>obj</em>, element musí být jeho rodič
 * @param {bool} fixed <strong>volitelný</strong> flag, má-li se brát ohled na "fixed" prvky
 * @returns {object} s vlastnostmi :
 * <ul><li><em>left</em>(px) - horizontalní pozice prvku</li><li><em>top</em>(px) - vertikální pozice prvku</li></ul> 
 */
 JAK.DOM.getPortBoxPosition = function(obj, parent, fixed) {
	var pos = JAK.DOM.getBoxPosition(obj, parent, fixed);
	var scroll = JAK.DOM.getBoxScroll(obj, parent, fixed);
	pos.left -= scroll.x;
	pos.top -= scroll.y;
	return {left:pos.left,top:pos.top};
}

/**
 * vrací dvojici čísel, o kolik je "obj" odscrollovaný vůči oknu nebo vůči zadanému rodičovskému objektu
 * @param {object} obj HTML elmenet, jehož odskrolovaní chci zjistit
 * @param {object} ref <strong>volitelný</strong> HTML element, vůči kterému chci zjistit odskrolování <em>obj</em>, element musí být jeho rodič
 * @param {bool} fixed <strong>volitelný</strong> flag, má-li se brát ohled na "fixed" prvky
 * @returns {object} s vlastnostmi :
 * <ul><li><em>left</em>(px) - horizontální scroll prvku</li><li><em>top</em>(px) - vertikální scroll prvku</li></ul> 
 */
JAK.DOM.getBoxScroll = function(obj, ref, fixed) {
	var x = 0;
	var y = 0;
	var cur = obj.parentNode;
	var limit = ref || obj.ownerDocument.documentElement;
	var fix = false;
	while (1) {
		/* opera debil obcas nastavi scrollTop = offsetTop, aniz by bylo odscrollovano */
		if (JAK.Browser.client == "opera" && cur.parentNode && JAK.DOM.getStyle(cur,"display") != "block") { 
			cur = cur.parentNode;
			continue; 
		}
		
		/* a taky stara opera (<9.5) pocita scrollTop jak pro <body>, tak pro <html> - takze <body> preskocime */
		if (JAK.Browser.client == "opera" && JAK.Browser.version < 9.5 && cur == document.body) { 
			cur = cur.parentNode;
			continue; 
		}
		
		if (fixed && JAK.DOM.getStyle(cur, "position") == "fixed") { fix = true; }
		
		if (!fix) {
			x += cur.scrollLeft;
			y += cur.scrollTop;
		}
		
		if (cur == limit) { break; }
		cur = cur.parentNode;
		if (!cur) { break; }
	}
	return {x:x,y:y};
}

/**
 * vrací aktuální odskrolování stránky
 * @returns {object} s vlastnostmi:
 * <ul><li><em>x</em>(px) - horizontální odskrolování</li><li><em>y</em>(px) - vertikální odskrolování</li></ul> 
 */
JAK.DOM.getScrollPos = function(){
	if (document.documentElement.scrollTop || document.documentElement.scrollLeft) {
		var ox = document.documentElement.scrollLeft;
		var oy = document.documentElement.scrollTop;
	} else if (document.body.scrollTop || document.body.scrollLeft) { 
		var ox = document.body.scrollLeft;
		var oy = document.body.scrollTop;
	} else {
		var ox = 0;
		var oy = 0;
	}
	return {x:ox,y:oy};
}

/**
 * vraci současnou hodnotu nějaké css vlastnosti
 * @param {object} elm HTML elmenet, jehož vlasnost nás zajímá
 * @param {string} property řetězec s názvem vlastnosti ("border","backgroundColor",...)
 */
JAK.DOM.getStyle = function(elm, property) {
	if (document.defaultView && document.defaultView.getComputedStyle) {
		var cs = elm.ownerDocument.defaultView.getComputedStyle(elm,'');
		if (!cs) { return false; }
		return cs[property];
	} else {
		return elm.currentStyle[property];
	}
}

/**
 * nastavuje objektu konkretni styly, ktere jsou zadany v objektu pojmenovanych vlastnosti (nazev_CSS : hodnota)
 * @param {object} elm HTML element, jehož vlastnosti měním
 * @param {object} style objekt nastavovaných vlastností, např.: {color: 'red', backgroundColor: 'white'}
 */
JAK.DOM.setStyle = function(elm, style) {
	for (var name in style) {
		elm.style[name] = style[name];
	}
}

/**
 * Přidá do dokumentu zadaný CSS řetězec
 * @param {string} css Kus CSS deklarací
 * @returns {node} vyrobený prvek
 */
JAK.DOM.writeStyle = function(css) {
	var node = JAK.mel("style", {type:"text/css"});
	if (node.styleSheet) { /* ie */
		node.styleSheet.cssText = css;
	} else { /* non-ie */
		node.appendChild(JAK.ctext(css));
	}
	var head = document.getElementsByTagName("head");
	if (head.length) {
		head = head[0];
	} else {
		head = JAK.cel("head");
		document.documentElement.appendChild(head, document.body);
	}
	head.appendChild(node);
	return node;
}

/**
 * skrývá elementy které se mohou objevit v nejvyšší vrstvě a překrýt obsah,
 * resp. nelze je překrýt dalším obsahem (typicky &lt;SELECT&gt; v internet exploreru)
 * @param {object | string} HTML element nebo jeho ID pod kterým chceme skrývat problematické prvky
 * @param {array} elements pole obsahující názvy problematických elementů
 * @param {string} action akce kterou chceme provést 'hide' pro skrytí 'show' nebo cokoli jiného než hide pro zobrazení
 * @examples 
 *  <pre>
 * JAK.DOM.elementsHider(JAK.gel('test'),['select'],'hide')
 * JAK.DOM.elementsHider(JAK.gel('test'),['select'],'show')
 *</pre>   									
 *
 */     
JAK.DOM.elementsHider = function(obj, elements, action) {
	var elems = elements;
	if (!elems) { elems = ["select","object","embed","iframe"]; }
	
	/* nejprve zobrazit vsechny jiz skryte */
	var hidden = arguments.callee.hidden;
	if (hidden) {
		hidden.forEach(function(node){
			node.style.visibility = "visible";
		});
		arguments.callee.hidden = [];
	}
	
	function verifyParent(node) {
		var ok = false;
		var cur = node;
		while (cur.parentNode && cur != document) {
			if (cur == obj) { ok = true; }
			cur = cur.parentNode;
		}
		return ok;
	}
	
	if (action == "hide") { /* budeme schovavat */
		if (typeof obj == 'string') { obj = JAK.gel(obj); }
		var hidden = [];
		var box = this.getBoxPosition(obj);
		
		box.width =  obj.offsetWidth + box.left;
		box.height = obj.offsetHeight +box.top;	
		for (var e = 0; e < elems.length; ++e) { /* pro kazdy typ uzlu */
			var elm = document.getElementsByTagName(elems[e]);
			for (var f = 0; f < elm.length; ++f) { /* vsechny uzly daneho typu */
				var node = this.getBoxPosition(elm[f]);
				if (verifyParent(elm[f])) { continue; } /* pokud jsou v kontejneru, pod kterym schovavame, tak fakof */
				node.width = elm[f].offsetWidth + node.left;
				node.height = elm[f].offsetHeight + node.top;
				
				if (!((box.left> node.width) || (box.width < node.left) || (box.top > node.height) || (box.height < node.top))) {
					elm[f].style.visibility = 'hidden';
					hidden.push(elm[f]);
				}
			}
		}
		arguments.callee.hidden = hidden;
	}
}

/**
 * Vrátí kolekci elementů, které mají nadefinovanou třídu <em>searchClass</em>
 * @param {string} searchClass vyhledávaná třída
 * @param {object} node element dokumentu, ve kterém se má hledat, je-li null prohledává
 * se celý dokument 
 * @param {string} tag název tagu na který se má hledání omezit, je-li null prohledávají se všechny elementy
 * @obsolete
 * @returns {array} pole které obsahuje všechny nalezené elementy, které mají definovanou třídu <em>searchClass</em>
 */      
JAK.DOM.getElementsByClass = function(searchClass, node, tag) {
	var nodeName = tag || "";
	var parent = node || document;
	var selector = nodeName + "." + searchClass;
	return [].slice.call(parent.querySelectorAll(selector));
}

/**
 * Převede html kolekci, kterou vrací např. document.getElementsByTagName, na pole, které lze
 * lépe procházet a není "živé" (z které se při procházení můžou ztrácet prvky zásahem jiného skriptu)
 * @param {HTMLCollection} col
 * @return {array}   
 */ 
JAK.DOM.arrayFromCollection = function(col) {
	var result = [];
	try {
		result = Array.prototype.slice.call(col);
	} catch(e) {
		for (var i=0;i<col.length;i++) { result.push(col[i]); }
	} finally {
		return result;
	}
}

/**
 * Rozdělí kus HTML kódu na ne-javascriptovou a javascriptovou část. Chceme-li pak
 * simulovat vykonání kódu prohlížečem, první část vyinnerHTMLíme a druhou vyevalíme.
 * @param {string} str HTML kód
 * @returns {string[]} pole se dvěma položkami - čistým HTML a čistým JS
 */
JAK.DOM.separateCode = function(str) {
    var js = [];
    var out = {}
    var s = str.replace(/<script.*?>([\s\S]*?)<\/script>/g, function(tag, code) {
        js.push(code);
        return "";
    });
    return [s, js.join("\n")];
}

/**
 * Spočítá, o kolik je nutno posunout prvek tak, aby byl vidět v průhledu.
 * @param {node} box
 * @returns {int[]}
 */
JAK.DOM.shiftBox = function(box) {
	var dx = 0;
	var dy = 0;
	
	/* soucasne souradnice vuci pruhledu */
	var pos = JAK.DOM.getBoxPosition(box);
	var scroll = JAK.DOM.getScrollPos();
	pos.left -= scroll.x;
	pos.top -= scroll.y;
	
	var port = JAK.DOM.getDocSize();
	var w = box.offsetWidth;
	var h = box.offsetHeight;
	
	/* dolni okraj */
	var diff = pos.top + h - port.height;
	if (diff > 0) {
		pos.top -= diff;
		dy -= diff;
	}

	/* pravy okraj */
	var diff = pos.left + w - port.width;
	if (diff > 0) {
		pos.left -= diff;
		dx -= diff;
	}
	
	/* horni okraj */
	var diff = pos.top;
	if (diff < 0) {
		pos.top -= diff;
		dy -= diff;
	}

	/* levy okraj */
	var diff = pos.left;
	if (diff < 0) {
		pos.left -= diff;
		dx -= diff;
	}
	
	return [dx, dy];
}

/**
 * Zjistí jakou šířku má scrollbar v použitém prohlížeci/grafickém prostředí
 * @returns {int}
 */ 
JAK.DOM.scrollbarWidth = function() {
    var div = JAK.mel('div', false, {width: '50px', height: '50px', overflow: 'hidden', position: 'absolute', left: '-200px'});
    var innerDiv = JAK.mel('div', false, {height: '100px'});
    div.appendChild(innerDiv);
    // Append our div, do our calculation and then remove it
    document.body.insertBefore(div, document.body.firstChild);
    var w1 = div.clientWidth + parseInt(JAK.DOM.getStyle(div,'paddingLeft')) + parseInt(JAK.DOM.getStyle(div,'paddingRight'));
    JAK.DOM.setStyle(div, {overflowY: 'scroll'});
    var w2 = div.clientWidth + parseInt(JAK.DOM.getStyle(div,'paddingLeft')) + parseInt(JAK.DOM.getStyle(div,'paddingRight'));
    document.body.removeChild(div);

    return (w1 - w2);
}

/**
 * Vrátí rodiče zadaného uzlu, vyhovujícího CSS selektoru
 * @param {node} node
 * @param {string} selector
 */
JAK.DOM.findParent = function(node, selector) {
	/* pokud je prazdny nebo nezadany, dostaneme prazdne pole omezujicich podminek -- a vratime prvniho rodice */
	var parts = (selector || "").match(/[#.]?[a-z0-9_-]+/ig) || [];
	
	var n = node.parentNode;
	while (n && n != document) {
		var ok = true;
		for (var i=0;i<parts.length;i++) {
			var part = parts[i];
			switch (part.charAt(0)) {
				case "#":
					if (n.id != part.substring(1)) { ok = false; }
				break;
				case ".":
					if (!JAK.DOM.hasClass(n, part.substring(1))) { ok = false; }
				break;
				default:
					if (n.nodeName.toLowerCase() != part.toLowerCase()) { ok = false; }
				break;
			}
		}
		if (ok) { return n; }
		n = n.parentNode;
	}
	return null;
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @class Třída provádí operace s objekty jako je jejich porovnávaní a serializace a deserializace. Obsolete!
 * @group jak
 */    
JAK.ObjLib = JAK.ClassMaker.makeClass({
	NAME: "ObjLib",
	VERSION: "3.1"
});

JAK.ObjLib.prototype.reSetOptions = function() {
}

JAK.ObjLib.prototype.pretty = function(str) {
	return str;
}

JAK.ObjLib.prototype.serialize = function(objToSource) {
	return JSON.stringify(objToSource);
};

JAK.ObjLib.prototype.unserialize = function(serializedString) {
	return JSON.parse(serializedString);
}

JAK.ObjLib.prototype.match = function(refObj, matchObj){
	return (JSON.stringify(refObj) == JSON.stringify(matchObj));
};

JAK.ObjLib.prototype.copy = function(objToCopy) {
	return JSON.parse(JSON.stringify(objToCopy));
};

JAK.ObjLib.prototype.arrayCopy = function(arrayToCopy) {
	return this.copy(arrayToCopy);
};
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @class XML/TEXT/JSONP request
 * @group jak
 * @example
 * var r = new JAK.Request(JAK.Request.XML, {method:"get"});
 * r.setCallback(mujObjekt, "jehoMetoda");
 * r.send("/dobrerano", {a:b, c:"asdf&asdf"});
 */
JAK.Request = JAK.ClassMaker.makeClass({
	NAME: "JAK.Request",
	VERSION: "2.0"
});

/** @constant */
JAK.Request.XML		= 0;
/** @constant */
JAK.Request.TEXT	= 1;
/** @constant */
JAK.Request.JSONP	= 2;
/** @constant */
JAK.Request.BINARY	= 3;

/**
 * Podporuje tento prohlizec CORS?
 */
JAK.Request.supportsCrossOrigin = function() {
	if (JAK.Browser.client == "opera" && parseFloat(JAK.Browser.version) < 12) { return false; }
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 8) { return false; }
	if (JAK.Browser.client == "gecko" && parseFloat(JAK.Browser.version) < 3.5) { return false; }
	return true;
}

/**
 * Podporuje prohlížeč upload ?
 */
JAK.Request.supportsUpload = function() {
  return (window.XMLHttpRequest && !! (new XMLHttpRequest().upload));
};

/**
 * @param {int} type Type požadavku, jedna z konstant JAK.Request.*
 * @param {object} [options] Konfigurační objekt
 * @param {bool} [options.async=true] Je-li požadavek asynchronní
 * @param {bool} [options.timeout=0] Timeout v msec; 0 = disable
 * @param {bool} [options.method="get"] HTTP metoda požadavku
 */
JAK.Request.prototype.$constructor = function(type, options) {
	this._NEW		= 0;
	this._SENT		= 1;
	this._DONE		= 2;
	this._ABORTED	= 3;
	this._TIMEOUT	= 4;
	this._PROGRESS	= 5;
	
	this._xhr = null;
	this._callback = "";
	this._script = null;
	this._type = type;
	this._headers = {};
	this._callbacks = {};
	this._state = this._NEW;
	this._xdomain = false; /* pouzivame IE8+ XDomainRequest? */
	
	this._handleProgress = false; /* nebudeme poslouchat na progres Eventy*/
	
	this._options = {
		async: true,
		timeout: 0,
		method: "get"
	}
	for (var p in options) { this._options[p] = options[p]; }

	if (this._type == JAK.Request.JSONP) {
		if (this._options.method.toLowerCase() == "post") { throw new Error("POST not supported in JSONP mode"); }
		if (!this._options.async) { throw new Error("Async not supported in JSONP mode"); }
	}
};

JAK.Request.prototype.$destructor = function() {
	if (this._state == this._SENT) { this.abort(); }
	this._xhr = null;
}

/**
 * Nastaví hlavičky požadavku
 * @param {object} headers Hlavičky (dvojice název:hodnota)
 */
JAK.Request.prototype.setHeaders = function(headers) {
	if (this._type == JAK.Request.JSONP) { throw new Error("Request headers not supported in JSONP mode"); }
	for (var p in headers) { this._headers[p] = headers[p]; }
}

/**
 * Vrátí hlavičky odpovědi
 * @returns {object} Hlavičky (dvojice název:hodnota)
 */
JAK.Request.prototype.getHeaders = function() {
	if (this._state != this._DONE) { throw new Error("Response headers not available"); }
	if (this._type == JAK.Request.JSONP) { 	throw new Error("Response headers not supported in JSONP mode"); }
	var headers = {};
	var h = this._xhr.getAllResponseHeaders();
	if (h) {
		h = h.split(/[\r\n]/);
		for (var i=0;i<h.length;i++) if (h[i]) {
			var v = h[i].match(/^([^:]+): *(.*)$/);
			headers[v[1]] = v[2];
		}
	}
	return headers;
}

/**
 * Odešle požadavek
 * @param {string} url Cílové URL
 * @param {string || object} [data] Data k odeslání
 */
JAK.Request.prototype.send = function(url, data) {
	if (this._state != this._NEW) { throw new Error("Request already sent"); }

	this._state = this._SENT;
	this._userCallback(this);

	switch (this._type) {
		case JAK.Request.XML:
		case JAK.Request.TEXT:
		case JAK.Request.BINARY:
			return this._sendXHR(url, data);
		break;
		case JAK.Request.JSONP:
			return this._sendScript(url, data);
		break;
		default:
			throw new Error("Unknown request type");
		break;
	}
}

/**
 * Přeruší probíhající požadavek
 * @returns {bool} Byl požadavek přerušen?
 */
JAK.Request.prototype.abort = function() {
	if (this._state != this._SENT) { return false; }
	this._state = this._ABORTED;
	if (this._xhr) { this._xhr.abort(); }
	this._userCallback(this);
	return true;
}

/**
 * Nastavení callbacku po dokončení požadavku
 * @param {object || null} obj
 * @param {function || string} method
 */
JAK.Request.prototype.setCallback = function(obj, method) {
	this._setCallback(obj, method, this._DONE);
	return this;
}

/**
 * Nastavení callbacku po odeslání
 * @see JAK.Request#setCallback
 */
JAK.Request.prototype.setSendCallback = function(obj, method) {
	this._setCallback(obj, method, this._SENT);
	return this;
}

/**
 * Nastavení callbacku po abortu
 * @see JAK.Request#setCallback
 */
JAK.Request.prototype.setAbortCallback = function(obj, method) {
	this._setCallback(obj, method, this._ABORTED);
	return this;
}

/**
 * Nastavení callbacku po timeoutu
 * @see JAK.Request#setCallback
 */
JAK.Request.prototype.setTimeoutCallback = function(obj, method) {
	this._setCallback(obj, method, this._TIMEOUT);
	return this;
}

/**
 * Nastavení callbacku po progress (je třeba vést v patrnosti, 
 * že zavěšení posluchače na upload, může znemožnit CORS requesty)
 * @see JAK.Request#setCallback
 */
JAK.Request.prototype.setProgressCallback = function(obj, method) {
	this._handleProgress = true;
	this._setCallback(obj, method, this._PROGRESS);
	return this;
}

/**
 * Interni registrace callbacku pro zadany stav
 */
JAK.Request.prototype._setCallback = function(obj, method, state) {
	this._callbacks[state] = [obj, method];
}

/**
 * Odeslani pozadavku pres XHR
 */
JAK.Request.prototype._sendXHR = function(url, data) {
	/* nejprve vyrobit instanci XHR */
	if (window.XMLHttpRequest) { 
		var ctor = XMLHttpRequest;
		var r = url.match(/^https?\:\/\/(.*?)\//);
		if (r && r[1] != location.host && window.XDomainRequest) { /* pro cross-domain je v IE >= 8 novy objekt */
			if (this._type == JAK.Request.BINARY) { throw new Error("XDomainRequest does not support BINARY mode"); }
			this._xdomain = true;
			ctor = XDomainRequest; 
		}
		this._xhr = new ctor(); 
	} else if (window.ActiveXObject) { 
		this._xhr = new ActiveXObject("Microsoft.XMLHTTP"); 
	} else { throw new Error("No XHR available"); }
	
	if (this._xdomain) {
		this._xhr.onload = this._onXDomainRequestLoad.bind(this);
	} else {
		this._xhr.onreadystatechange = this._onReadyStateChange.bind(this);
	}

	/* zpracovat parametry */
	var u, d;
	if (this._options.method.toLowerCase() == "get") {
		u = this._buildURL(url, data);
		d = null;
	} else {
		u = url;
		d = this._serializeData(data);
		
		var ctSet = false;
		for (var p in this._headers) {
			if (p.toLowerCase() == "content-type") { 
				ctSet = true;
				break;
			}
		}
		if (!ctSet) { this.setHeaders({"Content-Type":"application/x-www-form-urlencoded"}); }
	}

	if (this._type == JAK.Request.BINARY) {
		if (this._xhr.overrideMimeType) {
			this._xhr.overrideMimeType("text/plain; charset=x-user-defined");
		} else if (JAK.Browser.client == "ie") {
			this._buildVBS();
		} else {
			throw new Error("This browser does not support binary transfer");
		}
	}
	
	/* zpracovani progresu pokud to request umoznuje */
	if(this._handleProgress && this._xhr.upload) {
		JAK.Events.addListener(this._xhr.upload,"progress",this, "_progressCallback");
	}
	this._xhr.open(this._options.method, u, this._options.async);
	
	for (var p in this._headers) { this._xhr.setRequestHeader(p, this._headers[p]); }
	this._xhr.send(d);
	
	if (this._options.timeout) { setTimeout(this._timeout.bind(this), this._options.timeout); }
	if (!this._options.async) { this._onReadyStateChange(); }
	
	return u;
}

/**
 * Odeslani JSONP pozadavku pres &lt;script&gt;
 */
JAK.Request.prototype._sendScript = function(url, data) {
	var o = data || {};

	this._callback = "callback" + JAK.idGenerator();
	o.callback = this._callback;
	var url = this._buildURL(url, o);
	window[this._callback] = this._scriptCallback.bind(this);
	
	this._script = JAK.mel("script", {type:"text/javascript", src:url});
	document.body.insertBefore(this._script, document.body.firstChild);

	return url;
}

/**
 * Tvorba URL zmixovanim zakladu + dat
 */
JAK.Request.prototype._buildURL = function(url, data) {
	var s = this._serializeData(data);
	if (!s.length) { return url; }
	
	if (url.indexOf("?") == -1) {
		return url + "?" + s;
	} else {
		return url + "&" + s;
	}
}

/**
 * Serialize dat podle HTML formularu
 */
JAK.Request.prototype._serializeData = function(data) {
	if (typeof(data) == "string") { return data; }
	if (window.File && data instanceof File) { return data; }
	if (!data) { return ""; }
	
	var arr = [];
	for (var p in data) {
		var value = data[p];
		if (!(value instanceof Array)) { value = [value]; }
		for (var i=0;i<value.length;i++) {
			arr.push(encodeURIComponent(p) + "=" + encodeURIComponent(value[i]));
		}
	}
	return arr.join("&");
}

/**
 * Zmena stavu XHR
 */
JAK.Request.prototype._onReadyStateChange = function() {
	if (this._state == this._ABORTED) { return; }
	if (this._xhr.readyState != 4) { return; }

	var status = this._xhr.status;
	var data;

	if (this._type == JAK.Request.BINARY) {
		data = [];
		if (JAK.Browser.client == "ie") {
			var length = VBS_getLength(this._xhr.responseBody);
			for (var i=0;i<length;i++) { data.push(VBS_getByte(this._xhr.responseBody, i)); }
		} else {
			var text = this._xhr.responseText;
			var length = text.length;
			for (var i=0;i<length;i++) { data.push(text.charCodeAt(i) & 0xFF); }
		}
	} else {
		data = (this._type == JAK.Request.XML ? this._xhr.responseXML : this._xhr.responseText);
	}

	this._done(data, status);
}

/**
 * Nacteni XDomainRequestu
 */
JAK.Request.prototype._onXDomainRequestLoad = function() {
	if (this._state == this._ABORTED) { return; }

	var data = this._xhr.responseText;
	if (this._type == JAK.Request.XML) {
		var xml = new ActiveXObject("Microsoft.XMLDOM");
		xml.async = false;
		xml.loadXML(data);
		data = xml;
	}

	this._done(data, 200);
}

/**
 * progress callback
 */
JAK.Request.prototype._progressCallback = function(data) {
	var num = data.loaded/data.total;
	var state = this._state;
	this._state = this._PROGRESS;
	this._userCallback(num);
	this._state = state;
}

/**
 * JSONP callback
 */
JAK.Request.prototype._scriptCallback = function(data) {
	this._script.parentNode.removeChild(this._script);
	this._script = null;
	delete window[this._callback];

	if (this._state != this._ABORTED) { this._done(data, 200); }
}

/**
 * Request uspesne dokoncen
 */
JAK.Request.prototype._done = function(data, status) {
	if (this._state == this._DONE) { return; }
	this._state = this._DONE;
	this._userCallback(data, status, this);
}

/**
 * Nastal timeout
 */
JAK.Request.prototype._timeout = function() {
	if (this._state != this._SENT) { return; }
	this.abort();
	
	this._state = this._TIMEOUT;
	this._userCallback(this);	
}

/**
 * Volani uziv. callbacku
 */
JAK.Request.prototype._userCallback = function() {
	var data = this._callbacks[this._state];
	if (!data) { return; }
	
	var obj = data[0] || window;
	var method = data[1];
	
	if (obj && typeof(method) == "string") { method = obj[method]; }
	if (!method) {
		method = obj;
		obj = window;
	}
	
	method.apply(obj, arguments);
}

JAK.Request.prototype._buildVBS = function() {
	var s = JAK.mel("script", {type:"text/vbscript"});
	s.text = "Function VBS_getByte(data, pos)\n"
		+ "VBS_getByte = AscB(MidB(data, pos+1,1))\n"
		+ "End Function\n"
		+ "Function VBS_getLength(data)\n"
		+ "VBS_getLength = LenB(data)\n"
		+ "End Function";
	document.getElementsByTagName("head")[0].appendChild(s);
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Vytváření a zachytávání vlastních uživatelských událostí
 * @version 2.1
 * @author jelc, zara
 */
 
/**
 * @class Třída pro práci s uživatelsky definovanými událostmi
 * @group jak
 */
JAK.Signals = JAK.ClassMaker.makeClass({
	NAME: "JAK.Signals",
	VERSION: "2.1"
});
 
JAK.Signals.prototype.$constructor = function() {
	/**
	 * @field {object} zásobník posluchačů událostí
	 */
	this._myHandleFolder = {};
	
	/**
	 * @field {object} pomocný IDčkový index pro rychlé odebírání - pro ID obsahuje pole typových zásobníků
	 */
	this._myIdFolder = {};
};

/**
 * registrace posluchače uživatelské události, pokud je již na stejný druh 
 * události zaregistrována shodná metoda shodného objektu nic se neprovede,
 * @param {object} owner objekt/třída,  která naslouchá, a v jehož oboru platnosti se zpracovaní události provede
 * @param {string} type	typ události, kterou chceme zachytit; možno zadat víc názvů naráz oddělených mezerami 
 * @param {string} functionName funkce/metoda posluchače, která má danou událost zpracovat
 * @param {object} sender objekt, jehož událost chceme poslouchat. Pokud není zadáno (nebo false), odesilatele nerozlišujeme
 * @returns {id} id události / null
 */
JAK.Signals.prototype.addListener = function(owner, type, funcOrString, sender){
	var newId = JAK.idGenerator(); /* identifikátor handlované události */
	var typeFolders = [];

	var data = {
		eOwner		: owner,
		eFunction	: funcOrString,
		eSender		: sender
	};
	
	var types = type.split(" ");
	for (var i=0;i<types.length;i++) {
		var t = types[i];
		
		if (!(t in this._myHandleFolder)) { /* zasobnik pro dany typ udalosti neexistuje musim ho vytvorit */
			this._myHandleFolder[t] = {};
		} 
		
		var typeFolder = this._myHandleFolder[t]; /* sem ukladam zaznam - vsichni poslouchajici na dany signal */
		
		var ok = true; /* test duplicitniho zaveseni */
		for (var id in typeFolder) { 
			var item = typeFolder[id];
			if (
				(item.eFunction == funcOrString) && 
				(item.eOwner == owner) &&
				(item.eSender == sender)
			) {
				ok = false;
			}
		}
		if (!ok) { continue; }

		/* konecne si to můžu zaregistrovat */
		typeFolder[newId] = data;
		typeFolders.push(typeFolder);
	}
	
	if (typeFolders.length) { /* jeste pridam do ID zasobniku */
		this._myIdFolder[newId] = typeFolders;
		return newId;
	} else {
		return null;
	}
};


/**
 * Odstranění naslouchání události.
 * @param {id} id ID události
 */
JAK.Signals.prototype.removeListener = function(id) {
	var typeFolders = this._myIdFolder[id];
	if (!typeFolders) { throw new Error("Cannot remove non-existent signal ID '"+id+"'"); }
	
	while (typeFolders.length) {
		var typeFolder = typeFolders.pop();
		delete typeFolder[id];
	}

	delete this._myIdFolder[id];
};

/**
 * provede odvěšení signálů podle jejich <em>id</em> uložených v poli
 * @param {array} array pole ID signálu jak je vrací metoda <em>addListener</em>
 */  
JAK.Signals.prototype.removeListeners = function(array) {
	while (array.length) {
		this.removeListener(array.shift());
	}
};

/**
 * vytváří událost, ukládá ji do zásobníku události a předává ji ke zpracování
 * @param {string} type název nové události
 * @param {object} trg reference na objekt, který událost vyvolal
 * @param {object} [data] objekt s vlastnostmi specifickými pro danou událost 
 */   
JAK.Signals.prototype.makeEvent = function(type, trg, data) {
	var event = {
		type: type,
		target: trg,
		timeStamp: new Date().getTime(),
		data: (data && typeof data == 'object') ? data : null
	}
	this._myEventHandler(event);
};

/**
 * zpracuje událost - spustí metodu, která byla zaragistrována jako posluchač  
 * @param {object} myEvent zpracovávaná událost
 */    
JAK.Signals.prototype._myEventHandler = function(myEvent) {
	var functionCache = [];

	for (var type in this._myHandleFolder){
		if (type == myEvent.type || type == "*") { /* shoda nazvu udalosti */
			for (var p in this._myHandleFolder[type]) {
				var item = this._myHandleFolder[type][p];
				if (!item.eSender || item.eSender == myEvent.target) {
					functionCache.push(item);
				}
			}
		}
	}
	
	for (var i=0;i<functionCache.length;i++) {
		var item = functionCache[i];
		var owner = item.eOwner;
		var fnc = item.eFunction;
		if(typeof fnc == 'string'){
			owner[fnc](myEvent);
		} else if(typeof fnc == 'function'){
			fnc(myEvent);
		}
	}
};

/**
 * Výchozí instance
 */
JAK.signals = new JAK.Signals();
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Rozhraní určené k práci s uživatelskými událostmi a "globálními" 
 * zprávami, které zjednodušuje práci s objektem, který se o uživatelsky 
 * definované události stará
 * @version 2.1
 * @author jelc, zara
 */   

/**
 * @class Rozhraní pro práci s uživatelsky definovanými událostmi a zprávami
 * vyžaduje referenci na instanci třídy JAK.signals, všechny následující metody
 * jsou určeny k použití pouze jako zděděné vlastnosti rozhraní,
 * @group jak
 * @see JAK.Signals
 */  
JAK.ISignals = JAK.ClassMaker.makeInterface({
	NAME: "JAK.ISignals",
	VERSION: "2.1"
});

/**
 * slouží k nalezení rozhraní u rodičovských tříd, hledá v nadřazených třídách třídu,
 * ktera ma nastavenou vlastnost TOP_LEVEL a v ni očekává instanci třídy JAK.Signals s
 * nazvem "interfaceName"
 * @param {string}	interfaceName  název instance třídy JAK.Signals v daném objektu 
 * @returns {object} referenci na instanci třídy JAK.Signals
 * @throws {error} 	SetInterface:Interface not found  
 */
JAK.ISignals.prototype.setInterface = function(interfaceName) {
	if (typeof(this[interfaceName]) != 'object') {
		var owner = this._owner;
		while(typeof(owner[interfaceName])== 'undefined'){
			if(typeof owner.TOP_LEVEL != 'undefined'){
				throw new Error('SetInterface:Interface not found');
			} else {
				owner = owner._owner;
			}
		}
		return owner[interfaceName];
	} 
};

/**
 * slouží k registraci zachytávaní události nad objektem, který implementuje toto rozhraní
 * @param {string} type název události, kterou chceme zachytit
 * @param {string} handleFunction název metody objektu 'myListener', která bude zpracovávat událost
 * @param {object} sender objekt, jehož událost chceme poslouchat. Pokud není zadáno (nebo false), odesilatele nerozlišujeme
 * @returns {int} 1 v případě neúspěchu, 0 v pripade úspěchu  
 */
JAK.ISignals.prototype.addListener = function(type, handleFunction, sender) {
	return this.getInterface().addListener(this, type, handleFunction, sender);
};

/**
 * Slouží k zrušení zachytáváni události objektem, který implementuje toto rozhraní. 
 * @param {id} ID události, kterou jsme zachytávali
 */
JAK.ISignals.prototype.removeListener = function(id) {
	return this.getInterface().removeListener(id);
};

/**
 * Provede odvěšení signálů podle jejich <em>id</em> uložených v poli
 * @param {array} array pole ID signálu jak je vrací metoda <em>addListener</em>
 */  
JAK.ISignals.prototype.removeListeners = function(array) {
	this.getInterface().removeListeners(array);
}

/**
 * vytváří novou událost, kterou zachytáva instance třídy JAK.Signals
 * @param {string} type název vyvolané události
 * @param {object} [data] objekt s vlastnostmi specifickými pro danou událost  
 *					  nebo pouze vnitrnim objektum [private | public]
 * @throws {error} pokud neexistuje odkaz na instanci JAK.Signals vyvolá chybu 'Interface not defined'  
 */
JAK.ISignals.prototype.makeEvent = function(type, data) {
	this.getInterface().makeEvent(type, this, data);
};

JAK.ISignals.prototype.getInterface = function() {
	return (typeof(this.signals) == "object" ? this.signals : JAK.signals);
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Základní nástroje pro práci s "dekorátory".
 * Úvozovky okolo názvu jsou na místě, neb nejde o realizaci návrhového vzoru,
 * ale o naše vlastní, monkeypatch-based řešení.
 * @version 2.0
 * @author zara
 */   

/**
 * @class Abstraktní dekorátor, jedináček
 * @group jak
 */
JAK.AbstractDecorator = JAK.ClassMaker.makeSingleton({
	NAME: "JAK.AbstractDecorator",
	VERSION: "2.0"
});

/**
 * Dekorační metoda
 * @param {object} instance To, co chceme poupravit
 * @returns {object} Vrací to, co obdrží
 */
JAK.AbstractDecorator.prototype.decorate = function(instance) {
	instance.$super = this._$super;
	if (!instance.__decorators) { instance.__decorators = []; }
	instance.__decorators.push(this);
	return instance;
}

/**
 * Metoda volání "předka", magie pro otrlé.
 * Volá stejně pojmenovanou metodu objektu před odekorováním. 
 * Pokud je voláno z neodekorované metody, chová se jako $super z ClassMakeru.
 */
JAK.AbstractDecorator.prototype._$super = function() {
	var caller = arguments.callee.caller;
	if (!caller) { throw new Error("Function.prototype.caller not supported"); }

	var decorators = this.__decorators || [];
	var obj = null; /* objekt, jehoz metodu chceme volat */
	var name = null; /* nazev metody */
	
	var i = decorators.length;
	while (i--) { /* projdu vsechny naaplikovane dekoratory */
		var d = decorators[i];
		/**
		 * Hledam dve veci:
		 *  - jak se jmenuje metoda, ze ktere je $super volan,
		 *  - kde je tato metoda deklarovana pred timto dekoratorem
		 */
		
		if (!obj && name && (name in d)) { obj = d; break; } /* mame predchozi objekt s metodou */
		
		for (var p in d) { /* hledame objekt s touto metodou a jeji nazev */
			if (!name && caller == d[p]) { name = p; break; }
		}
	}

	if (!name) {
		/** 
		 * Metoda, ze ktere je volan $super, neni definovana v zadnem dekoratoru.
		 * Chteme tedy volat normalne metodu predka - kod je vybrakovan z ClassMakeru (_$super).
		 */
		var owner = caller.owner || this.constructor; /* toto je trida, kde jsme "ted" */

		var callerName = false;
		for (var name in owner.prototype) {
			if (owner.prototype[name] == caller) { callerName = name; }
		}
		if (!callerName) { throw new Error("Cannot find supplied method in constructor"); }
		
		var parent = owner.EXTEND;
		if (!parent) { throw new Error("No super-class available"); }
		if (!parent.prototype[callerName]) { throw new Error("Super-class doesn't have method '"+callerName+"'"); }

		var func = parent.prototype[callerName];
		return func.apply(this, arguments);
		
	} else if (!obj) {
		/**
		 * Predchudcem teto metody je primo prototypova metoda instance
		 */
		obj = this.constructor.prototype;
		if (!(name in obj)) { throw new Error("Function '"+name+"' has no undecorated parent"); }
	}
	
	return obj[name].apply(this, arguments);
}

/**
 * @class Automatický dekorátor - předá instanci veškeré své metody
 * @augments JAK.AbstractDecorator
 */
JAK.AutoDecorator = JAK.ClassMaker.makeSingleton({
	NAME: "JAK.AutoDecorator",
	VERSION: "1.0",
	EXTEND: JAK.AbstractDecorator
});

/**
 * @see JAK.AbstractDecorator#decorate
 */
JAK.AutoDecorator.prototype.decorate = function(instance) {
	this.$super(instance);
	var exclude = ["constructor", "$super", "_$super", "decorate"];
	
	for (var p in this) {
		if (exclude.indexOf(p) != -1) { continue; }
		instance[p] = this[p];
	}
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @class Dekorační rozhraní; implementuje ho ten, kdo chce být dekorován
 * @group jak
 */
JAK.IDecorable = JAK.ClassMaker.makeClass({
	NAME: "JAK.IDecorable",
	VERSION: "2.0",
	CLASS: "class"
});

/**
 * Odekorování této instance zadaným dekorátorem
 * @param {function} decorator Konstruktor dekorátoru
 * @returns {object} Vrací this
 */
JAK.IDecorable.prototype.decorate = function(decorator) {
	var args = [this];
	for (var i=1;i<arguments.length;i++) { args.push(arguments[i]); }
	var dec = decorator.getInstance();
	return dec.decorate.apply(dec, args);
}
/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @class Metronom: udržuje běžící interval (default 60fps nebo requestAnimationFrame) a notifikuje o jeho průběhu všechny zájemce
 * @group jak-utils
 */
JAK.Timekeeper = JAK.ClassMaker.makeSingleton({
	NAME: "JAK.Timekeeper",
	VERSION: "1.1"
});

JAK.Timekeeper.prototype.$constructor = function() {
	this._listeners = [];
	this._running = 0; /* 0 = stopped, 1 = stopping, 2 = running */
	this._tick = this._tick.bind(this);

	this._scheduler = window.requestAnimationFrame 
						|| window.webkitRequestAnimationFrame 
						|| window.mozRequestAnimationFrame 
						|| window.oRequestAnimationFrame 
						|| window.msRequestAnimationFrame 
						|| function(callback, element) {
              				setTimeout(callback, 1000/60);
           				};
}

/**
 * Přidání posluchače
 * @param {object} what Objekt žádající o notifikaci
 * @param {string || function} method Metoda k volání
 * @param {int} [count=1] Počet tiknutí na jednu notifikaci
 */
JAK.Timekeeper.prototype.addListener = function(what, method, count) {
	var index = this._findListener(what);
	if (index != -1) { throw new Error("This listener is already attached"); }
	
	var obj = {
		what: what,
		method: method,
		count: count || 1,
		bucket: 0
	}
	obj.bucket = obj.count;
	this._listeners.push(obj);
	
	if (this._running != 2) { 
		if (this._running == 0) { this._schedule(); }
		this._running = 2;
	}
	return this;
}

/**
 * Odebrání posluchače
 * @param {object} what Objekt žádající o odebrání
 */
JAK.Timekeeper.prototype.removeListener = function(what) {
	var index = this._findListener(what);
	if (index == -1) { throw new Error("Cannot find listener to be removed"); }
	this._listeners.splice(index, 1);
	
	if (!this._listeners.length) { this._running = 1; }
	return this;
}

JAK.Timekeeper.prototype._findListener = function(what) {
	for (var i=0;i<this._listeners.length;i++) {
		if (this._listeners[i].what == what) { return i; }
	}
	return -1;
}

JAK.Timekeeper.prototype._tick = function() {
	if (this._running == 1) { this._running = 0; }
	if (this._running == 0) { return; }

	this._schedule(); 	
	for (var i=0;i<this._listeners.length;i++) {
		var item = this._listeners[i];
		item.bucket--;
		if (item.bucket) { continue; } /* jeste ne */
		
		item.bucket = item.count;
		var obj = item.what;
		var method = (typeof(item.method) == "string" ? obj[item.method] : item.method);
		method.call(obj);
	}
}

JAK.Timekeeper.prototype._schedule = function() {
	var s = this._scheduler;
	s(this._tick, null);
}
/**
 * @class Cross-browser nahrada za console.log a podobne
 * Z ConsoleAPI (http://getfirebug.com/wiki/index.php/Console_API) implementuje log,info,warn,debug,error,clear,dir.
 * @signal change
 * @group jak
 */
JAK.C = JAK.ClassMaker.makeClass({
	NAME: "JAK.C",
	VERSION: "1.0",
	IMPLEMENT: JAK.ISignals
});

JAK.C.prototype.$constructor = function() {
	this.LIMIT = 1000;
	this.DEBUG = false;
	
	this._native = window.console;
	this._data = [];
	this._lost = 0; /* zahozene zaznamy */

	this._defineLogMethod("log");
	this._defineLogMethod("info");
	this._defineLogMethod("warn");
	this._defineLogMethod("debug");
	this._defineLogMethod("error");
	this._defineLogMethod("dir");
}

/**
 * Vycisti konzoli
 */
JAK.C.prototype.clear = function() {
	this._lost = 0;
	this._data = [];
	this.makeEvent("change");
}

/**
 * Vrati pocet zahozenych zaznamu
 */
JAK.C.prototype.getLost = function() {
	return this._lost;
}

/**
 * Vrati ulozene zaznamy
 */
JAK.C.prototype.getData = function() {
	return this._data;
}

JAK.C.prototype._defineLogMethod = function(type) {
	var self = this;
	this[type] = function() { return self._log(type, arguments); }
}

/**
 * Obecna logovaci funkce
 * @param {string} type Druh (log, warn, ...)
 * @param {array} args Data k logovani
 */
JAK.C.prototype._log = function(type, args) {
	/* pridat do zasobniku udalosti */
	this._data.push({
		type: type,
		args: args,
		ts: new Date().getTime()
	});
	
	/* procistit zasobnik */
	while (this._data.length > this.LIMIT) { 
		this._data.shift(); 
		this._lost++;
	}
	
	/* je-li zapnuto, preposlat do nativniho */
	if (this.DEBUG && this._native) {
		var nativeMethod = this._native[type];
		if (!nativeMethod) { /* tuto metodu nativni konzole nema */
			nativeMethod = this._native.log;
			if (!nativeMethod) { return; } /* nativni konzole nema ani log, sereme na ni */
		}
		
		/* trik: v IE nelze pouzit console.X.apply */
		return Function.prototype.apply.call(nativeMethod, this._native, args);
	}

	this.makeEvent("change");
}

window.console = new JAK.C();
window.onerror = function(error, url, line) {
	console.error(error, url, line);
}/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Interpolace, animace
 * @version 2.0
 * @author Zara
 */

/**
 * @class Periodicky interpolator
 * @group jak-utils
 */
JAK.Interpolator = JAK.ClassMaker.makeClass({
	NAME: "JAK.Interpolator",
	VERSION: "2.1",
	DEPEND: [{
		sClass: JAK.Timekeeper,
		ver: "1.0"
	}]
});

/** @constant */ JAK.Interpolator.LINEAR	= 1;
/** @constant */ JAK.Interpolator.QUADRATIC	= 2;
/** @constant */ JAK.Interpolator.SQRT		= 3;
/** @constant */ JAK.Interpolator.SIN		= 4;
/** @constant */ JAK.Interpolator.ASIN		= 5;

/**
 * @param {float} startVal počáteční hodnota
 * @param {float} endVal koncová hodnota
 * @param {int} interval doba trvání v msec
 * @param {function} callback periodicky callback
 * @param {object} [options] opšny
 * @param {int} [options.count=1] počet tiknutí pro Timekeeper
 * @param {int} [options.interpolation=JAK.Interpolator.LINEAR]
 * @param {function} [options.endCallback]
 */
JAK.Interpolator.prototype.$constructor = function(startVal, endVal, interval, callback, options) {
	this.startVal = startVal;
	this.endVal = endVal;
	this.interval = interval;
	this.callback = callback;
	this.options = {
		interpolation: JAK.Interpolator.LINEAR,
		count: 1,
		endCallback: false
	}
	this.running = false;

	for (var p in options) { this.options[p] = options[p]; }
}

/**
 * zavola callback
 * @private
 * @param {float} frac cislo mezi nulou a jednickou
 */
JAK.Interpolator.prototype._call = function(frac) {
	var result = this._interpolate(frac);
	var delta = this.endVal - this.startVal;
	this.callback(this.startVal + delta*result);
}

/**
 * provede interpolaci na zaklade this.options.interpolation
 * @private
 * @param {float} val cislo mezi nulou a jednickou
 */
JAK.Interpolator.prototype._interpolate = function(val) {
	if (typeof(this.options.interpolation) == "function") {
		return this.options.interpolation(val);
	}
	switch (this.options.interpolation) {
		case JAK.Interpolator.QUADRATIC: return val*val;
		case JAK.Interpolator.SQRT: return Math.sqrt(val);
		case JAK.Interpolator.SIN: return (Math.sin(Math.PI * (val-0.5)) + 1) / 2;
		case JAK.Interpolator.ASIN: return (Math.asin(2 * (val-0.5)) + Math.PI/2) / Math.PI;
		default: return val; /* default, linear */
	}
}

/**
 * spusti animaci
 */
JAK.Interpolator.prototype.start = function() {
	if (this.running) { return; }
	this.running = true;
	this.startTime = (new Date()).getTime();
	this._call(0);
	JAK.Timekeeper.getInstance().addListener(this, "_tick", this.options.count);
}

/**
 * zastavi animaci
 */
JAK.Interpolator.prototype.stop = function() {
	if (!this.running) { return; }
	this.running = false;
	JAK.Timekeeper.getInstance().removeListener(this);
}

/**
 * krok interpolace
 * @private
 */
JAK.Interpolator.prototype._tick = function() {
	var now = (new Date()).getTime();
	var elapsed = now - this.startTime;
	if (elapsed >= this.interval) {
		this.stop();
		this._call(1);
		if (this.options.endCallback) { this.options.endCallback(); }
	} else {
		this._call(elapsed / this.interval);
	}
}

/**
 * @class Interpolator CSS vlastnosti
 * @group jak-utils
 */
JAK.CSSInterpolator = JAK.ClassMaker.makeClass({
	NAME: "CSSInterpolator",
	VERSION: "2.0"
});

/**
 * @param {element} elm HTML prvek
 * @param {int} interval doba animace v msec
 * @param {object} [options] opsny pro interpolator
 * @see JAK.Interpolator
 */
JAK.CSSInterpolator.prototype.$constructor = function(elm, interval, options) {
	this.elm = elm;
	this.properties = [];
	this.colors = [];

	this._tick = this._tick.bind(this);
	this.interpolator = new JAK.Interpolator(0, 1, interval, this._tick, options);
}

/**
 * prida novou vlastnost k animovani
 * @param {string} property CSS vlastnost
 * @param {float} startVal pocatecni hodnota
 * @param {float} endVal koncova hodnota
 * @param {string} [suffix=""] volitelna pripona pro CSS hodnotu (typicky 'px')
 */
JAK.CSSInterpolator.prototype.addProperty = function(property, startVal, endVal, suffix) {
	var o = {
		property:property,
		startVal:startVal,
		endVal:endVal,
		suffix:suffix || ""
	}
	this.properties.push(o);
}

/**
 * prida novou barevnou vlastnost k animovani
 * @param {string} property CSS vlastnost
 * @param {string} startVal pocatecni hodnota
 * @param {string} endVal koncova hodnota
 */
JAK.CSSInterpolator.prototype.addColorProperty = function(property, startVal, endVal) {
	var o = {
		startVal:JAK.Parser.color(startVal),
		endVal:JAK.Parser.color(endVal),
		property:property
	};
	this.colors.push(o);
}

/**
 * spusti animaci
 */
JAK.CSSInterpolator.prototype.start = function() {
	this.interpolator.start();
}

/**
 * zastavi animaci
 */
JAK.CSSInterpolator.prototype.stop = function() {
	this.interpolator.stop();
}

/**
 * nastavi spravne hodnoty pro opacity v zavislosti na prohlizeci
 * @private
 */
JAK.CSSInterpolator.prototype._setOpacity = function(obj, prop, frac) {
	var property = "";
	var val = prop.startVal + frac * (prop.endVal - prop.startVal);

	// tady spocitej hodnotu pro ruzne klienty
	if (JAK.Browser.client == "ie" && JAK.Browser.version < 9) {
		property = 'filter';
		val = Math.round(100*val);
		val = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + val + ');';
	} else {
		property = 'opacity';
	}
	obj[property] = val;
}

/**
 * krok animace
 * @private
 */
JAK.CSSInterpolator.prototype._tick = function(frac) {
	for (var i=0;i<this.properties.length;i++) {
		var prop = this.properties[i];

		switch (prop.property) {
			case "opacity" :
				this._setOpacity(this.elm.style, prop, frac);
			break;

			default:
				var val = prop.startVal + frac * (prop.endVal - prop.startVal);
				val += prop.suffix;
				this.elm.style[prop.property] = val;
			break;
		}
	}

	var names = ["r", "g", "b"];
	for (var i=0;i<this.colors.length;i++) {
		var c = this.colors[i];
		var out = [0,0,0];
		for (var j=0;j<names.length;j++) {
			var name = names[j];
			out[j] = c.startVal[name] + Math.round(frac*(c.endVal[name]-c.startVal[name]));
		}
		var result = "rgb(" + out.join(",") + ")";
		this.elm.style[c.property] = result;
	}
};

/**
 * @fileOverview core.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

"use strict";

/**
 * @method Najde element, který odpovídá selector a vrátí instanci JAX.Node
 * @example
 * var jaxNode = JAX("#ads"); // vrati element s id ads
 *
 * @param {String|Node|JAX.Node} selector Řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.Node|null}
 */
var JAX = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.Node.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return JAX.Node.create(selector);
	} else if (selector instanceof JAX.Node) {
		return selector;
	}

	return null;
};

/**
 * @method Najde elementy, které odpovídají selectoru a vrátí instanci JAX.NodeArray
 * @example
 * var jaxNodes = JAX.all("div.example"); // najde vsechny divy s className example a vrati instanci JAX.NodeArray
 *
 * @param {String|Node|JAX.Node} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.NodeArray|null}
 */
JAX.all = function(selector, srcElement) {
	if (typeof(selector) === "string") {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.Node.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) === "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX.Node.create(selector));
	} else if (selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return null;
};

/**
 * @method Vytvoří element na základě zadaných parametrů a vrátí JAX.Node instanci
 * @example
 * var elm = JAX.make("div#ads.column"); // vytvori element div s id ads a className column
 *
 * @param {String} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) !== "string") { throw new Error("First argument must be string."); }
	if (typeof(attrs) !== "object") { throw new Error("Second argument must be associative array."); }
	if (typeof(styles) !== "object") { throw new Error("Third argument must be associative array."); }
	if (typeof(srcDocument) !== "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) === -1) { throw new Error("Fourth argument must be document element."); }

	var tagName = tagString.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/g) || [];

	if (tagName.length === 1) {
		tagString = tagString.substring(tagName[0].length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
	}
	
	var attrType = "";
	for (var i=0, len=tagString.length; i<len; i++) {
		var ch = tagString[i];
		if (ch === "#") { 
			attrType = "id"; 
			attrs["id"] = "";
		} else if (ch === ".") { 
			attrType = "className";
			if (attrs["className"]) { 
				attrs["className"] += " ";
			} else {
				attrs["className"] = "";
			}
		} else if (attrType) {
			attrs[attrType] += ch;
		}	
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.Node.prototype);
	f._init(createdNode);
	
	return f;
};

/**
 * @method Vytvoří textový uzel a vrátí JAX.Node instanci
 * @example
 * var textNode = JAX.makeText("Hellow world");
 *
 * @param {String} text text, který má uzel obsahovat
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.makeText = function(text, srcDocument) {
	return JAX.Node.create((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 * @example
 * console.log(JAX.getTypeOf(10)); // vrati "number"
 * console.log(JAX.getTypeOf("10")); // vrati "string"
 *
 * @param value testovana hodnota
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) === "number") {
		return "number";
	} else if (typeof(value) === "string") {
		return "string";
	} else if (typeof(value) === "undefined") {
		return "undefined";
	} else if (typeof(value) === "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult === "[object Array]") {
		return "array";	
	} else if (toStringResult === "[object Date]") {
		return "date";
	}

	return "object";
};
/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující prvek v DOMu a poskytující rozšířené metody pro práci s ním
 * @class JAX.Node
 */
JAX.Node = JAK.ClassMaker.makeClass({
	NAME: "JAX.Node",
	VERSION: "1.0"
});

JAX.Node.ELEMENT_NODE = 1;
JAX.Node.TEXT_NODE = 3;
JAX.Node.COMMENT_NODE = 8;
JAX.Node.DOCUMENT_NODE = 9;
JAX.Node.DOCUMENT_FRAGMENT_NODE = 11;

JAX.Node.instances = {};
JAX.Node.instances[JAX.Node.ELEMENT_NODE] = {};
JAX.Node.instances[JAX.Node.TEXT_NODE] = {};
JAX.Node.instances[JAX.Node.COMMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_NODE] = {};
JAX.Node.instances[JAX.Node.DOCUMENT_FRAGMENT_NODE] = {};

JAX.Node._ids = {};
JAX.Node._ids[JAX.Node.ELEMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.TEXT_NODE] = 0;
JAX.Node._ids[JAX.Node.COMMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_NODE] = 0;
JAX.Node._ids[JAX.Node.DOCUMENT_FRAGMENT_NODE] = 0;

JAX.Node._MEASUREABLEVALUE_REGEXP = /^(?:-)?\d+(\.\d+)?(%|em|in|cm|mm|ex|pt|pc)?$/i;
JAX.Node._OPACITY_REGEXP = /alpha\(opacity=['"]?([0-9]+)['"]?\)/i

/**
 * @static Tovární metoda. Slouží k vytvoření instance JAX.Node. Používejte, prosím, tuto metodu. Nevolejte JAX.Node s operátorem new.
 * @example
 * var jaxElm = JAX.Node.create(document.body.firstChild);
 *
 * @param {HTMLElm} node DOM uzel
 * @returns {JAX.Node}
 */
JAX.Node.create = function(node) {
	if (typeof(node) === "object" && node.nodeType) {
		var nodeType = node.nodeType;

		if (nodeType in JAX.Node.instances) {
			switch(nodeType) {
				case JAX.Node.ELEMENT_NODE:
					var jaxId = parseInt(node.getAttribute("data-jax-id"),10);
					if (typeof(jaxId) !== "number") { jaxId = -1; }
					if (jaxId > -1) {
						var item = JAX.Node.instances[JAX.Node.ELEMENT_NODE][jaxId];
						if (item) {return item.instance; }
					}
				break;
				default:
					var index = -1;
					var instances = JAX.Node.instances[nodeType];
					for (var i in instances) { 
						if (node === instances[i].node) { index = i; break; }
					}
					if (index > -1) { return JAX.Node.instances[nodeType][index].instance; }
			}
		}

		var f = Object.create(JAX.Node.prototype);
		f._init(node);
		return f;
	}
	
	throw new Error("First argument must be html element");
};

JAX.Node.prototype.$constructor = function() {
	throw new Error("You can not call this class with operator new. Use JAX.Node.create factory method instead of it");
};

/**
 * @method destructor - odvěsí všechny události, odebere uzel z DOMu, a odstraní všechny reference na něj z JAXu. Voláme, pokud víme, že uzel už se do DOMu nikdy více nepřipne.
 * @example
 * JAX("#nejakeId").$destructor();
 */
JAX.Node.prototype.$destructor = function() {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) { this._queueMethod(this.destroy, arguments); return this; }
	if ([1,9].indexOf(this._node.nodeType) !== -1) { this.stopListening(); }
	if ([1,3,8].indexOf(this._node.nodeType) !== -1) { this.remove(); }

	if (this._node.nodeType in JAX.Node.instances) { delete JAX.Node.instances[this._node.nodeType][this._jaxId]; }

	this._node = null;
	this._storage = null;
	this._jaxId = -1;
};

/**
 * @method vrací uzel, který si instance drží
 * @example
 * JAX("#nejakeId").node();
 *
 * @returns {DOMNode}
 */
JAX.Node.prototype.node = function() {
	return this._node;
};

/**
 * @method vyhledá a vrátí jeden DOM prvek, který odpovídá zadanému CSS3 (pro IE8 CSS2.1) selectoru
 * @example
 * JAX("#nejakeId").find(".trida"); // vrati prvni nalezeny prvek s classou trida v danem elementu
 *
 * @param {String} selector CSS3 (pro IE8 CSS2.1) selector
 * @returns {JAX.Node}
 */
JAX.Node.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

/**
 * @method vyhledá a vrátí instance JAX.NodeArray obsahující DOM prvky, které odpovídají zadanému CSS3 (pro IE8 CSS2.1) selectoru
 * @example
 * JAX("#nejakeId").findAll(".trida"); // vrati vsechny nalezene prvky s classou trida v danem elementu
 *
 * @param {String} selector CSS3 (pro IE8 CSS2.1) selector
 * @returns {JAX.NodeArray}
 */
JAX.Node.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

/**
 * @method přídá css třídu k elementu, lze zadat i více tříd oddělených mezerou a nebo pole tříd
 * @example
 * JAX("#nejakeId").addClass("trida"); // piseme bez tecky
 *
 * @param {String | Array} className jméno třídy nebo jména tříd oddělená mezerou | pole se jmény tříd
 * @returns {JAX.Node}
 */
JAX.Node.prototype.addClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.addClass","You can not use this method for this node. Doing nothing.", this._node);
		return this; 
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addClass, arguments); 
		return this; 
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.addClass","Given arguments can be string or array of strings. Trying convert to string: " + cName, this._node);
		}
		var classes = cName.split(" ");
		while(classes.length) {
			var newclass = classes.shift();
			if (currclasses.indexOf(newclass) === -1) { currclasses.push(newclass); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

/**
 * @method odebere css třídu od elementu, lze zadat i více tříd oddělených mezerou a nebo pole tříd
 * @example
 * JAX("#nejakeId").removeClass("trida"); // piseme bez tecky
 *
 * @param {String | Array} className jméno třídy nebo jména tříd oddělená mezerou | pole se jmény tříd
 * @returns {JAX.Node}
 */
JAX.Node.prototype.removeClass = function(classNames) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.removeClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.removeClass, arguments); 
		return this; 
	}
	
	if (!(classNames instanceof Array)) { classNames = [].concat(classNames); }
	var currclasses = this._node.className.split(" ");
	
	for (var i=0, len=classNames.length; i<len; i++) {
		var cName = classNames[i];
		if (typeof(cName) !== "string") { 
			cName += "";
			JAX.Report.show("error","JAX.Node.removeClass","Given arguments can be string, array of strings. Trying convert to string: " + cName, this._node);
		}
		var classes = cNames.split(" ");
		while(classes.length) {
			var index = currclasses.indexOf(classes.shift());
			if (index !== -1) { currclasses.splice(index, 1); }
		}
	}
	
	this._node.className = currclasses.join(" ");
	
	return this;
};

/**
 * @method zjistí, zda má element nastavenou požadovanou tříd. Lze zadat i jména více tříd oddělených mezerů, ale pokud alespoň jedna není přítomna, vrací false.
 * @example
 * if (JAX("#nejakeId").hasClass("trida")) { console.log("Trida pritomna"); } // jmeno tridy piseme bez tecky
 *
 * @param {String} className jméno třídy nebo jména tříd oddělená mezerou
 * @returns {Boolean}
 */
JAX.Node.prototype.hasClass = function(className) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.hasClass","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(className) !== "string") {  
		className += "";
		JAX.Report.show("error","JAX.Node.hasClass","For first argument I expected string. Trying convert to string: " + className, this._node);
	}

	var names = className.split(" ");

	while(names.length) {
		var name = names.shift();
		if (this._node.className.indexOf(name) === -1) { return false; }
	}

	return true;
};

/**
 * @method nastavuje nebo vrací atribut id elementu
 * @example
 * var jaxElm = JAX(document.body).id("mojeId"); 
 * console.log(jaxElm.id());
 *
 * @param {String|Undefined} id název id | bez parametru, pokud chceme id vrátit
 * @returns {JAX.Node | String}
 */
JAX.Node.prototype.id = function(id) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.id","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return this.attr("id"); 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.id, arguments); 
		return this; 
	}

	if (typeof(id) !== "string") {
		id += "";
		JAX.Report.show("warn","JAX.Node.id","For first argument I expected string. Trying convert to string: " + id, this._node);
	}

	this.attr({id:id}); 
	return this;
};

/**
 * @method nastavuje nebo vrací textový html obsah elementu
 * @example
 * var jaxElm = JAX(document.body).html("neco"); 
 * console.log(jaxElm.html());
 *
 * @param {String | Undefined} innerHTML html text | bez parametru, pokud chceme html obsah vrátit
 * @returns {JAX.Node | String}
 */
JAX.Node.prototype.html = function(innerHTML) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.html","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		return innerHTML; 
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	}

	if (typeof(innerHTML) !== "string" && typeof(innerHTML) !== "number") {
		innerHTML += "";
		JAX.Report.show("warn","JAX.Node.html","For first argument I expected string or number. Trying convert to string: " + innerHTML, this._node);
	}

	this._node.innerHTML = innerHTML + "";
	return this;
};

JAX.Node.prototype.text = function(text) {
	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
		JAX.Report.show("warn","JAX.Node.text","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (!arguments.length) { 
		if (this._node.innerHTML) { return this._getText(this._node); }
		return this._nodeValue;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.html, arguments); 
		return this; 
	}

	if (this._node.innerHTML) { 
		this._node.innerHTML = text;
	} else {
		this._node.nodeValue = text;
	}

	return this;
};

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {DOMNode | Array | JAX.NodeArray} nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.Node}
 */
JAX.Node.prototype.add = function(nodes) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.add, arguments); 
		return this; 
	}
	
	if (nodes instanceof JAX.NodeArray) {
		nodes = nodes.items();
	} else if (!(nodes instanceof Array)) { 
		nodes = [].concat(nodes); 
	}
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if (!node.nodeType && !(node instanceof JAX.Node)) { throw new Error("For arguments I expected html node, text node or JAX.Node instance. You can use array of them."); }
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {DOMNode} node DOM uzel
 * @param {DOMNode} nodeBefore DOM uzel
 * @returns {JAX.Node}
 */
JAX.Node.prototype.addBefore = function(node, nodeBefore) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.addBefore, arguments); 
		return this;  
	} 

	if (typeof(node) !== "object" || (!node.nodeType && !(node instanceof JAX.Node))) { 
		throw new Error("For first argument I expected html element, text node, documentFragment or JAX.Node instance"); 
	}
	if (typeof(nodeBefore) !== "object" || (!nodeBefore.nodeType && !(nodeBefore instanceof JAX.Node))) { 
		throw new Error("For second argument I expected html element, text node or JAX.Node instance"); 
	}

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

/**
 * @method připne (přesune) element do jiného elementu (na konec)
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendTo(document.body); // pripne span do body
 *
 * @param {DOMNode} node DOM uzel
 * @returns {JAX.Node}
 */
JAX.Node.prototype.appendTo = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendTo, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, documentFragment or JAX.Node instance");
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendBefore(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {DOMNode} node DOM uzel
 * @returns {JAX.Node}
 */
JAX.Node.prototype.appendBefore = function(node) {
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.appendBefore, arguments); 
		return this; 
	} else if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var node = node.jaxNodeType ? node.node() : node;
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	throw new Error("For first argument I expected html element, text node or JAX.Node instance");
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.remove = function() {
	if ([9,11].indexOf(this._node.nodeType) !== -1) { 
		JAX.Report.show("warn","JAX.Node.remove","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.remove, arguments); 
		return this; 
	}
	
	this._node.parentNode.removeChild(this._node);

	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.Node
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.Node}
 */
JAX.Node.prototype.clone = function(withContent) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.clone","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var withContent = !!withContent;
	var clone = this._node.cloneNode(withContent);
	clone.setAttribute("data-jax-id","");
	return JAX.Node.create(clone);
};

/**
 * @method navěsí posluchač události na element a vrátí event id. Pokud událost proběhne, vyvolá se zadané funkce. Do této funkce jsou pak předány parametry event (window.Event), jaxlm (instance JAX.Node) a bindData
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var func = function(e, jaxElm) { alert(elm.html()); };
 * var eventId = JAX(document.body.firstChild).listen("click", func); // navesi udalost click na span
 *
 * @param {String} type typ události, na kterou chceme reagovat ("click", "mousedown", ...)
 * @param {String | Function} funcMethod název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {Object} obj objekt, ve které se metoda uvedená pomocí stringu nachází. Pokud je funcMethod function, tento parameter lze nechat prázdný nebo null
 * @param {any} bindData pokud je potřeba přenést zároveň s tím i nějakou hodnotu (String, Number, Asociativní pole, ...)
 * @returns {String} Event ID
 */
JAX.Node.prototype.listen = function(type, funcMethod, obj, bindData) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.listen","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	var obj = obj || window;

	if (!type || typeof(type) !== "string") { 
		type += "";
		JAX.Report.show("error","JAX.Node.listen","For first argument I expected string. Trying convert to string: " + type, this._node);
	}

	if (!funcMethod || (typeof(funcMethod) !== "string" && typeof(funcMethod) !== "function")) { 
		throw new Error("For second argument I expected string or function"); 
	}

	if (typeof(obj) !== "object") { 
		throw new Error("For third argument I expected referred object"); 
	}

	if (typeof(funcMethod) === "string") {
		var funcMethod = obj[funcMethod];
		if (!funcMethod) { throw new Error("Given method in second argument was not found in referred object given in third argument"); } 
		funcMethod = funcMethod.bind(obj);
	}

	var f = function(e, node) { funcMethod(e, JAX(node), bindData); };
	var listenerId = JAK.Events.addListener(this._node, type, f);
	var evtListeners = this._storage.events[type] || [];
	evtListeners.push(listenerId);
	this._storage.events[type] = evtListeners;

	return listenerId;
};

/**
 * @method odvěsí posluchač na základě parametru, což může být eventId vrácené pomocí metody JAX.Node.listen a nebo jméno konkrétkní události, např.: "click" Pokud se uvede jméno konkrétní události, jsou odstranění všechny listenery na tomto elementu, které na ni poslouchají a které byly navěšeny JAXem.
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var func = function(e, jaxElm) { jaxElm.stopListening("click"); }; // pri kliknuti odvesi udalost
 * var eventId = JAX(document.body.firstChild).listen("click", func); // navesi udalost click na span
 *
 * @param {String} id konkrétní událost nebo event id vrácené metodou JAX.Node.listen
 * @returns {JAX.Node}
 */
JAX.Node.prototype.stopListening = function(id) {
	if ([1,9].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.stopListening","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.stopListening, arguments);
		return this; 
	} 

	if (!arguments.length) {
		var events = this._storage.events;
		for (var p in events) { this._destroyEvents(events[p]); }
		this._storage.events = {};
		return this;
	}

	if (typeof(id) !== "string") { 
		id += "";
		JAX.Report.show("error","JAX.Node.stopListening","For first argument I expected string. Trying convert to string: " + id, this._node);
	}

	var eventListeners = this._storage.events[id]; 
	if (eventListeners) { 
		this._destroyEvents(eventListeners);
		this._storage.events[id] = [];
		return this;
	}

	var index = eventListeners.indexOf(id);
	if (index > -1) {
		this._destroyEvents([eventListeners[index]]);
		eventListeners.splice(index, 1);
		return this;
	}

	JAX.Report.show("warn","JAX.Node.stopListening","No listeners found. It seams that listener " + id + " does not exist.", this._node);

	return this;
};

JAX.Node.prototype.prop = function(property, value) {
	if (typeof(property) === "string") { 
		if (arguments.length === 1) { 
			return this._node[property]; 
		}
		this._node[property] = value;
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.attr","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var props = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			props[p] = this._node[p];
		}
		return props;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.prop, arguments); 
		return this; 
	}

	for (var p in property) {
		this._node[p] = property[p];
	}

	return this;
};

/**
 * @method nastaví nebo získá html atributy
 * @example
 * var jaxElm = JAX(document.body);
 * jaxElm.attr("id","mojeId"); // nastavi id
 * jaxElm.attr({"data-word":"demo"}); // nastavi attribut data-word
 * console.log(jaxElm.attr("id")); // ziska, jak je nastaven atribut id
 * console.log(jaxElm.attr(["id", "data-word"])); // vraci pole ["mojeId", "demo"]
 *
 * @param {String | Array | Object} property název atributu | pole názvů atributů | asociativní pole, např. {id:"mojeId", checked:"checked"}
 * @param {value} value pokud je uvedena a první argument je string, provede se nastavení příslušného atributu na určitou hodnotu
 * @returns {String | Object | JAX.Node}
 */
JAX.Node.prototype.attr = function(property, value) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.attr","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") { 
		if (arguments.length === 1) { 
			return this._node.getAttribute(property); 
		} 
		this._node.setAttribute(property, value + "");
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.attr","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var attrs = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			attrs[p] = this._node.getAttribute(p);
		}
		return attrs;	
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.attr, arguments); 
		return this; 
	}

	for (var p in property) {
		this._node.setAttribute(p, property[p]);
	}

	return this;
};

/** 
 * @method nastaví nebo získá style vlastnosti u elementu
 * @example
 * var jaxElm = JAX(document.body);
 * jaxElm.css("width","100%"); // nastavi document.body.style.width = "100%";
 * jaxElm.css({"display":"block"}); // nastavi document.body.style.dsiplay = "block";
 * console.log(jaxElm.css("display")); // ziska, jak je nastavena vlastnost display
 * console.log(jaxElm.css(["display", "width"])); // vraci pole ["block", "100%"]
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {display:"none", width:"100%"}
 * @param {value} value pokud je tento argument uveden a první argument je string, provede se nastavení příslušné vlastnosti na danou hodnotu
 * @returns {String | Object | JAX.Node}
 */
JAX.Node.prototype.css = function(property, value) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.css","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(property) === "string") {
		if (arguments.length === 1) { 
			return property === "opacity" ? this._getOpacity() : this._node.style[property]; 
		}
		this._node.style[property] = value; 
		if (arguments.length > 2) { 
			JAX.Report.warn("warn","JAX.Node.css","Too much arguments.", this._node);
		}
		return this;
	} else if (property instanceof Array) {
		var css = {};
		for (var i=0, len=property.length; i<len; i++) {
			var p = property[i];
			if (p === "opacity") { css[p] = this._getOpacity(); continue; }
			css[p] = this._node.style[p];
		}
		return css;
	} else if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.style, arguments); 
		return this; 
	} 

	for (var p in property) {
		var value = property[p];
		if (p === "opacity") { this._setOpacity(value); continue; }
		this._node.style[p] = value;
	}

	return this;
};

/** 
 * @method vrátí aktuální platné hodnoty požadovaných css vlastností u elementu bez ohledu na to, jestli jsou nastaveny přes css pravidlo nebo object style
 * @example
 * <style> .trida { padding-top:100px; } </style>
 * var jaxElm = JAX(document.body).addClass("trida");
 * jaxElm.computedCss("padding-top"); // vraci "100px"
 * jaxElm.css("paddingTop", "200px");
 * jaxElm.computedCss("padding-top"); // vraci "200px"
 *
 * @param {String | Array} properties název vlastnosti | pole názvů vlastností
 * @returns {String | Object | JAX.Node}
 */
JAX.Node.prototype.computedCss = function(properties) {
	if (this._node.nodeType !== 1) { 
		JAX.Report.show("warn","JAX.Node.computedCss","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (typeof(properties) === "string") {
		var value = JAK.DOM.getStyle(this._node, properties);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		return value;
	}

	var css = {};
	for (var i=0, len=properties.length; i<len; i++) {
		var p = properties[i];
		var value = JAK.DOM.getStyle(this._node, p);
		if (this._node.runtimeStyle && !this._node.addEventListener && JAX.Node._MEASUREABLEVALUE_REGEXP.test(value)) { value = this._inPixels(value); }
		css[p] = value;
	}
	return css;
};

/** 
 * @method zjistí nebo nastaví skutečnou výšku nebo šířku elementu včetně paddingu a borderu
 * @example
 * <style> .trida { padding:20px; width:100px; } </style>
 * var jaxElm = JAX(document.body).addClass("trida");
 * console.log(jaxElm.realSize("width")); // vraci 140
 *
 * @param {String} sizeType "width" nebo "height"
 * @param {Number} value hodnota (v px)
 * @returns {Number | JAX.Node}
 */
JAX.Node.prototype.realSize = function(sizeType, value) {
	if ([1].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.realSize","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	if (arguments.length === 1) { 
		var backupStyle = this.css(["display","visibility","position"]);
		var isFixedPosition = this.computedCss("position").indexOf("fixed") === 0;
		var isDisplayNone = this.css("display").indexOf("none") === 0;

		if (!isFixedPosition) { this.css({"position":"absolute"}); }
		if (isDisplayNone) { this.css({"display":""}); }		
		this.css({"visibility":"hidden"});

		var size = sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight;
		this.css(backupStyle);
		return size; 
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.height, arguments); 
		return this; 
	}

	var value = this._getSizeWithBoxSizing(sizeType, value);
	this._node.style.height = Math.max(value,0) + "px";
	return this;
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.Node.create(this._node.parentNode); }
	return null;
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.next = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : null;
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.previous = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : null;
};

/** 
 * @method vrací instanci JAX.NodeArray, která obsahuje všechny přímé potomky uzlu
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(body.childs().length);
 *
 * @returns {JAX.NodeArray}
 */
JAX.Node.prototype.childs = function() {
	if (!this._node.childNodes) { return []; }
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		nodes.push(JAX(childNode));
	}
	return new JAX.NodeArray(nodes);
};

/** 
 * @method vrací první uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body span").first().jaxNodeType == JAX.Node.TEXT_NODE);
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.first = function() {
	return this._node.firstChild ? JAX(this._node.firstChild) : null;
};

/** 
 * @method vrací poslední uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body span").first() == JAX("body span").last());
 *
 * @returns {JAX.Node | null}
 */
JAX.Node.prototype.last = function() {
	return this._node.lastChild ? JAX(this._node.lastChild) : null;
};

/** 
 * @method promaže element
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * body.clear();
 *
 * @returns {JAX.Node}
 */
JAX.Node.prototype.clear = function() {
	if ([1,3,11].indexOf(this._node.nodeType) === -1) { 
		JAX.Report.show("warn","JAX.Node.clear","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.clear, arguments); 
		return this; 
	}

	if (this._node.nodeType == 3) {
		this._node.nodeValue = "";
		return this;
	}

	JAK.DOM.clear(this._node);

	return this;
};

JAX.Node.prototype.eq = function(node) {
	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node() : node;
		return elm == this._node;
	} else if (typeof(node) === "string") {
		if (/^[a-zA-Z0-9]+$/g.test(node)) { return !!(this._node.tagName && this._node.tagName.toLowerCase() == node); }
		return !!JAX.all(node).filterItems(
			function(jaxElm) { return jaxElm.eq(this); }.bind(this)
		).length;
	}

	return false;
};

JAX.Node.prototype.contains = function(node) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm === this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	} else if (typeof(node) === "string") {
		return !!this.find(node);
	}
	
	throw new Error("For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node instance");
};

JAX.Node.prototype.isIn = function(node) {
	if ([1,3,8].indexOf(this._node.nodeType) === -1) {
		JAX.Report.show("warn","JAX.Node.contains","You can not use this method for this node. Doing nothing.", this._node);
		return false;
	}

	if (typeof(node) === "object" && (node.nodeType || node instanceof JAX.Node)) {
		var elm = node.jaxNodeType ? node : JAX.Node.create(node);
		return elm.contains(this);
	}
	
	throw new Error("For first argument I expected html element or JAX.Node instance");
};

JAX.Node.prototype.fade = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (typeof(type) !== "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.fade","For first argument I expected string. Trying convert to string: " + type, this._node); 
	}
	if (duration < 0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fade","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	switch(type) {
		case "in":
			var sourceOpacity = 0;
			var targetOpacity = parseFloat(this.computedCss("opacity")) || 1;	
		break;
		case "out":
			var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
			var targetOpacity = 0;
		break;
		default:
			JAX.Report.show("warn","JAX.Node.fade","I got unsupported type '" + type + "'.", this._node);
			return this;
	}

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) { 
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();
	return fx;
};

JAX.Node.prototype.fadeTo = function(opacityValue, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.fade","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}
	
	var opacityValue = parseFloat(opacityValue) || 0;
	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.fade, arguments); 
		return this; 
	}

	if (opacityValue<0) {
		opacityValue = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}
	if (duration<0) { 
		duration = 0;
		JAX.Report.show("error","JAX.Node.fadeTo","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	var sourceOpacity = parseFloat(this.computedCss("opacity")) || 1;
	var targetOpacity = parseFloat(opacityValue);

	var fx = new JAX.FX(this).addProperty("opacity", duration, sourceOpacity, targetOpacity);

	if (lockElm) {
		this.lock();
		fx.callWhenDone(this.unlock.bind(this));
	}

	fx.run();

	return fx;
};

JAX.Node.prototype.slide = function(type, duration, lockElm) {
	if (this._node.nodeType !== 1) {
		JAX.Report.show("warn","JAX.Node.slide","You can not use this method for this node. Doing nothing.", this._node);
		return this;
	}

	var duration = parseFloat(duration) || 0;

	if (this._node.getAttribute && this._node.getAttribute("data-jax-locked")) {
		this._queueMethod(this.slide, arguments); 
		return this; 
	} 

	if (typeof(type) !== "string") {
		type += "";
		JAX.Report.show("error","JAX.Node.slide","For first argument I expected string. Trying convert to string: " + type, this._node);
	}
	if (duration<0) {
		duration = 0;
		JAX.Report.show("error","JAX.Node.slide","For second argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	switch(type) {
		case "down":
			var backupStyles = this.css(["height","overflow"]);
			var property = "height";
			var source = 0;
			var target = this._getSizeWithBoxSizing("height");
		break;
		case "up":
			var backupStyles = this.css(["height","overflow"]);
			var property = "height";
			var source = this._getSizeWithBoxSizing("height");
			var target = 0;
		break;
		case "left":
			var backupStyles = this.css(["width","overflow"]);
			var property = "width";
			var source = this._getSizeWithBoxSizing("height");
			var target = 0;	
		break;
		case "right":
			var backupStyles = this.css(["width","overflow"]);
			var property = "width";
			var source = 0;
			var target = this._getSizeWithBoxSizing("height");
		break;
		default:
			JAX.Report.show("warn","JAX.Node.slide","I got unsupported type '" + type + "'.", this._node);
			return this;
	}

	this.css({"overflow": "hidden"});


	var fx = new JAX.FX(this).addProperty(property, duration, source, target);

	if (lockElm) {
		var func = function() {
			for (var p in backupStyles) { this._node.style[p] = backupStyles[p]; }
			this.unlock();
		}.bind(this);
		fx.callWhenDone(func);
	}
	
	fx.run();

	return fx;
};

JAX.Node.prototype.lock = function() {
	if (this._node.nodeType === 1) { this._node.setAttribute("data-jax-locked","1"); }
	return this;
};

JAX.Node.prototype.isLocked = function() {
	if (this._node.nodeType !== 1) { return false; }

	return !!this._node.getAttribute("data-jax-locked");
};

JAX.Node.prototype.unlock = function() {
	if (!this.isLocked()) { return this; }
	if (this._node.nodeType === 1) {
		var queue = this._storage.lockQueue;
		this._node.removeAttribute("data-jax-locked");
		while(queue.length) {
			var q = queue.shift();
			q.method.apply(this, q.args);
		}
	}

	return this;
};

JAX.Node.prototype._init = function(node) {
	this._node = node;
	this.jaxNodeType = this._node.nodeType;

	/* set jax id for new (old) node */
	var oldJaxId = -1;
	if (node.getAttribute) { 
		var oldJaxId = parseInt(node.getAttribute("data-jax-id"),10);
		if (typeof(oldJaxId) !== "number") { oldJaxId = -1; }
	}

	if (oldJaxId > -1) {
		this._jaxId = oldJaxId;
		this._storage = JAX.Node.instances.html[this._jaxId];
		this._storage.instance = this;
		return;
	}

	if (this._node.nodeType in JAX.Node.instances) {
		switch(this._node.nodeType) {
			case JAX.Node.ELEMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.ELEMENT_NODE]++;
				this._node.setAttribute("data-jax-id", this._jaxId);

				var storage = {
					instance: this,
					events: {},
					lockQueue: []
				};

				JAX.Node.instances[JAX.Node.ELEMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.TEXT_NODE:
			case JAX.Node.COMMENT_NODE:
			case JAX.Node.DOCUMENT_FRAGMENT_NODE:
				var nodeType = this._node.nodeType;
				this._jaxId = JAX.Node._ids[nodeType]++;

				var storage = { instance: this, node: node };

				JAX.Node.instances[nodeType][this._jaxId] = storage;
				this._storage = storage;
			break;
			case JAX.Node.DOCUMENT_NODE:
				this._jaxId = JAX.Node._ids[JAX.Node.DOCUMENT_NODE]++;

				var storage = { 
					instance: this,
					events: {},
					node: node
				};

				JAX.Node.instances[JAX.Node.DOCUMENT_NODE][this._jaxId] = storage;
				this._storage = storage;
			break;
		}
	}
};

JAX.Node.prototype._inPixels = function(value) {
	var style = this._node.style.left;
	var rStyle = this._node.runtimeStyle.left; 
    this._node.runtimeStyle.left = this._node.currentStyle.left;
    this._node.style.left = value || 0;  
    value = this._node.style.pixelLeft;
    this._node.style.left = style;
    this._node.runtimeStyle.left = rStyle;
      
    return value;
};

JAX.Node.prototype._setOpacity = function(value) {
	var property = "";

	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) { 
		property = "filter";
		value = Math.round(100*value);
		value = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value + ");";
	} else {
		property = "opacity";
	}
	this._node.style[property] = value + "";

};

JAX.Node.prototype._getOpacity = function() {
	if (JAK.Browser.client === "ie" && JAK.Browser.version < 9) {
		var value = "";
		this._node.style.filter.replace(JAX.NODE.OPACITY_REGEXP, function(match1, match2) {
			value = match2;
		});
		return value ? (parseInt(value, 10)/100)+"" : value;
	}
	return this._node.style["opacity"];
};

JAX.Node.prototype._getSizeWithBoxSizing = function(sizeType, value) {
	var boxSizing = this.computedCss("box-sizing") 
				 || this.computedCss("-moz-box-sizing")
				 || this.computedCss("-webkit-box-sizing");

	var paddingX = 0,
		paddingY = 0,
		borderX = 0,
		borderY = 0,
		paddingPropertyX = "padding-" + (sizeType == "width" ? "left" : "top"),
		paddingPropertyY = "padding-" + (sizeType == "width" ? "right" : "bottom"),
		borderPropertyX = "border-" + (sizeType == "width" ? "left" : "top"),
		borderPropertyY = "border-" + (sizeType == "width" ? "right" : "bottom");

	if (arguments.length === 1) {
		var value = (sizeType == "width" ? this._node.offsetWidth : this._node.offsetHeight);
	}

	if (!boxSizing || boxSizing === "content-box") {
		paddingX = parseFloat(this.computedCss(paddingPropertyX));
		paddingY = parseFloat(this.computedCss(paddingPropertyY));
	}
	
	if (boxSizing !== "border-box") {
		borderX = parseFloat(this.computedCss(borderPropertyX));
		borderY = parseFloat(this.computedCss(borderPropertyY));
	}
	
	if (paddingX && isFinite(paddingX)) { value =- paddingX; }
	if (paddingY && isFinite(paddingY)) { value =- paddingY; }
	if (borderX && isFinite(borderX)) { value =- borderX; }
	if (borderY && isFinite(borderY)) { value =- borderY; }

	return value;
};

JAX.Node.prototype._getText = function(node) {
	var text = "";
	for (var i=0, len=node.childNodes.length; i<len; i++) {
		var child = node.childNodes[i];
		var tagName = child.tagName ? child.tagName.toLowerCase() : "";
		if (tagName && (!child.offsetHeight || !child.offsetWidth)) { continue; }
		if (child.childNodes && child.childNodes.length) { text += this._getText(child); continue; }
		if (tagName == "br") { text += "\n"; continue; }
		if (child.nodeValue) { text += child.nodeValue; }
	}
	return text;
};

JAX.Node.prototype._queueMethod = function(method, args) {
	this._storage.lockQueue.push({method:method, args:args});
};

JAX.Node.prototype._destroyEvents = function(eventListeners) {
	JAK.Events.removeListeners(eventListeners);
};

JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "1.0"
});

JAX.NodeArray.prototype.$constructor = function(nodes) {
	var nodes = [].concat(nodes);
	var len = nodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var node = nodes[i];
		if (typeof(node) === "object" && node.nodeType) { this._jaxNodes[i] = JAX(node); continue; }
		if (node instanceof JAX.Node) { this._jaxNodes[i] = node; continue; }

		throw new Error("First argument must be array of JAX.Node instances or html nodes");
	}
	this.length = this._jaxNodes.length;
};

JAX.NodeArray.prototype.item = function(index) {
	return this._jaxNodes[index];
};

JAX.NodeArray.prototype.items = function() {
	return this._jaxNodes.slice();
};

JAX.NodeArray.prototype.addClass = function(classNames) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.addClass(classNames); 
	}
	return this;
};

JAX.NodeArray.prototype.removeClass = function(classNames) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeClass(classNames); 
	}
	return this;
};

JAX.NodeArray.prototype.css = function(property, value) {
	if (arguments.length == 1) {
		if (typeof(property) === "string" || property instanceof Array) {
			var styles = new Array(len);
			for (var i=0; i<this.length; i++) { 
				styles[i] = this._jaxNodes[i].css(property);
			}
			return styles;
		}
	}

	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].css(property, value);
	}

	return this;	
};

JAX.NodeArray.prototype.attr = function(property, value) {
	if (arguments.length == 1) {
		if (typeof(property) === "string" || property instanceof Array) {
			var attrs = new Array(len);
			for (var i=0; i<len; i++) { 
				attrs[i] = this._jaxNodes[i].attr(property);
			}
			return attrs;
		}
	}

	for (var i=0; i<this.length; i++) { 
		this._jaxNodes[i].attr(property, value); 
	}

	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].appendTo(node);
	}
	return this;
};

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeFromDOM(); 
	}
	return this;
};

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].destroy(); 
	}
	return this;
};

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	var filtered = [];
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var jaxNode = this._jaxNodes[i];
		if (func(jaxNode)) { filtered.push(jaxNode); }
	}
	return new JAX.NodeArray(filtered);
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

JAX.NodeArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

JAX.NodeArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

JAX.NodeArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeArray.prototype.fade = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fade(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fadeTo(opacityValue, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};


JAX.NodeArray.prototype.slide = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].slide(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

/**
 * @fileOverview dombuilder.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Pomocník pro vytváření DOM elementů
 * @class JAX.DOMBuilder
 */ 
JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "2.0"
});

/** 
 * @example 
 * var db = new JAX.DOMBuilder();
 *
 * @param {documentElement} document element, ve kter0m se budou nové elementy vytvářet
 */
JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: JAX.Node.create(document.createDocumentFragment()) };
	this._pointerJaxNode = null;
	this._stack = [];
};

/**
 * @method Vytvoří nový element a nastaví na něj interně ukazatel, takže další vytvářené elementy se budou přidávat do tohoto elementu
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("div",{},{width:"100px"});
 * db.add("span");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	if (typeof(element) === "string" && typeof(element) === "object" && element.nodeType) {
		this._pointerJaxNode = this.add(element, attributes, styles);
		return this._pointerJaxNode;
	}

	throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
};

/**
 * @method Vytvoří nový element a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("div");
 * db.add("span");
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	var jaxNode = node;

	if (typeof(node) === "string") {
		jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) === "object" && node.nodeType) {
		jaxNode = JAX(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	}

	if (!(jaxNode instanceof JAX.Node) || jaxNode.jaxNodeType === 9) {
		throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.css(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

/**
 * @method Vytvoří nový textový uzel a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String} txt text, který se má uložit do textového uzlu
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) === "string") {
		var jaxNode = JAX.makeText(txt);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	throw new Error("First argument must be a string");
};

/**
 * @method "Uzavře aktuálně otevřený element metodou JAX.DOMBuilder.open". Znamená to, že ukazatel se nastaví na rodičovský prvek tohoto elementu, pokud existuje.
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.close(); // vyhodí výjimku, snažíme se uzavřít prvek, ale žádný už otevřen není
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return this;
	}

	throw new Error("There is no opened element so you can not close anything");
};

/**
 * @method Vezme svůj HTML obsah a připne ho do cílového prvku
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.appendTo(document.body); // pripne vytvoreny span do document.body
 * console.log(db.getContainer());
 *
 * @param {HTMLNode} node prvek, kam se má celý obsah připnout
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) === "object" && node.nodeType) {
		var jaxNode = JAX(node);
	} else if (node instanceof JAX.Node && node.jaxNodeType === 1) {
		var jaxNode = node;
	} else {
		throw new Error("You are trying to append me to unsupported element. I can be appended only to html element or documentFragment element.");
	}

	this._jax.container.appendTo(jaxNode);
	return this;
};

/**
 * @method Vrací instance JAX.Node s HTML obsahem
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 *
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

/**
 * @method Vymaže HTML obsah
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 * db.clear();
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
	return this;
};

/**
 * @fileOverview fx.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Pomocník pro snadnější tvorbu animací
 * @class JAX.FX
 */ 
JAX.FX = JAK.ClassMaker.makeClass({
	NAME: "JAX.FX",
	VERSION: "1.0"
});

JAX.FX._TRANSITION_PROPERTY = "";
JAX.FX._TRANSITION_EVENT = "";

(function() {
	var transitions = {
      "transition":"transitionend",
      "OTransition":"oTransitionEnd",
      "MozTransition":"transitionend",
      "WebkitTransition":"webkitTransitionEnd",
      "MSTransition":"MSTransitionEnd"
    };

	for (var p in transitions) {
		if (p in document.createElement("div").style) {
			JAX.FX._TRANSITION_PROPERTY = p;
			JAX.FX._TRANSITION_EVENT = transitions[p];
			break; 
		}
	}
})();

JAX.FX._SUPPORTED_PROPERTIES = {
	"width": {defaultUnit:"px", css:"width" },
	"height":{defaultUnit:"px", css:"height" },
	"top": {defaultUnit:"px", css:"top" },
	"left": {defaultUnit:"px", css:"left" },
	"bottom": {defaultUnit:"px", css:"bottom" },
	"right": {defaultUnit:"px", css:"right" },
	"fontSize": {defaultUnit:"px", css:"font-size" },
	"opacity": {defaultUnit:"", css:"opacity" },
	"color": {defaultUnit:"", css:"color" },
	"backgroundColor": {defaultUnit:"", css:"background-color" }
};

JAX.FX._SUPPORTED_METHODS = [
	"ease",
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"cubic-bezier"
];

/**
 * @method constructor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 *
 * @param {HTMLElm} elm html element, který se má animovat
 */
JAX.FX.prototype.$constructor = function(elm) {
	this._elm = elm instanceof JAX.Node ? elm : JAX.Node.create(elm);
	this._properties = [];
	this._interpolators = [];
	this._callbacks = [];
	this._running = false;
	this._transitionSupport = !!JAX.FX._TRANSITION_PROPERTY;
};

/**
 * @method Přidá css vlastnost, která se bude animovat. Pro každou vlastnost lze zadat různou délku animace a také hodnoty, od kterých se má začít a po které skončit. <br>
 * Podporované css vlasnosti pro animaci: width, height, top, left, bottom, right, fontSize, opacity, color a backgroundColor
 * @example 
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @param {string} property css vlastnost, která se má animovat
 * @param {number} duration délka v sekundách, lze zadat i desetinné číslo, např. 1.2
 * @param {string} start počáteční hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} end koncová hodnota - je dobré k ní uvést vždy i jednotky, pokud jde o číselnou hodnotu, jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.FX.prototype.addProperty = function(property, duration, start, end, method) {
	var duration = parseInt(duration);
	var method = this._transitionSupport ? (method || "linear") : "LINEAR";
	
	if (typeof(property) != "string") { throw new Error("For first argument I expected string"); }
	if (!isFinite(duration) || duration < 0) { throw new Error("For second argument I expected positive number"); }
	if (typeof(start) != "string" && (typeof(start) != "number" || !isFinite(start))) { throw new Error("For third argument I expected string or number"); }
	if (typeof(end) != "string" && (typeof(end) != "number" || !isFinite(end))) { throw new Error("For fourth argument I expected string or number"); }
	if (typeof(method) != "string") { throw new Error("For fifth argument I expected string"); }

	if (!(property in JAX.FX._SUPPORTED_PROPERTIES)) { 
		var properties = [];
		for (var p in JAX.FX._SUPPORTED_PROPERTIES) { properties.concat(JAX.FX._SUPPORTED_PROPERTIES[p]); }
		throw new Error("First argument must be supported property: " + properties.join(", ")); 
	}
	var cssEnd = this._parseCSSValue(property, end);
	var cssStart = this._parseCSSValue(property, start); 
	var methodLowerCase = method.toLowerCase();

	for (var i=0, len=JAX.FX._SUPPORTED_METHODS.length; i<len; i++) {
		var supported = JAX.FX._SUPPORTED_METHODS[i];
		if (methodLowerCase == supported || (supported == "cubic-bezier" && methodLowerCase.indexOf(supported) == 0)) { 
			this._properties.push({
				property: property,
				cssStart: cssStart,
				cssEnd: cssEnd,
				duration: (duration || 1),
				method: method
			});
			return this;
		}
	}

	var methods = [];
	for (var p in JAX.FX._SUPPORTED_METHODS) { methods.concat(JAX.FX._SUPPORTED_METHODS[p]); }
	throw new Error("Fifth argument must be supported method: " + methods.join(", ")); 
};

/**
 * @method Po doběhnutí celé animace zavolá funkci předanou parametrem. Opakovaným voláním této metody lze přidat více funkcí.
 * @example 
 * var func1 = function() { console.log("func1"); };
 * var func2 = function() { console.log("func1"); };
 * var elm = JAX("#box");
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.callWhenDone(func1);
 * fx.callWhenDone(func2);
 * fx.run();
 *
 * @param {function} callback funkce, která se provede po doběhnutí celé animace
 * @returns {JAX.FX}
 */
JAX.FX.prototype.callWhenDone = function(callback) {
	this._callbacks.push(callback);
	return this;
};

/**
 * @method Spustí animaci
 * @example
 * var fx = new JAX.FX(elm);
 * fx.addProperty("width", 2, 0, 200);
 * fx.addProperty("height", 3, 0, 100);
 * fx.run();
 *
 * @eturns {JAX.FX}
 */
JAX.FX.prototype.run = function() {
	this._running = true;
	if (!this._transitionSupport) { this._initInterpolators(); return this; }
	this._initTransition();
	return this;
};

/**
 * @method Zjistí, jestli animace právě běží
 * 
 * @returns {boolean}
 */
JAX.FX.prototype.isRunning = function() {
	return this._running;
};

/**
 * @method Stopne (zabije) animaci
 * 
 * @returns {JAX.FX}
 */
JAX.FX.prototype.stop = function() {
	if (!this._transitionSupport) { this._stopInterpolators(); return this; }
	this._stopTransition();
	return this;
};

JAX.FX.prototype._initInterpolators = function() {
	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];

		var interpolator = new JAK.CSSInterpolator(this._elm.node(), property.duration * 1000, { 
			"interpolation": property.method, 
			"endCallback": this._endInterpolator.bind(this, i) 
		});
		
		this._interpolators.push(interpolator);
		if (["backgroundColor", "color"].indexOf(property.property) === 0) {
			interpolator.addColorProperty(property.property, property.cssStart.value, property.cssEnd.value);
		} else {
			interpolator.addProperty(property.property, property.cssStart.value, property.cssEnd.value, property.cssStart.unit);
		}
		interpolator.start();
	}
};

JAX.FX.prototype._stopInterpolators = function() {
	for (var i=0, len=this._interpolators.length; i<len; i++) { this._endInterpolator(i); }
};

JAX.FX.prototype._initTransition = function() {
	var tp = JAX.FX._TRANSITION_PROPERTY;
	var te = JAX.FX._TRANSITION_EVENT;
	var tps = [];
	var node = this._elm.node();
	var style = node.style;

	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssStart.value + property.cssStart.unit;
		tps.push(property.property + " " + property.duration + "s " + property.method);
	}

	node.offsetHeight; /* trick - donutime porhlizec k prekresleni */
	node.style[tp] = tps.join(",");

	this._ecTransition = this._elm.listen(te, "_endTransition", this);
	for (var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i];
		style[property.property] = property.cssEnd.value + property.cssStart.unit;
	}
};

JAX.FX.prototype._stopTransition = function() {
	var node = this._elm.node();
	var style = this._elm.node().style;

	for(var i=0, len=this._properties.length; i<len; i++) {
		var property = this._properties[i].property;
		var value = window.getComputedStyle(node).getPropertyValue(JAX.FX._SUPPORTED_PROPERTIES[property].css);
		style[property] = value;
	}

	this._endTransition();
};

JAX.FX.prototype._parseCSSValue = function(property, cssValue) {
	var value = parseFloat(cssValue);
	var unit = (cssValue+"").replace(value, "");

	if (unit) { return { "value": value, "unit": unit }; }

	return { "value": value, "unit": JAX.FX._SUPPORTED_PROPERTIES[property].defaultUnit };
};

JAX.FX.prototype._endInterpolator = function(index) {
	this._interpolators[index].stop();
	this._interpolators.splice(index, 1);
	if (this._interpolators.length) { return; }
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

JAX.FX.prototype._endTransition = function() {
	var te = JAX.FX._TRANSITION_EVENT;
	this._elm.stopListening(te, this._ecTransition);
	this._elm.node().style[JAX.FX._TRANSITION_PROPERTY] = "none";
	this._ecTransition = null;
	this._running = false;
	for (var i=0, len=this._callbacks.length; i<len; i++) { this._callbacks[i](); }
};

JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.show = function(type, func, msg, node) {
	console.DEBUG = 1;

	if (console[type]) {
		console[type]("[" + func + "] » " + msg);
		if (node) { 
			console.log("============================================================");
			console.log(node);
			console.log("============================================================"); 
		}
		return;
	}
	throw new Error("Bad console type: " + type); 
};
if (!window.$ && !window.$$) { window.$ = JAX; window.$$ = JAX.all; }

