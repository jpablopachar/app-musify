import { Router } from 'express';
import AlbumController from '../controllers/albumController';

const { asegurarAutenticacion } = require('../libs/jwt');
const { uploadImagen } = require('../libs/media');

const router = Router();

router.post('/album', asegurarAutenticacion, AlbumController.guardarAlbum);
router.get('/albumes/:idArtista?', asegurarAutenticacion, AlbumController.obtenerAlbumes);
router.get('/album/:idAlbum', asegurarAutenticacion, AlbumController.obtenerAlbum);
router.put('/actualizarAlbum/:idAlbum', asegurarAutenticacion, AlbumController.actualizarAlbum);
router.delete('/eliminarAlbum/:idAlbum', asegurarAutenticacion, AlbumController.eliminarAlbum);
router.post('/subirImagenAlbum/:idAlbum', [uploadImagen, asegurarAutenticacion], AlbumController.subirImagenAlbum);
router.get('/obtenerImagenAlbum/:imagen', AlbumController.obtenerImagenAlbum);

export default router;
