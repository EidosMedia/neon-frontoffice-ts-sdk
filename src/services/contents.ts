import settings from '../commons/settings';
import { AuthenticatedRequestOptions } from '../types/base';
import {
  makePostRequest,makeDeleteRequest,
  makePostRequestXMLPayload,
} from '../utilities/http-client';
import { RollbackResponse } from '../types/content';

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
  const response = await makePostRequest(
    {
      url: `${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`,
      auth,
    },'{}' // Empty payload as per the original code
  );

  return response;
}

export async function rollbackVersion(
  neonFoUrl: string,
  { version, rollbackLinks, rollbackMetadata, auth }: RollbackVersionOptions
): Promise<RollbackResponse> {
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

  const response = await makePostRequest(
    { url: `${neonFoUrl}/api/contents/nodes/rollback`, auth, params: { headers: { 'Content-Type': 'application/json', } } },
    JSON.stringify(payload)
  );

  const rollbackResponse: RollbackResponse = {
    nodeRef: response.nodeRef,
  };

  return rollbackResponse;
}

export async function unpromoteContentLive({ id, auth, sites }: PromoteContentLiveOptions): Promise<Response> {
  const response = await makeDeleteRequest({
    url: `${settings.neonFoUrl}/api/contents/nodes/${id}/promote/live?sites=${sites}`,
    auth,
  });

  return response;
}

export async function updateContentItem({
  id,
  contentItemId,
  payload,
  auth,
}: UpdateContentItemOptions): Promise<Response> {
  const response = await makePostRequestXMLPayload(
    {
      url: `${settings.neonFoUrl}/api/contents/story/${id}/contentitem/${contentItemId}?saveMode=MINOR_CHECKIN&keepCheckedout=false`,
      auth,
    },
    payload
  );

  return response;
}
