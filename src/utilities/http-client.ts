import settings from '../commons/settings';
import { AuthTokens, ErrorObject } from '../types/base';
import { isValidXML } from './utils';

export async function makeRequest(url: string, params?: RequestInit) {
  const requestUrl = url.startsWith('http') ? url : `${settings.neonFoUrl}${url}`;

  const options = {
    method: params?.method || 'GET',
    url: requestUrl,
    headers: {
      'neon-fo-access-key': settings.frontOfficeServiceKey,
      ...params?.headers,
    },
    body: params?.body,
  };

  const response = await fetch(new URL(requestUrl), options);

  if (!response.ok) {
    try {
      const jsonResp = await response.json();
      throw {
        cause: jsonResp,
        status: response.status,
        url: requestUrl,
      } as ErrorObject;
    } catch {
      throw {
        cause: { message: 'Failed to parse error response' },
        status: response.status,
        url: requestUrl,
      } as ErrorObject;
    }
  }

  if (response.status === 204) {
    return response;
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return response;
}

export async function makeAuthenticatedRequest(url: string, auth: AuthTokens, params?: RequestInit) {
  const authHeaders = {
    Authorization: `Bearer ${auth.editorialAuth || auth.webAuth}`,
    'neon-fo-access-key': settings.frontOfficeServiceKey,
    ...params?.headers,
  };

  return await makeRequest(url, {
    ...params,
    headers: authHeaders,
  });
}

export async function makePostRequest(url: string, payload: string, params?: RequestInit) {
  return await makeRequest(url, {
    method: 'POST',
    body: payload,
    ...params,
  });
}

export async function makePostRequestXMLPayload(url: string, payload: string, params?: RequestInit) {
  if (isValidXML(payload)) {
    throw {
      cause: { message: 'Invalid XML provided' },
      status: 400,
      url,
    } as ErrorObject;
  }

  return await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      ...params?.headers,
    },
    body: payload,
  });
}

export async function makeAuthenticatedPostRequestXMLPayload(
  url: string,
  payload: string,
  auth: AuthTokens,
  contextId: string,
  params?: RequestInit
) {
  if (isValidXML(payload)) {
    throw {
      cause: { message: 'Invalid XML provided' },
      status: 400,
      url,
    } as ErrorObject;
  }

  return await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      Authorization: `Bearer ${auth.editorialAuth || auth.webAuth}`,
      'neon-fo-access-key': settings.frontOfficeServiceKey,
      'update-context-id': contextId,
      ...params?.headers,
    },
    body: payload,
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
