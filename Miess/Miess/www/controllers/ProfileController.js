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


agendaApp.controller('ProfileController', ['$scope', 'Profile', 'Setup', '$log', '$rootScope', 'Share', '$timeout',
              function($scope, Profile, Setup, $log, $rootScope, Share, $timeout) {
  $scope.menu = {
    active: 'profile'
  };
  $scope.formState = 'none'; // none|temp|view|edit|save|debug|agenda|invitation|max
  $scope.activeIndex = 0;	// which subMenu is active
  $scope.model = {};
  $scope.showInvitation = false;  // true and the menu show the invitation
  $scope.infoMessage = '';
  $scope.existingProfile = {};
  $scope.switchTo = {};   // when switch agenda's this is set to read the needed information
  $scope.isDebug = 0;
  $scope.dialog = {       // fields used in the dialogs
    email: '',
    password: '',
    passwordRepeat : ''
  };
  $scope.debug = {
    agendaView: localStorage.agendaView
  };


  if ($rootScope.user.is_temp_account === 0) {
    $scope.existingProfile = {
      username: $rootScope.user.email,
      password: $rootScope.user.password
    };
  } else {
    $scope.existingProfile = {};
  }
  $scope.newProfile = {};

  // for updating the existing profile
  $rootScope.$watch('isLoaded', function (newValue) {
    if (newValue) {
      $log.log('loaded on', $rootScope.user);
      Profile.get($scope, $rootScope.user.id);
      $scope.device = Setup.device(); // DeviceInfo;
      $scope.isDebug = Setup.get('debugLevel') > 0;
    }
  });
  $scope.$watch('model', function (newValue) {
    if (newValue.id) {
      if ($scope.formState != 'agenda') {
        $scope.formState = newValue.isTempAccount == 0 ? 'view' : 'temp';
      }
      newValue.invitation = {};
      var acceptCount = 0;
      for (var key in newValue.agendas) {
        if (newValue.agendas.hasOwnProperty(key)) {
          if (newValue.agendas[key].isUnknown == 1) {
            newValue.invitation = newValue.agendas[key];  // get the first one
            $scope.formState = 'invitation';
          }
          if (newValue.agendas[key].isAccepted == 1) {
            acceptCount++;
          }
        }
      }
      if (acceptCount < Number(Setup.get('maxAgenda'))) {
        if ($scope.formState == 'invitation') {
          $scope.showInvitation = true;
        }
      } else if ($scope.formState == 'invitation') {
        $scope.formState = 'max';
      }
      $scope.canAccept = ($scope.formState != 'max');
    }
  });
  $scope.$watch('switchTo', function (newValue) {
    if (newValue.id) {
      // we should update the app so it reflex the new users, shares, etc
      $rootScope.updateAgendas(newValue.agendas);
      $scope.model = newValue;
    }
  });
  $scope.$watch('infoMessage', function (newValue) {
    if (newValue && newValue.length > 0) {
      $scope.showPromise = $timeout(function () {
        $scope.infoMessage = '';
      }, 5000);
    }
  });

    /**
   *
   * @param index index in $scope.subMenu
   */
  $scope.show = function (index) {
    var f = $scope.subMenu[index].func;
    $log.log('call', f);
    $scope.activeIndex = index;
    f();
  };
  $scope.cancel = function () {
    $scope.formState = 'view'; // first reset state
    Profile.get($scope, $rootScope.user.id);
  };
  $scope.edit = function () {
    $scope.formState = 'edit';
  };
  $scope.save = function () {
    $scope.formState = 'save';
    Profile.update($scope);
  };
  $scope.logout = function () {
    Profile.logout(false, $scope);
  };

  $scope.testWait = function () {
    $rootScope.isWaiting = !$rootScope.isWaiting;
  };


  /**
   * login an existing user
   * uses the existingProfile as data store
   */
  $scope.existingUser = function () {
    $log.log('login existing user');
    Profile.login($scope.existingProfile.username, $scope.existingProfile.password, '/agenda', $scope, 'existingProfile');
  };
  $scope.newUser = function () {
    Profile.createNew($scope.newProfile, false, $scope);
  };

  $scope.updateProfile = function () {
    Profile.update($scope, '/profile/settings');
  };


  $scope.activateAgenda = function (shareId) {
    Share.activate(shareId, $scope, 'switchTo');
  };
  $scope.removeAgenda = function(shareId) {
    if (confirm('Wil je deze agenda verwijderen. Dit kan NIET ongedaan gemaakt worden.')) {
      Share.remove(shareId, $scope, 'switchTo');
    }
  };

  $scope.acceptShare = function (shareId) {
    $scope.showInvitation = false;
    Share.accept(shareId, $scope);
    $scope.activeIndex = 1;
    $scope.formState = 'agenda';
  };
  $scope.denyShare = function (shareId) {
    $scope.showInvitation = false;
    Share.deny(shareId, $scope);
    $scope.activeIndex = 1;
    $scope.formState = 'agenda';
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

  $scope.changePassword = function (action) {
    if (action == 'show') {
      $('#changePassword').modal('show');
    } else if (action == 'change') {
      if ($scope.dialog.password != $scope.dialog.passwordRepeat) {
        $scope.infoMessage = 'De wachtwoorden zijn niet gelijk';
      } else if ($scope.dialog.password.length < 4) {
        $scope.infoMessage = 'Het wachtwoord is te kort';
      } else {
        $('#changePassword').modal('hide');
        Profile.changePassword($scope, $scope.dialog.password);
      }
    }

  }

}]);
