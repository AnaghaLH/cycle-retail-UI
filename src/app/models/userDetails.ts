export interface CreateUserResponse {
    message: string;
    user: {
      userId: number;
      username: string;
      email: string;
      role: string;
    };
  }