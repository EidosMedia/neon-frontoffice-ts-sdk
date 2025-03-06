import { makeRequest } from '../utilities/http-client';

export async function getCurrentUserInfo({ headers }) {
  const user = await makeRequest(`/directory/sessions/whoami`, {
    headers,
  });

  return user;
}
