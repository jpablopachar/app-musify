import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
}).then((db) => console.log('La base de datos está conectada')).catch((error) => console.log(error));
