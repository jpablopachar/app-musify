import fs from 'fs-extra';
import path from 'path';

import Usuario from '../models/usuario';
import helpers from '../libs/helpers';
import jwt from '../libs/jwt';

const controller = {};

controller.guardarUsuario = async (req, res) => {
  const {
    nombres,
    apellidos,
    nombreUsuario,
    correo,
    contrasena,
  } = req.body;
  const usuario = new Usuario();

  if (nombres && apellidos && nombreUsuario && correo && contrasena) {
    const hash = await helpers.encriptarContrasena(contrasena);

    usuario.nombres = nombres;
    usuario.apellidos = apellidos;
    usuario.nombreUsuario = nombreUsuario;
    usuario.correo = correo;
    usuario.contrasena = hash;
    usuario.cargo = 'ROLE_USER';
    usuario.imagen = null;

    const usuarioDuplicado = await Usuario.find({ $or: [{ correo: usuario.correo.toLowerCase() }, { nombreUsuario: usuario.nombreUsuario.toLowerCase() }] });

    // Control de usuarios duplicados
    if (usuarioDuplicado.length >= 1) return res.status(200).json({ mensaje: '¡El usuario ya existe!' });

    await usuario.save();
    return res.status(200).json({ usuario });
  }

  return res.status(200).json({ mensaje: '¡Debes enviar todos los campos necesarios!' });
};

controller.iniciarSesion = async (req, res) => {
  const { correo, contrasena, obtenerToken } = req.body;
  const usuario = await Usuario.findOne({ correo });

  if (usuario) {
    const verificar = await helpers.validarContrasena(contrasena, usuario.contrasena);

    if (verificar) {
      if (obtenerToken) return res.status(200).send({ token: jwt.crearToken(usuario) });

      // Oculta la contraseña al devolver los datos
      usuario.contrasena = undefined;
      // Devuelve los datos del usuario
      return res.status(200).json({ usuario });
    }

    return res.status(200).json({ mensaje: '¡El usuario no se ha podido identificar!' });
  }

  return res.status(200).json({ mensaje: '¡El usuario no se ha podido identificar!' });
};

controller.actualizarUsuario = async (req, res) => {
  const { idUsuario } = req.params;

  // Elimina la propiedad contrasena
  delete req.body.contrasena;

  // Controla que no se pueda editar los datos de otro usuario
  if (idUsuario !== req.usuario.sub) return res.status(500).json({ mensaje: '¡No tienes permisos para actualizar los datos de este usuario!' });

  const usuarioDuplicado = await Usuario.find({ $or: [{ correo: req.body.correo }, { nombreUsuario: req.body.nombreUsuario }] });

  let configuracionUsuario = false;

  usuarioDuplicado.forEach((usuario) => {
    if (usuario && usuario._id !== idUsuario) configuracionUsuario = true;
  });

  if (configuracionUsuario) return res.status(404).json({ mensaje: '¡Los datos ya se encuentran en uso!' });

  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuario, req.body, { new: true });

    if (!usuarioActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el usuario!' });

    return res.status(200).json({ usuario: usuarioActualizado });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

async function eliminarArchivosSubidos(res, imagenPath, mensaje) {
  await fs.unlink(imagenPath);
  res.status(500).json({ mensaje });
}

controller.subirImagenUsuario = async (req, res) => {
  const { idUsuario } = req.params;

  // Dirección donde se encuentra la imágen
  const imagenTempPath = req.file.path;
  // Extensión de la imágen
  const ext = path.extname(req.file.originalname).toLowerCase();
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const objetivoPath = path.resolve(`src/public/uploads/usuarios/${req.file.originalname}`);

  // Controla que no se pueda editar los datos de otro usuario
  if (idUsuario !== req.usuario.sub) return eliminarArchivosSubidos(res, imagenTempPath, 'No tienes permisos para actualizar los datos de este usuario!');

  try {
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
      await fs.rename(imagenTempPath, objetivoPath);

      const usuarioActualizado = await Usuario.findByIdAndUpdate(idUsuario, { imagen: req.file.originalname }, { new: true });

      if (!usuarioActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el usuario!' });

      return res.status(200).json({ usuario: usuarioActualizado });
    }

    return eliminarArchivosSubidos(res, imagenTempPath, '¡Extensión no válida!');
  } catch (error) {
    console.log(error);
  }
};

controller.obtenerImagenUsuario = async (req, res) => {
  const { imagen } = req.params;
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const imagenPath = path.resolve(`src/public/uploads/usuarios/${imagen}`);

  // Devuelve true si la imágen existe o false si no existe
  const existe = await fs.exists(imagenPath);

  if (existe) return res.sendFile(imagenPath);

  return res.status(200).json({ mensaje: '¡La imágen no existe!' });
};

export default controller;
