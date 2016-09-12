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

/**
 * Helping the user on his way
 * 
 * @param {type} $scope
 */

agendaApp.controller('InfoController', ['$scope', 'Information', function($scope, Information) {
	$scope.model = {};
	$scope.list = [];
	$scope.activeIndex = 0;
	$scope.menu = {
		active: 'info'		
	};	
	$scope.formState = 'none';	// none|view
	
	$scope.$watch('isLoaded', function(newValue) {
		if (newValue) {
			Information.list($scope);
		}
	});
	
	$scope.$watch('list', function(newValue) {
		if (newValue.length > 0) {
			$scope.model = $scope.list[$scope.activeIndex];
			$scope.formState = 'view';
		}
	});
	$scope.item = $scope.list[$scope.active]; 
	
	$scope.show = function(index) {
		$scope.activeIndex = index;
		$scope.model = $scope.list[$scope.activeIndex];
	};
}]);

