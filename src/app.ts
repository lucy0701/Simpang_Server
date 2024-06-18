import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { MONGODB_URI, PORT } from './constants';

const app = express();

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongDB 연결 완료!'))
  .catch((err) => console.log(err));

app.set('port', PORT);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
