import { makeRequest } from '../utilities/http-client';
import { User } from '../types/user';

export type GetCurrentUserInfoOptions = {
  headers: Record<string, string>;
};

export type GetUserAvatarOptions = {
  headers: Record<string, string>;
  id: string;
};

export async function getCurrentUserInfo({ headers }: GetCurrentUserInfoOptions): Promise<User> {
  const neonUser = await makeRequest(`/directory/sessions/whoami`, {
    headers,
  });

  const filteredUser: User = {
    name: neonUser.user.name,
    id: neonUser.user.id,
    alias: neonUser.user.alias,
  };

  return filteredUser;
}

export async function getUserAvatar({ headers, id }: GetUserAvatarOptions): Promise<Response> {
  const user = await makeRequest(`/directory/users/picture?id=${id}`, {
    headers,
  });

  return user;
}
