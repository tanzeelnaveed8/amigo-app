const  colors = require("colors");

const requestLogger = (req, res, next) => {
  console.log(`\n=== Request Logger ===`.green.bold);
  console.log(`Method: ${req.method}  URL: ${req.originalUrl}`.cyan);
  console.log("Request Logger", req.body);
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`Request query: ${JSON.stringify(req.query)}`.bgYellow);
  } else {
    console.log("Request query is empty");
  }

  if (req.body && Object.keys(req.body).length > 0) {
    // console.log(`Request body: ${JSON.stringify(req.body)}`.bgCyan);
  } else {
    console.log("Request body is empty");
  }

  // Capture response
  const originalSend = res.send;

  res.send = function (body) {
    console.log(`Response status: ${res.statusCode}`.bgGreen);

    let responseBody;
    try {
      responseBody = typeof body === 'object' ? JSON.stringify(body) : body;
    } catch (err) {
      responseBody = '[Unable to stringify response body]';
    }

    console.log(`Response body: ${responseBody}`.bgMagenta);

    // If you want to log headers too:
    // console.log(`Response headers: ${JSON.stringify(res.getHeaders())}`.bgBlue);

    // Call original send
    return originalSend.call(this, body);
  };
  next();
};

module.exports = requestLogger;
