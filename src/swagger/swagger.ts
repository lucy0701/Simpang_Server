import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'simpang',
    description: '심팡의 서버입니당!',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:8080',
    },
  ],
  tags: [
    {
      name: 'Rusult',
      description: 'result입니다',
    },
  ],
  components: {
    schemas: {
      someSchema: {
        $title: 'Test',
        $content: 'Test content',
        about: '',
      },
    },
  },
  securityDefinitions: {
    type: 'http',
    scheme: 'bearer',
    in: 'header',
    bearerFormat: 'JWT',
  },
};

const outputFile = './src/swagger/swagger-output.json';
const routes = ['../app.ts'];

swaggerAutogen({ openapi: '3.0.3' })(outputFile, routes, doc).then(async () => {
  await import('../app');
});
