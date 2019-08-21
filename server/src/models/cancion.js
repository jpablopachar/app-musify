import mongoose from 'mongoose';

const { Schema } = mongoose;

const CancionSchema = new Schema({
  numero: { type: String, required: true },
  nombre: { type: String, required: true },
  duracion: { type: String, required: true },
  archivo: { type: String },
  album: { type: Schema.ObjectId, ref: 'Album', required: true },
});

export default mongoose.model('Cancion', CancionSchema);
