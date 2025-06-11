import { makeAuthenticatedRequest, makeRequest } from '../utilities/http-client';
import { User } from '../types/user';
import { AuthenticatedRequestOptions } from '../types/base';

export type GetCurrentUserInfoOptions = {} & AuthenticatedRequestOptions;

export type GetUserAvatarOptions = {
  id: string;
} & AuthenticatedRequestOptions;

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

export async function getUserAvatar({ headers, id, editorialAuth }: GetUserAvatarOptions): Promise<Response> {
  const user = await makeAuthenticatedRequest(`/directory/users/picture?id=${id}`, editorialAuth || '', {
    headers,
  });

  return user;
}
