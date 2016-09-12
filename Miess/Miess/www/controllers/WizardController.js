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
 * WizardController to create a new account for the App
 *
 */

agendaApp.controller('WizardController', ['$scope', '$log', 'Profile', '$rootScope', '$http', 'Server', 'Share', 'Users', '$timeout',
                  function($scope, $log, Profile, $rootScope, $http, Server, Share, Users, $timeout) {
  /**
   * set when a connection to create an profile when wrong
   */

  $scope.state = 'home';
  $scope.profileState = 'none'; // none|error|ok
  $scope.newProfile = {
    username :'',
    email : '',
    password: ''
  };
  $scope.shares = [];
  $scope.refreshCount = 0;

  $scope.dialog = {
    email : ''
   };
  $scope.infoMessage = '';

  $scope.model ={
    name : '',
    password: '',
    email : '',

    name1  : '',
    email1 : '',
    group1 : 1,

    name2 : '',
    email2: '',
    group2: 1,

    name3  : '',
    email3 : '',
    group3 : 1
  } ;

  $scope.$watch('newProfile', function(newValue) {
    if (newValue) {
      if (newValue.errors) {
        $log.log('error from profile');
      }
    }
  });

  $scope.show = function (page) {
    $log.log('goto', page);
    $scope.infoMessage = '';
    $scope.model.errors = [];
    $scope.newProfile.errors = [];
    $rootScope.errorMessage = false;
    $scope.state = page;
  };

  $scope.newUser = function() {
    Profile.connectToShare($scope.newProfile, undefined, $scope);
  };

  $scope.searchAgenda = function() {
    $rootScope.errorMessage = false;
    $scope.newProfile.errors = {};
    if (!$scope.newProfile.email) {
      $scope.newProfile.errors.email = 'Het email adres is verplicht';
    }
    if ($scope.newProfile.password.length < 5) {
      $scope.newProfile.errors.password = 'Het wachtwoord is te kort';
    }
    if (!$scope.newProfile.password) {
      $scope.newProfile.errors.password = 'Het wachtwoord is verplicht';
    }
    if (!$scope.newProfile.username) {
      $scope.newProfile.errors.username = 'De naam is verplicht';
    }

    for (var p in $scope.newProfile.errors) { // check if there is an error
      return;
    }
    $rootScope.isWaiting = 1;
    $http({
      method  : 'POST',
      url     : Server.createUrl('profile/listShares'),
      data : $.param({
        username : $scope.newProfile.username,
        password : $scope.newProfile.password,
        email    : $scope.newProfile.email
      }),
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .success(function(response) {
        if (response.status && response.status.success) {
          $scope.shares = response.data;
          $scope.state = 'shares';
        } else {
          $rootScope.errorMessage = response.status.message;
          $scope.newProfile.error = response.status.errors;
        }
        $rootScope.isWaiting = 0;
      })
      .error(function() {
        $rootScope.isWaiting = 0;
        $rootScope.errorMessage = 'Er was een fout in de communicatie met de server. Probeer het later weer.';
      });

  };

  /**
   * activate the share and restart the application
   * @param shareId integer the id of the share to active
   */
  $scope.activeShare = function(shareId) {
    $rootScope.isWaiting = 1;
    // login to our account
    $http({
      method  : 'GET',
      url     : Server.createUrl('profile/login'),
      params  : {
        username : $scope.newProfile.email,
        password : $scope.newProfile.password,
        name     : $scope.newProfile.username,
        create   : 1
      }
    })
      .success(function(response) {
        if (response.status && response.status.success) {
          $log.info('activating share:', shareId);
          $rootScope.isWaiting = 0;
          Share.accept(shareId, $scope);
        } else {
          $rootScope.isWaiting = 0;
          $rootScope.errorMessage = response.status.message;
        }
      })
      .error(function(){
        $rootScope.isWaiting = 0;
        $rootScope.errorMessage = 'Er was een fout in de communicatie';
      });
  };

  $scope.validateNewAgenda = function() {
    $rootScope.errorMessage = false;
    $rootScope.isWaiting = true;
    $scope.model.errors = [];
    $http({
      method : 'POST',
      url    : Server.createUrl('profile/validate'),
      data	 : $.param($scope.model),
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          $scope.show('wizard-b-2');
        } else {
          $scope.model.errors = response.status.errors;
        }
      })
      .error(function() {
        $rootScope.isWaiting = false;
        $rootScope.errorMessage = 'Er was een fout in de communicatie met de server. Probeer het later weer.';
      });
  };

  $scope.groupName = function(id) {
    return Users.translateGroupName(id);
  };

  $scope.generateAgenda = function() {
    $rootScope.errorMessage = false;
    $rootScope.isWaiting = true;
    $scope.model.errors = [];
    $http({
      method : 'POST',
      url    : Server.createUrl('profile/wizardAdd'),
      data	 : $.param($scope.model),
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .success(function(response) {
        $rootScope.isWaiting = false;
        if (response.status && response.status.success) {
          $rootScope.readUserInfo(response.data);
        } else {
          $scope.show('wizard-b-1');
          $scope.model.errors = response.status.errors;

        }
      })
      .error(function(response) {
        $rootScope.isWaiting = false;
        $scope.show('wizard-b-1');
        $rootScope.errorMessage = 'Er was een fout in de communicatie met de server. Probeer het later weer. (response:' + response + ')';
      });
  };


  /**
   * save the message and sends it
   */
  $scope.requestPassword = function (action) {
    if (action == 'show') {
      $('#requestPassword').modal('show');
    } else if (action == 'send') {
      $('#requestPassword').modal('hide');
      Profile.requestPassword($scope, $scope.dialog.email);
    }
  };

  $rootScope.isWaiting = false;
}]);