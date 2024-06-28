import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import { FE_URL, MONGODB_URI, PORT, VULTR_HOST } from './constants';
import { errorHandler } from './middlewares';
import comments from './routes/comments';
import contents from './routes/contents';
import kakao from './routes/kakao';
import likes from './routes/likes';
import results from './routes/results';
import shares from './routes/shares';
import uploade from './routes/uploade';
import swaggerFile from './swagger/swagger-output.json' assert { type: 'json' };

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
app.use(errorHandler);

app.use('/api/v1/contents', contents);
app.use('/api/v1/results', results);
app.use('/api/v1/comments', comments);
app.use('/api/v1/likes', likes);
app.use('/api/v1/shares', shares);

app.use('/api/oauth2/kakao', kakao);
app.use('/api/v1/upload', uploade);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(PORT, VULTR_HOST, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

export default app;
