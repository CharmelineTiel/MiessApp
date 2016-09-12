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

/*
 * Controller to add menu items to main bar
 */

agendaApp.controller('FormController', ['$scope', 'Server', '$sce', function($scope, Server, $sce)
{
	$scope.urlHome = function()
	{
		Server.open('/agenda');
	}
	
	var leftButtons = [
		"<a href='#' class='btn btn-default'><span class='glyphicon glyphicon-home'></span> Agenda</a>",		
		"<a class='btn btn-default'><span class='glyphicon glyphicon-wrench'></span> Profiel</a>"
	];
	
	$scope.updateProfileButtons =  {
		left: leftButtons,
		right:					[
		"<a href='#/profile' class='btn btn-default'><span class='glyphicon glyphicon-arrow-left'></span> Annuleer</a>",		
		$sce.trustAsHtml("<a ng-click='submit()' class='btn btn-default'><span class='glyphicon glyphicon-save'></span> 4Gereed</a>")
	]
	};
	
	$scope.profileButtons =  {
		left: leftButtons,
		right:					[
		"<a href='#' ng-click='logout()' class='btn btn-default'>uitloggen</a>",				
	]
	};
	
	$scope.activeButtons = function()
	{
		return $scope.formButtons;
	}
	
}]);

