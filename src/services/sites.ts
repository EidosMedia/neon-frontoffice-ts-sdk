import settings from '../commons/settings';
import { Site } from '../types/site';
import { makeRequest } from '../utilities/http-client';

export async function loadSites({
  sitemap,
  viewStatus,
}: {
  sitemap: boolean;
  viewStatus: string;
}) {
  const sites = await makeRequest(
    `/api/sites/${viewStatus}?${new URLSearchParams({
      siteMap: sitemap.toString(),
    }).toString()}`
  );

  const sitesWithSitemap = await Promise.all(
    sites.map(async (site: Site) => ({
      ...site,
      logoUrl: await getLogoUrl(site.root.id, site.apiHostnames.liveHostname),
    }))
  );

  return sitesWithSitemap;
}

export async function getLogoUrl(id: string, liveHostName: string) {
  const requestUrl = `${liveHostName}/api/nodes/${id}`;
  const envProtocol = new URL(settings.neonFeUrl).protocol;

  const logoUrl = `${envProtocol}//${requestUrl}`;

  try {
    const response = await makeRequest(logoUrl);

    return response.files?.logo.resourceUrl;
  } catch (err) {
    console.error('Error fetching logo URL: ', logoUrl, err);
    return '';
  }
}
