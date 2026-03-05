const cors = require("cors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const requestLogger = require("../utility/requestLogger");
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};
module.exports = (app) => {
  // Enable trust proxy to handle X-Forwarded-For headers from reverse proxies/load balancers
  // app.set('trust proxy', true);
  
  app.use(cors());
  app.options("*", cors());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "trusted.cdn.com"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "trusted.cdn.com"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: "deny",
      },
    })
  );
  app.use(cookieParser());
  app.use(xss());
  // app.use(compression());
  function shouldCompress (req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }
  
    // fallback to standard filter function
    return compression.filter(req, res)
  }
  app.use(compression({ filter: shouldCompress }))


  app.use(
    express.json({
      verify: rawBodySaver,
      limit: "100mb", // Increased to handle large image uploads
    })
  );
  app.use(
    express.urlencoded({
      limit: "200mb", // Increased to handle multiple large files
      extended: true,
      verify: rawBodySaver,
    })
  );

  if (process.env.NODE_ENV === "development") {
    app.use((_req, _res, next) => {
      requestLogger(_req, _res, next);
    });
    app.use(logger("dev"));
  }
  app.use("/public", express.static(path.join(__dirname, "../public")));
  app.use(mongoSanitize());
  const limiter = rateLimit({
    max: 90000,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many requests from this IP, please try again in 15 mintues!",
  });
  app.use("/api", limiter);
  app.use(
    hpp({
      whitelist: [],
    })
  );
  // Test middleware
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=()");
    next();
  });

  const exitHandler = () => {
    // if (server) {
    //   server.close(() => {
    //     console.log("Server closed");
    //     process.exit(1);
    //   });
    // } else {
    // }
    process.exit(1);
  };

  const unexpectedErrorHandler = (error) => {
    console.log(error);
    exitHandler();
  };

  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);
  process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
      server.close();
    }
  });
};
