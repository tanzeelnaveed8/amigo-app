require('dotenv').config();
const express = require('express');
const configMiddlewares = require('./config/configMiddlewares');
const routes = require('./config/routes');

const app = express();

configMiddlewares(app);

routes(app);

module.exports = app;