var crossp = function() {

	var httpOptions = {
        trustAll: true
    };

    var ready = function(fn) {

    	// Wait for Cordova to load
        $(document).bind('ready deviceready', fn);

    };


	var query = function(method, url, data, callback) {

		if(window.Cordova && window.plugins.HttpRequest.execute) {

			window.plugins.HttpRequest.execute(url, method, data, httpOptions, function(response) {
				callback.call(this, response, 'success');
			}, function(response) {
				callback.call(this, response, 'fail');
			});
        	return;		
		}

 		jQuery.ajax({
            type        : method,
            url         : url,
            data        : data
		}).done(function(data, textStatus, jqXHR) {
			var response = {
				code: jqXHR.status,
				message: textStatus,
				body: jqXHR.responseText
			};
			console.log(response);
			callback.call(this, response, 'success');
		}).fail(function(jqXHR,textStatus) {
			var response = {
				code: jqXHR.status,
				message: textStatus,
				body: jqXHR.responseText
			};
			console.log(response);
			callback.call(this, response, 'fail');	
		});

	};

	return {
		query: query,
		ready: ready
	};


}();