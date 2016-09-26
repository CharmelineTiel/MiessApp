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

/*
 * Defines which share is currently active
 */
agendaApp.controller('ActiveShareController', ['$scope', '$rootScope', '$log', 'Agenda',
                    function($scope, $rootScope, $log, Agenda) {

	$scope.menu = 'choose';
	$scope.active = 0;
	$scope.list = {};
	$scope.formState = 'none';	// nothing to show
	
	$scope.$watch('isLoaded', function(newValue, oldValue) {
		if (newValue) {
			$rootScope.refreshProfile();
		}
	});
	
	$rootScope.$watch(
		'agendas',		
		function(newValue, oldValue) {	
//			$log.log('Refreshed agenda to', newValue);
			$scope.list = [];
			for (var id in newValue) {
				$scope.list.push(newValue[id]);
			}
			$log.log($scope.list);
			$scope.formState =  $scope.list.length > 1 ? 'view' : 'clear';			
		}	
	);	
	
	$scope.accept = function(index) {
		$scope.model = $scope.list[index];
		Agenda.accept($scope.model.id, '/agenda');
	}
	$scope.deny = function(index) {
		$scope.model = $scope.list[index];
		Agenda.deny($scope.model.id, '/agenda');
	}
	
	$scope.open = function(index) {
		$scope.model = $scope.list[index];
		Agenda.activate($scope.model.id, '/agenda');		
	}
}]);




