import settings from '../commons/settings';
import { AuthContext, ErrorObject } from '../types/base';
import { isValidXML } from './utils';

type MakeRequestOptions = {
  url: string;
  auth?: AuthContext;
  params?: RequestInit;
  apiHostname?: string;
  convertToJSON?: boolean;
  calculateURL?: boolean;
};

export async function makeRequest({ url, auth, params, apiHostname, convertToJSON=true, calculateURL=true }: MakeRequestOptions) {
  let requestUrl: string;
  if(calculateURL){
    requestUrl = url.startsWith('http') ? url : `${settings.neonFoUrl}${url}`;

    if (apiHostname) {
      requestUrl = new URL(url, apiHostname).toString();
    }
  }else{
    requestUrl = url;
  }

  let authHeaders: Record<string, string> = {};
  if (auth && (auth.webAuth || auth.editorialAuth)) {
    authHeaders = {
      Authorization: `Bearer ${auth.webAuth || auth.editorialAuth}`,
      ...(auth.contextId ? { 'update-context-id': auth.contextId } : {}),
      ...(params?.headers as Record<string, string> | undefined),
    };
  } else if (params?.headers) {
    authHeaders = {
      ...(params.headers as Record<string, string>),
    };
  }

  authHeaders['neon-fo-access-key'] = settings.frontOfficeServiceKey;

  const options: RequestInit = {
    method: params?.method || 'GET',
    headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
    body: params?.body,
    redirect: params?.redirect || 'follow',
    cache: params?.cache || 'default',
  };

  const response = await fetch(requestUrl, options);

  // Enter error handling only if not ok and not a redirect (status 300-399)
  if (!response.ok && (response.status < 300 || response.status >= 400)) {
    try {
      const jsonResp = await response.json();
      throw {
        cause: jsonResp,
        status: response.status,
        url: requestUrl,
      } as ErrorObject;
    } catch (err) {
      // If the error is already an ErrorObject, rethrow it
      if (err && typeof err === 'object' && 'cause' in err && 'status' in err && 'url' in err) {
        throw err;
      }
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

  if (contentType && contentType.includes('application/json') && convertToJSON) {
    return await response.json();
  }

  return response;
}

export async function makePostRequest({ url, auth, params, apiHostname, convertToJSON }: MakeRequestOptions, payload: string) {
  return await makeRequest({
    url,
    auth,
    params: {
      method: 'POST',
      body: payload,
      ...params,
    },
    apiHostname,
    convertToJSON,
  });
}

export async function makePostRequestXMLPayload(
  { url, auth, params, apiHostname }: MakeRequestOptions,
  payload: string
) {
  if (isValidXML(payload)) {
    throw {
      cause: { message: 'Invalid XML provided' },
      status: 400,
      url,
    } as ErrorObject;
  }

  return await makeRequest({
    url,
    auth,
    params: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        ...params?.headers,
      },
      body: payload,
    },
    apiHostname,
  });
}

export async function makePutRequest({ url, auth, params, apiHostname }: MakeRequestOptions, payload: string) {
  return await makeRequest({
    url,
    auth,
    params: {
      method: 'PUT',
      body: payload,
      ...params,
    },
    apiHostname,
  });
}

export async function makeDeleteRequest({ url, auth, params, apiHostname }: MakeRequestOptions) {
  return await makeRequest({
    url,
    auth,
    params: {
      method: 'DELETE',
      body: JSON.stringify(params),
      ...params,
    },
    apiHostname,
  });
}
