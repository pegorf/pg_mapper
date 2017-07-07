var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//Trying socket connection for communication with view	
var server = require('http').Server(app).listen(2999, function(){
  console.log('listening on port 2999');
});
var io = require('socket.io')(server);

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


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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

// 		console.log(' coords_strada @5s: ' + coords_strada);
// 	}

// }, 1000);



// FIORINO ==============================================
if(connection_fiorino == false) {
  my_dev_fiorino.listening(function (data) {
	console.log(data[0].location.coordinates);
	coords_fiorino = data[0].location.coordinates;
	console.log('fiorino callback');

	//Send to the map the information
	if (typeof io != "undefined") {
		io.emit('news', { coords_fiorino: coords_fiorino });
	}
	else {
		console.log("io is not defined");
	}
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

my_dev_fiorino.find(filter)
.then((result) => {
    //You can treat the result here
    console.log('result_fiorino:' + result[0].location.coordinates);
    coords_fiorino = result[0].location.coordinates;

    if(result[0].origin == devid_fiorino) {
    	console.log('É FIORINO: ' + result[0].origin);	
		//Send to the map the information
		if (typeof io != "undefined") {
			io.emit('news', { coords_fiorino: coords_fiorino });
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

my_dev_strada.find(filter)
.then((result) => {
    //You can treat the result here
    console.log('result_strada:' + result[0].location.coordinates);
    coords_strada = result[0].location.coordinates;

    if(result[0].origin == devid_strada) {
    	console.log('É STRADA: ' + result[0].origin);	
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


    // STRADA ==============================================
if(connection_strada == false) {
  my_dev_strada.listening(function (data) {
	console.log(data[0].location.coordinates);
	coords_strada[0] = data[0].location.coordinates[0];
	coords_strada[1] = data[0].location.coordinates[1];
	console.log('strada callback');


	//Send to the map the information
	if (typeof io != "undefined") {
		io.emit('news', { coords_strada: coords_strada });
	}
	else {
		console.log("io is not defined");
	}
	// $scope.myData_Strada.coordinates = data[0].location.coordinates;
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


function getPosition(_obj) {
	//Get Data on page reload
	var filter = {
	    'variable':   'location',
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
}

io.on('connection', function (socket) {
	console.log('io on connection: ' + socket);
	socket.on('position_request', function (data) {
	 console.log('position_request: ' + data);
	 getPosition(my_dev_strada);
	 getPosition(my_dev_fiorino);

	});
   //getPosition(my_dev_strada);
});

// io.on('position_request', function (socket) {
// 	console.log('position_request event !!!!');
// });

module.exports = app;
