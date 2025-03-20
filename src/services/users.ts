import { makeRequest } from '../utilities/http-client';
import { User } from '../types/user';

export async function getCurrentUserInfo({ headers }): Promise<User> {
  const neonUser = await makeRequest(`/directory/sessions/whoami`, {
    headers,
  });

  const filteredUser: User = {
    name: neonUser.user.name,
    avatarUrl: neonUser.user.avatarUrl,
  };

  return filteredUser;
}

export async function getUserAvatar({ headers, id }) {
  const user = await makeRequest(`/directory/users/picture?id=${id}`, {
    headers,
  });

  return user;
}
