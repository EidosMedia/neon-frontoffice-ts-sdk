import { makeRequest } from '../utilities/http-client';

export type PromoteContentLiveOptions = {
  id: string;
  headers: {
    Authorization: string;
  };
  baseUrl: string;
};

export async function promoteContentLive({ id, headers, baseUrl }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${baseUrl}/api/contents/nodes/${id}/promote/live`, {
    method: 'POST',
    headers,
  });

  return req;
}

export async function unpromoteContentLive({ id, headers, baseUrl }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${baseUrl}/api/contents/nodes/${id}/promote/live`, {
    method: 'DELETE',
    headers,
  });

  return req;
}
