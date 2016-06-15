var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//NIITUser Schema
var NIITUserSchema = mongoose.Schema({
	name: String,
	username: String,
	email: { type : String , unique : true},
	examination: String,
	country: String,
	phonenumber: Number,
	password: String,
	token: String

});


//User Schema
var UserSchema = mongoose.Schema({
	name: String,
	email: { type : String , unique : true},
	provider: String,
	country: String,
	examination: String,
	phoneNumber: Number,
	role: String,
	last_login: { type: Date, default: Date.now }},
	{ timestamps: true }
	);



var User = mongoose.model('User', UserSchema);
var NIITUser = mongoose.model('NIITUser', NIITUserSchema);

module.exports = {
    User: User,
    NIITUser: NIITUser
};


