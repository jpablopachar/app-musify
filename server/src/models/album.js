import mongoose from 'mongoose';

const { Schema } = mongoose;

const AlbumSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  anio: { type: String, required: true },
  imagen: { type: String },
  artista: { type: Schema.ObjectId, ref: 'Artista', required: true },
});

export default mongoose.model('Album', AlbumSchema);
