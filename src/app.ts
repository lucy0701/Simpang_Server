import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { FE_URL, MONGODB_URI, PORT } from './constants';
import { errorHandler } from './middlewares/errorHandler';
import contents from './routes/contents';
import results from './routes/results';
import kakaoLogin from './routes/kakaoLogin';

const app = express();

const corsOptions = {
  origin: FE_URL,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Authorization', 'Content-Type'],
};

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongDB 연결 완료!'))
  .catch((err) => console.log(err));

app.set('port', PORT);

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/v1/contents', contents);
app.use('/api/v1/results', results);
app.use('/api/oauth2/kakao', kakaoLogin);

app.use(errorHandler);

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
