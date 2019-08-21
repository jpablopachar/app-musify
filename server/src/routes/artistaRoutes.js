import { Router } from 'express';
import ArtistaController from '../controllers/artistaController';

const { asegurarAutenticacion } = require('../libs/jwt');
const { uploadImagen } = require('../libs/media');

const router = Router();

router.post('/artista', asegurarAutenticacion, ArtistaController.guardarArtista);
router.get('/artistas/:pagina?', asegurarAutenticacion, ArtistaController.obtenerArtistas);
router.get('/artista/:idArtista', asegurarAutenticacion, ArtistaController.obtenerArtista);
router.put('/actualizarArtista/:idArtista', asegurarAutenticacion, ArtistaController.actualizarArtista);
router.delete('/eliminarArtista/:idArtista', asegurarAutenticacion, ArtistaController.eliminarArtista);
router.post('/subirImagenArtista/:idArtista', [uploadImagen, asegurarAutenticacion], ArtistaController.subirImagenArtista);
router.get('/obtenerImagenArtista/:imagen', ArtistaController.obtenerImagenArtista);

export default router;
