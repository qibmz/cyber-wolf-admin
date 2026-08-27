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
    nickname: string;
  };

  type AuthResetPasswordDto = {
    password: string;
    hash: string;
  };

  type AuthUpdateDto = {
    photo?: FileDto;
    nickname?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
  };

  type CreateNewsArticleDto = {
    sourceName: string;
    sourceId: string;
    publishedAt: string;
    coverImage?: string;
    category: string;
    url: string;
    summary: string;
    title: string;
  };

  type CreateNewsCategoryDto = {
    name: string;
    /** 越小越靠前 */
    sortOrder?: number;
  };

  type CreateUserDto = {
    nickname?: string;
    email: string;
    password: string;
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
    total: number;
  };

  type InfinityPaginationNewsCategoryResponseDto = {
    data: NewsCategory[];
    hasNextPage: boolean;
    total: number;
  };

  type InfinityPaginationUserResponseDto = {
    data: User[];
    hasNextPage: boolean;
    total: number;
  };

  type LoginResponseDto = {
    token: string;
    refreshToken: string;
    tokenExpires: number;
    user: User;
  };

  type NewsArticle = {
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
    deletedAt?: Record<string, any>;
  };

  type NewsArticlesAdminControllerFindAllV1Params = {
    page?: number;
    limit?: number;
    /** 按分类筛选（如 Market / Technology） */
    category?: string;
    /** all=全部，notDeleted=未删除，deleted=已删除；默认 notDeleted */
    deletedStatus?: "all" | "notDeleted" | "deleted";
  };

  type NewsArticlesAdminControllerFindByIdV1Params = {
    id: string;
  };

  type NewsArticlesAdminControllerRemoveV1Params = {
    id: string;
  };

  type NewsArticlesAdminControllerRestoreV1Params = {
    id: string;
  };

  type NewsArticlesAdminControllerUpdateV1Params = {
    id: string;
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

  type NewsCategoriesAdminControllerFindAllV1Params = {
    page?: number;
    limit?: number;
    /** all=全部，notDeleted=未删除，deleted=已删除；默认 notDeleted */
    deletedStatus?: "all" | "notDeleted" | "deleted";
  };

  type NewsCategoriesAdminControllerFindByIdV1Params = {
    id: string;
  };

  type NewsCategoriesAdminControllerRemoveV1Params = {
    id: string;
  };

  type NewsCategoriesAdminControllerRestoreV1Params = {
    id: string;
  };

  type NewsCategoriesAdminControllerUpdateV1Params = {
    id: string;
  };

  type NewsCategory = {
    name: string;
    sortOrder: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: Record<string, any>;
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
    id: number;
  };

  type Status = {
    id: number;
    name: string;
  };

  type StatusDto = {
    id: number;
  };

  type UpdateNewsArticleDto = {
    sourceName?: string;
    sourceId?: string;
    publishedAt?: string;
    coverImage?: string;
    category?: string;
    url?: string;
    summary?: string;
    title?: string;
  };

  type UpdateNewsCategoryDto = {
    name?: string;
    /** 越小越靠前 */
    sortOrder?: number;
  };

  type UpdateUserDto = {
    nickname?: string;
    email?: string;
    password?: string;
    photo?: FileDto;
    role?: RoleDto;
    status?: StatusDto;
  };

  type User = {
    nickname: string;
    id: number;
    email: string;
    provider: string;
    socialId: string;
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
