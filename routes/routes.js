'use strict'
//Bring in express and set up router.
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
//Require models
const {User, Course} = require('../models/models');

/* ----------   Routes for api/users ---------- */

//GET for /api/users
router.get('/users', (req, res) => {
    res.json({"text": "GET for /api/users"});
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