import { makeRequest, makePostRequestApiHostname } from '../utilities/http-client';
import { User } from '../types/user';
import { AuthenticatedRequestOptions, ErrorObject } from '../types/base';

export type GetCurrentUserInfoOptions = {} & AuthenticatedRequestOptions;

export type GetUserAvatarOptions = {
  id: string;
} & AuthenticatedRequestOptions;

export type LoginRequestOptions = {
  apiHostname: string; 
  name: string;
  password: string;
  rememberMe?: boolean;
};

export async function getCurrentUserInfo({ auth }: GetCurrentUserInfoOptions): Promise<User> {
  const neonUser = await makeRequest(`/directory/sessions/whoami`, auth);

  const filteredUser: User = {
    name: neonUser.user.name,
    id: neonUser.user.id,
    alias: neonUser.user.alias,
  };

  return filteredUser;
}

export async function getUserAvatar({ id, auth }: GetUserAvatarOptions): Promise<Response> {
  const user = await makeRequest(`/directory/users/picture?id=${id}`, auth);

  return user;
}

export async function login({ apiHostname, name, password, rememberMe=false }: LoginRequestOptions): Promise<Response> {
  const url = `/api/login?rememberMe=${rememberMe}`;

  const options: RequestInit = {
    method: 'POST',
    credentials: 'include', // Important for cookies!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  };

  const response = await makePostRequestApiHostname( apiHostname, url, {}, JSON.stringify({ name, password }), options);

  return response;
}
