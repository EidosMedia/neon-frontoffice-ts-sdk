import { RagOnItemsResponse } from '../types/content';
import { makePostRequest } from '../utilities/http-client';

export type AskAboutContentsOptions = {
    query: string;
    ids?: string[];
    headers?: {
        Authorization?: string;
        'neon-fo-access-key'?: string;
    };
    baseUrl: string;
};


export async function askAboutContents({  query, ids , headers, baseUrl, }: AskAboutContentsOptions): Promise<RagOnItemsResponse> {
  
    const req = await makePostRequest(
      `${baseUrl}/api/augmented-search/public/liveindex/rag?query=${query}`,
      JSON.stringify(ids),
      {
        method: 'POST',
        headers: headers,
     }
    );
  
    return req;
  }