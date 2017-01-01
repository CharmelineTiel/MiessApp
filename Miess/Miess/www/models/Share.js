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


agendaApp.factory('Share',function($log, $rootScope, $http, Server) {

	var updateOnVar = function(context, url, varName) {
			$rootScope.resetState();
			
			$log.log('Share.update: ',context[varName]);
			var id = context[varName].id;
			$http({
				method : 'POST',
				url : Server.createUrl('share/update/' + id),
				data : $.param(context[varName]),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  			
			})
			.success(function(response) {
				$rootScope.isWaiting = false;
				if (response.status && response.status.success) {					
					context[varName] = response.data;
					if (url) {
						url = url.replace('{id}', response.data.id);
						Server.open(url);
					} 				
				} else {
					$log.info('Error in Share:',response);
          if (response.status) {
            context[varName].errors = response.status.errors;
            $rootScope.errorMessage = (response.status.message) ? response.status.message : 'Onbekende fout';
          } else {
            $rootScope.errorMessage = 'internal server error';
          }
				}
			})
			.error(function(response) {
				$log.error(response);
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
				$rootScope.isWaiting = false;
			});
		};
	var sendOnVar = function(context, varName)	{
    $rootScope.resetState();

		$log.log('Share.send: ',context[varName]);
		var id = context[varName].id;
		$http({
			method : 'POST',
			url : Server.createUrl('share/send/' + id),
			data : $.param(context[varName]),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  			
		})
		.success(function(response) {
			$rootScope.isWaiting = false;
			if (response.status && response.status.success) {					
				context[varName] = response.data;
				if (url) {
					Server.open(url);
				} 				
			} else {
				$log.info(response);
				context[varName].errors = response.status.errors;
				$rootScope.errorMessage = (response.status.message) ? response.status.message : 'Onbekende fout';
			}
		})
		.error(function(response) {
			$log.error(response);
			$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
			$rootScope.isWaiting = false;
		});
	};
		
		
	var listOnVar = function(context, varName)	{
      $rootScope.resetState();
			$log.log('Share.listUsers');
			$http({
				method: 'GET',
				url : Server.createUrl('share/listUsers')
			})
			.success(function(response) {
				$log.info('Share.list', response);
				if (response.status && response.status.success) {
					context[varName] = response.data;
				} else {
					$log.warn('Share.listUser warning:', response);
					context[varName].errors = response.status.error;
					$rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
				}
				$rootScope.isWaiting = false;
			}).error(function(response) {
				$log.warn('Share.listUser error:', response);
				$rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
				$rootScope.isWaiting = false;				
			});
		};		

  var createOnVar = function(context, varName) {
		context[varName] = {
				id : 0,
				name : '',
				email : '',
				isOwner: 0,
				isWritable : 1,
				isBlocked  : 0,
				isAdmin : 0,
				isAccepted : 0,
				isDenied : 0,
				groupId :1
		};
	};

  var acceptOnVar = function(id, scope,modelName) {
    $rootScope.resetState();
    $http({
      method: 'POST',
      url : Server.createUrl('share/accept/'+id)
    })
    .success(function(response) {
      $rootScope.isWaiting = false;
      if (response.status && response.status.success) {
        scope[modelName] = response.data;
        // returns the new restore information
        $rootScope.readUserInfo(response.data, response.status)
      } else {
        scope[modelName].errors = response.status.error;
        $rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
      }
    }).error(function(response) {
      $rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
      $rootScope.isWaiting = false;
    });
  };
  var denyOnVar = function(id, scope,modelName) {
    $rootScope.resetState();
    $http({
      method: 'POST',
      url : Server.createUrl('share/deny/'+id)
    })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          scope[modelName] = response.data;
        } else {
          scope[modelName].errors = response.status.error;
          $rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
        }
      }).error(function(response) {
        $rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
        $rootScope.isWaiting = false;
      });
  };
  var activateOnVar = function(id, scope,modelName) {
    $rootScope.resetState();
    $http({
      method: 'POST',
      url : Server.createUrl('share/activate/'+id)
    })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          scope[modelName] = response.data;
        } else {
          scope[modelName].errors = response.status.error;
          $rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
        }
      }).error(function(response) {
        $rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
        $rootScope.isWaiting = false;
      });
  };
  var remove = function(id, scope, modelName) {
      $rootScope.resetState();
    $http({
      method: 'POST',
      url : Server.createUrl('share/remove/'+id)
    })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          //scope[modelName] = response.data;
        } else {
          scope[modelName].errors = response.status.error;
          $rootScope.errorMessage = isset(response.status) ? response.status.message : 'Onbekende fout';
        }
      }).error(function(response) {
        $rootScope.errorMessage = 'Fout:' + (isset(response) ? response : 'Onbekende server fout');
        $rootScope.isWaiting = false;
      });
  };


	return {
		
		/**
		 * update / insert the current share
		 */
		update : function(context, url) {
			url = typeof url === 'undefined' ? '' : url;
			updateOnVar(context, url, 'model');
		},
		create : function(context) {
			createOnVar(context, 'model');
		},
		/**
		 * list all active users		 
		 */
		list : function(context) {
			listOnVar(context, 'list');
		},
		send : function(context, varName) {
			varName = typeof varName === 'undefined' ? 'model' : varName;
			sendOnVar(context, varName);
		},
    accept : function(id, scope, modelName) {
      acceptOnVar(id, scope, typeof modelName=='undefined' ? 'model': modelName);
    },
    deny : function(id, scope, modelName) {
      denyOnVar(id, scope, typeof modelName=='undefined' ? 'model' : modelName);
    },
    activate : function(id, scope, modelName) {
      activateOnVar(id, scope, typeof modelName=='undefined' ? 'model' : modelName);
    },
    remove : function(id, scope, modelName) {
      remove(id, scope, typeof modelName=='undefined' ? 'model' : modelName);
    }


  };
});