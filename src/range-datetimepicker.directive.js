(function(angular) {
  angular.module('range.datetimepicker', function() {
    return {
      restrict: 'AE',
      require: '?ngModel',
      scope: {
        options: '=',
        exOptions: '='
      },
      link: function(scope, element, attr, ngModel) {
        if (!ngModel) {
          return;
        }
        
        ngModel.$render = function() {
          if (!ngModel.$viewValue) {
            return;
          }
          
          $(element).trigger('rangedatetime.update', [{date: ngModel.$viewValue}]);
          
        };
        
        
        scope.exOptions = scope.exOptions || {};
        scope.exOptions.update = function(date) {
          ngModel.$setViewValue(date);
        };
        $(element).rangePicker(scope.options, scope.exOptions);
        
      }
    };
  });
})(angular);