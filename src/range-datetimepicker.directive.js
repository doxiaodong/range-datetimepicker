(function(angular, $) {
  angular.module('range.datetimepicker', [])
  .directive('rangeDatetimepicker', function() {
    return {
      restrict: 'AE',
      require: '?ngModel',
      scope: {
        options: '=?',
        exOptions: '=?'
      },
      link: function(scope, element, attr, ngModel) {
        var first = true;
        if (!ngModel) {
          return;
        }
        
        var _trigger = function() {
          $(element).trigger('rangedatetime.update', [angular.copy(ngModel.$viewValue)]);
        };
        
        var _init = function() {
          scope.exOptions = scope.exOptions || {};
          scope.exOptions.defaultDate = angular.copy(ngModel.$viewValue);
          scope.exOptions.update = function(date) {
            if(!first) {
              ngModel.$setViewValue(date);
            }
          };
          $(element).rangePicker(scope.options, scope.exOptions);
          $(element).on('select1Value.invalid', function(e, data) {
            scope.$emit('select1Value.invalid', data);
          })
          .on('select2Value.invalid', function(e, data) {
            scope.$emit('select2Value.invalid', data);
          });
        };
        
        ngModel.$render = function() {
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
})(angular, jQuery);