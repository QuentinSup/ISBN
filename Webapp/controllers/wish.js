var http			= require('http');

server;

// Load server plugin 'couchdb'
var db = server.plugins('couchdb');

var wishController = (function() {

	var run = function(response, request, params) {

		if(request.method == 'GET') {
			var wishList = [];
			db.getAll(function(err, data) {
				for(var i = 0; i < data.rows.length; i++) {
					var doc = data.rows[i].doc;
					if(doc.wished == 'true') {
						wishList.push(doc.title);
					}
				}
				wishList.sort();
				server.quickr(response, 200, wishList.join('<br />'), 'text/html');
			}, { descending: true });


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

// Export controller (to direct use)
exports = wishController;