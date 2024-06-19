export interface IUser extends Document {
  _id?: string;
  kakaoId: string;
  name: string;
  password: string;
  thumbnail: string;
  role: 'User' | 'Admin';
  createdAt: number;
}
