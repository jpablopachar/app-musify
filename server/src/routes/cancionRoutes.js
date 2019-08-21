import { Router } from 'express';

import CancionController from '../controllers/cancionController';

const { asegurarAutenticacion } = require('../libs/jwt');
const { uploadMusic } = require('../libs/media');

const router = Router();

router.post('/cancion', asegurarAutenticacion, CancionController.guardarCancion);
router.get('/canciones/:idAlbum?', asegurarAutenticacion, CancionController.obtenerCanciones);
router.get('/cancion/:idCancion', asegurarAutenticacion, CancionController.obtenerCancion);
router.put('/actualizarCancion/:idCancion', asegurarAutenticacion, CancionController.actualizarCancion);
router.delete('/eliminarCancion/:idCancion', asegurarAutenticacion, CancionController.eliminarCancion);
router.post('/subirCancion/:idCancion', [uploadMusic, asegurarAutenticacion], CancionController.subirCancion);
router.get('/obtenerCancion/:cancion', CancionController.obtenerArchivoCancion);

export default router;
