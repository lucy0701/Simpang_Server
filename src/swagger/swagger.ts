import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Simpang',
    description: '심팡의 API 명세서 입니다!',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:8080',
    },
  ],
  basePath: '/',
  tags: [
    {
      name: 'Content',
      description: 'Content API',
    },
    {
      name: 'Rusult',
      description: 'Rusult API',
    },
    {
      name: 'Kakao OAuth',
      description: 'Oauth API',
    },
    {
      name: 'like',
      description: 'like API',
    },
    {
      name: 'Share',
      description: 'Share API',
    },
    {
      name: 'Comment',
      description: 'Comment API',
    },
    {
      name: 'Image upload',
      description: 'Image upload API',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      content: {
        title: '제목',
        content: '내용',
        imageUrls: ['image.url'],
        questions: [
          {
            index: 1,
            question: '질문',
            answers: [
              {
                score: 1,
                text: '대답',
              },
            ],
          },
        ],
        results: [
          {
            result: 'INTP',
            title: 'INTP입니다',
            content: '착해요',
          },
        ],
        type: 'content type',
      },
    },
  },
};

const outputFile = './src/swagger/swagger-output.json';
const routes = ['../app.ts'];

swaggerAutogen({ openapi: '3.0.3' })(outputFile, routes, doc).then(async () => {
  await import('../app');
});
