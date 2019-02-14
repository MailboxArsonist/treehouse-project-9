//Require mongoose
const mongoose = require('mongoose');
//Bring in Schema
const { Schema } = mongoose;

//Define UserSchema
const UserSchema = new Schema({
    firstName : String,
    lastName : String,
    emailAddress : String,
    password : String
});

//Define CourseSchema 'users' property will reference a user model
const CourseSchema = new Schema({
    title : String,
    description : String,
    estimatedTime : String,
    materialsNeeded : String,
    users : { type: Schema.Types.ObjectId, ref: 'User' }
});

//Define models for User and Course
const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

//Export models for use in other files
module.exports = { User, Course };