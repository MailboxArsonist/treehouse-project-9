'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const router = require('./routes/routes.js');
const mongoose = require('mongoose');

//connect to db 
mongoose.connect("mongodb://localhost:27017/fsjstd-restapi", { useNewUrlParser: true });
//mongo connection object
const db = mongoose.connection;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//Set up to parse request body and json
// app.use(express.urlencoded({extended: true}));
app.use(express.json())


// setup morgan which gives us http request logging
app.use(morgan('dev'));

//list on connections
db.on('error', (err) => {
  console.log(`Connection Error: ${err}`);
});

//close db connection
db.once('open', () => {
  console.log('Database connection open');
});


//ROUTING
app.use('/api', router);



// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  if(err.message.includes('validation failed')){
    console.log('true')
    err.status = 400;
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
