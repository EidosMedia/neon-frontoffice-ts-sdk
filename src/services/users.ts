import { makeAuthenticatedRequest, makeRequest } from '../utilities/http-client';
import { User } from '../types/user';
import { AuthenticatedRequestOptions } from '../types/base';

export type GetCurrentUserInfoOptions = {} & AuthenticatedRequestOptions;

export type GetUserAvatarOptions = {
  id: string;
} & AuthenticatedRequestOptions;

export async function getCurrentUserInfo({ auth }: GetCurrentUserInfoOptions): Promise<User> {
  const neonUser = await makeAuthenticatedRequest(`/directory/sessions/whoami`, auth);

  const filteredUser: User = {
    name: neonUser.user.name,
    id: neonUser.user.id,
    alias: neonUser.user.alias,
  };

  return filteredUser;
}

export async function getUserAvatar({ id, auth }: GetUserAvatarOptions): Promise<Response> {
  const user = await makeAuthenticatedRequest(`/directory/users/picture?id=${id}`, auth);

  return user;
}
