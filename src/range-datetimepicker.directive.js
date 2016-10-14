(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD is used - Register as an anonymous module.
    define(['jquery', 'moment', 'angular'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('moment'), require('angular'));
  } else {
    // Neither AMD nor CommonJS used. Use global variables.
    if (typeof jQuery === 'undefined') {
      throw 'range-datetimepicker directive requires jQuery to be loaded first';
    }
    if (typeof moment === 'undefined') {
      throw 'range-datetimepicker directive requires Moment.js to be loaded first';
    }
    if (typeof moment === 'angular') {
      throw 'range-datetimepicker directive requires angular.js to be loaded first';
    }
    factory(jQuery, moment, angular);
  }
} (function ($, moment, angular) {
  angular.module('range.datetimepicker', [])
    .directive('rangeDatetimepicker', function () {
      return {
        restrict: 'AE',
        require: '?ngModel',
        scope: {
          options: '=?',
          exOptions: '=?'
        },
        link: function (scope, element, attr, ngModel) {
          var first = true,
            _render = false;
          if (!ngModel) {
            return;
          }

          var _trigger = function () {
            $(element).trigger('rangedatetime.update', [angular.copy(ngModel.$viewValue)]);
          };

          var _init = function () {
            scope.options = scope.options || {};
            scope.options.maxDate = scope.options.maxDate || moment();
            scope.exOptions = scope.exOptions || {};
            scope.exOptions.defaultDate = angular.copy(ngModel.$viewValue);
            scope.exOptions.update = function (date) {
              if (!first && !_render) {
                ngModel.$setViewValue(date);
              }
              _render = false;
            };
            $(element).rangePicker(scope.options, scope.exOptions);
            $(element).on('select1Value.invalid', function (e, data) {
              scope.$emit('select1Value.invalid', data);
            })
              .on('select2Value.invalid', function (e, data) {
                scope.$emit('select2Value.invalid', data);
              });
          };

          ngModel.$render = function () {
            _render = true;
            if (!ngModel.$viewValue) {
              return;
            }
            if (first) {
              _init();
              first = false;
            } else {
              _trigger();
            }
          };

        }
      };
    });
}));
