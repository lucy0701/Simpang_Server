export type AuthToken = {
  token_type: string; // 토큰 타입, bearer로 고정
  access_token: string; // 사용자 액세스 토큰 값
  expires_in: string; // 액세스 토큰과 ID 토큰의 만료 시간(초)
  refresh_token: string; // 사용자 리프레시 토큰 값
  refresh_token_expires_in: string; // 리프레시 토큰 만료 시간(초)
};

export type UserInfoResponse = {
  id: number;
  connected_at: Date;
  kakao_account: {
    profile: {
      nickname: string;
      thumbnail_image_url: string;
    };
  };
};

export type Role = 'User' | 'Admin' | 'Creator';
