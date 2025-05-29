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
    'update-context-id'?: string;
  };
  baseUrl: string;
};

export type RollbackVersionOptions = {
  version: string;
  rollbackLinks: boolean;
  rollbackMetadata: boolean;
  headers: {
    Authorization: string;
    'update-context-id': string;
    'Content-Type': string;
  };
};

export async function promoteContentLive({ id, headers, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live=${sites}`, {
    method: 'POST',
    headers,
  });

  return req;
}

export async function rollbackVersion(neonFoUrl: string,  { version, rollbackLinks, rollbackMetadata, headers }: RollbackVersionOptions): Promise<Response> {
  /*

    private final NodeRef versionToRollback;

    private boolean rollbackSystemAttributes = true;
    private boolean rollbackAttributes = true;
    private boolean rollbackLinks = true;

    private NodeRetrieveOptions options;

  */
  
  const payload = {
    versionToRollback: version,
    rollbackLinks : rollbackLinks,
    rollbackAttributes: rollbackMetadata,
    rollbackSystemAttributes: true, // Assuming we want to rollback system attributes by default
    options: {  
        showPath: false,
        showXml: false,
        showSystemAttributes: false,
        showAttributes: false,
        showLinkedContents: false,
        includeDiscarded: false,
        showLoadPublishInfo: false,
        resolveContainer: false,
    }
  };
  
  const req = await makeRequest(`${neonFoUrl}/api/contents/nodes/rollback`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  return req;
}


export async function unpromoteContentLive({ id, headers, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(`${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`, {
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
