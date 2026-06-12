const express = require('express');
const path = require('path');
const cors = require('cors')
require('dotenv').config();
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const swaggerDocs = yaml.load(path.join(__dirname, 'swagger.yaml'))
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet({
      crossOriginResourcePolicy: false,
    }));
app.use('/images', express.static(path.join(__dirname, 'images')));
// Servir les fichiers statiques du FrontEnd
app.use(express.static(path.join(__dirname, '../FrontEnd')));

const db = require("./models");
const userRoutes = require('./routes/user.routes');
const categoriesRoutes = require('./routes/categories.routes');
const worksRoutes = require('./routes/works.routes');

// Synchroniser la DB avec gestion d'erreur
db.sequelize.sync().then(()=> {
  console.log('db is ready');
}).catch(err => {
  console.error('Database sync error:', err);
});

// Routes API AVANT le fallback SPA
app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/works', worksRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Fallback pour le SPA (Single Page Application) - DOIT être à la fin
// Toutes les routes non trouvées redirigent vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/index.html'));
});

module.exports = app;
