
var http			= require('http');
var crypto			= require('crypto');
var dateFormat 		= require('dateformat');
var xmldom			= require('xmldom');
var xpath			= require('xpath');

server;
application;

var awsController = (function() {

	var searchISBN = function(isbn, callback) {

		var awsConfig = application.config.aws;
		var now 				= new Date();
        var timestamp           = dateFormat(now, "isoDateTime") + 'Z';

        var awsRESTQueryString  = 'http://webservices.amazon.com/onca/xml';
        var awsParameters       = {
            AWSAccessKeyId      : awsConfig.accessKeyId,
            IdType              : 'ISBN',
            ItemId              : isbn,
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
		  		callback(dataContent);
		  	});
		  
		}).on('error', function(e) {
			callback(null, e);
		});

	};


	var run = function(response, request, params) {

		if(request.method == 'GET') {

			if(request.path.query.isbn) {
				searchISBN(request.path.query.isbn, function(xmlDataContent, e) {
					if(xmlDataContent != null) {
		
						var doc = new xmldom.DOMParser().parseFromString(xmlDataContent);

						var items = xpath.select("//Item", doc);
						var book = {};
						if(items.length > 0) {
							for(var i = 0; i < items.length; i++) {
								var item = items[i];
	                            
	                            book = {
	                                isbn    : xpath.select('//ItemAttributes/ISBN/text()', item).toString(),
	                                image   : xpath.select('//LargeImage/URL/text()', item).toString(),
	                                title   : xpath.select('//ItemAttributes/Title/text()', item).toString(),
	                                author  : xpath.select('//ItemAttributes/Author/text()', item).toString(),
	                                edition : xpath.select('//ItemAttributes/Edition/text()', item).toString(),
	                                awsData : undefined
	                            };
							}
			
						}

						server.quickrJSON(response, 200, book);
						
					} else {
						server.quickr(response, 202, "> Got error: ".red + e.message);
					}
				});
			}
		}

	};

	return {
		run: run,
		searchISBN: searchISBN
	};

})();

// Export controller (to direct use)
exports = awsController;