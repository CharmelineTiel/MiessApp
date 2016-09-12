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
 * The help system
 * 
 * should load the information from the server
 * 
 */
agendaApp.factory('Information',function() {
	var items = [
    {id : 1,
      caption: 'Wat doet het',
      file: 'infoWatDoetHet.html'
    },
    {id : 2,
      caption: 'Voordelen',
      file: 'infoVoordelen.html'
    },
    {id : 3,
      caption: 'Functies',
      file: 'infoFuncties.html'
    },
    {id : 4,
      caption: 'Uitnodigen',
      file: 'infoUitnodigen.html'
    },
    {id : 5,
      caption: 'Berichten',
      file: 'infoBerichten.html'
    },
    {id : 6,
      caption: 'Betekenis iconen',
      file: 'infoBetekenisIconen.html'
    },
    {
     id: 7,
     caption: 'Veel gestelde vragen',
     file : 'infoVeelGesteldeVragen.html'
    },
    {id : 8,
      caption: 'Privacy statement',
      file: 'infoPrivacy.html'
    },
    {id : 9,
      caption: 'Disclaimer',
      file: 'infoDisclaimer.html'
    },
    {id : 10,
      caption: 'Algemene voorwaarden',
      file: 'infoVoorwaarden.html'
    }
  ];
	return {
		list : function(scope, model) {
			model = typeof model === 'undefined' ? 'list' : model;
			scope[model] = items;
		}
	};
});

