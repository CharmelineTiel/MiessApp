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

agendaApp.factory('Agenda',function($log, $rootScope, $http, Server) {
/*
	var virtualFields = function(agenda)	{
		if (agenda.isTemp)
	}
*/		

	var getOnVar = function(context, id, varname) {
			$rootScope.resetState();
			
			$http({
				method	: 'GET',
				url			: Server.createUrl('agenda/get/' + id)
			}).success(function(response) {
				$rootScope.isWaiting = false;
				if (response.status && response.status.success) {
					context[varname] = response.data;
				} else {
					$log.warn('Agenda.get', response);
					context[varname].errors = response.status.errors;
					$rootScope.errorMessage = (response.status.message) ? response.status.message : 'Onbekende fout';					
				}
			}).error(function(response) {
				$rootScope.isWaiting = false;
				$log.error('Agenda.get', response);
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');				
			});			
		};
		
	var listOnVar = function(context, varname) {
			$rootScope.resetState();
			$http({
				method: 'GET',
				url : Server.createUrl('agenda/list')
			})
			.success(function(response) {
				$rootScope.isWaiting = false;
				if (response.status && response.status.success) {
					context[varname] = response.data;
				} else {
					context[varname].errors = response.status.error;
					$rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
				}
			}).error(function(response) {
				$rootScope.isWaiting = false;
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
			});
	};	

/*
	var activateOnId = function(id, url) {
			$rootScope.resetState();
			
			$http({
				method	: 'GET',
				 url			: Server.createUrl('agenda/activate/' + id)
				url : Server.createUrl('profile/selectAgenda/' + id)
 			}).success(function(response) {
				$rootScope.isWaiting = false;
				if (response.status && response.status.success) {
					$rootScope.readUserInfo(response.data, response.status);
					Server.open(url);
				} else {
					$log.warn('Agenda.activate', response);
					$rootScope.errorMessage = (response.status.message) ? response.status.message : 'Onbekende fout';					
				}				
			}).error(function(response) {
				$rootScope.isWaiting = false;
				$log.error('Agenda.activate', response);
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');				
			});			
		};
		*/

	return {
		/**
		 *  store the information of the request agenda in scope.model
		 *  can be read by $watch
		 *  
		 */		
		get : function(scope, id, varName) {
			varName = typeof varName === 'undefined' ? 'model' : varName;
			getOnVar(scope, id, varName);
		},
		list : function(context, varName) {
			varName = typeof varName === 'undefined' ? 'list' : varName;
			listOnVar(context, varName);
		}
  // 	activate : function(id, url) {
//			activateOnId(id, url);
//		}
	};
});