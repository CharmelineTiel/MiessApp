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

agendaApp.controller('TestController', ['$scope', '$log', function($scope, $log) {
  $scope.selectedDate = new Date();

  $scope.popover = {title: 'Title', content: 'Hello Popover<br />This is a multiline message!'};

  $scope.checkValue = String(1);
  $scope.readCheckValue = function () {
    $log.log('CheckValue', $scope.checkValue);
  }

}]);
