(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD is used - Register as an anonymous module.
    define(['jquery', 'moment'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('moment'));
  } else {
    // Neither AMD nor CommonJS used. Use global variables.
    if (typeof jQuery === 'undefined') {
      throw 'range-datetimepicker requires jQuery to be loaded first';
    }
    if (typeof moment === 'undefined') {
      throw 'range-datetimepicker requires Moment.js to be loaded first';
    }
    factory(jQuery, moment);
  }
} (function($, moment) {
  /*
   * param: element <jquery unique dom>
   *
   * param: options <bootstrap-datetimepiker params> do not set defaultDate
   *
   * param: exOptions <range-datetimepicker extra params> {template: string, defaultDate: {start: Date.now(), end: Date.now()}}
   */

  var rangeDateTimePicker = function(element, options, exOptions) {

    this.element = element;
    this.options = options ? $.extend({}, options) : {};
    this.options.format = this.options.format || 'YYYY/MM/DD';
    this.options.locale = this.options.locale || 'zh-cn';
    this.options.keepOpen = true; // 始终保持日历打开
    this.options.inline = true; // 始终inline
    this.exOptions = exOptions ? $.extend({}, exOptions) : {};

    if (this.exOptions.defaultDate) {
      this.exOptions.defaultDate = {
        start: moment(this.exOptions.defaultDate.start),
        end: moment(this.exOptions.defaultDate.end)
      }
    } else {
      this.exOptions.defaultDate = { start: moment().subtract(moment.duration(7, 'd')), end: moment() };
    }

    if (this.options.maxDate) {
      this.options.maxDate = moment(this.options.maxDate)
    }
    if (this.options.minDate) {
      this.options.minDate = moment(this.options.minDate)
    }

    // 存储dom
    this.dom = {};

    // 时间格式
    this.date = this.exOptions.defaultDate;

    this.init();
  };

  rangeDateTimePicker.prototype.init = function() {

    this._tempalte();
    this._dom();

    // 清楚旧的默认时间设置，避免和新的配置冲突
    if (this.options.defaultDate) {
      this.options.defaultDate = undefined;
    }
    this.dom.select1.datetimepicker(this.options);
    this.dom.select2.datetimepicker(this.options);

    this._event();

    this._injectDate();

  };

  rangeDateTimePicker.prototype._tempalte = function() {

    var element = this.element;
    var exOptions = this.exOptions;

    element.addClass('range-datetimepicker-container clearfix');

    // 驼峰式命名的类不可去掉
    var templateString = '' +
      '<div class="showRange">' +
      '<div class="btn btn-outline dateRangeLabel">' +
      '<span class="rangeData1"></span> - <span class="rangeData2"></span>' +
      '<span class="caret"></span>' +
      '</div>' +
      '</div>' +

      '<div class="datepicker-calendar-menu pickerBody datepickerHidden">' +
      '<div class="datepicker-calendar">' +

      '<div class="datepicker-head form-inline showDate">' +
      '<span>时间范围:</span>' +
      '<label><input type="text" class="form-control rangeDate1"></label>' +
      '<span class="date-separator">至</span>' +
      '<label><input type="text" class="form-control rangeDate2"></label>' +
      '<button type="button" class="updateTimeButton btn btn-sm btn-light btn-primary pull-right">应用</button>' +
      '</div>' +

      '<div class="calendars row">' +
      '<div class="calendar col-md-6" style="position: relative;">' +
      '<div class="datetimepickerSelect datetimepickerSelect1"><input type="hidden" class="form-control"></div>' +
      '</div>' +
      '<div class="calendar col-md-6" style="position: relative;">' +
      '<div class="datetimepickerSelect datetimepickerSelect2"><input type="hidden" class="form-control"></div>' +
      '</div>' +
      '</div>' +

      '</div>' +
      '</div>';

    var template = (exOptions && exOptions.template) || templateString;

    element.html(template);
  };

  rangeDateTimePicker.prototype._dom = function() {
    var element = this.element;
    this.dom.pickerBody = element.find('.pickerBody');
    this.dom.select1 = element.find('.datetimepickerSelect1');
    this.dom.select2 = element.find('.datetimepickerSelect2');
    this.dom.showRange = element.find('.showRange');

    this.dom.showDate = element.find('.showDate');

    this.dom.updateTimeButton = element.find('.updateTimeButton');
  };

  rangeDateTimePicker.prototype._event = function() {
    var self = this;
    var element = this.element;
    var dom = this.dom;
    var options = this.options;

    element.on('click', function(e) {
      e.stopPropagation();
    });

    $(document).on('click', function() {
      if (!dom.pickerBody.hasClass('datepickerHidden')) {
        dom.showRange.trigger('click');
      }
    });

    dom.showRange.on('click', function() {
      if (dom.pickerBody.hasClass('datepickerHidden')) {
        dom.pickerBody.removeClass('datepickerHidden');
        // 不知道这里什么鬼，始终使用options.inline === true 不用 $(_element).data("DateTimePicker").show();
        // element.find('.datetimepickerSelect').each(function(index, _element) {
        //   $(_element).data("DateTimePicker").show();
        // });
      } else {
        dom.pickerBody.addClass('datepickerHidden');
        // 不知道这里什么鬼，始终使用options.inline === true 不用 $(_element).data("DateTimePicker").hide();
        // element.find('.datetimepickerSelect').each(function(index, _element) {
        //   $(_element).data("DateTimePicker").hide();
        // });
      }
    });

    dom.updateTimeButton.on('click', function() {
      self.updateTime();

      dom.showRange.trigger('click');
    });

    dom.select1.on("dp.change", function(e) {
      dom.select2.data("DateTimePicker").minDate(e.date);
      dom.showDate.find('input.rangeDate1').val(e.date.format(options.format));
    });

    dom.select2.on("dp.change", function(e) {
      dom.select1.data("DateTimePicker").maxDate(e.date);
      dom.showDate.find('input.rangeDate2').val(e.date.format(options.format));
    });

    this._time();

    this._emit();

  };

  rangeDateTimePicker.prototype._time = function() {
    var dom = this.dom;
    var options = this.options;
    var element = this.element;
    dom.showDate.find('input.rangeDate1').on('blur', function() {
      if (moment(this.value, options.format).isValid()) {
        dom.select1.data("DateTimePicker").date(checkTime(moment(this.value, options.format), dom.select1));
        dom.showDate.find('input.rangeDate1').closest('label').removeClass('has-error');
      } else {
        element.trigger('select1Value.invalid', [{ err: this.value, right: options.format }]);
        console.warn('无效的时间格式：%s，正确时间格式：%s', this.value, moment().format(options.format));
        dom.showDate.find('input.rangeDate1').closest('label').addClass('has-error');
      }
    });

    dom.showDate.find('input.rangeDate2').on('blur', function() {
      if (moment(this.value, options.format).isValid()) {
        dom.select2.data("DateTimePicker").date(checkTime(moment(this.value, options.format), dom.select2));
        dom.showDate.find('input.rangeDate2').closest('label').removeClass('has-error');
      } else {
        element.trigger('select2Value.invalid', [{ err: this.value, right: options.format }]);
        console.warn('无效的时间格式：%s，正确时间格式：%s', this.value, moment().format(options.format));
        dom.showDate.find('input.rangeDate2').closest('label').addClass('has-error');
      }
    });

    function checkTime(date, select) {
      var _max = select.data("DateTimePicker").maxDate();
      var _min = select.data("DateTimePicker").minDate();
      if (_max && date.valueOf() > _max.valueOf()) {
        select.data("DateTimePicker").maxDate(_max.add(moment.duration(20))); // 强制添加20ms以触发 "db.change"
        return select.data("DateTimePicker").maxDate();
      } else if (_min && date.valueOf() < _min.valueOf()) {
        select.data("DateTimePicker").minDate(_min.add(moment.duration(20))); // 强制添加20ms以触发 "db.change"
        return select.data("DateTimePicker").minDate();
      } else {
        return date;
      }
    }

  };

  rangeDateTimePicker.prototype._injectDate = function() {

    select2Max = this.dom.select2.data("DateTimePicker").maxDate();
    select2Min = this.dom.select2.data("DateTimePicker").minDate();
    select1Max = this.dom.select1.data("DateTimePicker").maxDate();
    select1Min = this.dom.select1.data("DateTimePicker").minDate();

    if (select2Max && this.date.end.valueOf() > select2Max.valueOf()) {
      this.dom.select2.data("DateTimePicker").maxDate(this.date.end);
    }
    if (select2Min && this.date.end.valueOf() < select2Min.valueOf()) {
      this.dom.select2.data("DateTimePicker").minDate(this.date.end);
    }
    if (select1Max && this.date.start.valueOf() > select1Max.valueOf()) {
      this.dom.select1.data("DateTimePicker").maxDate(this.date.start);
    }
    if (select1Min && this.date.start.valueOf() < select1Min.valueOf()) {
      this.dom.select1.data("DateTimePicker").minDate(this.date.start);
    }

    this.dom.select1.data("DateTimePicker").date(this.date.start);
    this.dom.select2.data("DateTimePicker").date(this.date.end);

    this.updateTime();
  };

  rangeDateTimePicker.prototype.updateTime = function() {

    var dom = this.dom;
    var options = this.options;

    this.date.start = dom.select1.data("DateTimePicker").date();
    this.date.end = dom.select2.data("DateTimePicker").date();

    dom.showRange.find('.rangeData1').html(this.date.start.format(options.format));
    dom.showRange.find('.rangeData2').html(this.date.end.format(options.format));

    if (typeof (this.exOptions.update) === 'function') {
      this.exOptions.update({
        start: this.date.start.valueOf(),
        end: this.date.end.valueOf()
      });
    }

  };

  rangeDateTimePicker.prototype._emit = function() {
    var self = this;
    var element = this.element;

    element.on('rangedatetime.update', function(e, date) {
      var _date = {
        start: moment(date.start),
        end: moment(date.end)
      }

      if (_date.start.valueOf() > _date.end.valueOf()) {
        _date.start = $.extend(true, {}, _date.end);
      }

      // 最大最小时间限制
      if (self.options.minDate && _date.start.valueOf() < self.options.minDate.valueOf()) {
        console.warn('开始时间小于最小时间');
        return
      }
      if (self.options.maxDate && _date.end.valueOf() > self.options.maxDate.valueOf()) {
        console.warn('结束时间大于最大时间');
        return
      }

      self.date = _date;
      self._injectDate();
    });
  };


  $.fn.rangePicker = function(options, exOptions) {
    new rangeDateTimePicker($(this), options, exOptions);
  };

}));
