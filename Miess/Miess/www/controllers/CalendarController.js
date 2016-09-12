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
agendaApp.controller('CalendarController', ['$scope', 'Server', '$log', '$rootScope', function($scope, Server, $log, $rootScope) {
//	var date = new Date();
//	var d = date.getDate();
//	var m = date.getMonth();
//	var y = date.getFullYear();
	
	$scope.calendar = {};
	$scope.$watch('isLoaded', function(state) {
		if (state) {
			$scope.eventSources = [{
				url: Server.createUrl('activity/listPeriod')
			}];
			$scope.calendarConfig.eventSources = $scope.eventSources;
			$('#calendar').fullCalendar($scope.calendarConfig);
		}
	});
	
	//$scope.eventClick = function(event){
	//	$log.info('CalenderController.eventClick:',event);
	//	$scope.view(event);
	//};
	var h = $rootScope.screen.height - 105; // ($('nav').height() + $('header').height());
	$log.log('content height:', h);
	
	/* config object */
	$scope.calendarConfig = {
		defaultView: localStorage.agendaView,
		eventClick: $scope.view,
    dayClick: $scope.dayClick,
		loading : $scope.loading,
		contentHeight: h,
		editable: false,
		header:{
			left: '',
			center: ' title ',
			right : ''
		},
		titleFormat:{
		    month: 'MMMM yyyy',                             // September 2009
		    week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}", // Sep 7 - 13 2009
		    day: 'dddd, MMMM d, yyyy'                  // Tuesday, Sep 8, 2009
		},
		columnFormat:{
		    day: false,
		    week: "ddd d"
		},
		axisFormat: 'H',
		timeFormat: {
			agenda: ' H:mm{ - H:mm}',
		   '': 'H(:mm)t' ,
			'': 'H:mm' 
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
		eventSources : [$scope.eventApi]
	};
}]);