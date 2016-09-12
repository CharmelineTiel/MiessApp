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

/* iOS
 * There may be times when we need a quick way to reference whether iOS is in play or not.
 * While a primative means, will be helpful for that.
 */
Modernizr.addTest('ipad', function () {
  return !!navigator.userAgent.match(/iPad/i);
});

Modernizr.addTest('iphone', function () {
  return !!navigator.userAgent.match(/iPhone/i);
});

Modernizr.addTest('ipod', function () {
  return !!navigator.userAgent.match(/iPod/i);
});

Modernizr.addTest('appleios', function () {
  return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
});

/**
 * Manipulating the user definition
 * 
 */
agendaApp.factory('Users', function($rootScope, $log) {
    var service = {};
    var groups = [];
    var shares = [];
  var sharesNotOwner = false;
    var agendaOwner = {};
    
    /** 
     * list the shares we can send information to
     * 
     * @returns Shares
     */
    service.list = function(includeOwner) {
        if (typeof includeOwner === 'undefined' || includeOwner) {
            return shares;
        }
    if (sharesNotOwner === false) {
      sharesNotOwner = [];
      for (var key in shares) {
        if (shares.hasOwnProperty(key)) {
          if (shares[key].isOwner) {
            agendaOwner = shares[key];	// there is only one
          } else {
            sharesNotOwner.push(shares[key]);
          }
        }
      }
    }
    return sharesNotOwner;
    };
    service.setGroups = function(g) {
        groups = g;
    };
  service.getAllGroups = function() {
    return groups;
  };

    service.setShares = function(s) {
        $log.log('shares:', s);
    sharesNotOwner = false;
        // shares = $.map(s, function(value, index) {
    shares = $.map(s, function(value) {
            return [value];
        });		
    };
    /**
     * 
     * 
     * list the groups used in the system
     * 
     * return an array of { 
     *		id : [number], 
     *		caption: [string], 
     *		users : [ 
     *			{ id: [number] } 
     *		]
     *	}
     */
    service.groups = function(includeOwner) {
        var usedGroups = [];
        var groupId;
        var l = service.list(true);
        includeOwner = typeof includeOwner === 'undefined';
        for (var key in l) {  // find unique values of the groups
      if (l.hasOwnProperty(key)) {
        groupId = l[key].groupId;
        if (includeOwner || groupId > 0) {
          if (typeof usedGroups[groupId] === 'undefined') {
            usedGroups[groupId] = {
              id: groupId,
              caption: service.translateGroupName(groupId),
              users: [
                {  id: l[key].id }
              ]
            }
          } else {
            usedGroups[groupId].users.push({id: l[key].id});
          }
        }
      }
        }
        $log.log('usedGroup', usedGroups);
        return usedGroups;
    };

    service.owner = function() {
        service.list(false);
        return agendaOwner;
    };

    /**
     * translate the type to the text
     * 
     * @param index
     */
    service.translateGroupName = function(index) {
    if (index == 0) {
      return 'agenda eigenaar';
    }
        for (var key in groups) {
      if (groups.hasOwnProperty(key)) {
        if (groups[key].id == index) {
          return groups[key].caption;
        }
      }
        }
        return 'onbekend ' + index;
    };
    
    /**
     * 
     * @returns array 
     *    result = [
     *			0 : {
     *				id : 0,
     *				name : 'self',
     *				members : [ 
     *					{ id: 2, name: 'Jaap' }
     *				],
     *			1 : {
     *				id : 1,
     *				name: 'family',
     *				members : [
     *					{ id : 3, name: 'Anne'},
     *					{ id : 6, name: 'Frouk' },
     *				]
     *			}
     *    ];      
     */
    service.groupedList = function() 	{
        var users = $rootScope.shares;
        var user, userIndex, found, l;
        var result = [];
        
        for (userIndex in users) {
      if (users.hasOwnProperty(userIndex)) {
        user = users[userIndex];
        found = false;
        // find the user.groupId in result
        for (l = 0; l < result.length; l++) {
          if (result[l].id === user.groupId) {
            found = true;
            break;
          }
        }
        if (!found) {
          l = result.length;
          result.push({
            id: user.groupId,
            name: service.translateGroupName(user.groupId),
            members: []
          });
        }
        result[l].members.push({
          id: user.id,					// the id of the share
          name: user.name
        });
      }
        }
        result.sort(function(a,b) {
            return a.id - b.id;
        });
        $log.log('groupedList',result);
        return result;
    };
    
    return service;
});

agendaApp.factory('ActivityType', function($rootScope) {
    var service = {};
    
    service.list = function() {
        return $rootScope.system.activityType;
    };
    
    service.caption = function(id) {
        if (typeof $rootScope.system !== 'undefined') {
            var list = $rootScope.system.activityType;
            for (var key in list) {
        if (list.hasOwnProperty(key)) {
          if (list[key].id == id) {
            return list[key].caption;
          }
        }
            }			
            return 'Unknown: ' + id;
        } else {
            return 'loading';
        }	
    };
    
    return service;
});

/**
 * CAREFULL: the Setup.device(...) can only be used AFTER initialization
 * 
 */
agendaApp.factory('Setup', function() {
    var system = {};
  var service = {};

    service.device = function(key) {
    var appVersion = '1.00.11';
    var isDevelop = 0;

        if (typeof key === 'undefined') { 
            var device = window.device;
      if (typeof device == 'undefined') {
        device = {
          name:     '(undefined)',
          cordova:  '(undefined)',
          platform: 'web',
          uuid:     '(undefined)',
          version:  '(undefined)',
          model:    '(undefined)'
        };
      }
            return {
        name:			    device.name,
        cordova:	    device.cordova,
        platform:     device.platform,
        uuid:			    device.uuid,
        deviceGuid:   localStorage.deviceGuid,
        version:	    device.model, //https://github.com/NielsLeenheer/WhichBrowser
        develop:      isDevelop,
        appVersion:   appVersion,   // CHANGES ALSO IN config.xml !!!!
        server:       isDevelop ? 'http://www.miessagenda.localhost/api/index.php/': 'http://www.miessagenda.nl/api/index.php/',
        isIos:        device.platform == 'iOS' ? 1 : 0,
        isAndroid:    device.platform == 'Android' ? 1: 0,
        isWeb:        device.platform == 'iOS' || device.platform == 'Android' ? 0 : 1,
        isApp:        device.platform == 'iOS' || device.platform == 'Android' ? 1 : 0,
        hasInputNativeDate:    Modernizr.inputtypes.datetime ? 1 : 0
            };
        }
    var info = service.device();
    if (info.hasOwnProperty(key)) {
      return info[key];
    } else if (system.hasOwnProperty(key)) {
      return system[key];
    } else {
      return 'unknown info: '.key;
    }
    };
    
  return {
            /**
             * Set the entire state object at once
             * @param state
             */
            set : function(state) {
                system = state;
            },
            /**
             * set one key value pair
             */
            setValue : function(key, value) {
                system[key] = value;
                return system[key];
            },
            /**
             * reads a key
             */
      get : function(key) {
                if (typeof key === 'undefined' ) {
                    return system;
                } else {
          if (system.hasOwnProperty(key)) {
            return system[key];
          } else {
            return; // undefined
          }
                }	
            },
            /*
             * read a device key
             */
            device : function(key) {
                return service.device(key);
            },
            /*
             * make the path from relative to server specific
             */
            path: function(relative, params) {
                params = typeof params !== 'undefined' ? params : 0;
                if (params === 0) {
                    return service.device('server') + relative + '?sessionYId='+system.deviceGuid;
                } else {
                    return service.device('server') + relative + '?'+params+'&'+'deviceGuid='+system.deviceGuid;
                }	
            }
  };
});

/**
 * replace by Setup.device
 */
agendaApp.factory('DeviceInfo', function() {
    var service = {};
    
    service.info = {
            name:			typeof window.device == 'undefined' ? 'no device'					: window.device.name,
            cordova:	typeof window.device == 'undefined' ? 'web'								: window.device.cordova,
            platform: typeof window.device == 'undefined' ? 'web'								:window.device.platform,
            uuid:			typeof window.device == 'undefined' ? localStorage.appId	: window.device.uuid,
            version:	typeof window.device == 'undefined' ? '1.0'								: window.device.version,
            model:		typeof window.device == 'undefined' ? navigator.userAgent	:window.device.model //https://github.com/NielsLeenheer/WhichBrowser
    };
     
    
    return service;
});


/**
 * The service to connect to agendaServer
 */
agendaApp.factory('Server', function($location,$rootScope, $log, Setup) {
        var miessUrl = Setup.device('server');// serverUrl; //'http://www.miessagenda.localhost/agenda/index.php/';
        return {
                createUrl: function(action, params) {
                    params = typeof params !== 'undefined' ? params : 0;
                    if (params === 0) {
                        return miessUrl + action + '?device=' + $rootScope.deviceGuid;
                    } else {
                        return miessUrl + action + '?'+params+'&'+'device=' + $rootScope.deviceGuid;
                    }	
                },
                open: function(url) {
                    $log.info('goto: ' + url);
                    $location.path(url);
                },
                connectionError : function(status) {
                    return {
                        success: false,
                        message: 'Onverwachte verbindings fout',
                        statusCode: status
                    }	
                }
        };
});

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');
