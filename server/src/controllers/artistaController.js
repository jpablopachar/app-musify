import mongoosePagination from 'mongoose-pagination';

import fs from 'fs-extra';
import path from 'path';

import Artista from '../models/artista';
import Album from '../models/album';
import Cancion from '../models/cancion';

const controller = {};

controller.guardarArtista = async (req, res) => {
  const {
    nombres,
    descripcion,
    correo,
  } = req.body;
  const artista = new Artista();

  if (nombres && correo) {
    artista.nombres = nombres;
    artista.descripcion = descripcion;
    artista.correo = correo;
    artista.imagen = null;

    try {
      const artistaDuplicado = await Artista.find({ artista: artista.nombres });

      // Control de artistas duplicados
      if (artistaDuplicado.length >= 1) return res.status(200).json({ mensaje: '¡El artista ya existe!' });

      await artista.save();

      return res.status(200).json({ artista });
    } catch (error) {
      console.log(error);
    }
  }

  return res.status(200).json({ mensaje: '¡Debes enviar todos los campos necesarios!' });
};

controller.obtenerArtistas = (req, res) => {
  let pagina = 1;
  const elementosPorPagina = 5;

  if (req.params.pagina) pagina = req.params.pagina;

  Artista.find().sort('nombres').paginate(pagina, elementosPorPagina, (error, artistas, total) => {
    if (error) return res.status(500).json({ mensaje: 'Error en la petición' });

    if (!artistas) return res.status(404).json({ mensaje: '¡No existen artistas disponibles!' });

    return res.status(200).json({
      artistas,
      total,
      paginas: Math.ceil(total / elementosPorPagina),
    });
  });
};

controller.obtenerArtista = async (req, res) => {
  const { idArtista } = req.params;

  try {
    const artista = await Artista.findById(idArtista);

    // Cuando no existe el artista
    if (!artista) return res.status(404).json({ mensaje: 'El artista no existe' });

    return res.status(200).json({ artista });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.actualizarArtista = async (req, res) => {
  const { idArtista } = req.params;

  try {
    const artistaActualizado = await Artista.findByIdAndUpdate(idArtista, req.body, { new: true });

    if (!artistaActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el artista!' });

    return res.status(200).json({ artista: artistaActualizado });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

controller.eliminarArtista = async (req, res) => {
  try {
    const artistaEliminado = await Artista.findByIdAndRemove({ _id: req.params.idArtista });

    if (!artistaEliminado) return res.status(404).json({ mensaje: '¡No se ha podido eliminar el artista!' });

    const albumEliminado = await Album.find({ artista: artistaEliminado._id }).remove();

    if (!albumEliminado) {
      res.status(404).json({ mensaje: '¡No se ha podido eliminar el album!' });
    } else {
      const cancionEliminada = await Cancion.find({ album: albumEliminado._id }).remove();

      if (!cancionEliminada) return res.status(404).json({ mensaje: '¡No se ha podido eliminar las canciones!' });
    }

    return res.status(200).json({ artista: artistaEliminado });
  } catch (error) {
    return res.status(505).json({ mensaje: 'Error en la petición' });
  }
};

async function eliminarArchivosSubidos(res, imagenPath, mensaje) {
  await fs.unlink(imagenPath);
  res.status(500).json({ mensaje });
}

controller.subirImagenArtista = async (req, res) => {
  const { idArtista } = req.params;

  // Dirección donde se encuentra la imágen
  const imagenTempPath = req.file.path;
  // Extensión de la imágen
  const ext = path.extname(req.file.originalname).toLowerCase();
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const objetivoPath = path.resolve(`src/public/uploads/artistas/${req.file.originalname}`);

  // Controla que no se pueda editar los datos de otro usuario
  /* if (idUsuario !== req.usuario.sub) return eliminarArchivosSubidos(res, imagenTempPath, 'No tienes permisos para actualizar los datos de este usuario!'); */

  try {
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
      await fs.rename(imagenTempPath, objetivoPath);

      const artistaActualizado = await Artista.findByIdAndUpdate(idArtista, { imagen: req.file.originalname }, { new: true });

      if (!artistaActualizado) return res.status(404).json({ mensaje: '¡No se ha podido actualizar el artista!' });

      return res.status(200).json({ artista: artistaActualizado });
    }

    return eliminarArchivosSubidos(res, imagenTempPath, '¡Extensión no válida!');
  } catch (error) {
    return console.log(error);
  }
};

controller.obtenerImagenArtista = async (req, res) => {
  const { imagen } = req.params;
  // Dirección donde se desea ubicar la imágen para obtener y mostrar
  const imagenPath = path.resolve(`src/public/uploads/artistas/${imagen}`);

  // Devuelve true si la imágen existe o false si no existe
  const existe = await fs.exists(imagenPath);

  if (existe) return res.sendFile(imagenPath);

  return res.status(200).json({ mensaje: '¡La imágen no existe!' });
};

export default controller;
