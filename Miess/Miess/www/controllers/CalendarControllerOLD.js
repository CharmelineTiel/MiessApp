/**
 * the control of the agenda 
 * http://www.oodlestechnologies.com/blogs/Fullcalendar-Walk-through-with-AngularJS
 */

function CalendarController($scope, Server, $log) {
	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();
	
	$scope.$watch('isLoaded', function(state) {
		if (state) {
			// we now have a session
			$scope.eventApi = {
				url: Server.createUrl('activity/listPeriod')
			};		
			$scope.eventSources = [$scope.eventApi];
//			$log.log('Agenda reading', $scope.eventSources, $scope.eventApi, $scope.uiConfig);
			//$('.calendar').fullCalendar({eventSources: $scope.eventSources});
			
			$scope.uiConfig.calendar.eventSources = $scope.eventSources;
			$('.calendar').fullCalendar($scope.uiConfig.calendar);
		//	$('.calendar').fullCalendar('refetchEvents');
		}
	});
    
//    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
		
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };
		
		$scope.eventApi = {
			url: Server.createUrl('activity/listPeriod')
		};
	  
    /* event source that contains custom events on the scope */
    $scope.events = [
		];
/*		
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'},
			{id:"1",title:"This is the 30 minute date",start:"1396256401",end: "1396258201", allDay: false}
    ];
*/		

		//with this you can handle the click on the events
    $scope.eventClick = function(event){           
			$log.info('CalenderController.eventClick:',event);
			$scope.view(event);
    };


				
		/* config object */
    $scope.uiConfig = {
      calendar:{
				defaultView: 'month',
				eventClick: $scope.eventClick,
        editable: false,
        header:{
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},			
				axisFormat: 'H',
				timeFormat: {
          agenda: ' H:mm{ - H:mm}'
        },
				allDaySlot: true,
        allDayText: '',
        firstHour: 6,
        slotMinutes: 30,
        defaultEventMinutes: 60,
        dragOpacity: {
           agenda: .5
        },
        minTime: 3,
        maxTime: 24,
        slotEventOverlap: true,
				
				eventSources : [$scope.eventApi],
//				defaultView : 'agendaWeek'

				
      //  eventClick: $scope.alertOnEventClick,
      //  eventDrop: $scope.alertOnDrop,
      //  eventResize: $scope.alertOnResize
      }
    };
		
		$scope.eventSources = [$scope.eventApi]; //,$scope.events,  $scope.eventSource, $scope.eventsF];
}