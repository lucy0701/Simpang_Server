import { Document, Model } from 'mongoose';
import { Sort } from '../types';

// export default class Pagination {
//   static validatePagination = (size?: string, page?: string) => {
//     if (!size || !page) {
//       throw new Error('Query parameters are invalid.');
//     }
//     const sizeNum = Number(size);
//     const pageNum = Number(page);
//     if (sizeNum < 1 || pageNum < 1) {
//       throw new Error('Query parameters are invalid.');
//     }

//     return { sizeNum, pageNum };
//   };

//   static paginate = async <T extends Document>(
//     model: Model<T>,
//     filter: object,
//     sort: Sort,
//     page: string,
//     size: string,
//   ) => {
//     const validate = this.validatePagination(size, page);

//     if (typeof validate === 'string') return validate;

//     const { sizeNum, pageNum } = validate;

//     const totalCount = await model.countDocuments(filter).exec();
//     const totalPage = Math.ceil(totalCount / sizeNum);

//     const documents: T[] = await model
//       .find(filter)
//       .sort({ createdAt: sort })
//       .skip((pageNum - 1) * sizeNum)
//       .limit(sizeNum)
//       .exec();

//     return { totalCount, totalPage, documents, pageNum };
//   };
// }

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
