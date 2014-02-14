var http			= require('http');
var crypto			= require('crypto');
var dateFormat 		= require('dateformat');

server;
application;

var awsController = (function() {

	var run = function(response, request, params) {

		if(request.method == 'GET') {

			if(request.path.query.isbn) {

				var awsConfig = application.config.aws;
				var now 				= new Date();
		        var timestamp           = dateFormat(now, "isoDateTime") + 'Z';

		        var awsRESTQueryString  = 'http://webservices.amazon.com/onca/xml';
		        var awsParameters       = {
		            AWSAccessKeyId      : awsConfig.accessKeyId,
		            IdType              : 'ISBN',
		            ItemId              : request.path.query.isbn,
		            MerchantId          : 'Amazon',
		            Operation           : 'ItemLookup',
		            RelationshipType    : 'AuthorityTitle',
		            SearchIndex         : 'Books',
		            AssociateTag        : 'isbn',
		            IncludeReviewsSummary: 'true',
		            ResponseGroup       : 'Images,ItemAttributes,EditorialReview',
		            Service             : 'AWSECommerceService',
		            Timestamp           : timestamp
		        };

		        var awsParametersString = '';

		        var parameterKeys = Object.keys(awsParameters).sort();
		        var awsParametersStringArray = [];

		        for(var i = 0, length = parameterKeys.length; i < length, i < length; i++) {
					awsParametersStringArray.push(parameterKeys[i] + '=' + encodeURIComponent(awsParameters[parameterKeys[i] ]));
		    	}

		        awsParametersString 	= awsParametersStringArray.join('&');
		        var queryToSign         = 'GET\nwebservices.amazon.com\n/onca/xml\n' + awsParametersString;
		        var signature           = crypto.createHmac('sha256', awsConfig.secretPassphrase).update(queryToSign).digest('base64');
		        var url                 = awsRESTQueryString + '?' + awsParametersString + '&Signature=' + encodeURIComponent(signature);

				var dataContent = '';
				http.get(url, function(resp) {
					resp.on('data', function(chunk) {
				    	dataContent += chunk;
				  	});

				  	resp.on('end', function() {
						server.quickr(response, 200, dataContent, 'text/xml');
				  	});
				  
				}).on('error', function(e) {
					server.quickr(response, 202, "> Got error: ".red + e.message);
				});
			}
		}

	};

	return {
		run: run
	};

})();

// Export controller (to direct use)
exports = awsController;