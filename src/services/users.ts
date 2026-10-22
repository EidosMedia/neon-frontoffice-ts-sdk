import { makeRequest, makePostRequest } from '../utilities/http-client';
import { User, UserWithAuthentication } from '../types/user';
import { AuthenticatedRequestOptions } from '../types/base';
import settings from '../commons/settings';
import logger from '../utilities/logger';

export type GetCurrentUserInfoOptions = {
  apiHostname?: string;
} & AuthenticatedRequestOptions;

export type GetUserAvatarOptions = {
  id: string;
  apiHostname?: string;
} & AuthenticatedRequestOptions;

export type LoginRequestOptions = {
  apiHostname: string;
  name: string;
  password: string;
  rememberMe?: boolean;
};

export async function getCurrentUserInfo({ auth, apiHostname }: GetCurrentUserInfoOptions): Promise<User> {
  const target = apiHostname ?? settings.neonFoUrl;
  const neonUser = await makeRequest({ url: `/directory/sessions/whoami`, auth, apiHostname });
  const response = neonUser instanceof Response ? neonUser : undefined;

  logger.info(
    {
      event: 'whoami-response',
      target,
      hasEditorialAuth: Boolean(auth?.editorialAuth),
      hasWebAuth: Boolean(auth?.webAuth),
      status: response?.status,
      contentType: response?.headers.get('content-type'),
      keys: response ? undefined : Object.keys(neonUser ?? {}),
      hasUser: Boolean(neonUser?.user),
    },
    'whoami response',
  );

  const filteredUser: User = {
    name: neonUser.user.name,
    id: neonUser.user.id,
    alias: neonUser.user.alias,
  };

  return filteredUser;
}

export async function getUserAvatar({ id, auth, apiHostname }: GetUserAvatarOptions): Promise<Response> {
  const user = await makeRequest({ url: `/directory/users/picture?id=${id}`, auth, apiHostname });

  return user;
}

export async function login({
  apiHostname,
  name,
  password,
  rememberMe = false,
}: LoginRequestOptions): Promise<UserWithAuthentication> {
  const url = `/api/login?rememberMe=${rememberMe}`;

  const options: RequestInit = {
    method: 'POST',
    credentials: 'include', // Important for cookies!
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  };

  const response = await makePostRequest(
    { apiHostname, url, params: options, convertToJSON: false },
    JSON.stringify({ name, password }),
  );

  // Get the 'webauth' cookie from the response headers
  let webauthToken = '';
  if (response && response.headers) {
    const cookieHeader = response.headers.get('set-cookie');
    if (cookieHeader) {
      // Find the 'webauth' cookie in the set-cookie header
      const match = cookieHeader.match(/webauth=([^;]+)/);
      if (match) {
        webauthToken = match[1];
      }
    }
  }

  // If response is a Response object, parse JSON body
  let userData: any = response;
  if (typeof Response !== 'undefined' && response instanceof Response) {
    userData = await response.json();
  }

  const filteredUser: UserWithAuthentication = {
    name: userData.name,
    id: userData.id,
    alias: userData.alias,
    email: userData.email,
    webauthToken,
  };

  return filteredUser;
}
