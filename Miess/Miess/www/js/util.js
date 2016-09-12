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


function isset() {
  //  discuss at: http://phpjs.org/functions/isset/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: FremyCompany
  // improved by: Onno Marsman
  // improved by: Rafał Kukawski
  //   example 1: isset( undefined, true);
  //   returns 1: false
  //   example 2: isset( 'Kevin van Zonneveld' );
  //   returns 2: true

  var a = arguments,
    l = a.length,
    i = 0,
    undef;

  if (l === 0) {
    throw new Error('Empty isset');
  }

  while (i !== l) {
    if (a[i] === undef || a[i] === null) {
      return false;
    }
    i++;
  }
  return true;
}

/**
 * convert a string to a date object
 * 
 * @param string date "2010-08-09 01:02:03";
 * @returns Date
 * http://stackoverflow.com/questions/476105/how-can-i-convert-string-to-datetime-with-format-specification-in-javascript
 */
/*
function stringToDate(dateString)
{
	var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
	var dateArray = reggie.exec(dateString); 
	
	return new Date(
			(+dateArray[1]),
			(+dateArray[2])-1, // Careful, month starts at 0!
			(+dateArray[3]),
			(+dateArray[4]),
			(+dateArray[5]),
			(+dateArray[6])
	);
}
function addMinutes(date, minutes) {
   return new Date(date.getTime() + minutes*60000);
}
*/

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function time2seconds(text)
{
	text = '' + text;
	var a = text.split(':');
	if (a.length === 2) {
		return  a[0] * 3600 + a[1] * 60;
	} else {
		return 0;
	}	
}
/**
 * 
 * @param integer date time stamp of date
 * @param string time hh::mm
 * @param integer duration seconds to add
 * @returns moment
 */
function timeAdd(date, time, duration)
{
	var m = moment(date).hour(0).minute(0).second(0).millisecond(0);	// as timestamp
	var a = time.split(':');
	m.add('hours',a[0]).add('minutes',a[1]).add('seconds',duration);
	return m;
}

// https://gist.github.com/pbroschwitz/3891293
/**
 * 
 * linkTpl = '<a href="{url}" class="{class}">{lable}</a>';
 * links = linkTpl.supplant({
 *   url : 'http://example.com',
 *   class : 'lnk',
 *   lable : 'Link Bezeichnung'
 *   });
  */
String.prototype.supplant = function (o) {
	return this.replace(
		/{([^{}]*)}/g,
		function (a, b) {
			var r = o[b];
			return typeof r === 'string' || typeof r === 'number' ? r : a;
		}
	);
};