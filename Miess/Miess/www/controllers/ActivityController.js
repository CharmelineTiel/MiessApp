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
 * there are two navigation on the page:
 * one to show hide the right column
 * ** show(id)
 *   - triggerd by activityShow: show(id)
 *   if id === false the new state is shown
 * ** open(id)
 *   put the system in edit mode   
 * 
 */
agendaApp.controller('ActivityController', ['$scope', '$routeParams', 'Activity', '$log', 'Users', 'ActivityType', 'Server', '$locale', 'Setup',
                      function($scope, $routeParams, Activity, $log, Users, ActivityType, Server, $locale, Setup) {
  $log.log('local', $locale);
  $scope.model = {};
  $scope.menu = {
    active: 'agenda'
  };
  $scope.formState = 'none';	// edit: [show: edit|view\| invite: [show: edit | edit]
  $scope.hasDateTime = 0;     // use the datetime instead of date and time separate

  $scope.showMessage = 0;  // is the form to add a message visible?
  $scope.recipients = [];

  $scope.changeTypePopup = {
    title: 'Wijzig type afspraak',
    body: '&nbsp;'
  };

  $scope.$watch('isLoaded', function (newValue) {
    if (newValue) {
      if (isset($routeParams.id)) {
        Activity.get($scope, $routeParams.id);
      } else if (isset($routeParams.typeId)) {
        Activity.create($scope, 'model', $routeParams.typeId);
      } else {
        $log.warn('ActitiyController: expecting $routeParams.id or .typeId', $routeParams);
      }

      $scope.hasDateTime = Setup.device('isApp');
      $scope.userList = Users.list(false);
      $scope.groups = Users.groups(false); // [ {id, users : [{id:1},] } ]
      $scope.owner = Users.owner();
//			$scope.shares = Users.groupedList();
      $scope.types = ActivityType.list();
    }
  });

  $scope.$watch('model', function (newValue, oldValue) {
    if (newValue && newValue.typeId) {
      newValue.typeText = ActivityType.caption(newValue.typeId);
      if (typeof oldValue.endOn !== 'undefined' && typeof newValue.startOn !== 'undefined') {
        var h, m,t;
        if (typeof newValue.endOn === 'string') {
          // the time has change It looses it's day part so add it again
          h = parseInt(newValue.endOn.substr(0,2));
          m = parseInt(newValue.endOn.substr(3,2));
          t = moment(newValue.endDate, 'YYYY-MM-DD').add(h,'hours').add(m,'minutes');
          newValue.endOn = t.toDate();
        }
        if (newValue.endOn - oldValue.endOn != 0) {
          // endOn can be string or date. Make sure it a date
          newValue.duration   = (newValue.endOn - newValue.startOn) / 1000;
          newValue.endDate    = moment(newValue.endOn).format('YYYY-MM-DD');
          newValue.endTime    = moment(newValue.endOn).format('HH:mm');
        } else if (typeof newValue.startDate == 'undefined' || newValue.startOn - oldValue.startOn != 0) {
          if (typeof newValue.startOn === 'string') {
            // the time has change It looses it's day part so add it again
            h = parseInt(newValue.startOn.substr(0,2));
            m = parseInt(newValue.startOn.substr(3,2));
            t = moment(newValue.startDate, 'YYYY-MM-DD').add(h,'hours').add(m,'minutes');
            newValue.startOn = t.toDate();
          }
          newValue.startDate  = moment(newValue.startOn).format('YYYY-MM-DD');
          newValue.startTime = moment(newValue.startOn).format('HH:mm');
          newValue.endOn      = moment(newValue.startOn).add('seconds', newValue.duration).toDate();
          newValue.endDate    = moment(newValue.endOn).format('YYYY-MM-DD');
          newValue.endTime    = moment(newValue.endOn).format('HH:mm');
        }
      }
      if ($scope.formState =='none') {
        $scope.formState = newValue.inviteIsSend ? 'edit' : 'invite';
      }
      if (typeof newValue.inviteIds === 'undefined') {
        newValue.inviteIds = ''
      }
      if (typeof newValue.invitation == 'undefined') {
        newValue.invitation = {};
      }
      $scope.recipients = ('' + $scope.model.inviteIds).split(',');
      $scope.model.isPrivate = String($scope.model.isPrivate);
    }
  }, true);	// watch for field changes too

                        /**
   * save the activity
   */
  $scope.update = function () {
    Activity.update($scope, '/agenda');
  };

  /**
   * Add or Removes a user from the model.invite
   *
   * @param  userId the id of the user to add /remove
   */
  
   //$scope.invite = function(userId) {
   //var idx = $scope.model.invite.indexOf(userId);
   //if (idx > -1) {
   //$scope.model.invite.splice(idx,1);
   //} else {
   //$scope.model.invite.push(userId);
   //}
   //$log.log('invitation to', $scope.model.invite);
   //};
   
  /**
   * called when the user clicks on a reciever
   *
   * @param id
   * @returns {undefined}
   */
  $scope.toClick = function (id) {
    var i = $scope.recipients.indexOf(id.toString());
    if (i === -1) {
      $scope.recipients.push(id.toString());
    } else {
      $scope.recipients.splice(i, 1);
    }
    $scope.model.inviteIds = $scope.recipients.join(',');
    $scope.activityForm.$setDirty();
  };
  /**
   * called when the group is clicked
   *
   * @param index the index in the groups array
   */
  $scope.toClickGroup = function (index) {

    var group = $scope.groups[index];
    var i = $scope.recipients.indexOf(group.users[0].id.toString());
    var key;

    if (i === -1) {		// if first person is unchecked check all
      for (key in group.users) {
        if (group.users.hasOwnProperty(key)) {
          var id = group.users[key].id;
          if ($scope.recipients.indexOf(id.toString()) === -1) {
            $scope.recipients.push(id.toString());
          }
        }
      }
    } else {
      for (key in group.users) {
        if (group.users.hasOwnProperty(key)) {
          i = $scope.recipients.indexOf(group.users[key].id.toString());
          if (i !== -1) {
            $scope.recipients.splice(i, 1);
          }
        }
      }
    }
    $scope.model.inviteIds = $scope.recipients.join(',');
    $scope.activityForm.$setDirty();
  };
/**
 * open this activty
 */
  $scope.edit = function () {

      if ($scope.model && $scope.model.id > 0) {
          Server.open('/activity/' + $scope.model.id);
      }
  };
  /**
   * delete this activity
   */
  $scope.del = function () {
          Activity.del($scope.model.id, '/agenda');
  };
  /**
   * restores the agenda not saving the changes
   */
  $scope.cancel = function () {
    Server.open('#/agenda');
  };

  $scope.startOpen = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  /**
   * screen helpers
   */
  /**
   * change the type of an activity by show a pop panel
   */
  $scope.changeType = function (id) {
    $log.info('change type to:', id);
    $scope.model.typeId = id;
  };
  /**
   * returns the generated HTML code for the popover
   */
  $scope.selectIt = function () {
    return  $('#id-type-menu').html(); // 'Oh <b>Yeah</b>';
  };

  $scope.addMessage = function () {
    $scope.showMessage = 1;
  };

  // find the recipient information
  $scope.findRecipient = function (shareId) {
    for (var key in $scope.model.recipients) {
      if ($scope.model.recipients.hasOwnProperty(key)) {
        if ($scope.model.recipients[key].shareId == shareId) {
          return $scope.model.recipients[key];
        }
      }
    }
    return {};
  };

  $scope.copyTitle = function() {
    if (typeof $scope.model.inviteSubject == 'undefined' || $scope.model.inviteSubject.length == 0) {
      $scope.model.inviteSubject = $scope.model.title;
    }
  };
}]);