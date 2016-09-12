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
 * Model for message processing
 * 
 * version 1.0
 */
agendaApp.factory('Message',function($log, $rootScope, $http, Server) {


	var getOnVar = function(context, id, varname) {
		$rootScope.resetState();
		$http({
			method	: 'GET',
			url			: Server.createUrl('message/get/' + id)
		}).success(function(response) {
			$rootScope.isWaiting = false;
			if (response.status && response.status.success) {
				context[varname] = response.data;		// the first of the array
			} else {
				$log.warn('Message.get', response);
				context[varname].errors = response.status.errors;
				$rootScope.errorMessage = (response.status.message) ? response.status.message : 'Onbekende fout';					
			}
		}).error(function(response) {
      $rootScope.isWaiting = false;
			$log.error('Message.get', response);
			$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');				
		});			
	};
		
	var updateOnVar = function(context, url, varName, sendMessage) {
    $rootScope.resetState();
		$log.info('Message.update');
		var tmp = context[varName]; // the dates must be returns ad time stamp
		var d = $.param(tmp);
		$http({
			method: 'POST',
			url : Server.createUrl('message/update/' + context[varName].id,'send='+sendMessage),
			data : d,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		}).
		success(function(response) {
			$rootScope.isWaiting = false;			
			if (response.status && response.status.success) { // open the next url
				if (context) {	// we want results
					context[varName] = response.data;
					if (url !== '') {
						Server.open(url);
					}	
				}	
			} else if (response.status) {
				context[varName].errors = response.status.errors;
				$log.warn('Message not valid:', context[varName]);
				$rootScope.errorMessage = response.status.message;
			}
      $rootScope.checkMessages();
		}).
		error(function(response, status) {
			$log.error('Message.update',response);
			context[varName].status = Server.connectionError(status);
      $rootScope.isWaiting = false;
		});		
	};		
	
	var quickSaveOnVar = function(context, varName, index, listName) {
    $rootScope.resetState();
		$log.info('Message.quickSave');
		var d = $.param(context[varName]);
		$http({
			method: 'POST',
			url : Server.createUrl('message/update/' + context[varName].id),
			data : d,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		})
    .success(function(response) {
      $rootScope.isWaiting = false;
      if (response.status && response.status.success) {
        if (index >= 0) {
          context[listName][index] = response.data; // update if there is an id
        }
        $rootScope.isWaiting = false;
      } else {
        $log.error('Message.quickSave',response);
      }
		})
    .error(function(response) {
      $rootScope.isWaiting = false;
			$log.error('Message.quickSave',response);
		});		
	};
	
	var listOnVar = function(context, params, varname) {
    $rootScope.resetState();
		$log.log('Message.list, filter:',params);
		
		$http({
			method: 'POST',
			url : Server.createUrl('message/filter'),
			data : $.param(params),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		})
		.success(function(response) {
			$rootScope.isWaiting = false;			
			if (response.status && response.status.success) {
				context[varname] = response.data;
			} else {
				$log.warn('Message.list warning:', response);
				context[varname].errors = response.status.error;
				$rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
			}
			$rootScope.isWaiting = false;
		}).error(function(response) {
      $rootScope.isWaiting = false;
			$log.warn('Message.list error:', response);
			$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
		});
	};	
	
	var changeStatus = function(context, status, varName)	{
    $rootScope.resetState();
		$log.info('Message.changeStatus');
		$http({
			method: 'POST',
			url : Server.createUrl('message/status/' + context[varName].id,'status='+status)
		}).
		success(function(response) {
			$rootScope.isWaiting = false;			
			if (response.status && response.status.success) { // open the next url
				context[varName] = response.data;
			} else if (response.status) {
				context[varName].errors = response.status.errors;
				$log.warn('Message status not valid:', context[varName]);
				$rootScope.errorMessage = response.status.message;
			}
      $rootScope.checkMessages();
		}).
		error(function(response, status) {
      $rootScope.isWaiting = false;
			$log.error('Message.status',response);
			context[varName].status = Server.connectionError(status);
		});		
	};
	
	var changeRead = function(context, status, id, varName)	{
    $rootScope.resetState();
		$log.info('Message.changeRead');
		$http({
			method: 'POST',
			url : Server.createUrl('message/read/' + id,'status='+status)
		}).
		success(function(response) {
			$rootScope.isWaiting = false;			
			if (response.status && response.status.success) { // open the next url
				context[varName] = response.data;
			} else if (response.status) {
				context[varName].errors = response.status.errors;
				$log.warn('Message status not valid:', context[varName]);
				$rootScope.errorMessage = response.status.message;
			}
      $rootScope.checkMessages();
		}).
		error(function(response, status) {
      $rootScope.isWaiting = false;
			$log.error('Message.status',response);
			context[varName].status = Server.connectionError(status);
		});		
	};
	
	var changeInvitationStatus = function(scope, recipientId, state, message, model) {
    $rootScope.resetState();
		var d = $.param({
			state : state,
			message : message,
			shareId : $rootScope.user.shareId
		});

		$http({
			method: 'POST',
			url : Server.createUrl('message/changeInvitationStatus/' + recipientId),
			data : d,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
		})
		.success(function(result) {
      if (result.status && result.status.success) { // open the next url
        scope[model] =  result.data;
      } else if (result.status) {
        scope[model].errors = result.status.errors;
        $log.warn('Message not valid:', scope[model]);
        $rootScope.errorMessage = result.status.message;
      }
      $rootScope.isWaiting = false;
		})		
		.error(function(response) {
			$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
      $rootScope.isWaiting = false;
		});
	};
	
	var removeMsg = function(context, id) {
    $rootScope.resetState();
		$log.info('Message.remove');
		$http({
			method: 'POST',
			url : Server.createUrl('message/delete/' + id)
		}).
		success(function() {
      if (typeof context.refresh != 'undefined') {
        context.refresh();
      }
      $rootScope.isWaiting = false;
		}).
		error(function(response, status) {
      $rootScope.isWaiting = false;
			$log.error('Message.status',response);
			context[varName].status = Server.connectionError(status);
		});		
	};
	
	return {
		/**
		 *  store the information of the request agenda in scope.model
		 *  can be read by $watch
		 *  
		 */		
		get : function(scope, id, model) {
			model = typeof model !== 'undefined' ? model : 'model';
			getOnVar(scope, id, model);
		},
		list : function(context, params, model) {
			model = typeof model !== 'undefined' ? model : 'list';
			params = typeof params !== 'undefined' ? params : {content:'', p : 0};
			listOnVar(context, params, model);
		},
		update : function(context, url, model) {
			context = typeof context !== 'undefined' ? context : false;
			model = typeof model !== 'undefined' ? model : 'model';
			url = typeof url !== 'undefined' ? url : '';
			updateOnVar(context, url, model,0)
		},
		quickSave : function(context, varName, index, listName) {
			quickSaveOnVar(context, varName, index, typeof listName === 'undefined' ? 'list': listName);
		},
		send : function(context, url, model) {
			model = typeof model !== 'undefined' ? model : 'model';
			url = typeof url !== 'undefined' ? url : '';
			updateOnVar(context, url, model, 1)
		},
		status: function(context, status, model){
			model = typeof model !== 'undefined' ? model : 'model';
			changeStatus(context,status, model);
		},
		markRead: function(context, status, id){			
			var model = typeof model !== 'undefined' ? model : 'model';
			id = typeof id !== 'undefined' ? id : context[model].id;
			changeRead(context,status, id, model);
		},
		remove: function(context, id) {
			removeMsg(context, id);
		},
		
		accept: function(scope, recipientId, message, model) {
			message = typeof message !== 'undefined' ? message : '';			
			model = typeof model !== 'undefined' ? model : 'model';			
			changeInvitationStatus(scope,recipientId, 1, message,model);
		},
		deny: function(scope, recipientId, message, model) {
			message = typeof message !== 'undefined' ? message : '';			
			model = typeof model !== 'undefined' ? model : 'model';			
			changeInvitationStatus(scope,recipientId, -1, message, model);
		}
	}
});

