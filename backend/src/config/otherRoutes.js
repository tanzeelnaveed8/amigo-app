require('dotenv').config();
const http = require('http');
const globalErrorHandler = require('../controllers/error/error.controller');
const { connectDB } = require('./connectDb');
const { configureSockets } = require('../utility/socket/index');
const AppError = require('../utility/appError');
const { initializeCleanupCron } = require('../utility/ghost/crowdCleanup');

module.exports = (app) => {
  const server = http.createServer(app);

  configureSockets(server)

  app.use('/', (req, res, next) => {
    if (req.path === '/') {
      res.send('Amigo API is Working deployed.............');
    } else {
      next();
    }
  });
 const deploymentTimestamp = new Date().toISOString();
  app.use('/api/deployment', (_req, res) => {
    res.json({
      message: `AMIGO BE API is up and running.`,
      deployedAt: deploymentTimestamp
    });
  });
  app.all('/*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
 
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
  app.use(globalErrorHandler);

  const port = process.env.PORT || 9090;
  connectDB()
    .then(() => {
      server.listen(port, () => {
        // const socketManager = new SocketManager(server)
        // app.set("io", socketManager.io)
        console.log(
          `Server running in ${process.env.NODE_ENV} mode on port http://localhost:${port}`.yellow
            .bold
        );
        // Initialize ghost crowd cleanup cron job
        initializeCleanupCron();
      });
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:'.red.bold, error.message);
    });
};
