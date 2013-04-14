var http			= require('http');

//https://github.com/dscape/nano
var nano		 	= require('nano')('http://' + application.config.couchdb.host + ':' + application.config.couchdb.port);

server;
application;

var db = nano.use('wish_db');

var wishController = (function() {

	var run = function(response, request, params) {

		if(request.method == 'GET') {

			//TODO

		} else if(request.method == 'PUT') {

			//TODO

		} else if(request.method == 'POST') {

			//TODO
		
		} else if(request.method == 'DELETE') {

			//TODO

		} else {

			server.quickr(response, 501);
			console.log('> Request is not implemented'.red);
		}

	};

	return {
		run: run
	};

})();

// Register controller
server.controllers.register('wish', wishController);

// Export controller (to direct use)
exports = wishController;