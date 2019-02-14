'use strict'

const express = require('express');

const router = express.Router();

/* ----------   Routes for api/users ---------- */

//GET for /api/users
router.get('/users', (req, res) => {
    res.json({"text": "GET for /api/users"});
});

//POST for /api/users
router.post('/users', (req, res) => {
    res.json({"text": `POST for /api/users ${req.body.name}`});
});

/* ----------   Routes for api/courses ---------- */

//GET for /api/courses
router.get('/courses', (req, res) => {
    res.json({"text": "GET for /api/courses"});
});

//GET for /api/courses/:id
router.get('/courses/:id', (req, res) => {
    res.json({"text": `GET for /api/courses/${req.params.id}`});
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