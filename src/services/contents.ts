import settings from '../commons/settings';
import { makeRequest, makePostRequestXMLPayload } from '../utilities/http-client';

export type PromoteContentLiveOptions = {
  id: string;
  headers: {
    Authorization?: string;
  };
  sites: string;
};

export type UpdateContentItemOptions = {
  id: string;
  contentItemId: string;
  payload: string;
  headers: {
    Authorization?: string;
    'update-context-id': string;
  };
  baseUrl: string;
};

export async function promoteContentLive({ id, headers, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${settings.neonFeUrl}/api/contents/nodes/${id}/promote/live=${sites}`, {
    method: 'POST',
    headers,
  });

  return req;
}

export async function unpromoteContentLive({ id, headers, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${settings.neonFeUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`, {
    method: 'DELETE',
    headers,
  });

  return req;
}

export async function updateContentItem({
  id,
  contentItemId,
  payload,
  headers,
  baseUrl,
}: UpdateContentItemOptions): Promise<Response> {
  const req = await makePostRequestXMLPayload(
    `${baseUrl}/api/contents/story/${id}/contentitem/${contentItemId}?saveMode=MINOR_CHECKIN&keepCheckedout=false`,
    payload,
    {
      method: 'POST',
      headers,
    }
  );

  return req;
}
