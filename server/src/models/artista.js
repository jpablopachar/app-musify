import mongoose from 'mongoose';

const { Schema } = mongoose;

const ArtistaSchema = new Schema({
  nombres: { type: String, required: true },
  descripcion: { type: String },
  correo: { type: String, required: true },
  imagen: { type: String },
});

export default mongoose.model('Artista', ArtistaSchema);
