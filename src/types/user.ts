export type User = {
  name: string;
  avatarUrl?: string;
  id: string;
  alias: string;
};

export type UserWithAuthentication = {
  name: string;
  avatarUrl?: string;
  id: string;
  alias: string;
  email: string;
  webauthToken: string;
};