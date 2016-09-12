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
 * Debug an AngularJS app 
 * http://www.bennadel.com/blog/2542-logging-client-side-errors-with-angularjs-and-stacktrace-js.htm
 * 
 * uses:
 *   https://github.com/stacktracejs/stacktrace.js
 *   
 * also to read:
 * http://engineering.talis.com/articles/client-side-error-logging/  
 */

/**
 * "printStackTrace" is a global an injectable
 */
agendaApp.factory('stacktraceService', function() { 	
	return({
		print: printStackTrace
	});
});


/**
 * By default, AngularJS will catch errors and log them to
 * the Console. We want to keep that behavior; however, we
 * want to intercept it so that we can also log the errors
 * to the server for later analysis.
 */
agendaApp.provider("$exceptionHandler",{
	$get: function( errorLogService ) {
		return( errorLogService );
 }
});


/**
 * The error log service is our wrapper around the core error
 * handling ability of AngularJS. Notice that we pass off to
 * the native "$log" method and then handle our additional
 * server-side logging.
 */
agendaApp.factory("errorLogService", function( $log, $window, stacktraceService, Setup) {

	// I log the given error to the remote server.
	function log( exception, cause ) {
		// Pass off the error to the default error handler
		// on the AngualrJS logger. This will output the
		// error to the console (and let the application
		// keep running normally for the user).
		$log.error.apply( $log, arguments );

    $log.log('Debug to:', Setup.get('debugUrl'));
		if (typeof Setup.get('debugUrl') === 'undefined') { return ; }		// check that we want to trace
		// Now, we need to try and log the error the server.
		// --
		// NOTE: In production, I have some debouncing
		// logic here to prevent the same client from
		// logging the same error over and over again! All
		// that would do is add noise to the log.
		try {
			var errorMessage = exception.toString();
			var stackTrace = stacktraceService.print({ e: exception });

			// Log the JavaScript error to the server.
			// --
			// NOTE: In this demo, the POST URL doesn't
			// exists and will simply return a 404.
			$.ajax({
				type: "POST",
				url: Setup.get('debugUrl'), //  'http://www.miessagenda.localhost/api/index.php/debug/client',
				contentType: "application/json",
				crossDomain: true,
				data: angular.toJson({
//					appId : Setup.get('appId'),
//					deviceId : Setup.get('deviceId'),
					sessionId : Setup.get('deviceGuid'),
					userId : Setup.get('userId'),
					errorUrl: $window.location.href,
					errorMessage: errorMessage,
					stackTrace: stackTrace,
					cause: ( cause || "" )
				})
			});
		} catch ( loggingError ) {
			// For Developers - log the log-failure.
			$log.warn( "Error logging failed" );
			$log.log( loggingError );
		}
		$log.log('Setup.get()', Setup.get());
	}
	// Return the logging function.
	return( log ); 
});


/**
 * Application Logging Service to give us a way of logging 
 * error / debug statements from the client to the server.
 */
agendaApp.factory('Logging', ['$log','$window', 'Setup',function($log, $window, Setup)
{
	var connection = {
		logging : function(typeId) {
//			if (Setup.get('debugUrl') === 0) { return ; }				// check that we want to trace
//			if (Setup.get('debugLevel') > typeId ) { return ; }	// lower levels are stored
			// Now, we need to try and log the error the server.
			// --
			// NOTE: In production, I have some debouncing
			// logic here to prevent the same client from
			// logging the same error over and over again! All
			// that would do is add noise to the log.
			try {
				// exists and will simply return a 404.
				var msg = ((arguments.length > 1) && arguments[1].length > 0 && typeof arguments[1][0] === 'string') ? arguments[1][0] : '';
				var state = arguments.length > 1 ? arguments[1] : [];
				if (msg !== '') {
					delete state[0];
				}
				$.ajax({
					type: "POST",
					url: Setup.get('debugUrl'), //  'http://www.miessagenda.localhost/api/index.php/debug/client',
					contentType: "application/json",
					crossDomain: true,
					data: angular.toJson({
//						appId : Setup.get('appId'),
						typeId : typeId,
						deviceId : Setup.get('deviceId'),
						sessionId : Setup.get('deviceGuid'),
						userId : Setup.get('userId'),
						errorUrl: $window.location.href,
						errorMessage: msg,
						state: state
					})
				});
			} catch ( loggingError ) {
				// For Developers - log the log-failure.
				$log.warn( "Error logging failed" );
				$log.log( loggingError );
			}			
		}
	};
		
	
	return({
		error: function(message) {
			// preserve default behaviour
			$log.error.apply($log, arguments);
			connection.logging(1,message);
		},
		warn: function() {
			$log.log(arguments);
			// $log.error.apply($log, arguments);
			connection.logging(2, arguments);			
		},
		info: function(message) {
			$log.error.apply($log, arguments);
			connection.logging(3,message);
		},
		log: function(message) {
			$log.error.apply($log, arguments);
			connection.logging(4,message);
		}
	});
	}]
);