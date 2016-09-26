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

agendaApp.controller('AgendaController', ['$scope', 'Server', 'ActivityType', 'Activity', '$log', '$rootScope',
          function($scope, Server, ActivityType, Activity, $log, $rootScope)
{

  $scope.menu = {
    active: 'agenda',
    add: 1,
    activeAgenda: 'day',
    date: ''        /* always the month we are looking at */
  };

  $scope.model = {};						// Activity
  $scope.activitTypes = [];			// the list for creating new actity
  $scope.formState = 'none';	// which parts to show on screen

  $scope.$watch('isLoaded', function (newValue) {
    if (newValue) {
      $scope.activityTypes = ActivityType.list();
      $scope.menuClick(localStorage.agendaView);
      if ($rootScope.isStartup == 1 && $rootScope.hideIntro == 0) {
        $('#introModal').modal('toggle');
        $rootScope.isStartup = 0;
      }
      $log.log('isStartup', $rootScope.isStartup, ' hideIntro',$rootScope.hideIntro);
    }
  });

  $scope.$watch('model.typeText', function (newValue) {
    if (newValue) {
      newValue.typeText = ActivityType.caption(newValue.typeId);
    }
  });


  /**
   * called when calendar is reloaded to set the date in the menu bar
   *
   */
  $scope.loading = function (isLoading, view) {
    if (isLoading) {
      $scope.menu.date = moment(view.start).format('MMMM YYYY');
    }
  };
  /**
   * called when menu item + is clicked
   */
  $scope.create = function () {
    $scope.formState = 'create';
  };
  /**
   * preview the Activity, but the event is only the short version which
   * is used by the agenda. So we must copy the needed fields and
   * request all other fields
   *
   * @param event the short version event for the agenda
   */
  $scope.view = function (event) {
    $rootScope.clickDate = false;  // reset it

    $scope.model = {
      title: event.title,
      description: event.description,
      period: event.period,
      allDay: event.allDay,
      typeId: event.typeId,
      id: event.id,
      //startDate: moment(event.startDate).format('YYYY-MM-DD')
    };
      //		$log.info('send: activityShow on ', $scope.model); 
    if ($scope.model && $scope.model.id > 0) {
        Server.open('/agenda/view/' + $scope.model.id);
    }
    $scope.$apply();		// is a jQuery event so must apply
    Activity.get($scope, event.id);
  };

  /**
   * called when the user click on a day
   */
  $scope.dayClick = function (date) {
    $log.log('Day click', date);
    $rootScope.clickDate = date;
    if ($scope.menu.activeAgenda == 'month') { // does not have a hour portion
      $rootScope.clickDate.setHours(12);
      $log.log('Changed to', $rootScope.clickDate);
    }
    $('#calendar').fullCalendar('gotoDate', date);
    $scope.menuClick('agendaDay');

    //$scope.formState = 'create';    // open the menu

    $scope.$apply();
    //$('#calendar').fullCalendar('changeView', 'agendaDay');
  };


  //$scope.edit = function () {
  //  if ($scope.model && $scope.model.id > 0) {
  //    Server.open('/activity/' + $scope.model.id);
  //  }
  //};

  $scope.goBack = function () {
      window.history.back();
  };

  $scope.menuClick = function (menu) {
    try {
      $scope.formState = 'none';
      $scope.menu.activeAgenda = menu;
      $('#calendar').fullCalendar('changeView', menu);
      localStorage.agendaView = menu;
    } catch (err) {
      alert(err.message);
    }
  };

  /* http://stackoverflow.com/questions/3317940/making-fullcalendar-scroll-to-the-current-time */
  $scope.moveInSight = function () {
//		setTimeout(function(){ // Timeout
    $(".fc-state-highlight").attr("id", "scrollTo"); // Set an ID for the current day..
    //$log.log('scroll', $("#scrollTo").offset().top);
    /* $(".content").scrollTop($("#scrollTo").offset().top); */
    $(".content").animate({
      scrollTop: $("#scrollTo").offset().top // Scroll to this ID
    }, 500);

    //	}, 1);
    // $('#calendar').fullCalendar('today');
  };
  /**
   * move to next day, week, month
   */
  $scope.next = function () {
    $(".content").scrollTop(0);
    $('#calendar').fullCalendar('next');
    $scope.formState = 'none';
  };
  /**
   * move to previous day, week,month
   */
  $scope.previous = function () {
    $(".content").scrollTop($(".fc-last").offset().top);
    $('#calendar').fullCalendar('prev');
    $scope.formState = 'none';
  };
  /**
   * show the add menu
   */
  $scope.add = function () {
      if ($scope.formState == 'create') {
          $scope.formState = 'none';

      } else {
          $("#create").fadeIn();
          $scope.formState = 'create';
      }
  };
  /**
   * move to today
   */
  $scope.today = function () {
    //	$log.log('today');
    $('#calendar').fullCalendar('gotoDate', new Date());
    setTimeout(function () { // Timeout
      $(".fc-state-highlight").attr("id", "scrollTo"); // Set an ID for the current day..
      $(".content").animate({
        scrollTop: $("#scrollTo").offset().top // Scroll to this ID
      }, 500);
    });
  };

  $scope.hideIntro = function () {
    localStorage.hideIntro = 1;
  }
  /*
  $scope.bottom = function() {
    $log.log('call bottom');
    $('nav').css('bottom', '20px');
  }
*/

}]);