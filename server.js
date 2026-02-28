const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv');
const connectDB  = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express')
//load env var
dotenv.config({path:'./config/config.env'});

connectDB();

const app = express();

//Body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

app.use(mongoSanitize());

app.use(helmet());

app.use(xss());

const limiter = rateLimit({
    windowMs : 10 * 60 * 1000,
    max: 1000
});
app.use(limiter);

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
        {
        url: 'http://localhost:5000/api/v1'
        }
        ],
    },
    apis:['./routes/*.js'],
};
const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const campground = require('./routes/campgrounds');
const books = require('./routes/books');
const auth = require('./routes/auth');

app.use('/api/v1/campgrounds', campground);
app.use('/api/v1/books', books);
app.use('/api/v1/auth', auth);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ${err.message}`);
    server.close(() => process.exit());
});

app.set('query parser', 'extended');

