import '@babel/polyfill';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import usuarioRoutes from './routes/usuarioRoutes';
import artistaRoutes from './routes/artistaRoutes';
import albumRoutes from './routes/albumRoutes';
import cancionRoutes from './routes/cancionRoutes';

if (process.env.NODE_ENV !== 'production') {
  config();
}

require('./db/database');

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
app.use('/api', usuarioRoutes);
app.use('/api', artistaRoutes);
app.use('/api', albumRoutes);
app.use('/api', cancionRoutes);

async function main() {
  await app.listen(app.get('port'));

  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`Servidor en puerto ${app.get('port')}`);
}

main();
