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
 * Profile Model
 * version 2.0
 */

agendaApp.factory('Profile', ['$log', '$rootScope', '$http', 'Server','$location', '$route',
                      function($log, $rootScope, $http, Server,$location, $route)
{
	var getOnVar = function(context, id, varName) {
			$rootScope.resetState();			
			$http({
				method: 'GET',
				url : Server.createUrl('profile/get/' + id)
			}).
			success(function(response) {
				$rootScope.isWaiting = false;
				// $log.log('profile.get returned', response);
				if (response.status && response.status.success) { // open the next url
					context[varName] = response.data;
				} else if (response.status) {
					$rootScope.errorMessage = response.status.message;					
					context[varName].errors = response.status.errors;					
				} else {
					$rootScope.errorMessage = 'Onverwachte fout';
				}
			}).
			error(function() {
				$rootScope.errorMessage = 'Onbekende fout';
				$rootScope.isWaiting = false;				
			});
		};
	
	var createOnVar = function(context, varName) {
			$rootScope.resetState();
			$http({
				method: 'GET',
				url : Server.createUrl('profile/new')
			}).
			success(function(result) {
				$rootScope.isWaiting = false;
				$log.info('Profile new');
				if (result.data) {
					context[varName] = result.data;
				}
				if (!(result.status && result.status.success)) {
					if (result.status) {	 
						context.status = result.status;
					} else { 
						context.status = Server.connectionError(600); 
					}
				}									
			}).
			error(function(data, status) {
				context.status = Server.connectionError(status);
				$rootScope.isWaiting = false;
			});
		};
	var updateOnVar = function(context, url, varName) {
			$rootScope.resetState();
			$http({
				method: 'POST',
				url : Server.createUrl('profile/update/' + context[varName].id),
				data : $.param(context[varName]),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
			}).
			success(function(response) {
				$rootScope.isWaiting = false;
				if (response.status && response.status.success) { // open the next url
					context[varName] = response.data;
					$rootScope.infoMessage = 'De informatie is bewaard';
					Server.open(url);
				} else if (response.status) {
					$rootScope.errorMessage = response.status.message;					
					context[varName].errors = response.status.errors;					
				} else {
					$rootScope.errorMessage = 'Onverwachte fout';
				}				
			}).
			error(function() {
				$rootScope.errorMessage = 'Onverwachte fout';
				$rootScope.isWaiting = false;
			});
	};
	
	return {
		create : function(context) {
			createOnVar(context, 'model');
		},
			
		get	: function(context, id, varName) {
			varName = typeof varName === 'undefined' ? 'model' : varName;
			getOnVar(context, id, varName);
		},
		
		update : function(context, url) {
			updateOnVar(context, url, 'model' );
		},
		
		/**
		 * trys to open an profile by logging in
		 * uses: errorMessage, isWaiting
		 * 
		 */
		login : function(username, password, url, scope, varName) {
			varName = (typeof varName === 'undefined') ? 'model' : varName;
			$rootScope.resetState();
			$log.info('Login existing user', scope[varName]);

			$http({ 
				method	: 'POST',
				url			: Server.createUrl('profile/login'),
				params  : {
									  username : username,
									  password : password
								  },
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}				
			})
			.success(function(response) {
				$rootScope.isWaiting = false;				
				if (response.status && response.status.success) {	// we are in
					$rootScope.readUserInfo(response.data, response.status);
					$log.info('user logged in');
					if (url) {
						Server.open(url);
					} else {
						scope[varName] = response.data;
					}	
				} else if (response.status) {
					scope[varName].errors = response.status.errors;					
					$log.warn('login failed',varName, scope[varName]);
					
					$rootScope.errorMessage = response.status.message
				} else {
					$rootScope.errorMessage = 'Server gaf een fout terug';
				}

			})
			.error(function(response, status) {
				$log.error('status: ' + status);
				if (response.status) {
					$rootScope.errorMessage = response.status.message;
				} else {
					$rootScope.errorMessage = 'Onbekende server fout';
				}
				$rootScope.isWaiting = false;
			});
		},
		
		createNew: function(profile, url, scope)
		{
			$rootScope.resetState();
			$log.info('Profile:', profile);
			$http({
				method : 'POST',
				url    : Server.createUrl('profile/createNew'),
				data	 : $.param(profile),
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
 			})
			.success(function(response) {
				$rootScope.isWaiting = false;
				$log.log('success');
				if (response.status && response.status.success) {	// we are in
					$rootScope.readUserInfo(response.data, response.status);
					if (url) {
						Server.open(url);
					} else if (typeof scope !== undefined) {
						scope.model = response.data;
					}	
				} else if (response.status) {
          $rootScope.errorMessage = response.status.message;
					profile.errors = response.status.errors;
					$log.log(profile.errors);
				} else {
					$rootScope.errorMessage = 'Server gaf een fout terug';
				} 
			})
			.error(function(response) {
				$log.log('error');
				$rootScope.errorMessage = response;
				$rootScope.isWaiting = false;
			});
		},

    /**
     * new user is trying to connect to invitation.
     *
     * @param profile
     * @param url
     * @param scope
     */
    connectToShare: function(profile, url, scope)
    {
      $rootScope.resetState();
      $http({
        method : 'POST',
        url    : Server.createUrl('profile/connectToShare'),
        data	 : $.param(profile),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .success(function(response) {
          $rootScope.isWaiting = false;
          $log.log('success');
          if (response.status && response.status.success) {	// we are in
            $rootScope.readUserInfo(response.data, response.status);
            if (url) {
              Server.open(url);
            } else if (typeof scope !== undefined) {
              scope.model = response.data;
            }
          } else if (response.status) {
            $rootScope.errorMessage = response.status.message;
            profile.errors = response.status.errors;
            $log.log(profile.errors);
          } else {
            $rootScope.errorMessage = 'Server gaf een fout terug';
          }
        })
        .error(function(response) {
          $log.log('error');
          $rootScope.errorMessage = response;
          $rootScope.isWaiting = false;
        });
    },

		/**
		 * tries to open an profile by logging in
		 * uses: errorMessage, isWaiting
		 * 
		 */
		logout : function(url, scope) {
			$rootScope.resetState();
			$log.info('Logoff');

			$http({ 
				method	: 'POST',
				url			: Server.createUrl('profile/logout'),
				// params  : {	device   : localStorage.deviceGuid	},
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}				
			})
			.success(function(response) {
				$rootScope.isWaiting = false;				
				if (response.status && response.status.success) {	// we are out
					$rootScope.readUserInfo(response.data, response.status);
					if (url) {
						Server.open(url);
					} else {
						getOnVar(scope, response.data.id, 'model');
					}
				} else if (response.status) {
          $log.warn('logoff failed');
          $rootScope.errorMessage = response.status.message;
          $rootScope.readUserInfo();
        } else {
          $rootScope.errorMessage = 'Server gaf een fout terug';
          $rootScope.readUserInfo();
        }
        $route.reload();
      })
			.error(function(response, status) {
				$log.error('status: ' + status);
				if (response.status) {
					$rootScope.errorMessage = response.status.message;
				} else {
					$rootScope.errorMessage = 'Onbekende server fout';
				}
				$rootScope.isWaiting = false;
        $rootScope.readUserInfo();
        $route.reload();
			});
		},
    /** reload the information about the app (share, agenda's etc) */
    refresh: function() {
      $rootScope.resetState();
      $http({
        method	: 'POST',
        url			: Server.createUrl('profile/restoreSession'),
        params  : {
          username : $rootScope.user.username,
          password : $rootScope.user.password,
          device   : $rootScope.deviceGuid
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          $rootScope.readUserInfo(response.data, response.status);
        } else {
          $log.warn('Refresj failed');
        }
      })
      .error(function(response, status) {
        $log.error('status: ' + status);
        $rootScope.isWaiting = false;
      });
    },
    requestPassword: function(scope, email) {
      $rootScope.resetState();
      $http({
        method	: 'POST',
        url			: Server.createUrl('profile/requestPassword'),
        params  : {
          email : email
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
        .success(function(response, status) {
          $rootScope.isWaiting = false;
          if (response.status && response.status.success) {
            scope.infoMessage = response.status.message;
          } else {
            if (typeof status == 'undefined') {
              $rootScope.errorMessage = 'De server gaf een onbekend fout terug. Probeer het later opnieuw';
            } else {
              $rootScope.errorMessage = status.message;
            }
          }
        })
        .error(function() {
          $rootScope.errorMessage = 'Er was een communicatie fout met de server.';
          $rootScope.isWaiting = false;
        });
    },
    changePassword: function(scope, password) {
      $rootScope.resetState();
      $http({
        method	: 'POST',
        url			: Server.createUrl('profile/changePassword'),
        params  : {
          password : password
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
        .success(function(response, status) {
          $rootScope.isWaiting = false;
          if (response.status && response.status.success) {
            scope.infoMessage = response.status.message;
          } else {
            $rootScope.errorMessage = status.message;
          }
        })
        .error(function() {
          $rootScope.errorMessage = 'Er was een communicatie probleem met de server.';
          $rootScope.isWaiting = false;
        });

    }

	};	
	
}]);


