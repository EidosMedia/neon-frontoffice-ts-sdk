import settings from '../commons/settings';
import { Site } from '../types/site';
import { makeRequest } from '../utilities/http-client';
import logger from '../utilities/logger';

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
      logoUrl: await newFunction(site),
      viewStatus: `${viewStatus}`
    }))
  );

  return sitesWithSitemap;

  async function newFunction(site: Site) {
    try{
      return await getLogoUrl(site.root.id, viewStatus === 'live' ? site.apiHostnames.liveHostname : site.apiHostnames.previewHostname);
    }catch(e){
      logger.warn(`logo not found for site ${site.root.name}`);
      return '';
    }
  }
}

export async function getLogoUrl(id: string, liveHostName: string) {
  const requestUrl = `${liveHostName}/api/nodes/${id}`;
  const envProtocol = new URL(settings.neonFeUrl).protocol;

  const logoUrl = `${envProtocol}//${requestUrl}`;

  const response = await makeRequest(logoUrl);

  return response.files?.logo.resourceUrl;
}
