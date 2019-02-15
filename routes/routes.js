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
    //Parse user creds from auth header
    const credentials = auth(req);
    if(credentials){
        //run code check if user is in db
        User.find({emailAddress : credentials.name})
            .then((user) => {
                if(user.length > 0){
                    //check header password against hashed stored password
                    const authenticated = bcryptjs.compareSync(credentials.pass, user[0].password);
                    if(authenticated){
                        //Success, put current user on the req object
                        req.currentUser = user;
                        next();
                    } else {
                        //access denied
                        res.status(401).json({ 'Incorrect Password': 'Access Denied' });
                    }
                } else {
                    res.status(401).json({ 'No user found': 'Access Denied' });
                }
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.sendStatus(401).json({ 'No email/password entered': 'Access Denied' });
    }
};

/* ----------   Routes for api/users ---------- */

//GET for /api/users
router.get('/users', authenticateUser, (req, res) => {
    console.log(req.currentUser)
    res.json(req.currentUser);
});

//POST for /api/users
router.post('/users', (req, res, next) => {
    const user = req.body;
    user.password = bcryptjs.hashSync(user.password);
    User.create({
        firstName : user.firstName,
        lastName : user.lastName,
        emailAddress : user.emailAddress,
        password : user.password
    })
        .then(() => {
            res.location('/');
            res.send(201);
        })
        .catch(err => {
            next(err);
        });
});

/* ----------   Routes for api/courses ---------- */

//GET for /api/courses
router.get('/courses', (req, res, next) => {
    Course.find()
            .populate('user')
            .then(function( courses, err){
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
    .populate('user')
    .then((course) => {
        res.json(course);
    })
    .catch(err => {
        next(err);
    }) 
});

//POST for /api/courses
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
        console.log(course);
        res.location(`/courses/${course.id}`);
        res.sendStatus(201);
    })
    .catch(err => {
        next(err);
    })
});

//PUT for /api/courses/:id
router.put('/courses/:id', (req, res, next) => {
    res.json({"text": `PUT for /api/courses/${req.params.id} Course: ${req.body.name}`});
});

//DELETE for /api/courses/:id
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