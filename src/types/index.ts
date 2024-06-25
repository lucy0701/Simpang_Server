export * from './auth';

export type ContentType = 'MBTI';
export type ShareType = 'Kakao' | 'Link';
export type Sort = 'asc' | 'desc';

export type PaginationOptions = {
  size: string;
  page: string;
  sort?: Sort;
};
