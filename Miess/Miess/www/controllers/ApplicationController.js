/**
 * Copyright 2014, Jaap van der Kreeft, Toxus, www.toxus.nl
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * Using the Services of MiessAgenda does not give you ownership of any intellectual property rights in our Services
 * or the content you access. You may not use content from our Services. These terms do not grant you the right to use any
 * branding or logos used in our Services. Don't remove, obscure, or alter any legal notices displayed in or along with our Services.
 * Intellectual ownership of the Service of MiessAgenda has Miess BV.

 *
 * @author Jaap van der Kreeft (jaap@toxus.nl) at toxus (www.toxus.nl)
 * @copyright Copyright 2013 - 2014, Jaap van der Kreeft, Toxus, www.toxus.nl
 * @version 1.0
 * @license http://www.opensource.org/licenses/mit-license.php The MIT License
 *
 */

agendaApp.controller('ApplicationController', ['$scope', 'Server', '$rootScope', '$log', '$window', '$timeout', '$route',
          function($scope, Server, $rootScope, $log, $window, $timeout, $route) {
  $scope.go = function (url) {
    Server.open(url);
  };


  $scope.logout = function () {
    alert('log off');
  };

  /**
   * checkes if we own this agenda
   *
   * @returns true | false
   */
  $scope.ownAgenda = function () {
    return $rootScope.ownedAgenda.id === $rootScope.user.activeAgenda;
  };

  $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.dateOptions = {
    'year-format': "'yy'",
    'starting-day': 1,
    showButtonBar: false
  };
  $scope.showButtonBar = false;


  angular.element($window).bind('resize', function () {
    $log.log('changed on resize');

    if ($rootScope.keyboardVisible) {
//      $log.log('skip size change because of keyboard visible')
    } else {
      $rootScope.screen = {
        height: $(window).height(),
        width: $(window).width()
      };
      $rootScope.navFix();

    }
  });

  /*
    the rotate does not proper resize / redraws the elements
     so a full redraw is needed
  */
  angular.element($window).bind('orientationchange', function () {
    $route.reload();
  });

}]);