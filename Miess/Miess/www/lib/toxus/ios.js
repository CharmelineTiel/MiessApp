
  /**
   * adjust the input tag so when a keyboard is visible on iOS the
   * $rootScope.keyboardVisible is set to true
   *
   * <header ng-hide="keyboardVisible" > ... </header>
   * will hide the header when on iOS the keyboard is shown
   *
   */
  agendaApp.directive('input', [ 'Setup', function(Setup) {
      return {
        restrict: 'E',
             scope: true,
        //   transclude : false,
        link: function (scope, element, attrs, controller) {

          var p;
          if (true || Setup.device('isApp')) {
            try {
              element.bind('blur', function (e) {
                p = scope.$parent; // have to find the rootScope
                while (p != null && typeof p !== 'undefined' && p.hasOwnProperty('keyboardVisible') == false) {
                  p = p.$parent;
                }
                if (p) {
                  p.keyboardVisible = false;
                  p.$apply();
                }
              });
              element.bind('focus', function (e) {
                p = scope.$parent; // have to find the rootScope
                while (p != null && typeof p !== 'undefined' && p.hasOwnProperty('keyboardVisible') == false) {
                  p = p.$parent;
                }
                if (p) {
                  p.keyboardVisible = true;
                  p.$apply();
                }
              });

            } catch (e) {
            }
          }
        }
      };
    }]);

  agendaApp.directive('textarea', [ 'Setup', function(Setup) {
    return {
      restrict: 'E',
      scope: true,
      //   transclude : false,
      link: function (scope, element, attrs, controller) {

        var p;
        if (Setup.device('isApp')) {
          try {
            element.bind('blur', function (e) {
              p = scope.$parent; // have to find the rootScope
              while (p != null && typeof p !== 'undefined' && p.hasOwnProperty('keyboardVisible') == false) {
                p = p.$parent;
              }
              if (p) {
                p.keyboardVisible = false;
                p.$apply();
              }
            });
            element.bind('focus', function (e) {
              p = scope.$parent; // have to find the rootScope
              while (p != null && typeof p !== 'undefined' && p.hasOwnProperty('keyboardVisible') == false) {
                p = p.$parent;
              }
              if (p) {
                p.keyboardVisible = true;
                p.$apply();
              }
            });

          } catch (e) {
          }
        }
      }
    };
  }]);


