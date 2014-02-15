var http			= require('http');

server;

// Load server plugin 'couchdb'
var db = server.plugins('couchdb');

var isbnController = (function() {

	var run = function(response, request, params) {
		console.log('Receive ' + request.method.red + ' method');
		if(request.method == 'GET') {

			var pisbn 	= request.path.query.isbn;
			var pwished = request.path.query.wished;

			if(pisbn) {

				if(pisbn == '*') {
			 		db.getAll(function(err, docs) {
				        if(!err) {
					    	server.quickr(response, 200, JSON.stringify(docs.rows), 'application/json');
						} else {
							console.log('> ISBN ' + pisbn + ' not found'.red, err.message);
							server.quickr(response, 404);
						}
				    });
				} else {
			 		db.get(pisbn, function(err, doc) {
				        if(!err) {
					    	server.quickr(response, 200, JSON.stringify(doc));
						} else {
							server.quickr(response, 409);
							console.log('> ISBN ' + pisbn + ' not found'.red, err.message);
						}
				    });
			 	}

			} else {
				server.quickr(response, 400);
				console.log('> ISBN is required'.red);
			}

		} else if(request.method == 'PUT') {

			var pisbn = request.data.isbn;
			var prev = request.data.rev;
			
			db.get(pisbn, function(err, doc) {

				if(!err) {

					if(request.data.title !== undefined) {
						doc.title = request.data.title;
					}
					if(request.data.author !== undefined) {
						doc.author = request.data.author;
					}
					if(request.data.image !== undefined) {
						doc.image = request.data.image;
					}
					if(request.data.edition !== undefined) {
						doc.edition = request.data.edition;
					}
					if(request.data.wished !== undefined) {
						doc.wished = request.data.wished;
					}

					db.insert(pisbn, doc, function(err, xdoc) {
						if(!err) {
					    	doc._id = xdoc._id;
					    	doc._rev = xdoc._rev;
					    	server.quickrJSON(response, 200, doc);
					    	console.log('> ISBN ' + pisbn.magenta + ' updated'.green);
						} else {
							server.quickrJSON(response, 409, doc);
							console.log('> ISBN ' + pisbn.magenta + ' not updated'.red, err.message);
						}

					});
				} else {
					server.quickr(response, 409);
					console.log('> ISBN ' + pisbn + ' not found'.red, err.message);
				}
			});

			

		} else if(request.method == 'POST') {

			var doc = { 
				isbn: request.data.isbn, 
				title: request.data.title, 
				author: request.data.author, 
				image: request.data.image, 
				edition: request.data.edition,
				wished: request.data.wished || false,
				awsData: request.data.awsData
			};

			db.insert(doc.isbn, doc, function(err, xdoc) {
				if(!err) {
			    	console.log('> ISBN ' + request.data.isbn.magenta + ' created'.green);
			    	doc._id = xdoc._id;
			    	doc._rev = xdoc._rev;
			    	server.quickrJSON(response, 201, doc);
				} else {
					console.log('> ISBN ' + request.data.isbn.magenta + ' not created'.red, err.message);
					server.quickrJSON(response, 409, doc);
				}

			});
		
		} else if(request.method == 'DELETE') {

			var pisbn = request.path.query.isbn;
			var prev = request.path.query.rev;

			db.destroy(pisbn, prev, function(err, doc) {
				if(!err) {
			    	console.log('> ISBN ' + pisbn.magenta + ' destroyed'.green);
			    	server.quickr(response, 200, JSON.stringify(doc));
				} else {
					console.log('> ISBN ' + pisbn.magenta + ' not destroyed'.red, err.message);
					server.quickr(response, 202, JSON.stringify(doc));
				}
			});

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
exports = isbnController;