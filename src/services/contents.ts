import settings from '../commons/settings';
import { makeRequest, makeAuthenticatedPostRequestXMLPayload } from '../utilities/http-client';

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
  contextId: string;
  editorialToken: string;
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
  const req = await makeRequest(`${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`, {
    method: 'POST',
    headers,
  });

  return req;
}

export async function rollbackVersion(
  neonFoUrl: string,
  { version, rollbackLinks, rollbackMetadata, headers }: RollbackVersionOptions
): Promise<Response> {
  const payload = {
    versionToRollback: version,
    rollbackLinks: rollbackLinks,
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
    },
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
  // headers,
  contextId,
  editorialToken,
}: UpdateContentItemOptions): Promise<Response> {
  const req = await makeAuthenticatedPostRequestXMLPayload(
    `${settings.neonFoUrl}/api/contents/story/${id}/contentitem/${contentItemId}?saveMode=MINOR_CHECKIN&keepCheckedout=false`,
    editorialToken,
    contextId,
    payload,
    {
      method: 'POST',
    }
  );

  return req;
}
