export interface IUser extends Document {
  kakaoId: string;
  name: string;
  password: string;
  thumbnail: string;
  role: 'User' | 'Admin';
  createdAt: number;
}
