import { Router } from 'express';
import UsuarioController from '../controllers/usuarioController';
const { asegurarAutenticacion } = require('../libs/jwt');

const router = Router();

router.post('/registrarse', UsuarioController.guardarUsuario);
router.post('/iniciarSesion', UsuarioController.iniciarSesion);
router.put('/actualizarUsuario/:idUsuario', asegurarAutenticacion, UsuarioController.actualizarUsuario);
router.post('/subirImagenUsuario/:idUsuario', asegurarAutenticacion, UsuarioController.subirImagenUsuario);
router.get('/obtenerImagenUsuario/:imagen', UsuarioController.obtenerImagenUsuario);

export default router;
