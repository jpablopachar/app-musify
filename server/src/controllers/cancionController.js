import fs from 'fs-extra';
import path from 'path';

import Cancion from '../models/cancion';

const controller = {};

controller.guardarCancion = async (req, res) => {
  const {
    numero,
    nombre,
    duracion,
    album,
  } = req.body;
  const cancion = new Cancion();

  if (numero && nombre && duracion) {
    cancion.numero = numero;
    cancion.nombre = nombre;
    cancion.duracion = duracion;
    cancion.archivo = null;
    cancion.album = album;

    try {
      await cancion.save();

      return res.status(200).json({ cancion });
    } catch (error) {
      return res.status(505).json({ mensaje: 'Error en la petición' });
    }
  }

  return res.status(404).json({ mensaje: '¡Debes enviar todos los campos necesarios!' });
};

controller.obtenerCanciones = async (req, res) => {
  const { idAlbum } = req.params;
  let canciones;

  try {
    if (!idAlbum) {
      canciones = await Cancion.find({}).sort('numero').populate({ path: 'album', populate: { path: 'artista', model: 'Artista' } });
    } else {
      canciones = await Cancion.find({ album: idAlbum }).sort('anio').populate({ path: 'album', populate: { path: 'artista', model: 'Artista' } });
    }

    if (!canciones) return res.status(404).json({ mensaje: '¡No existen canciones disponibles!' });

    return res.status(200).json({ canciones });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.obtenerCancion = async (req, res) => {
  const { idCancion } = req.params;
  console.log(idCancion);

  try {
    const cancion = await Cancion.findById(idCancion).populate('album');

    if (!cancion) return res.status(404).json({ mensaje: 'La cancion no existe' });

    return res.status(200).json({ cancion });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.actualizarCancion = async (req, res) => {
  const { idCancion } = req.params;

  try {
    const cancionActualizada = await Cancion.findByIdAndUpdate(idCancion, req.body, { new: true });

    if (!cancionActualizada) return res.status(404).json({ mensaje: '¡No se ha podido actualizar la cancion!' });

    return res.status(200).json({ cancion: cancionActualizada });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.eliminarCancion = async (req, res) => {
  try {
    const cancionEliminada = await Cancion.findByIdAndRemove(req.params.idCancion);

    if (!cancionEliminada) return res.status(404).json({ mensaje: '¡No se ha podido eliminar la cancion!' });

    return res.status(200).json({ cancion: cancionEliminada });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

async function eliminarArchivosSubidos(res, imagenPath, mensaje) {
  await fs.unlink(imagenPath);
  res.status(500).json({ mensaje });
}

controller.subirCancion = async (req, res) => {
  const { idCancion } = req.params;

  // Dirección donde se encuentra la imágen
  const musicaTempPath = req.file.path;
  // Extensión de la imágen
  const ext = path.extname(req.file.originalname).toLowerCase();
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const objetivoPath = path.resolve(`src/public/uploads/canciones/${req.file.originalname}`);

  try {
    if (ext === '.mp3' || ext === '.ogg') {
      await fs.rename(musicaTempPath, objetivoPath);

      const cancionActualizada = await Cancion.findByIdAndUpdate(idCancion, { archivo: req.file.originalname }, { new: true });

      if (!cancionActualizada) return res.status(404).json({ mensaje: '¡No se ha podido actualizar la cancion!' });

      return res.status(200).json({ album: cancionActualizada });
    }

    return eliminarArchivosSubidos(res, musicaTempPath, '¡Extensión no válida!');
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.obtenerArchivoCancion = async (req, res) => {
  const { cancion } = req.params;
  // Dirección donde se desea ubicar la cancion para obtener y mostrar
  const archivoPath = path.resolve(`src/public/uploads/canciones/${cancion}`);

  try {
    // Devuelve true si la imágen existe o false si no existe
    const existe = await fs.exists(archivoPath);

    if (!existe) return res.status(404).json({ mensaje: '¡La cancion no existe!' });

    return res.sendFile(archivoPath);
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

export default controller;
