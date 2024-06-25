import { Document, Model } from 'mongoose';
import { Sort } from '../types';

export const getPaginatedDocuments = async <T extends Document>(
  model: Model<T>,
  filter: object,
  sort: Sort,
  page: string,
  size: string,
) => {
  const sizeNum = Number(size),
    pageNum = Number(page);

  const totalCount = await model.countDocuments(filter).exec();
  const totalPage = Math.ceil(totalCount / sizeNum);

  const documents: T[] = await model
    .find(filter)
    .sort({ createdAt: sort })
    .skip((pageNum - 1) * sizeNum)
    .limit(sizeNum)
    .exec();

  return { totalCount, totalPage, documents, pageNum };
};
