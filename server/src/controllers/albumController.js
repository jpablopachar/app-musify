import fs from 'fs-extra';
import path from 'path';

import Album from '../models/album';
import Cancion from '../models/cancion';

const controller = {};

controller.guardarAlbum = async (req, res) => {
  const {
    titulo,
    descripcion,
    anio,
    artista,
  } = req.body;
  const album = new Album();

  if (titulo && anio) {
    album.titulo = titulo;
    album.descripcion = descripcion;
    album.anio = anio;
    album.imagen = null;
    album.artista = artista;

    try {
      await album.save();

      return res.status(200).json({ album });
    } catch (error) {
      console.log(error);
    }
  }

  return res.status(200).json({ mensaje: '¡Debes enviar todos los campos necesarios!' });
};

controller.obtenerAlbumes = async (req, res) => {
  const { idArtista } = req.params;
  let albumes;

  try {
    if (!idArtista) {
      albumes = await Album.find({}).sort('titulo').populate('artista');
    } else {
      albumes = await Album.find({ artista: idArtista }).sort('anio').populate('artista');
    }

    if (!albumes) return res.status(404).json({ mensaje: '¡No existen albumes disponibles!' });

    return res.status(200).json({ albumes });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.obtenerAlbum = async (req, res) => {
  const { idAlbum } = req.params;

  try {
    const album = await Album.findById(idAlbum).populate('artista').exec();

    // Cuando no existe el artista
    if (!album) return res.status(404).json({ mensaje: 'El album no existe' });

    return res.status(200).json({ album });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.actualizarAlbum = async (req, res) => {
  const { idAlbum } = req.params;

  try {
    const albumActualizado = await Album.findByIdAndUpdate(idAlbum, req.body, { new: true });

    if (!albumActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el album!' });

    return res.status(200).json({ album: albumActualizado });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.eliminarAlbum = async (req, res) => {
  try {
    const albumEliminado = await Album.findByIdAndRemove({ _id: req.params.idAlbum });

    if (!albumEliminado) return res.status(404).json({ mensaje: '¡No se ha podido eliminar el album!' });

    const cancionEliminada = await Cancion.find({ album: albumEliminado._id }).remove();

    if (!cancionEliminada) return res.status(404).json({ mensaje: '¡No se ha podido eliminar las canciones!' });

    return res.status(200).json({ album: albumEliminado });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

async function eliminarArchivosSubidos(res, imagenPath, mensaje) {
  await fs.unlink(imagenPath);
  res.status(500).json({ mensaje });
}

controller.subirImagenAlbum = async (req, res) => {
  const { idAlbum } = req.params;

  // Dirección donde se encuentra la imágen
  const imagenTempPath = req.file.path;
  // Extensión de la imágen
  const ext = path.extname(req.file.originalname).toLowerCase();
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const objetivoPath = path.resolve(`src/public/uploads/albumes/${req.file.originalname}`);

  try {
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
      await fs.rename(imagenTempPath, objetivoPath);

      const albumActualizado = await Album.findByIdAndUpdate(idAlbum, { imagen: req.file.originalname }, { new: true });

      if (!albumActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el album!' });

      return res.status(200).json({ album: albumActualizado });
    }

    return eliminarArchivosSubidos(res, imagenTempPath, '¡Extensión no válida!');
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.obtenerImagenAlbum = async (req, res) => {
  const { imagen } = req.params;
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const imagenPath = path.resolve(`src/public/uploads/albumes/${imagen}`);

  try {
    // Devuelve true si la imágen existe o false si no existe
    const existe = await fs.exists(imagenPath);

    if (!existe) return res.status(404).json({ mensaje: '¡La imágen no existe!' });

    return res.sendFile(imagenPath);
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

export default controller;
