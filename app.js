var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();


// var data = new Date();
// console.log(data.toISOString());
// console.log(new Date().toISOString());
// data.setHours(data.getHours()-2);
// console.log(data.toISOString());
// console.log(new Date(new Date().setHours(new Date().getHours()-2)));
// console.log(new Date().getTimezoneOffset());
// console.log(process.env.TZ);
// console.log(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000)));
// console.log(new Date(new Date().setHours(new Date().getHours() - 2 - (new Date().getTimezoneOffset()/60) )).toISOString());
// return;
// while(1)

//Trying socket connection for communication with view	
//var server = require('http').Server(app).listen(2999, function(){
//  console.log('listening on port 2999');
//});
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(2999, function() {
  console.log('listening on port 2999');
});

var index = require('./routes/index');
var users = require('./routes/users');

var coords_strada = [];	
var coords_fiorino = [];	

const token_strada   = '55fec5cc-ac9c-4a78-9cc9-3adcf93356b2';
const token_fiorino  = 'f935d23f-f493-4a0d-abe0-f7e564bbd408';
const devid_fiorino  = '577ac2f20adbf7000a7b799a';
const devid_strada   = '577ac2da0adbf7000a7b7997';
const Device = require('tago/device');
const my_dev_fiorino = new Device(token_fiorino);
const my_dev_strada  = new Device(token_strada);
var connection_fiorino = false;
var connection_strada = false;

var MongoClient = require('mongodb').MongoClient
var assert = require('assert');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use("/img",express.static(path.join(__dirname, '/public/images')));
//app.use('/js',express.static(path.join(__dirname, 'public/js')));
//app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// setInterval(function() {
// 	if(coords_strada != 'undefined') {
// 		//coords_strada[0] = lng;
// 		coords_strada[0] = coords_strada[0] + 0.001;
// 		io.emit('news', { coords_strada: coords_strada });
//
// 		console.log(' coords_strada @5s: ' + coords_strada);
// 	}
//
// }, 1000);



// FIORINO ==============================================
if(connection_fiorino == false) {
  my_dev_fiorino.listening(function (data) {
	console.log('socket income: ' + JSON.stringify(data, null, 2));
	// coords_fiorino = data[0].location.coordinates;
	// console.log('fiorino callback');

	// //Send to the map the information
	// if (typeof io != "undefined") {
	// 	io.emit('news', { coords_fiorino: coords_fiorino });
	// }
	// else {
	// 	console.log("io is not defined");
	// }
	    //Send the data to Mongo
    MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
    	assert.equal(null, err);
  		console.log("Connected successfully to server");
  		var collection = db.collection('documents');

  		var data_filtered = data.filter(function(el) {
  			return el.variable == 'speed';
  		});
  		//console.log('data_filtered: ' + JSON.stringify(data_filtered));

		// //update the database
	 	var selector = {'id': data_filtered[0].id};
		var new_records = {$set: data_filtered[0]};
		collection.updateOne(selector, new_records, {upsert: true}, function(err, res, raw) {
		  console.log('res: ' + res);
		  console.log('err: ' + err);
		  console.log('raw: ' + raw);
		});
		db.close();

		//Send to the map the information
		if (typeof io != "undefined") {
			io.emit('news', { coords_fiorino: data_filtered[0] });
		}
		else {
			console.log("io is not defined");
		}

    }); //END MongoClient.connect
  });  	
}

//console.log('my_dev_fiorino.realtime.socket.connected: ' + my_dev_fiorino.realtime.socket.connected);

my_dev_fiorino.realtime.socket.on('connecting', function() {
	console.log('connecting');
});
my_dev_fiorino.realtime.socket.on('connect', function() {
	console.log('connect');
	connection_fiorino = true;
});
my_dev_fiorino.realtime.socket.on('disconnect', function() {
	connection_fiorino = false;
	console.log('disconnect');
});

my_dev_fiorino.realtime.socket.on('register', function() {
	connection_fiorino = true;
	console.log('register');
});
my_dev_fiorino.realtime.socket.on('reconnecting', function() {
	connection_fiorino = false;
	console.log('disconnect');
});

//Get Data on page reload
var filter = {
    'variable':   'location',
    'qty':      '1',
};

var filter2 = {
    'variable':   'speed',
    'qty':      '100',
    'origin': '577ac2f20adbf7000a7b799a',
	'start_date':"2017-07-27",
	'end_date': "2017-07-27"
};
filter2.origin = devid_fiorino;
var date_now = new Date();
filter2.start_date = date_now.toISOString().replace(/T.+/, '');
filter2.end_date = date_now.toISOString().replace(/T.+/, '');

my_dev_fiorino.find(filter2)
.then((result) => {
    //Send the data to Mongo
    MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
    	assert.equal(null, err);
  		console.log("Connected successfully to server");
  		var collection = db.collection('documents');

	  	// Check if the document is already registered
	  	for(var i = 0; i < result.length; i++) {
	  		//console.log(JSON.stringify(result[i].location.coordinates));

			// //update the database
		 	var selector = {'id': result[i].id};
			//var new_records = {$set: {'a': 10}};
			var new_records = {$set: result[i]};
			//var new_records = {$set: {'a':8, 'b':8}};

			collection.updateOne(selector, new_records, {upsert: true}, function(err, res, raw) {
			//if(err) throw err;
			// console.log('res: ' + res);
			// console.log('err: ' + err);
			// console.log('raw: ' + raw);
			
			});
	  	}

		// collection.find().toArray(function(err, docs) {
		// 	console.log(docs);
		// 	console.log(err);
		// 	db.close();	
		// });
		db.close();			
    }); //END MongoClient.connect
})
.catch((error) => {
    //You can treat errors here
    console.log('error:' + error);
});

filter2.origin = devid_strada;
my_dev_strada.find(filter2)
.then((result) => {
    //Send the data to Mongo
    MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
    	assert.equal(null, err);
  		console.log("Connected successfully to server");
  		var collection = db.collection('documents');

	  	// Check if the document is already registered
	  	for(var i = 0; i < result.length; i++) {
	  		// console.log('result[i] => ' + JSON.stringify(result[i]));

			// //update the database
		 	var selector = {'id': result[i].id};
			//var new_records = {$set: {'a': 10}};
			var new_records = {$set: result[i]};
			//var new_records = {$set: {'a':8, 'b':8}};

			collection.updateOne(selector, new_records, {upsert: true}, function(err, res, raw) {
			//if(err) throw err;
			// console.log('res: ' + res);
			// console.log('err: ' + err);
			// console.log('raw: ' + raw);
			
			});
	  	}

		// collection.find().toArray(function(err, docs) {
		// 	console.log(docs);
		// 	console.log(err);
		// });
		db.close();	
    }); //END MongoClient.connect
})
.catch((error) => {
    //You can treat errors here
    console.log('error:' + error);
});

    // STRADA ==============================================
if(connection_strada == false) {
  my_dev_strada.listening(function (data) {
  	console.log('socket income: ' + JSON.stringify(data, null, 2));
	// console.log(data[0].location.coordinates);
	// coords_fiorino = data[0].location.coordinates;
	// console.log('fiorino callback');

	// //Send to the map the information
	// if (typeof io != "undefined") {
	// 	io.emit('news', { coords_fiorino: coords_fiorino });
	// }
	// else {
	// 	console.log("io is not defined");
	// }
	    //Send the data to Mongo
    MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
    	assert.equal(null, err);
  		console.log("Connected successfully to server");
  		var collection = db.collection('documents');

  		var data_filtered = data.filter(function(el) {
  			return el.variable == 'speed';
  		});
  		
		// //update the database
	 	var selector = {'id': data_filtered[0].id};
		var new_records = {$set: data_filtered[0]};
		collection.updateOne(selector, new_records, {upsert: true}, function(err, res, raw) {
		  console.log('res: ' + res);
		  console.log('err: ' + err);
		  console.log('raw: ' + raw);
		});
		db.close();

		//Send to the map the information
		if (typeof io != "undefined") {
			io.emit('news', { coords_strada: data_filtered[0] });
		}
		else {
			console.log("io is not defined");
		}

    }); //END MongoClient.connect
  });  	
}

console.log('my_dev_strada.realtime.socket.connected: ' + my_dev_strada.realtime.socket.connected);

my_dev_strada.realtime.socket.on('connecting', function() {
	console.log('connecting');
});
my_dev_strada.realtime.socket.on('connect', function() {
	console.log('connect');
	connection_strada = true;
});
my_dev_strada.realtime.socket.on('disconnect', function() {
	connection_strada = false;
	console.log('disconnect');
});

my_dev_strada.realtime.socket.on('register', function() {
	connection_strada = true;
	console.log('register');
});
my_dev_strada.realtime.socket.on('reconnecting', function() {
	connection_strada = false;
	console.log('disconnect');
});


// Get the position from Tago and emit event to the viewer
function getPosition(_obj) {
	//Get Data on page reload
	var filter = {
	    'variable':   'speed',
	    'qty':      '1',
	};
	_obj.find(filter)
    .then((result) => {
        //Get from Tago.io the information
        console.log('result(getpos):' + JSON.stringify(result[0].location));

        if(result[0].origin == devid_fiorino) {
			coords_fiorino[0] = result[0].location.coordinates[0];
			coords_fiorino[1] = result[0].location.coordinates[1];

			//Send to the map the information
			if (typeof io != "undefined") {
				io.emit('news', { coords_fiorino: coords_fiorino });
			}
			else {
				console.log("io is not defined");
			}
    	} 

        if(result[0].origin == devid_strada) {
			coords_strada[0] = result[0].location.coordinates[0];
			coords_strada[1] = result[0].location.coordinates[1];

			//Send to the map the information
			if (typeof io != "undefined") {
				io.emit('news', { coords_strada: coords_strada });
			}
			else {
				console.log("io is not defined");
			}
    	} 

    })
    .catch((error) => {
        //You can treat errors here
        console.log('error:' + error);
    });
} // End of function getPosition(_obj) {


// Get the position from local database and emit event to the viewer
function getPosition2(_obj) {
    //Ge the data from Mongo
    MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
    	assert.equal(null, err);
  		console.log("Connected successfully to server");
  		var collection = db.collection('documents');

		collection
		.find({
			"time": { // 60 minutes ago (from now)
       		 	//$gte: new Date(ISODate().getTime() - 1000 * 60 * 60 * 12)	//12hr ago
       		 	$gte: new Date(new Date().setHours(new Date().getHours()-12)).toISOString()	//2hr ago
       		 	//$gte: new Date(new Date().setHours(new Date(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000))).getHours()-2)).toISOString()	//2hr ago
       		 	//$gte: new Date(new Date().setHours(new Date().getHours() - 2 - (new Date().getTimezoneOffset()/60) )).toISOString()	//2hr ago
    		}
		})
		.sort( {'time': 1} )
		.toArray(function(err, docs) {
	        //Send data to the viewer
			for(var i = 0; i < docs.length; i++) {
				console.log('docs[i]: ' + JSON.stringify(docs[i], null, 2));
				//Send to the map the information
				if (typeof io != "undefined") {
					if(docs[i].origin == devid_fiorino) {
						io.emit('news', { coords_fiorino: docs[i] });
					}
					else if(docs[i].origin == devid_strada) {
						io.emit('news', { coords_strada: docs[i] });
					}					
				}
				else {
					console.log("io is not defined");
				}
			}
			db.close();	
		});
    }); //END MongoClient.connect
} // End of function getPosition2(_obj) {

io.on('connection', function (socket) {
	console.log('io on connection: ' + socket);
	socket.on('position_request', function (data) {
	 console.log('position_request: ' + data);
	 // getPosition(my_dev_strada);
	 // getPosition(my_dev_fiorino);
	 getPosition2(my_dev_fiorino);
	});
   //getPosition(my_dev_strada);
});

io.on('disconnect', function(socket) {
	console.log('io on disconnect...');

});

io.on('error', function(socket) {
	console.log('io on error...');

});


// io.on('position_request', function (socket) {
// 	console.log('position_request event !!!!');
// });

module.exports = app;
