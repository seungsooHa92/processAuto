const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const window = require('window');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

app.use(cors({
    'allowedHeaders':['sessionId','Content-Type'],
    'exposedHeaders':['sessionId'],
    'origin':'*',
    'methods':'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue':false
}))

app.all('/*',(req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    next();
})

let server = app.listen()