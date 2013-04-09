JAX.Calendar = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar",
	VERSION:"0.3"
});

JAX.Calendar.prototype.$constructor = function(elm) {
	this._jax = {};
	this._jax.targetElm = elm instanceof JAX.HTMLElm ? elm : new JAX.HTMLElm(elm);
	this._jax.container = JAX.make("div.jax-cal");

	var date = new Date();

	this._current = {};
	this._current.year = new JAX.Calendar.Year(date.getFullYear());
	this._current.month = this._current.year.getMonths()[date.getMonth()];
	this._current.day = this._current.month.getDays()[date.getDate()-1];

	this._activeYearView = new JAX.Calendar.Year.View(this._current.year);
	this._yearViews = {};
	this._yearViews[this._current.year] = this._activeYearView;

	this._shown = false;
};

JAX.Calendar.prototype.show = function() {
	if (this._shown) { return this; }

	var pos = JAK.DOM.getPortBoxPosition(this._jax.targetElm.node());
	var width = this._jax.targetElm.width();
	var height = this._jax.targetElm.height();

	pos.left += width;
	pos.top += height;

	this._activeYearView.setActiveMonth(this._current.month);
	this._jax.container.addNode(this._activeYearView.getContainer());
	this._jax.container.appendTo(document.body).style({top:pos.top+"px", left:pos.left+"px"}).fadeIn();
	this._shown = true;
}

JAX.Calendar.prototype.hide = function() {
	if (!this._shown) { return this; }
	this._jax.container.clear().removeFromDOM();
	this._shown = false;
}

JAX.Calendar.Day = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Day",
	VERSION:"0.3"
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

	var date = new Date(year, month, day);
	this._dayInWeek = date.getDay() - 1;
	if (this._dayInWeek < 0) { this._dayInWeek = 6; } 

	this._dayName = JAX.Calendar.Day.DAY_NAMES[this._dayInWeek];
	this._dayNameShort = JAX.Calendar.Day.DAY_NAMES_SHORT[this._dayInWeek];
};

JAX.Calendar.Day.View = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Day.View",
	VERSION:"0.3"
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
	this._jax.number = JAX.make("span", this._day.getDayNumber()).appendTo(this._jax.container);
};

JAX.Calendar.Month = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Month",
	VERSION:"0.3"
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
	if (this._year.getYearNumber() % 4 == 0 && this._month.getMonthNumber() == 2) { this._countOfDays += 1; }

	for (var i=1; i<=this._countOfDays; i++) {
		this._days.push(new JAX.Calendar.Day(i, this, this._year));
	}
};

JAX.Calendar.Month.View = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Month.View",
	VERSION:"0.3"
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
	this._jax.container.displayOn();
};

JAX.Calendar.Month.View.prototype.hide = function() {
	this._jax.container.displayOff();
};

JAX.Calendar.Month.View.prototype._build = function() {
	var monthTitle = this._month.getMonthName() + " " + this._month.getYear().getYearNumber();
	this._jax.container = JAX.make("div.jax-cal-month");
	this._jax.header = JAX.make("div.jax-cal-month-header").appendTo(this._jax.container);
	this._jax.monthName = JAX.make("span.jax-cal-month-title", monthTitle).appendTo(this._jax.header);

	this._jax.table = JAX.make("table").appendTo(this._jax.container);
	this._jax.content = JAX.make("tbody").appendTo(this._jax.table);
	this._jax.header = JAX.make("tr").appendTo(this._jax.content);
	this._jax.rows = [JAX.make("tr").appendTo(this._jax.content)];

	var dayNames = JAX.Calendar.Day.DAY_NAMES_SHORT;
	for (var i=0, len=dayNames.length; i<len; i++) {
		this._jax.header.addNode(JAX.make("th", dayNames[i]));
	}

	var startCell = this._days[0].getDayInWeek();
	var endCell = startCell + this._days.length - 1;
	var totalCells = Math.ceil(endCell/7)*7;
	var row = 0;
	var j = 0;

	for (var i=0; i<totalCells; i++) {
		if (i && i%7 == 0) {
			this._jax.rows.push(JAX.make("tr").appendTo(this._jax.content));
			row++;
		}

		if (i<startCell || i>endCell) { 
			this._jax.rows[row].addNode(JAX.make("td.disabled")); 
			continue;
		}

		var day = this._days[j++];
		var dayView = new JAX.Calendar.Day.View(day);
		this._jax.rows[row].addNode(dayView.getContainer());
		this._dayViews.push(dayView);
	}
};

JAX.Calendar.Year = JAK.ClassMaker.makeClass({
	NAME:"JAX.Calendar.Year",
	VERSION:"0.3"
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
	VERSION:"0.3"
});

JAX.Calendar.Year.View.prototype.$constructor = function(year) {
	this._year = year;
	this._months = year.getMonths();
	this._viewMonths = [];
	this._jax = {};
	this._activeMonth = null;

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

	for (var i=0, len=this._viewMonths.length; i<len; i++) {
		var viewMonth = this._viewMonths[i];
		viewMonth.hide();
	}
	this._viewMonths[index].show();
};

JAX.Calendar.Year.View.prototype._build = function() {
	this._jax.container = JAX.make("div.jax-cal-year");

	for(var i=0, len=this._months.length; i<len; i++) {
		var month = this._months[i];
		var viewMonth = new JAX.Calendar.Month.View(month);
		this._viewMonths.push(viewMonth);
		this._jax.container.addNode(viewMonth.getContainer());
	}
};

