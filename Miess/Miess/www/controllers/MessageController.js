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
agendaApp.controller('MessageController', ['$scope', '$rootScope', 'Message', '$log', '$timeout', 'Users', 'Server', '$routeParams', 'Share',
              function($scope, $rootScope, Message, $log, $timeout, Users, Server, $routeParams, Share) {
  $scope.menu = {
    active: 'message'
    // add : 1
  };
  $scope.menuCreate = 1;			// show add button and create() will be called
  $scope.model = {};

  $scope.profile = {};
  $scope.invitation = 'none';		 // is set it's an invition. Created in $watch(model)
  // none|save|send|error
  $scope.replyText = {};				 // reply to the user on invitation
  $scope.list = [];
  $scope.query = [];
  $scope.extraMessages = [];   // used for endless scroll

  $scope.formState = 'none';   // none, add, edit, view, clear, send, save
  $scope.activeIndex = 0;
  $scope.userList = [];
  $scope.owner = {};
  $scope.groups = [];

  $scope.searchFilter = {
    word: '',		// the words to look for
    p: 0,		// the page loaded
    busy: 0			// if 1 the query is running
  };

  $scope.$watch('isLoaded', function (newValue) {
    if (newValue) {
      Message.list($scope, $scope.searchFilter, 'query');
      $scope.userList = Users.list(false); // userList();
      $scope.owner = Users.owner();
      $scope.groups = Users.groups(false); // [ {id, users : [{id:1},] } ]

    }
  });

  $scope.$watch('query', function (newValue) {
    if (newValue.items) {
      if ((newValue.items && newValue.items.length > 0) || newValue.searchFilter != '') {
        $scope.list = newValue.items;
        if (typeof $routeParams.id !== 'undefined' && $routeParams.id > 0) {
          Message.get($scope, $routeParams.id);
          $routeParams.id = 0;
        } else {
          if ($scope.activeIndex >= $scope.list.length) {
            $scope.activeIndex = $scope.list.length - 1;
          } else if ($scope.activeIndex < 0) {
            $scope.activeIndex = 0;
          }
          $scope.show($scope.activeIndex);
        }
        $scope.formState = 'view';
      } else {
        $scope.formState = 'clear';
      }
      $rootScope.unreadCount = newValue.definition.unreadCount;
    } else {
      $scope.list = [];
      $scope.activeIndex = -1;
      $scope.formState = 'clear';
    }
  });

  $scope.$watch('extraMessages', function (newValue) {
//		$log.log('extramessages', newValue);
    if (newValue && newValue.items && newValue.items.length > 0) {
      for (var key in newValue.items) {
        if (newValue.items.hasOwnProperty(key)) {
          $scope.list.push(newValue.items[key]);
        }
      }
    }
    $scope.searchFilter.busy = false;
  });
  /**
   * called:
   *  - by the Message model when a item is update
   *  - by the $scope.show when click on a other one
   *  - by clearMessage when a new one is loaded
   *
   * this means the when the formState is save or send the list[x] must be
   * updated to the new valuse
   * send already reload the list because the order changes direct
   *
   */
  $scope.$watch('model', function (newValue) {
    if (newValue) {
      if ($scope.formState == 'send') {
        // $scope.list[requestIndex] = newValue;
        $scope.formState = 'view';
        $scope.activeIndex = 0;
        Message.list($scope, $scope.searchFilter, 'query');
      } else {
        if ($scope.formState == 'save') {
          if ($scope.list[$scope.activeIndex].id == newValue.id) {	// if not changed
            $scope.list[$scope.activeIndex] = newValue;
          }
          $scope.formState = 'view'
        }
      }
      // need the the invitation
      newValue.invitation = {};
      for (var key in newValue.recipients) {
        if (newValue.recipients.hasOwnProperty(key) && newValue.recipients[key].shareId == $rootScope.user.shareId) {
          newValue.invitation = newValue.recipients[key];
          break;
        }
      }
    }
  });

  $scope.messageEdit = function () {
    $scope.formState = 'edit';
  };
  $scope.add = function () {
    clearMessage();
    $scope.formState = 'add';
  };

  /**
   * shows more information about the item in the list
   * select if it's in the view or edit mode
   * @param index the index in list
   */
  $scope.show = function (index) {
    saveToConcepts();
    $log.log('Click on ' + index, $scope.list[index]);
    $scope.activeIndex = index;
    $scope.model = $scope.list[index];
    if ($scope.model.isConcept === 1) {
//			activateEdit();
      $scope.formState = 'edit';
    } else {
        $scope.formState = 'view';

    }

    // marking message as read
    if ($scope.model.isRead === 0 && $scope.model.isConcept === 0) {
      Message.markRead($scope, 1);
      $scope.list[index].isRead = 1;
    }
  };
  /**
   * Shows a new Message
   * @param id the id of the Message
   */
  $scope.showById = function (id) {
    
    Message.get($scope, id);
    $scope.activeIndex = -1; // none
    Message.markRead($scope, 1, id);
  };

  /**
   * save the message and sends it
   */
  $scope.sendMessage = function () {
    if ($scope.model.recipientIds.length == 0) {
      $('#confirmNoRecipients').modal('show');
    } else {
      $scope.formState = 'send';
      Message.send($scope);
    }
  };
  $scope.sendConfirmed = function () {

    $('#confirmNoRecipients').modal('hide');
    $scope.formState = 'send';
    Message.send($scope);
  };

  /**
   * called when the user clicks on a reciever
   *
   * @param  id
   * @returns {undefined}
   */
  $scope.toClick = function (id) {
    var users = typeof $scope.model.recipientIds === 'undefined' ? [] : ('' + $scope.model.recipientIds).split(',');
    var i = users.indexOf(id.toString());
    if (i === -1) {
      users.push(id);
    } else {
      users.splice(i, 1);
    }
    $scope.model.recipientIds = users.join(',');
    $scope.msgForm.$setDirty();
  };
  /**
   * called when the group is clicked
   *
   * @param  index
   */
  $scope.toClickGroup = function (index) {
    var group = $scope.groups[index];
    $log.log('Group:', $scope.model);
    var users = typeof $scope.model.recipientIds === 'undefined' ? [] : ('' + $scope.model.recipientIds).split(',');
    var key, i;
    i = users.indexOf(group.users[0].id.toString());
    if (i === -1) {		// if first person is unchecked check all
      for (key in group.users) {
        if (group.users.hasOwnProperty(key)) {
          var id = group.users[key].id;
          if (group.users.hasOwnProperty(key)) {
            if (users.indexOf('' + id) === -1) {
              users.push(id);
            }
          }
        }
      }
    } else {
      for (key in group.users) {
        if (group.users.hasOwnProperty(key)) {
          i = users.indexOf('' + group.users[key].id);
          if (i !== -1) {
            users.splice(i, 1);
          }
        }
      }
    }
    $scope.model.recipientIds = users.join(',');
    $scope.msgForm.$setDirty();
  };

  $scope.openActivity = function (id) {
    Server.open('/activity/' + id);
  };
  $scope.gotoMessage = function (id) {
    $scope.activeIndex = -1;
    Message.get($scope, id);
  };
  /**
   * changes the status of the active model
   *
   * @param status 1: accept, 0 deny
   */
  $scope.statusClick = function (status) {
    Message.status($scope, status);
  };
  /**
   * set the searchFilter for the list, delayed so on fast typing they are bound
   * together
   *
   */
  $scope.search = function () {
    $timeout.cancel($scope.searchPromise);
    $scope.searchPromise = $timeout(function () {
      $rootScope.newMessages = [];
      //	$scope.list = [];
      Message.list($scope, $scope.searchFilter, 'query');	// will auto read the searchFilter event
    }, 200);
  };
  /**
   * the infinite scroll
   */
  $scope.nextPage = function () {
    if ($scope.searchFilter.busy) {
      return;
    }
    $scope.searchFilter.busy = true;
    $scope.searchFilter.p++;

    Message.list($scope, $scope.searchFilter, 'extraMessages');
  };
  /**
   * create an answer to this message with the same replyers
   *
   */
  $scope.answer = function () {
    var to = ('' + $scope.model.recipientIds).split(',');
    var index = to.indexOf($rootScope.user.shareId);				// myself
    if (index !== -1) {
      to.splice(index, 1);
    }						// remove it
    to.push($scope.model.sender.shareId);
    // now generate a new message on the basis of this
    clearMessage($scope.model.id);
    $scope.model.recipientIds = to.join(',');
    $scope.formState = 'edit';
  };

  $scope.remove = function (id) {
    if (typeof id === 'undefined') {
      id = $scope.model.id;
    }
    Message.remove($scope, id);
  };

  $scope.refresh = function () {
    Message.list($scope, $scope.searchFilter, 'query');
  };

  /**
   * @param id the recipient for who the message is unread
   */
  $scope.unread = function (id) {
    if (typeof id === 'undefined') {
      id = $scope.model.id;
    }
    Message.markRead($scope, 0, id, 'model');
    $scope.list[$scope.activeIndex].isRead = 0;
  };

  $scope.openMessage = function (id) {
    $log.log('open', id);
    Message.get($scope, id);
  };
  /**
   * translate the status code to a readable text
   * @param status
   * @returns string
   */
  $scope.recipientAcceptText = function (status) {
    switch (status) {
      case '0' :
        return 'unknown';
      case '1' :
        return 'accept';
      case '-1' :
        return 'denied';
      default:
        return 'error-' + status;
    }
  };

  /**
   * denies the current invitation and reset the form
   *
   */
  $scope.acceptInvitation = function (recipientId) {
    $scope.formState = 'save';
    Message.accept($scope, recipientId, $scope.replyText.confirmYes);
    $scope.invitation = 'accept';
  };
  $scope.denyInvitation = function (recipientId) {
    $scope.formState = 'save';
    Message.deny($scope, recipientId, $scope.replyText.confirmNo);
    $scope.invitation = 'deny';
  };

  /**
   * accept the share
   * @param shareId the share to accept
   */
  $scope.acceptShare = function (shareId) {
    Share.accept(shareId, $scope);
    $scope.model.share.isAccepted=1;
    // we must refresh this page
  };
  $scope.denyShare = function(shareId) {
    Share.deny(shareId, $scope);
    $scope.model.share.isDenied=1;
  };


	var saveToConcepts = function() {
		if ($scope.formState === 'edit' || $scope.formState === 'add') {
			if ($scope.msgForm.$dirty) {
				Message.quickSave($scope, 'model', $scope.formState === 'add' ? $scope.activeIndex : -1, 'list');
				$scope.msgForm.$setPristine();
			}
		}
	};

	/**
	 * create an empty model and moves it on top of the list
	 * @returns nothing
	 */
	var clearMessage = function(replyId)
	{
		replyId = typeof replyId === 'undefined' ? 0 : replyId;
		
		$scope.activeIndex = 0;
		var model = {
				id : 0,
				subject : replyId==0  ? '' : $scope.model.subject,
				body : '',
				isPrivate : 0,
				isConcept : 1,
				sender : {
					id : $rootScope.user.id, 
					name :$rootScope.user.username
				},
				recipients: [],
				recipientIds : '',
				replyOnMessageId : replyId,
				to : []
		};
		$scope.list.unshift(model);
		$scope.model = $scope.list[$scope.activeIndex];
	};




	
	/* the auto scroll of the message */
	// http://stackoverflow.com/questions/19639842/bootstrap-3-scrollable-div-for-table
	$(function() {  
    var window_height = $(window).height(),
       content_height = window_height - 150;
    $('.scroll-box').height(content_height);
	});

}]);