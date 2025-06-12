import { AuthenticatedRequestOptions } from '../types/base';
import { RagOnItemsResponse } from '../types/content';
import { makePostRequest } from '../utilities/http-client';

export type AskAboutContentsOptions = {
    query: string;
    ids?: string[];
    baseUrl: string;
} & AuthenticatedRequestOptions;


export async function askAboutContents({  query, ids , baseUrl, auth }: AskAboutContentsOptions): Promise<RagOnItemsResponse> {

    const req = await makePostRequest(
      `${baseUrl}/api/augmented-search/public/liveindex/rag?query=${query}`,
      auth,
      JSON.stringify(ids),
      {
        method: 'POST',
     }
    );

    return req;
  }