//Require mongoose
const mongoose = require('mongoose');
//Bring in Schema
const { Schema } = mongoose;

//Define UserSchema
const UserSchema = new Schema({
    firstName : {type : String, required : [true, 'First name required']},
    lastName : {type : String, required : [true, 'Last name required']},
    emailAddress : {type : String, required : [true, 'Email address required']},
    password : {type : String, required : [true, 'Password required']}
});

//Define CourseSchema 'users' property will reference a user model
const CourseSchema = new Schema({
    title : {type : String, required : [true, 'Title required']},
    description : {type : String, required : [true, 'Description required']},
    estimatedTime : {type : String, required : [true, 'Est time required']},
    materialsNeeded : {type : String, required : [true, 'Materials Needed required']},
    user : { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Course needs a user'] }
});

//Define models for User and Course
const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

//Export models for use in other files
module.exports = { User, Course };