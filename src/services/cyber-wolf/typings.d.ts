declare namespace API {
  type AuthConfirmEmailDto = {
    hash: string;
  };

  type AuthEmailLoginDto = {
    email: string;
    password: string;
  };

  type AuthForgotPasswordDto = {
    email: string;
  };

  type AuthGoogleLoginDto = {
    idToken: string;
  };

  type AuthRegisterLoginDto = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };

  type AuthResetPasswordDto = {
    password: string;
    hash: string;
  };

  type AuthUpdateDto = {
    photo?: FileDto;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
  };

  type CreateUserDto = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    photo?: FileDto;
    role?: RoleDto;
    status?: StatusDto;
  };

  type FileDto = {
    id: string;
  };

  type FileResponseDto = {
    file: FileType;
  };

  type FileType = {
    id: string;
    path: string;
  };

  type InfinityPaginationNewsArticleResponseDto = {
    data: NewsArticle[];
    hasNextPage: boolean;
  };

  type InfinityPaginationUserResponseDto = {
    data: User[];
    hasNextPage: boolean;
  };

  type LoginResponseDto = {
    token: string;
    refreshToken: string;
    tokenExpires: number;
    user: User;
  };

  type NewsArticle = {
    coverColor: string;
    sourceName: string;
    sourceId: string;
    publishedAt: string;
    coverImage?: string;
    category: string;
    url: string;
    summary: string;
    title: string;
    id: string;
    createdAt: string;
    updatedAt: string;
  };

  type NewsArticlesControllerFindAllV1Params = {
    page?: number;
    limit?: number;
    /** 按分类筛选（如 Market / Technology） */
    category?: string;
  };

  type NewsArticlesControllerFindByIdV1Params = {
    id: string;
  };

  type RefreshResponseDto = {
    token: string;
    refreshToken: string;
    tokenExpires: number;
  };

  type Role = {
    id: number;
    name: string;
  };

  type RoleDto = {
    id: Record<string, any>;
  };

  type Status = {
    id: number;
    name: string;
  };

  type StatusDto = {
    id: Record<string, any>;
  };

  type UpdateUserDto = {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    photo?: FileDto;
    role?: RoleDto;
    status?: StatusDto;
  };

  type User = {
    id: number;
    email: string;
    provider: string;
    socialId: string;
    firstName: string;
    lastName: string;
    photo: FileType;
    role: Role;
    status: Status;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };

  type UsersControllerFindAllV1Params = {
    page?: number;
    limit?: number;
    filters?: string;
    sort?: string;
  };

  type UsersControllerFindOneV1Params = {
    id: string;
  };

  type UsersControllerRemoveV1Params = {
    id: string;
  };

  type UsersControllerUpdateV1Params = {
    id: string;
  };
}
