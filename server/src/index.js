import '@babel/polyfill';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import multer from 'multer';

import path from 'path';

import usuarioRoutes from './routes/usuarioRoutes';

if (process.env.NODE_ENV !== 'production') {
  // require('dotenv').config();
  config();
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

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});

app.use(multer({ storage }).single('imagen'));

/*                    Rutas                     */
app.use('/api', usuarioRoutes);

async function main() {
  await app.listen(app.get('port'));

  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`Servidor en puerto ${app.get('port')}`);
}

main();
