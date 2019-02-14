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
    //define error message
    let errorMessage = null;
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
        res.status(401).json({ 'No email/password entered': 'Access Denied' });
    }
};

/* ----------   Routes for api/users ---------- */

//GET for /api/users
router.get('/users', authenticateUser, (req, res) => {
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
        .then((result => {
            res.json(result);
        }))
        .catch(err => {
            next(err);
        })
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
router.post('/courses', (req, res) => {
    res.json({"text": `POST for /api/courses Course:${req.body.name}`});
});

//PUT for /api/courses/:id
router.put('/courses/:id', (req, res) => {
    res.json({"text": `PUT for /api/courses/${req.params.id} Course: ${req.body.name}`});
});

//DELETE for /api/courses/:id
router.delete('/courses/:id', (req, res) => {
    res.json({"text": `DELETE for /api/courses/${req.params.id}`});
});


module.exports = router;