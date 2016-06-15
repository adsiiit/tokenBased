// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var MyUser   = require('./app/models/user');// get our mongoose model
    
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('SecretKey', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================


// API ROUTES -------------------
// NIIT side API's Starts

app.post('/signup', function(req, res) {

  // create a sample user
  var user_info = {name: req.body.name, email: req.body.email,
  	examination: req.body.examination, country: req.body.country,
  	phone: req.body.phonenumber};

  	var token = jwt.sign(user_info, app.get('SecretKey'));

  	var aman = new MyUser.NIITUser({ 
    name: req.body.name,
    username: req.body.username, 
    password: req.body.password,
	email: req.body.email,
	examination: req.body.examination,
	country: req.body.country,
	phonenumber: req.body.phonenumber,
	token: token 
  });

  // save the sample user
  aman.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true, user: aman });
  });
});


// route to return all users (GET http://localhost:8080/api/users)
app.get('/users', function(req, res) {
  MyUser.NIITUser.find({}, function(err, users) {
    res.json(users);
  });
});



// NIIT side API's Ends





// MyPerfectice side API's Starts


// get an instance of the router for api routes
var apiRoutes = express.Router(); 



// route to show a welcome message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the MyPerfectice and NIIT API:' });
});


//route middleware to verify a token
apiRoutes.use(function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	if(token) {
		jwt.verify(token, app.get('SecretKey'), function(err, decoded){
			if(err){
				return res.json({success: false, message:'Failed to authenticate token'});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else{
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});





// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/tokenInfo', function(req, res) {
	info = {name: req.decoded.name, email: req.decoded.email, examination: req.decoded.examination, country: req.decoded.country, phone: req.decoded.phone};
  res.json(info);
});




//connect to database using mongojs

/*var mongojs = require('mongojs');
var db=mongojs("ProdDb",['users']);*/

apiRoutes.get('/niitUser', function(req, res) {
	info = {name: req.decoded.name, email: req.decoded.email,
		examination: req.decoded.examination, country: req.decoded.country,
		phoneNumber: req.decoded.phone, provider: "niit"};
	MyUser.User.findOneAndUpdate({email: info.email},{$set:{last_login:new Date().toISOString()}},
		function(err, que){
		if(err)
			res.send(err);
		if(que){
		/*	console.log(que._id);*/
			res.json(que._id);
		}
		else{
			newuser = MyUser.User(info);
			newuser.save(function(err){
				if(err)
					res.send(err);
				res.json(newuser._id);
			});
		}
	});
});



// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);



// MyPerfectice side API's Ends


app.listen(port);
console.log('Server running at http://localhost:' + port);