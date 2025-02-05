import settings from '../commons/settings';

export async function makeRequest(url: string, params?: RequestInit) {
  const requestUrl = url.startsWith('http')
    ? url
    : `${settings.neonFeUrl}${url}`;

  const options = {
    method: params?.method || 'GET',
    url: requestUrl,
    headers: {
      'neon-fo-access-key': settings.frontOfficeServiceKey,
      ...params?.headers,
    },
  };

  const response = await fetch(new URL(requestUrl), options);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, url: ${requestUrl}`
    );
  }

  if(response.status === 204) {
    return response;
  }

  return await response.json();
}

export async function makePostRequest(url: string, params?: RequestInit) {
  return await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(params),
    ...params,
  });
}

export async function makePutRequest(url: string, params?: RequestInit) {
  return await makeRequest(url, {
    method: 'PUT',
    body: JSON.stringify(params),
    ...params,
  });
}

export async function makeDeleteRequest(url: string, params?: RequestInit) {
  return await makeRequest(url, {
    method: 'DELETE',
    body: JSON.stringify(params),
    ...params,
  });
}
