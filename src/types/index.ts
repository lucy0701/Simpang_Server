export * from './auth';

export type ContentType = 'MBTI' | 'MBTI_mini';
export type Sort = 'asc' | 'desc';

export type PaginationOptions = {
  size: string;
  page: string;
  sort?: Sort;
  filter?: object;
};
