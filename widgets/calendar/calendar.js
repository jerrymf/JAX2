JAX.Calendar = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar",
	VERSION:"0.45"
});

JAX.Calendar.prototype.$constructor = function(elm) {
	this._jax = {};
	this._buttons = {};
	this._current = {};
	this._yearViews = {};
	this._ecDoc = null;

	this._shown = false;
	this._pendingAnimation = false;

	this._jax.targetElm = elm instanceof JAX.Node ? elm : JAX.Node.create(elm);
};

JAX.Calendar.prototype.show = function() {
	if (this._shown || this._pendingAnimation) { return this; }

	var pos = JAK.DOM.getPortBoxPosition(this._jax.targetElm.node());
	
	var width = this._jax.targetElm.fullSize("width");
	var height = this._jax.targetElm.fullSize("height");

	pos.left += width;
	pos.top += height;

	this._init();
	this._activeYearView.setActiveMonth(this._current.month);

	this._pendingAnimation = true;

	this._jax.container
		.add(this._activeYearView.getContainer())
		.appendTo(document.body)
		.css({top:pos.top+"px", left:pos.left+"px"})
		.fade("in", 0.5, true)
		.callWhenDone(this._showingComplete.bind(this));
};

JAX.Calendar.prototype.hide = function() {
	if (!this._shown || this._pendingAnimation) { return this; }

	this._jax.doc.stopListening("mousedown",this._ecDoc);
	this._ecDoc = null;

	this._pendingAnimation = true;
	this._jax.container
		.fade("out", 0.5, true)
		.callWhenDone(this._hidingComplete.bind(this));
};

JAX.Calendar.prototype._showingComplete = function() {
	this._jax.doc = JAX(document);
	this._ecDoc = this._jax.doc.listen("mousedown", this, "_tryHide");
	this._shown = true;
	this._pendingAnimation = false;
};

JAX.Calendar.prototype._hidingComplete = function() {
	this._jax.container.$destructor();

	for (var i in this._yearViews) { delete this._yearViews[i]; }
	for (var i in this._buttons) { delete this._buttons[i]; }
	for (var i in this._current) { delete this._current[i]; }
	delete this._jax.container;

	this._activeYearView = null;

	this._shown = false;
	this._pendingAnimation = false;
};

JAX.Calendar.prototype._init = function() {
	this._jax.container = JAX.make("div.jax-cal");

	/* calendar body init */
	var date = new Date();
	this._initYear(date.getFullYear(), date.getMonth());
	this._activeYearView = this._yearViews[this._current.year.getYearNumber()].view;

	/* buttons init */
	this._buttons["prev-year"] = new JAX.Calendar.Button("&laquo;&laquo;");
	this._buttons["next-year"] = new JAX.Calendar.Button("&raquo;&raquo;");
	this._buttons["prev-month"] = new JAX.Calendar.Button("&laquo;");
	this._buttons["next-month"] = new JAX.Calendar.Button("&raquo;");

	for (var p in this._buttons) {
		var button = this._buttons[p];
		button.listenOnClick(this._onButtonClick.bind(this, p));
		button.getContainer()
			.addClass(p)
			.appendTo(this._jax.container);
	}
};

JAX.Calendar.prototype._onButtonClick = function(type, jaxE, jaxElm) {
	jaxE.cancel();
	var currentYearNumber = this._current.year.getYearNumber();
	var currentMonthNumber = this._current.month.getMonthNumber();

	switch(type) {
		case "prev-month":
			if (currentMonthNumber > 0) { 
				this._activeYearView.setPreviousMonth();
				this._current.month = this._current.year.getMonths()[currentMonthNumber - 1];
				return;
			}
			this._initYear(currentYearNumber - 1, 11);
		break;
		case "next-month":
			if (currentMonthNumber < 11) { 
				this._activeYearView.setNextMonth();
				this._current.month = this._current.year.getMonths()[currentMonthNumber + 1];
				return;
			}
			this._initYear(currentYearNumber + 1, 0);
		break;
		case "prev-year":
			this._initYear(currentYearNumber - 1, currentMonthNumber);
		break;
		case "next-year":
			this._initYear(currentYearNumber + 1, currentMonthNumber);
		break;
	}

	this._activeYearView.getContainer().remove();
	this._activeYearView = this._yearViews[this._current.year.getYearNumber()].view;
	this._activeYearView.setActiveMonth(this._current.month);
	this._jax.container.add(this._activeYearView.getContainer());
};

JAX.Calendar.prototype._initYear = function(yearNumber, monthNumber) {
	var newYear = null;
	for (var p in this._yearViews) { if (p == yearNumber) { newYear = this._yearViews[p].year; } }

	if (!newYear) { 
		newYear = new JAX.Calendar.Year(yearNumber); 
		newYearView = new JAX.Calendar.Year.View(newYear);

		this._yearViews[yearNumber] = {
			year:newYear,
			view:newYearView
		};
	}

	this._current.year = newYear;
	this._current.month = newYear.getMonths()[monthNumber];
};

JAX.Calendar.prototype._tryHide = function(jaxE, jaxElm) {
	var node = jaxE.target();
	if (node.jaxNodeType == 9 || !node.isIn(this._jax.container)) { this.hide(); }
};

JAX.Calendar.Day = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Day",
	VERSION:"0.45"
});

JAX.Calendar.Day.DAY_NAMES = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
JAX.Calendar.Day.DAY_NAMES_SHORT = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

JAX.Calendar.Day.prototype.$constructor = function(dayNumber, month, year) {
	this._dayNumber = dayNumber;
	this._year = year instanceof JAX.Calendar.Year ? year : new JAX.Calendar.Year(year);
	this._month = month instanceof JAX.Calendar.Month ? month : new JAX.Calendar.Month(month);
	this._dayName = "";
	this._dayNameShort = "";

	this._generateDayName();
};

JAX.Calendar.Day.prototype.getDayNumber = function() {
	return this._dayNumber;
};

JAX.Calendar.Day.prototype.getDayName = function() {
	return this._dayName;
};

JAX.Calendar.Day.prototype.getDayInWeek = function() {
	return this._dayInWeek;
};

JAX.Calendar.Day.prototype.getDayNameShort = function() {
	return this._dayNameShort;
};

JAX.Calendar.Day.prototype.getMonth = function() {
	return this._month;
};

JAX.Calendar.Day.prototype.getYear = function() {
	return this._year;
};

JAX.Calendar.Day.prototype._generateDayName = function() {
	var month = this._month.getMonthNumber();
	var year = this._year.getYearNumber();
	var day = this._dayNumber;

	var date = new Date(year, month, day + 1);
	this._dayInWeek = date.getDay() - 1;
	if (this._dayInWeek < 0) { this._dayInWeek = 6; } 

	this._dayName = JAX.Calendar.Day.DAY_NAMES[this._dayInWeek];
	this._dayNameShort = JAX.Calendar.Day.DAY_NAMES_SHORT[this._dayInWeek];
};

JAX.Calendar.Day.View = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Day.View",
	VERSION:"0.45"
});

JAX.Calendar.Day.View.prototype.$constructor = function(day) {
	this._day = day;
	this._jax = {};
	this._build();
};

JAX.Calendar.Day.View.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.Calendar.Day.View.prototype._build = function() {
	this._jax.container = JAX.make("td");
	this._jax.number = JAX.make("span").html(this._day.getDayNumber()+1).appendTo(this._jax.container);
};

JAX.Calendar.Month = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Month",
	VERSION:"0.45"
});

JAX.Calendar.Month.MONTH_NAMES = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
JAX.Calendar.Month.MONTH_NAMES_SHORT = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čerc", "Srp", "Zář", "Říj", "Lis", "Pro"];
JAX.Calendar.Month.MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

JAX.Calendar.Month.prototype.$constructor = function(monthNumber, year) {
	this._monthNumber = monthNumber;
	this._year = year instanceof JAX.Calendar.Year ? year : new JAX.Calendar.Year(year);
	this._monthName = JAX.Calendar.Month.MONTH_NAMES[monthNumber];
	this._monthNameShort = JAX.Calendar.Month.MONTH_NAMES_SHORT[monthNumber];
	this._days = [];
	this._countOfDays = 0;
	this._generateDays();
};

JAX.Calendar.Month.prototype.getMonthNumber = function() {
	return this._monthNumber;
};

JAX.Calendar.Month.prototype.getMonthName = function() {
	return this._monthName;
};

JAX.Calendar.Month.prototype.getYear = function() {
	return this._year;
};

JAX.Calendar.Month.prototype.getDays = function() {
	return this._days;
};

JAX.Calendar.Month.prototype._generateDays = function() {
	this._countOfDays = JAX.Calendar.Month.MONTH_DAYS[this._monthNumber];
	if (this._year.getYearNumber() % 4 == 0 && this._monthNumber == 1) { this._countOfDays += 1; }

	for (var i=0; i<this._countOfDays; i++) {
		this._days.push(new JAX.Calendar.Day(i, this, this._year));
	}
};

JAX.Calendar.Month.View = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Month.View",
	VERSION:"0.45"
});

JAX.Calendar.Month.View.prototype.$constructor = function(month) {
	this._month = month;
	this._days = month.getDays();
	this._dayViews = [];
	this._jax = {};

	this._build();
};

JAX.Calendar.Month.View.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.Calendar.Month.View.prototype.show = function() {
	this._jax.container.css("display", "");
};

JAX.Calendar.Month.View.prototype.hide = function() {
	this._jax.container.css("display", "none");
};

JAX.Calendar.Month.View.prototype._build = function() {
	var monthTitle = this._month.getMonthName() + " " + this._month.getYear().getYearNumber();
	this._jax.container = JAX.make("div.jax-cal-month");
	this._jax.header = JAX.make("div.jax-cal-month-header").appendTo(this._jax.container);
	this._jax.monthName = JAX.make("span.jax-cal-month-title").html(monthTitle).appendTo(this._jax.header);

	this._jax.table = JAX.make("table").appendTo(this._jax.container);
	this._jax.content = JAX.make("tbody").appendTo(this._jax.table);
	this._jax.header = JAX.make("tr").appendTo(this._jax.content);
	this._jax.rows = [JAX.make("tr").appendTo(this._jax.content)];

	var dayNames = JAX.Calendar.Day.DAY_NAMES_SHORT;
	for (var i=0, len=dayNames.length; i<len; i++) {
		this._jax.header.add(JAX.make("th").html(dayNames[i]));
	}

	var startCell = this._days[0].getDayInWeek();
	var endCell = startCell + this._days.length - 1;
	var totalCells = Math.ceil((endCell + 1)/7)*7;
	var row = 0;
	var j = 0;

	for (var i=0; i<totalCells; i++) {
		if (i && i%7 == 0) {
			this._jax.rows.push(JAX.make("tr").appendTo(this._jax.content));
			row++;
		}

		if (i<startCell || i>endCell) { 
			this._jax.rows[row].add(JAX.make("td.disabled")); 
			continue;
		}

		var day = this._days[j++];
		var dayView = new JAX.Calendar.Day.View(day);
		this._jax.rows[row].add(dayView.getContainer());
		this._dayViews.push(dayView);
	}
};

JAX.Calendar.Year = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Year",
	VERSION:"0.45"
});

JAX.Calendar.Year.prototype.$constructor = function(yearNumber) {
	this._yearNumber = yearNumber;
	this._months = [];
	this._generateMonths();
};

JAX.Calendar.Year.prototype.getYearNumber = function() {
	return this._yearNumber;
};

JAX.Calendar.Year.prototype.getMonths = function() {
	return this._months;
};

JAX.Calendar.Year.prototype._generateMonths = function() {
	for (var i=0; i<12; i++) {
		this._months.push(new JAX.Calendar.Month(i, this));
	}
};

JAX.Calendar.Year.View = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Year.View",
	VERSION:"0.45"
});

JAX.Calendar.Year.View.prototype.$constructor = function(year) {
	this._year = year;
	this._months = year.getMonths();
	this._viewMonths = {};
	this._jax = {};
	this._activeMonth = null;
	this._activeMonthNumber = -1;

	this._build();
	this.setActiveMonth(this._months[0]);
};

JAX.Calendar.Year.View.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.Calendar.Year.View.prototype.setActiveMonth = function(month) {
	var index = this._months.indexOf(month);
	if (index == -1) { return; }

	this._activeMonth = month;
	this._activeMonthNumber = month.getMonthNumber();

	for (var i in this._viewMonths) {
		var viewMonth = this._viewMonths[i];
		viewMonth.hide();
	}

	var viewMonth = this._viewMonths[index];
	if (!viewMonth) {
		viewMonth = new JAX.Calendar.Month.View(month); 
		this._jax.container.add(viewMonth.getContainer());
		this._viewMonths[index] = viewMonth;
	}
	this._viewMonths[index].show();
};

JAX.Calendar.Year.View.prototype.setNextMonth = function() {
	if (this._activeMonthNumber + 1 > 11) { return; }
	this.setActiveMonth(this._months[this._activeMonthNumber+1]);
};

JAX.Calendar.Year.View.prototype.setPreviousMonth = function() {
	if (this._activeMonthNumber - 1 < 0) { return; }
	this.setActiveMonth(this._months[this._activeMonthNumber-1]);	
};

JAX.Calendar.Year.View.prototype._build = function() {
	this._jax.container = JAX.make("div.jax-cal-year");
};

JAX.Calendar.Button = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Button",
	VERSION:"0.45"
});

JAX.Calendar.Button.prototype.$constructor = function(text) {
	this._text = text;
	this._callback = null;
	this._jax = {};
	this._ec = [];
	this._build();
};

JAX.Calendar.Button.prototype.listenOnClick = function(callback) {
	this._callback = callback;
	this._ec.push(this._jax.container.listen("click", callback));
}

JAX.Calendar.Button.prototype.getContainer = function() {
	return this._jax.container;
};

JAX.Calendar.Button.prototype._build = function() {
	this._jax.container = JAX.make("a.jax-cal-button").html(this._text);
};

