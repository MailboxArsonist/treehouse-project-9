'use strict'
//Bring in express and set up router.
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
//authentication
const auth = require('basic-auth');
//Require models
const {User, Course} = require('../models/models');


///Authentication middleware
const authenticateUser = (req, res, next) => {
    //Parse user creds from auth header and check they exist
    const credentials = auth(req);
    if(credentials){
        //run code check if user is in db
        User.find({emailAddress : credentials.name})
            .then((user) => {
                if(user.length > 0){
                    //check header password against hashed stored password
                    const authenticated = bcryptjs.compareSync(credentials.pass, user[0].password);
                    if(authenticated){
                        //Success, put current user on the req object for next middleware
                        req.currentUser = user;
                        next();
                    } else {
                        //incorrect password => access denied
                        res.status(401).json({ 'Incorrect Password': 'Access Denied' });
                    }
                } else {
                    ////No user found => Access denied
                    res.status(401).json({ 'No user found': 'Access Denied' });
                }
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.status(401).json({ 'No email/password entered': 'Access Denied' });
    }
};

/* ----------   Routes for api/users ---------- */

//GET for /api/users, *** user needs authenticating first
router.get('/users', authenticateUser, (req, res) => {
    res.json(req.currentUser);
});

//POST for /api/users
router.post('/users', (req, res, next) => {
    const user = req.body;
    //check that a password property exists before hashing. Schema validation will catch any empty passwords
    if(user.password && user.password !== ''){
        user.password = bcryptjs.hashSync(user.password);
    }
    //check database to see if a user is already registered with email address
    User.findOne({emailAddress : user.emailAddress})
        .then((data) => {
            if(data){
                //email already exists, send error 
                const err = new Error('Account already exists');
                err.status = 409;
                next(err);
            } else{
                //no email exists, continue to create a user
                User.create({
                    firstName : user.firstName,
                    lastName : user.lastName,
                    emailAddress : user.emailAddress,
                    password : user.password
                })
                    .then(() => {
                        res.location('/');
                        res.sendStatus(201);
                    })
                    .catch(err => {
                        next(err);
                    });
            }
        })
        .catch(err => {
            next(err);
        });
});

/* ----------   Routes for api/courses ---------- */

//GET for /api/courses
router.get('/courses', (req, res, next) => {
    Course.find()
            .populate({ path: 'user', select: ['firstName','lastName' ] })
            .then((courses, err) => {
                if(err){
                    return next(err);
                } else if(courses.length === 0){
                    let error = new Error('No results in db for courses');
                    return next(error);
                } else {
                    res.json({courses});
                }
            });
});

//GET for /api/courses/:id
router.get('/courses/:id', (req, res, next) => {
    const id = req.params.id;
    Course.findById(id)
    .populate({ path: 'user', select: ['firstName','lastName' ] })
    .then((course) => {
        if(!course){
            let error = new Error('No results in db for courses');
            return next(error);
        } else {
            res.json(course);
        }
    })
    .catch(err => {
        next(err);
    });
});

//POST for /api/courses, *** user needs authenticating first
router.post('/courses', authenticateUser ,(req, res, next) => {
    //Will hold the current user that was put on the req object by authUser middleware
    const currentUser = req.currentUser[0];
    //Will hold the data for the new course
    const newCourse = req.body;
    Course.create({
        title : newCourse.title,
        description : newCourse.description,
        estimatedTime : newCourse.estimatedTime,
        materialsNeeded : newCourse.materialsNeeded,
        user : currentUser
    })
    .then((course) => {
        res.location(`/courses/${course.id}`);
        res.sendStatus(201);
    })
    .catch(err => {
        next(err);
    });
});

//PUT for /api/courses/:id, *** user needs authenticating first
router.put('/courses/:id', authenticateUser, (req, res, next) => {
    const currentUser = req.currentUser[0];
    const courseId = req.params.id;
    const updatedCourse = req.body;
    //check that userId matches courses user id
    Course.findById(courseId)
            .populate('user')
            .then((course) => {
                if(currentUser.id === course.user.id){
                    Course.findByIdAndUpdate(course.id, {
                        title : updatedCourse.title,
                        description : updatedCourse.description,
                        estimatedTime : updatedCourse.estimatedTime,
                        materialsNeeded : updatedCourse.materialsNeeded,
                        user : currentUser

                    }, {runValidators : true})
                            .then(() => {
                                //Success, course updated, send 204
                                res.sendStatus(204);
                            })
                            .catch(err => {
                                next(err);
                            });
                } else {
                    //user doesn't own the course, cannot update, send 403 status
                    res.sendStatus(403);
                }
            })
            .catch(err => {
                next(err);
            });
});

//DELETE for /api/courses/:id, *** user needs authenticating first
router.delete('/courses/:id', authenticateUser, (req, res, next) => {
    const currentUser = req.currentUser[0];
    const courseId = req.params.id;
    //check that userId matches courses user id
    Course.findById(courseId)
            .populate('user')
            .then((course) => {
                if(currentUser.id === course.user.id){
                    Course.findByIdAndDelete(course.id)
                            .then(() => {
                                res.sendStatus(204);
                            })
                            .catch(err => {
                                next(err);
                            });
                } else {
                    //user doesn't own the course, cannot delete send 403 status
                    res.sendStatus(403);
                }
            })
            .catch(err => {
                next(err);
            });
});


module.exports = router;