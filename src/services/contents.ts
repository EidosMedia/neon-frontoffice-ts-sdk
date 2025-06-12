import settings from '../commons/settings';
import { AuthenticatedRequestOptions } from '../types/base';
import {
  makeRequest,
  makePostRequestXMLPayload,
} from '../utilities/http-client';

export type PromoteContentLiveOptions = {
  id: string;

  sites: string;
} & AuthenticatedRequestOptions;

export type UpdateContentItemOptions = {
  id: string;
  contentItemId: string;
  payload: string;
} & AuthenticatedRequestOptions;

export type RollbackVersionOptions = {
  version: string;
  rollbackLinks: boolean;
  rollbackMetadata: boolean;
} & AuthenticatedRequestOptions;

export async function promoteContentLive({ id, auth, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(
    `${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`,
    auth,
    {
      method: 'POST',
    }
  );

  return req;
}

export async function rollbackVersion(
  neonFoUrl: string,
  { version, rollbackLinks, rollbackMetadata, auth }: RollbackVersionOptions
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

  const req = await makeRequest(`${neonFoUrl}/api/contents/nodes/rollback`, auth, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return req;
}

export async function unpromoteContentLive({ id, auth, sites }: PromoteContentLiveOptions): Promise<Response> {
  const req = await makeRequest(
    `${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`,
    auth,
    {
      method: 'DELETE',
    }
  );

  return req;
}

export async function updateContentItem({
  id,
  contentItemId,
  payload,
  auth,
}: UpdateContentItemOptions): Promise<Response> {
  const req = await makePostRequestXMLPayload(
    `${settings.neonFoUrl}/api/contents/story/${id}/contentitem/${contentItemId}?saveMode=MINOR_CHECKIN&keepCheckedout=false`,
    auth,
    payload,
    {
      method: 'POST',
    }
  );

  return req;
}
