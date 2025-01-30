import { makeRequest } from '../../utilities/http-client';

export async function getLogoUrl(id: string, liveHostName: string) {
  const requestUrl = `${liveHostName}/api/nodes/${id}`;
  const envProtocol = new URL(process.env.BASE_NEON_FE_URL || '').protocol;

  const logoUrl = `${envProtocol}//${requestUrl}`;

  const options = {
    method: 'GET',
    headers: {
      'neon-fo-access-key': process.env.NEON_API_KEY || '',
    },
  };

  try {
    const response = await makeRequest(logoUrl, options);

    return response.files?.logo.resourceUrl;
  } catch (err) {
    console.error('Error fetching logo URL: ', logoUrl, err);
    return '';
  }
}
