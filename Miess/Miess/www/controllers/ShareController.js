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

agendaApp.controller('ShareController', ['$scope', 'Share', '$routeParams', 'Users', 'Profile', 'Setup',
          function($scope, Share, $routeParams, Users, Profile, Setup)
{
	$scope.model = {};
	$scope.menu = {
		active : 'share',
		add : 1
	};
	$scope.activeIndex = 0;			// index in list currently showind
	$scope.list = [];								// list on the left. reacts on id
	$scope.formState = 'none';	// none|add|edit|save|invite|view|clear
	$scope.inEdit = 0;					// 0|1 disables the left menu if editing

	
		$scope.$watch('isLoaded', function(newValue) {
		if (newValue) {
			Share.list($scope);
      $scope.groups = Users.getAllGroups();
		}
	});
	$scope.$watch('list', function(newValue, oldValue) {
		if (oldValue !== newValue) {
			// remove the owner of the agenda
			var index = 0;
      Users.setShares(newValue);
			for (var key in newValue) {
        if (newValue.hasOwnProperty(key)) {
          if (newValue[key].isOwner == 0) {
            $scope.activeIndex = index;
            break;
          }
          index++;
        }
			}
			$scope.inEdit = 0;
			if ($scope.list.length > 1) {
				$scope.model = $scope.list[$scope.activeIndex];
				$scope.formState = 'view';
        if (typeof $routeParams.id > 0) {
          activateOnId($routeParams.id);
        } else {
          $scope.show($scope.activeIndex);
        }
			}	else {
				$scope.formState = 'clear';	// instruction page
			}
		}
	});
	
	var activateOnId = function(id) {
		for (var key in $scope.list) {
      if ($scope.list.hasOwnProperty(key)) {
        if ($scope.list[key].id == id) {
          $scope.activeIndex = key;
          $scope.model = $scope.list[$scope.activeIndex];
          return;
        }
      }
		}
		$scope.activeIndex = 0;
	};
	
	$scope.$watch('model', function(newValue) {
    if (newValue) {
      if ($scope.formState === 'save' || $scope.formState === 'send') {
        //$scope.list[$scope.activeIndex] = newValue;
        Share.list($scope);
        $scope.inEdit = 0;
        $scope.formState = 'view';
        Profile.refresh();
      }
      newValue.groupName = Users.translateGroupName($scope.model.groupId);
      newValue.isWritable = String(newValue.isWritable);
      newValue.isAdmin = String(newValue.isAdmin);
      newValue.isBlocked = String(newValue.isBlocked);
    }
	});	
	
	/**
	 * show the view of the list[index]
	 * @param index
	 */
	$scope.show = function(index) {
//		$log.log('Click on ' + index, $scope.list[index]);
		$scope.formState = 'view';
		$scope.activeIndex = index;
		$scope.model = $scope.list[index];		
	};
	/**
	 * set system in insert model
	 */
	$scope.add= function() {
    if (Setup.get('maxShare') > $scope.list.length) {
      $scope.inEdit = 1;
      Share.create($scope);
      $scope.formState = 'add';
    } else {
      $scope.formState = 'max';
    }
	};
	$scope.edit = function() 	{
		$scope.inEdit = 1;
		$scope.formState = 'edit';
	};
	$scope.save = function()
	{
		$scope.formState = 'save';
    // $log.info('Aan:',$scope.aan, ($scope.aan ? 'is aan': 'is uit'));
	  Share.update($scope,'/share/{id}');
	};
	$scope.send = function() {
		$scope.model.resend=1;
		$scope.formState = 'save';
		Share.update($scope);  // will auto send the message
	};
	$scope.cancel = function() {
		$scope.formState = 'view'; // first reset state
		Share.list($scope);	
	};
	$scope.remove = function (id) {

	    $scope.model = $scope.list[id];
	    Share.remove($scope.model.id);
    }
}]);