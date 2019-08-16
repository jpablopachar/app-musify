import '@babel/polyfill';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import multer from 'multer';

import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


require('./db/database');

// import indexRoutes from '../routes/indexRoutes';

const app = express();

/*                  Ajustes                     */
// Usa el puerto establecido o usa el puerto 3000
app.set('port', process.env.PORT || 3000);

/*                 Middleware                   */
app.use(morgan('dev'));
// Recibe los datos que vienen desde formularios
app.use(express.urlencoded({ extended: false }));
// Convierte los objetos a json
app.use(express.json());
app.use(cors());

/*                    Rutas                     */
// app.use('/', indexRoutes);

async function main() {
  await app.listen(app.get('port'));

  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`Servidor en puerto ${app.get('port')}`);
}

main();
