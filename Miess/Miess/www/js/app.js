'use strict';
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


// Declare app level module which depends on filters, and services
var agendaApp = angular.module('AgendaApp', 
				['ngRoute',
          'ngAnimate',
          'ngTouch',
          'ui.calendar',
          'ngResource',
          'ngSanitize',
          'angular-flash.service',
          'angular-flash.flash-alert-directive',
				  'monospaced.elastic',
          'mgcrea.ngStrap',
          'fsCordova',
          'lrInfiniteScroll'
        ]).
		config(function($provide) { 
			$provide.factory('serverUrl', function() { 
				return 'http://www.miessagenda.localhost/agenda/';
			});			
		})
		// http://stackoverflow.com/questions/20718020/angularjs-ngtouch-300ms-delay
	/*	.run(function() {
			FastClick.attach(document.body);
		})
	*/	;

if (typeof StatusBar !== 'undefined') {
	StatusBar.show();
}
	

agendaApp.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.useXDomain = true;
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}
]);

/**
 * add any variable to every controller
 */
agendaApp.run(function($rootScope, $http, Server, $log, $interval, Setup, Users,$timeout, $templateCache, $location, $route)
{
  /**
   * request a new deviceGuid from the server
   */
  $rootScope.createDeviceGuid = function()
  {
    $http({
      method : 'GET',
      url : Server.createUrl('profile/deviceGuid')
    }).
      success(function(response) {
        if (response.status && response.status.success) {
          localStorage.deviceGuid = response.data.deviceGuid;
          $rootScope.deviceGuid = response.data.deviceGuid;
          $rootScope.showWizard();
          $log.log('new Guid:',$rootScope.deviceGuid);
        } else {
          $log.error('Could not retrieve deviceGuid');
        }
      }).
      error(function(response){
        $log.error('Error in deviceGuid', response);
      })
  };
  /**
   * show the wizard so use can login / active agenda
   */
  $rootScope.showWizard = function() {
    $rootScope.user.password = '';
    window.location = "#/wizard";
    $route.reload();
    //$location.path( "/wizard" );
  };


	$log.info('App startup');

  $rootScope.$on('$viewContentLoaded', function() {
    $templateCache.removeAll();
  });

	$rootScope.activeDuration = 60 * 60;
  $rootScope.keyboardVisible = false; // true on iOS when keyboard is shown
  $rootScope.isLoaded = false;  // set to true when the load process is ready.
																// should watch this to initialize
	$rootScope.newMessages = [];	// messages arriving by pull
	moment.lang('nl');            // set the language
	$rootScope.formatDate = function(date, useFormat) {
		if (typeof useFormat === 'undefined') { useFormat = 'D MMMM YYYY HH:mm'; }
		return moment(date).format(useFormat);
	};
  $rootScope.user = {};
	$rootScope.agenda = {};
	$rootScope.agendas = {};

  $rootScope.screen = {
    height : $('body').height(),
    width :  $('body').width()
  };

  if (!localStorage.agendaView) {
    localStorage.agendaView = 'agendaDay';
  }
  $rootScope.isStartup = 1; // will reset after first show
  $rootScope.isWaiting = true;


  if (!localStorage.deviceGuid) {
    $rootScope.createDeviceGuid();
  } else {
    $rootScope.deviceGuid = localStorage.deviceGuid;
    if (!(localStorage.username && localStorage.password)) {
      $rootScope.showWizard();
    } else {
      $rootScope.user = {
        username : localStorage.username,
        password : localStorage.password
      };
      $http({
        method     : 'GET',
        url : Server.createUrl('profile/restoreSession'),	// can create a new user / open a session
        params : {
			    username : $rootScope.user.username,
			    password : $rootScope.user.password,
          create    : 0
        }
      })
      .success(function(response, status) {
          if (response.status && response.status.success === true) {
            // these can be refreshed by the ProfileController
            $rootScope.readUserInfo(response.data, response.status);
          } else if (response.status && response.status.statuscode == 401) { // deviceGuid not found
//            $rootScope.errorMessage = response.status.message;
            $log.info('DeviceGuid invalid');
            $rootScope.user = {};
            localStorage.username = false;
            localStorage.password = false;
            $rootScope.createDeviceGuid();
            $rootScope.showWizard();
          } else if (response.status && response.status.statuscode == 403) { // access denied
            $rootScope.errorMessage = response.status.message;
            $rootScope.showWizard();
          } else {
            $rootScope.errorMessage = 'Onbekend fout (restore)';
            $rootScope.showWizard();
          }
          $rootScope.isWaiting = false;
      })
      .error(function(response,status) {
          if (status == 401) {
            $log.info('DeviceGuid invalid');
            $rootScope.user = {};
            localStorage.username = false;
            localStorage.password = false;
            $rootScope.createDeviceGuid();
          } else if (status == 403) {
            $rootScope.errorMessage = response.status.message;
          } else {
            $rootScope.errorMessage = 'De communicatie met de server gaf een fout. Probeer het opnieuw';
            $rootScope.isWaiting = false;
          }
          $rootScope.showWizard();
      })
    }
	}


  $rootScope.navTop = function () {
//    $log.log('navTop called',$rootScope.screen.height - 105);
    return ($rootScope.screen.height - 77) + 'px';
  };

  $rootScope.navFix = function() {
    if ($rootScope.screen === 'undefined' || $rootScope.screen.height < 100) {
      $rootScope.screen = {
        height: $(window).height(),
        width: $(window).width()
      };
    }
    $rootScope.resizePromise = $timeout(function() {
      console.log('change position: ', $rootScope.screen.height);
      $('nav').css('top', $rootScope.navTop() );
      $('body').css('min-height', $rootScope.screen.height);
      $('body').css('top', 0);      // iOs is hanging the top down
      $rootScope.keyboardShown = 0;
    },100);
  }

  $rootScope.updateAgendas = function(agendas) {
    // these can be refresh by the AgendaController
    $rootScope.agendas = agendas;
    $rootScope.agenda = $.grep($rootScope.agendas, function(v) {
      return v.isActive==1;
    });
    if ($rootScope.agenda.length == 0) { // none is active
      // use our own
      $rootScope.agenda = $.grep($rootScope.agendas, function(v) {
        return v.isOwner==1;
      });
      // it's an fatal error if there is no agenda
      if ($rootScope.agenda.length==0) {
        $log.error('There is no agenda for this user.');
        $rootScope.agenda = [];
      }
    }
    if ($rootScope.agenda.length == 0) {
      $rootScope.agenda = {};
    } else {
      $rootScope.agenda = $rootScope.agenda[0]; // should be one and only one
    }
    if (typeof  $rootScope.agenda.shares == 'undefined') {
      Users.setShares([]);
    } else {
      Users.setShares($rootScope.agenda.shares);
    }
  };

  $rootScope.activeDate = function() {
    var date = new Date();
    if ($rootScope.clickDate) {
      date = $rootScope.clickDate;
    }
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0);

    return date;
  };

  $rootScope.$watch('isWaiting',function(newValue) {
    $timeout.cancel($rootScope.waitPromise);
    if (newValue) {
      $rootScope.waitPromise = $timeout(function() {
        $rootScope.showWait = 1;
        $rootScope.showWaitPromise = $timeout(function() {
          $rootScope.showWait = 0;
        }, 15000);
      },500);
    } else {
      $rootScope.showWait = 0;
    }
  });

  $rootScope.$watch('keyboardVisible', function(newValue) {
    $timeout.cancel($rootScope.keyboardPromise);
    if (!newValue) {
      $rootScope.keyboardPromise = $timeout(function() {
        console.log('change position: ', $rootScope.screen.height);
        $('nav').css('top', $rootScope.navTop() );
        $('body').css('min-height', $rootScope.screen.height);
        $('body').css('top', 0);      // iOs is hanging the top down
        $rootScope.keyboardShown = 0;
      },1000);
    } else {
      $rootScope.keyboardShown = 1;
    }
  });

  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if (!$rootScope.user.shareId || $rootScope.user.isTempAccount ) {
      // no logged user, we should be going to #login
      if ( next.templateUrl == "views/wizard/index.html" ) {
        // already going to #login, no redirect needed
      } else {
        // not going to #login, we should redirect now
        $location.path( "/wizard" );
      }
    }
  });


  /**
   * open an url in a new browser window.
   * http://stackoverflow.com/questions/17887348/phonegap-open-link-in-browser
   * @param url
   */
  $rootScope.openUrlInBrowser = function(url) {
    window.open(url, '_system');
  }


  /**
	 * translates the server response to our internal used structure
	 * This happens after we know which agenda has to be opened.
   *
   * if data is ommited the system is reset to the basic version
	 */
	$rootScope.readUserInfo = function(data) {
    if (typeof data === 'undefined') {
      localStorage.username = false;
      localStorage.password = false;
      $rootScope.user = {};
      $rootScope.updateAgendas([]);
    } else {
      $rootScope.deviceGuid = data.deviceGuid;
      localStorage.deviceGuid = data.deviceGuid;
      Setup.set('deviceGuid', data.deviceGuid);
      $rootScope.user = {
        id: data.id,
        username: data.username,
        password: data.password,
        isTempAccount: data.isTempAccount,
        email: data.email,
        activeAgendaId: data.activeAgendaId,
        shareId: data.shareId,
        hasInvitations: data.hasInvitations
      };

      Setup.set({
        appId: 'miessagenda',
        deviceGuid: data.deviceGuid,
        userId: data.id,
        pollingUrl: data.pollingUrl,
        pollingInterval: data.pollingInterval,		// in seconds
        activityType: data.activityType,
        debugLevel: data.debugLevel,
//      debugUrl : data.debugUrl,
        maxShare: data.maxShare,
        maxAgenda: data.maxAgenda
      });
      Users.setGroups(data.shareGroups);
      // pathes can only be setup AFTER the global setup
      Setup.setValue('debugUrl', data.debugUrl);

      $rootScope.system = {
        pollingUrl: data.pollingUrl,
        pollingInterval: data.pollingInterval,		// in seconds
        activityType: data.activityType,
        debugUrl: data.debugUrl
      };
      $rootScope.updateAgendas(data.agendas);
    }
		localStorage.username = $rootScope.user.email;
		localStorage.password = $rootScope.user.password;

    $location.path('/');
		// never changed
		$log.info('app.run:',data,', user:', $rootScope.user, ', agenda:', $rootScope.agenda);
    if ($rootScope.isLoaded == false) {
      $rootScope.isLoaded = true;	// active the whole system. Everybody is waiting for thist

      // the polling function
      if ($rootScope.system.pollingUrl && $rootScope.system.pollingInterval > 0) {
        $rootScope.stopPoll();
        $rootScope.checkMessages();
        $rootScope.poll = $interval(function () {
          $rootScope.checkMessages();
/* Low on Fat but not doing what it should
          $http({
            method: 'GET',
            url: $rootScope.system.pollingUrl
          }).success(function (response) {
            if (response.length) {
              processPull(response);
            }
          });
*/
        }, $rootScope.system.pollingInterval * 1000);
      }
    }
	};

  $rootScope.checkMessages = function() {
    //	$log.log('Json:', $rootScope.system.pollingUrl);
    $http({
      method: 'GET',
      url: Server.createUrl('message/unreadCount')
    })
      .success(function(response) {
        if (response.status && response.status.success) {
          $rootScope.unreadCount = response.data.count;
        }
      })
      .error(function() {
        $rootScope.unreadCount = false;
      });
  };

	$rootScope.stopPoll = function() {
		if ($rootScope.poll) {
			$interval.cancel($rootScope.poll);
			$log.log('Stop polling queue');
			$rootScope.poll = undefined;
		}
	};
	
	$rootScope.$on('$destroy', function() {
		$rootScope.stopPoll();
	});
	
	$rootScope.refreshProfile = function() {
		$http({
			method     : 'GET',
			url : Server.createUrl('profile/info')
		}).
		success(function(response) {
			if (response.status && response.status.success === true) {
				$rootScope.readUserInfo(response.data, response.status);
			} else {
				$log.error('$rootScope.refreshProfile', response);				
			}
		});		
	};

	$rootScope.resetState = function()	{
	//	$rootScope.isWaiting = true;
		$rootScope.errorMessage = false;
		$rootScope.infoMessage = false;				
	};

	/** 
	 * @param {type} model
	 * @returns the number of errors
	 */
	$rootScope.errorCount = function(model) {
		if (typeof model.errors === 'undefined') {
			return 0;
		}
		return Object.keys(model.errors).length;
	};


	var userActive = function(info) {
		$log.log('User login:', info);
	};
	var messageNew = function(info) {
		$log.log('message new:', info);		
		$rootScope.unreadCount = info.unreadCount;
		$rootScope.newMessages.unshift(info);
		$log.log('message new:', info, $rootScope.newMessages);		
	};
	var messageRead = function(info) {
		if ($rootScope.user.activeAgendaId == info.agendaId) {	// agenda is active
      $log.info('active agenda got message:',info);
			$rootScope.unreadCount = info.unreadCount;		
		}	else {
			$log.info('agenda ',$rootScope.user.activeAgendaId,' not active:',info);
		}
	};



	var action2function = [
		{key : 'user.active',		func : userActive},
//		{key : 'user.add',			func : userAdd },
		{key : 'message.new',		func : messageNew },
		{key : 'message.read',	func : messageRead }
//		{key : 'event.add',			func : activityAdd },
//		{key : 'event.update',	func : activityUpdate },
//		{key : 'event.delete',	func : activityDelete },
		
	];
	
	var processPull = function(response) {
		var action;
		for (var step in response) {
      if (response.hasOwnProperty(step)) {
        action = response[step].event;			// action: event, timestamp, data = {}
        for (var i in action2function) {
          if (action2function.hasOwnProperty(i)) {
            if (action2function[i].key === action) {
              var f = action2function[i].func;
              var err = '';
              try {
                return f(response[step].data);
              } catch (err) {
                $log.error(err);
              }
              $log.warn('Function ' + f + ' is not defined in app.js', response, err);
              return;
            }
          }
        }
      }
		}
		$log.log('unknown action '+action,response);
	};
	
	/**
	 * called when a new message arrives for this user,
	 * maybe not the right agenda
	 * @param {type} info
	 */
	
		
});



function agendaRouteConfig($routeProvider)
{
	//console.log('route:Config: ' + $routeProvider.path); // why can't it be $log
	$routeProvider
			.when('/', {
				templateUrl : 'views/agenda/index.html'
			})
			.when('/agenda', {
				templateUrl : 'views/agenda/index.html'
			})
        	.when('/agenda/view/:id', {
        		templateUrl: 'views/agenda/view.html'
        	})
			.when('/activity/:id', {
				templateUrl: 'views/activity/index.html'
			})
			.when('/activity/new/:typeId', {
				templateUrl: 'views/activity/index.html'
			})
			.when('/profile',	{													// show the current userProfile
				templateUrl : 'views/profile/index.html'				
			})
			.when('/profile/new', {
				templateUrl : 'views/profile/unknownUser.html'
			})
			.when('/profile/settings', {
				templateUrl : 'views/profile/settings.html'
			})
			.when('/share', {
				templateUrl : 'views/share/index.html'
			})
			.when('/share/:id', {
				templateUrl : 'views/share/index.html'
			})
			.when('/activeShare', {
				templateUrl : 'views/activeShare/index.html'
			})
			.when('/message', {
				templateUrl : 'views/message/index.html'
			})
			.when('/msg/:id', {
				templateUrl : 'views/message/index.html'
			})
			.when('/info', {
				templateUrl : 'views/info/index.html'
			})
			.when('/test', {
				templateUrl : 'views/test/popover.html'
			})
      .when('/wizard' , {
        templateUrl : 'views/wizard/index.html'
      })
			.otherwise( {
				redirectTo	:	'/agenda'
			});				
		
}
agendaApp.config(agendaRouteConfig);


agendaApp.directive('datetime', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).datetimepicker(scope.$eval(attrs.datetime));
        }
    };
});
//http://stackoverflow.com/questions/15449325/how-can-i-preserve-new-lines-in-an-angular-partial
//agendaApp.filter("nl2br", function($filter) {
agendaApp.filter("nl2br", function() {
 return function(data) {
   if (!data) return data;
   return data.replace(/\n\r?/g, '<br />');
 };
});

agendaApp.directive('elastic', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).elastic(scope.$eval(attrs.elastic));
        }
    };
});
//http://stackoverflow.com/questions/14965968/angularjs-browser-autofill-workaround-by-using-a-directive
agendaApp.directive('formAutofillFix', function() {
  return function(scope, elem, attrs) {
    // Fixes Chrome bug: https://groups.google.com/forum/#!topic/angular/6NlucSskQjY
    elem.prop('method', 'POST');

    // Fix autofill issues where Angular doesn't know about autofilled inputs
    if(attrs.ngSubmit) {
      setTimeout(function() {
        elem.unbind('submit').submit(function(e) {
          e.preventDefault();
          elem.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
          scope.$apply(attrs.ngSubmit);
        });
      }, 0);
    }
  };
});
/*
// http://stackoverflow.com/questions/18061757/angular-js-and-html5-date-input-value-how-to-get-firefox-to-show-a-readable-d
agendaApp.directive(
    'dateInput',
    function(dateFilter) {
        return {
            require: 'ngModel',
            template: '<input type="date"></input>',
            replace: true,
            link: function(scope, elm, attrs, ngModelCtrl) {
                ngModelCtrl.$formatters.unshift(function (modelValue) {
                    return dateFilter(modelValue, 'yyyy-MM-dd');
                });

                ngModelCtrl.$parsers.unshift(function(viewValue) {
                    return new Date(viewValue);
                });
            }
        };
});
*/
/**
 * http://www.ng-newsletter.com/posts/angular-on-mobile.html
 */
angular.module('fsCordova', [])
.service('CordovaService', ['$document', '$q',
  function($document, $q) {

    var d = $q.defer(),
        resolved = false;

    this.ready = d.promise;

    document.addEventListener('deviceready', function() {
      resolved = true;
      d.resolve(window.cordova);
    });

    // Check to make sure we didn't miss the 
    // event (just in case)
    setTimeout(function() {
      if (!resolved) {
        if (window.cordova) d.resolve(window.cordova);
      }
    }, 3000);
}]);


