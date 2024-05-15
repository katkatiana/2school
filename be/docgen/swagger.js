const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const express = require('express');
const router = express.Router();
require('dotenv').config();

const options = {
  definition: {
    swagger: '2.0',
    info: {
      title: '2school back-end API Documentation',
      description: "API endpoints documentation for 2school application, made with Swagger.",
      contact: {
        name: "Mariakatia Santangelo",
        email: "msantangelo56@gmail.com",
        url: "https://github.com/katkatiana"
      },
      version: '1.0.0',
    },
    // Useful for openapi 3.0.0
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //       in: "header"
    //     }
    //   }
    // },
    securityDefinitions : {
      bearerAuth : {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Valid access token must be composed in the following format:\n Bearer TOKEN\nwhere TOKEN is returned upon successfull login in the Authorization header.'
      }
    }
  },
  // looks for configuration in specified directories
  apis: ['./routes/*.js'],
}
 
const swaggerSpec = swaggerJsdoc(options)

function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.send(swaggerSpec)
  })
}
module.exports = swaggerDocs
