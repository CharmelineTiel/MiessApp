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


agendaApp.factory('Activity',function($log, $rootScope, $http, Server) {

	var updateOnVar = function(context, url, varName) {
			$rootScope.resetState();
			var tmp = context[varName];
			var d = $.param(tmp);
			
			$http({
				method: 'POST',
				url : Server.createUrl('activity/update/' + context[varName].id),
				data : d,
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
			}).
			success(function(result) {
				if (result.status && result.status.success) { // open the next url
					context[varName] = result.data;
					Server.open(url);
				} else if (result.status) {
					context[varName].errors = result.status.errors;
					$log.warn('Activity not valid:', context[varName]);
					$rootScope.errorMessage = result.status.message;
				}
				$rootScope.isWaiting = false;
			}).
			error(function(result, status) {
				context[varName].status = Server.connectionError(status);
				$rootScope.isWaiting = false;
			});		
	};
	
	var createOnVar = function(context, varName, typeId) {
  		$rootScope.resetState();
			context[varName] = {
				typeId		: typeId,
				isAllDay	: 0,	
				startOn   : $rootScope.activeDate(),
				duration	: $rootScope.activeDuration,
        endOn     : moment($rootScope.activeDate()).add('seconds',$rootScope.activeDuration).toDate(),
        inviteIds : '',
        ownerId   : $rootScope.user.shareId,
        invitation: {}
			};
			$rootScope.isWaiting = false;
		};
	
	 var getOnVar = function(context, id, varName) {
     $rootScope.resetState();
			$http({
				method: 'GET',
				url : Server.createUrl('activity/get/' + id)
			}).
			success(function(response) {
				if (response.status && response.status.success) {
					// convert the 2014/10/12 to Date					
					context[varName] = response.data;
          setDefaults(context, varName);
				} else {
					context[varName].errors = response.errors;
					$rootScope.errorMessage = response.status.message;
				}
				$rootScope.isWaiting = false;
			}).
			error(function(response) {
				$log.warn('Activity.get error:', response);
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
				$rootScope.isWaiting = false;
			});
		};
	/**
	 * Delete one activity
	 *  
	 * @param id
	 * @param url
	 * @returns {undefined}
	 */	
	var deleteOnVar = function(id, url) {
    $rootScope.resetState();

		$http({
			method: 'POST',
			url : Server.createUrl('activity/delete/' + id)
		}).
		success(function(result) {
			$rootScope.isWaiting = false;			
			if (result.status && result.status.success) { // open the next url
				Server.open(url);
			} else if (result.status) {
				$rootScope.errorMessage = result.status.message;
			}
		}).
		error(function(result) {
			$rootScope.errorMessage = result.status.message;
			$rootScope.isWaiting = false;
		});
	};

  var setDefaults = function(scope, varName) {
    scope[varName].startOn = moment(scope[varName].startDate +' ' + scope[varName].startTime).toDate();
    scope[varName].endOn = moment(scope[varName].endDate + ' ' + scope[varName].endTime).toDate();
    scope[varName].duration = (scope[varName].endOn - scope[varName].startOn) / 1000;
  };
	
	
	
	return {
		update : function(context, url, model) {
			model = typeof model !== 'undefined' ? model : 'model';			
			updateOnVar(context, url, model);
		},
		create : function(context, model, typeId) {
			model = typeof model !== 'undefined' ? model : 'model';			
			typeId = typeof typeId !== 'undefined' ? typeId : 1;			
			createOnVar(context, model, typeId);
		},
		get : function(context, id,model)	{
			model = typeof model !== 'undefined' ? model : 'model';			
			getOnVar(context, id, 'model');
		},
		del: function(id, url) {
			deleteOnVar(id, url);
		},
		list : function(context, model) {
			model = typeof model !== 'undefined' ? model : 'list';			
			listOnVar(context, model);
		}
	}	
});