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
 * the registration of the user profile
 */
// http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html
/*
var service = angular.module("apiService", ["ngResource"]);

service.factory("Appointment", function ($resource, Server) {
    return $resource(
        Server.createUrl('api/appointment/:id'),
        {id: "@Id" },
        {
            "update": {method: "PUT"},
//            "reviews": {'method': 'GET', 'params': {'reviews_only': "true"}, isArray: true}
       }
    );
});

// end
var profileModel = angular.module('Profile', ['ngResource']);

profileModel.factory('Profile', ['$resource',
	function($resource) {
		
	}
]);
	
agendaApp.factory('Profilex', function() {
	var username = '';
	var password = '';
});
*/


agendaApp.factory('Activity', function($http, Server, $rootScope, $log) 
{
	
	var resetState = function()	{
		$rootScope.isWaiting = true;
		$rootScope.errorMessage = false;
		$rootScope.infoMessage = false;				
	};
	/**
	 * local function to scan for changes in the duration
	 * 	 
	 */
	function durationWatch($scope)
	{
		$scope.$watch(
			'model.start_time',
			function(newValue, oldValue) {
				if (newValue === oldValue) return;
				var dEnd = moment($scope.model.start_date+' '+newValue).add('seconds', $scope.model.duration);					
				if (dEnd.isValid()) {
					$scope.model.end_time = dEnd.format('HH:mm');
					$scope.model.end_date = dEnd.format('YYYY-MM-DD');
				}	
			}
		);			
		$scope.$watch(
			'model.start_date',
			function(newValue, oldValue) {
				if (newValue === oldValue) return;
				var dEnd = moment($scope.model.start_date+' '+ $scope.model.start_time).add('seconds', $scope.model.duration);					
				if (dEnd.isValid()) {
					$scope.model.end_time = dEnd.format('HH:mm');
					$scope.model.end_date = dEnd.format('YYYY-MM-DD');
				}	
			}
		);			
		$scope.$watch(
			'model.end_time',
			function(newValue, oldValue) {
				if (newValue === oldValue) return;
				var dEnd		= moment($scope.model.end_date + ' ' + newValue);
				var dBegin	= moment($scope.model.start_date   + ' ' + $scope.model.start_time);
				if (dEnd.isValid() && dBegin.isValid() && dEnd > dBegin) {
					// console.log('duration changed to: ' + (dEnd - dBegin) / 1000);
					$scope.model.duration = (dEnd - dBegin) / 1000;
				} 
			}	
		);
		var dEnd		= moment($scope.model.end_date + ' ' + $scope.model.end_time);
		var dBegin	= moment($scope.model.start_date   + ' ' + $scope.model.start_time);
		if (dEnd.isValid() && dBegin.isValid() && dEnd > dBegin) {
			// console.log('duration changed to: ' + (dEnd - dBegin) / 1000);
			$scope.model.duration = (dEnd - dBegin) / 1000;
		} 		
	}
	
	return {
		create : function($scope) {
			resetState();
			$scope.model = {
				'type_id' : 1,
				'is_all_day' : 0,	
				'start_date' : $rootScope.activeDate, 
				'start_time' : $rootScope.activeTime,
				'end_date'	 : $rootScope.activeDate,
				'end_time'	 : moment($rootScope.activeDate+' '+$rootScope.activeTime).add('seconds', $rootScope.activeDuration).format('HH:MM'),
				'duration'	 : $rootScope.activeDuration						
			};
			durationWatch($scope);
			$rootScope.isWaiting = false;
		},
		get		 : function($scope, id) {
			resetState();
			$http({
				method: 'GET',
				url : Server.createUrl('activity/get/' + id)
			}).
			success(function(result) {
				if (result.data) {
					$scope.model = result.data;
					durationWatch($scope);
				}
				if (!(result.status && result.status.success)) {
					if (result.status) {	 $scope.status = result.status;
					} else { $scope.status = Server.connectionError(600); }
				}					
				$rootScope.isWaiting = false;
			}).
			error(function(data, status) {
				$scope.status = Server.connectionError(status);
				$rootScope.isWaiting = false;
			});
		},	
		
		update : function($scope, nextUrl) {
			resetState();
			console.log('Activity.update');
			$http({
				method: 'POST',
				url : Server.createUrl('activity/update/' + $scope.model.id),
				data : $.param($scope.model),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
			}).
			success(function(result) {
				if (result.status && result.status.success) { // open the next url
					Server.open(nextUrl);
				} else if (result.status) {
					$scope.status = result.status;
				} else {
					$scope.status = Server.connectionError(600);
				}
				$rootScope.isWaiting = false;
			}).
			error(function(result, status) {
				$scope.status = Server.connectionError(status);
				$rootScope.isWaiting = false;
			});
		},
	};	
});

