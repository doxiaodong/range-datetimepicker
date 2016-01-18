(function($){
  /*
   * param: element <jquery unique dom>
   *
   * param: options <bootstrap-datetimepiker params> do not set defaultDate
   *
   * param: exOptions <range-datetimepicker extra params> {template, defaultDate{start: moment(), end: moment()}}
   */
  
  var rangeDateTimePicker = function(element, options, exOptions) {
    
    this.element = element;
    this.options = options || {};
    this.options.format = this.options.format || 'YYYY/MM/DD';
    this.options.locale = this.options.locale || 'zh-cn';
    this.options.keepOpen = true; // 始终保持日历打开
    this.exOptions = exOptions || {};
    this.exOptions.defaultDate = this.exOptions.defaultDate || {start: moment().subtract(moment.duration(7, 'd')), end: moment()};
    
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
    
    this.updateTime();
    
  };
  
  rangeDateTimePicker.prototype._tempalte = function() {
    
    var element = this.element;
    var exOptions = this.exOptions;
    
    // 驼峰式命名的类不可去掉
    var templateString = '' +
      '<div class="showRange btn btn-outline date-range-label">' +
        '<span class="rangeData1"></span> - <span class="rangeData2"></span>' +
        '<span class="caret"></span>' +
      '</div>' +

      '<div class="datepicker-calendar-menu pickerBody hide">' +
        '<div class="datepicker-calendar">' +

          '<div class="datepicker-head showDate">' +
            '<span>时间范围:</span>' +
            '<input type="text" class="date-input rangeDate1">' +
            '<span class="date-separator">至</span>' +
            '<input type="text" class="date-input rangeDate2">' +
            '<button class="updateTimeButton btn btn-sm btn-ghost btn-default pull-right">应用</button>' +
          '</div>' +

          '<div class="calendars row">' +
            '<div class="calendar col-md-6" style="position: relative;height: 100px;">' +
              '<div class="datetimepickerSelect datetimepickerSelect1"><input type="hidden" class="form-control"></div>' +
            '</div>' +
            '<div class="calendar col-md-6" style="position: relative;height: 100px;">' +
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
      if (!dom.pickerBody.hasClass('hide')) {
        dom.updateTimeButton.trigger('click');
      }
    });
    
    dom.showRange.on('click', function() {
      if (dom.pickerBody.hasClass('hide')) {
        dom.pickerBody.removeClass('hide');
        element.find('.datetimepickerSelect').each(function(index, _element) {
          $(_element).data("DateTimePicker").show();
        });
      } else {
        dom.pickerBody.addClass('hide');
        element.find('.datetimepickerSelect').each(function(index, _element) {
          $(_element).data("DateTimePicker").hide();
        });
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
    dom.showDate.find('input.rangeDate1').on('blur', function() {
      if (moment(this.value, options.format).isValid()) {
        dom.select1.data("DateTimePicker").date(checkTime(moment(this.value, options.format), dom.select1));
      }
    });
    
    function checkTime(date, select) {
      if (date.valueOf() > select.data("DateTimePicker").maxDate().valueOf()) {
        return select.data("DateTimePicker").maxDate();
      } else if (date.valueOf() < select.data("DateTimePicker").minDate().valueOf()) {
        return select.data("DateTimePicker").minDate();
      } else {
        return date;
      }
    }

  };
  
  rangeDateTimePicker.prototype._injectDate = function() {
    this.dom.select1.data("DateTimePicker").date(this.date.start);
    this.dom.select2.data("DateTimePicker").date(this.date.end);
  };
  
  rangeDateTimePicker.prototype.updateTime = function() {
    
    var dom = this.dom;
    var options = this.options;
    
    this.date.start = dom.select1.data("DateTimePicker").date();
    this.date.end = dom.select2.data("DateTimePicker").date();
    
    dom.showRange.find('.rangeData1').html(this.date.start.format(options.format));
    dom.showRange.find('.rangeData2').html(this.date.end.format(options.format));
    
    if (typeof(this.exOptions.update) === 'function') {
      this.exOptions.update(this.date);
    }
    
  };
  
  rangeDateTimePicker.prototype._emit = function() {
    var self = this;
    var element = this.element;
    var date = this.date;
    
    element.on('rangedatetime.update', function(e, _date) {
      date = _date;
      self._injectDate();
    });
  };


  $.fn.rangePicker = function(options, exOptions) {
    new rangeDateTimePicker($(this), options, exOptions);
  };
  
})(jQuery);