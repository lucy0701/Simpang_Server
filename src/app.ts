import cors from 'cors';
import express from 'express';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import { FE_URL, MONGODB_URI, PORT, SSL_FULL_CERT_PATH, SSL_KEY_PATH } from './constants';
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
  credentials: true,
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

try {
  const serverOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_FULL_CERT_PATH),
  };

  https.createServer(serverOptions, app).listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
  });
} catch (error) {
  console.error('HTTPS 오류 발생', error);
}

export default app;
