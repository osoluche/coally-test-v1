require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./routes/user');
const Task = require('./routes/task');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const puerto = process.env.PORT || 3000;
const db = process.env.DBO;

const auth = require('./middleware/auth');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('No se pudo conectar a MongoDB', err));


// Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Coally Test v1',
            version: '1.0.0',
            description: 'Documentación de la API',
        },
        servers: [
            {
                url: `http://localhost:${puerto}`,
            },
        ],
        components: {
            securitySchemes: {
                JwtAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                JwtAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('', Task);

app.use('', User);

app.get('/', (req, res) => {
    res.json([{ name: 'Coally Test v1' }]);
});

if (require.main === module) {
    app.listen(puerto, err => {

        if (err) {

        }

        console.log("running ...");

    });
}

module.exports = app;