import mongoose from 'mongoose';

const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  nombreUsuario: { type: String, required: true },
  correo: { type: String, required: true },
  contrasena: { type: String, required: true },
  cargo: { type: String, required: true },
  imagen: { type: String },
});

export default mongoose.model('Usuario', UsuarioSchema);
