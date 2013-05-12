var Books = function() {

	var __serverUri = 'http://192.168.0.13:8080/';
	var _booksItems = ko.observableArray();
    

	var _render = function(booksItems) {
		_booksItems([]);
        $.each(booksItems, function() {
            this.doc.visible = ko.observable(true);
            this.doc.wished = ko.observable(this.doc.wished == 'true');
            _booksItems.push(this.doc);
        });
        _booksItems.sort(function(a, b) {
            return (a.title < b.title)?-1:1;
        });
	}

    var __createdCallBack = function(res) {
        switch(res.code) {
            case 201:   var doc = JSON.parse(res.body);
                        doc.visible = ko.observable(true);
                        doc.wished  = ko.observable(doc.wished == 'true');
                        _booksItems.push(doc);
                        break;
            case 409:   alert('This reference already exists');
                        break;
            default:
                alert('Error: ' + res.message);
        }
    };

    var _search = function(isbn, callback) {
        crossp.query(
            'GET', 
            __serverUri + 'aws/?isbn=' + isbn, 
            {}, 
            function(response, textStatus) 
            {
                // Win
                if(textStatus == 'success')
                {
                    var code       = response.code;
                    var message    = response.message;
                    var body       = response.body;

                    var items = $(body).find('Item');

                    if(items.length > 0) {
                        items.each(function() {
                            var ItemAttributes  = $(this).find('ItemAttributes');
                            var LargeImage      = $(this).find('LargeImage');
                            var book = {
                                isbn    : ItemAttributes.find('ISBN').text(),
                                image   : LargeImage.find('URL').text(),
                                title   : ItemAttributes.find('Title').text(),
                                author  : ItemAttributes.find('Author').text(),
                                edition : ItemAttributes.find('Edition').text(),
                                awsData : undefined
                            };
                            crossp.query(
                                'POST',
                                __serverUri + 'isbn/', 
                                book,
                                function(res, textStatus) {
                                	__createdCallBack(res);
                                	callback(res, textStatus);
                                }
                            );
                            
                        });
                    
                    }
                } else {
                    alert('Research failed: ' + response);
                }
           });
    };

    var _remove = function(book) {
        crossp.query(
            'DELETE',
            __serverUri + 'isbn/?isbn=' + book._id + '&rev=' + book._rev,
            {},
            function(res) {
                if(res.code == 200) {
                    _booksItems.remove(book);
                } else {
                    alert("Can't delete. " + res.message);
                }
            }
        ); 
    };

    var _moveToWishList = function(book, wished) {
        console.log(book.wished(), wished);
        crossp.query(
            'PUT',
            __serverUri + 'isbn/?isbn=' + book._id + '&rev=' + book._rev,
            { wished: wished },
            function(res, textStatus) {
                if(res.code == 200) {
                    book.wished(wished == 'true');
                } else {
                    alert("Can't move to wish list. " + res.message);
                }
            }
        ); 
    };

	var _getAll = function(callback) {
		_get('*', callback);
	};

    var _get = function(isbn, callback) {

		crossp.query(
	        'GET', 
	        __serverUri + 'isbn/?isbn=' + isbn, 
	        {}, 
	        callback
	    );
    };

	var Books = function() {};

	$.extend(Books, {
		destroy 		: _remove, 
		moveToWishList  : _moveToWishList,
		get 			: _get,
		getAll 			: _getAll,
		booksItems      : _booksItems,
		render 			: _render,
        search          : _search
	});

	return Books;

}();