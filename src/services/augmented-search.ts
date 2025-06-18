import { AuthenticatedRequestOptions } from '../types/base';
import { RagOnItemsResponse } from '../types/content';
import { makeRequest, makePostRequest} from '../utilities/http-client';

export type AskAboutContentsOptions = {
    query: string;
    ids?: string[];
    baseUrl: string;
} & AuthenticatedRequestOptions;

export type SearchOptions = {
    apiHostname: string;
    searchParams: URLSearchParams;
} & AuthenticatedRequestOptions;

export async function askAboutContents({  query, ids , baseUrl, auth }: AskAboutContentsOptions): Promise<RagOnItemsResponse> {

    const response = await makePostRequest(
      {
        url: `${baseUrl}/api/augmented-search/public/liveindex/rag?query=${query}`,
        auth
      },
      JSON.stringify(ids)
    );

    return response;
  }

  export async function search({ apiHostname, searchParams, auth }: SearchOptions) {
  try {
    const ragsearch = searchParams.get('rag') === 'true';
    const naturalsearch = searchParams.get('rag') === 'false';

    const url = ragsearch || naturalsearch ? '/api/search/natural' : '/api/search';

    if (!(ragsearch || naturalsearch)) {
      searchParams.append('baseType', 'article');
      searchParams.append('baseType', 'liveblog');
    }

    return await makeRequest({
      url: `${url}?${searchParams}`,
      auth,
      apiHostname
    });
  } catch (error) {
    console.log('Error in search POST request:', error);
    return Response.json(
      error instanceof Error && error.cause instanceof Response
        ? { error: error.cause.statusText }
        : { error: 'Internal Server Error' },
      error instanceof Error && error.cause instanceof Response ? { status: error.cause.status } : { status: 500 }
    );
  }
}
