import settings from '../commons/settings';
import { Site, Menu } from '../types/site';
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
      viewStatus: `${viewStatus}`,
      menus: await newFunction2(site)
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

  async function newFunction2(site: Site) {
    try{
      const menus = await getMenu(
        viewStatus === 'live'
          ? site.apiHostnames.liveHostname
          : site.apiHostnames.previewHostname
      );

      // Try to find possible keys containing menu items
      if (menus && typeof menus === 'object') {
        // Log all keys and their values
        Object.keys(menus).forEach(key => {
          const menuValue = menus[key as keyof typeof menus];
          if (Array.isArray(menuValue)) {
            logMenuItems(menuValue);
          }
        });
      }

      // Helper to recursively log all menu items
      function logMenuItems(items: any[]) {
        if (!Array.isArray(items)) return;
        items.forEach(item => {
          if (item.type === 'SECTION' && item.ref) {
            const nodesArray = site.nodes ? Object.values(site.nodes) : [];
            const node = nodesArray.find((n: any) => n.id === item.ref);

            if (node && node.url) {
              item.url = node.url;
            } 
          }
          // Recursively handle children items
          if (item.items && Array.isArray(item.items)) {
            logMenuItems(item.items);
          }
        });
      }

      return menus;
    }catch(e){
      logger.warn(`menu not found for site ${site.root.name} error: ${e}`);
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

export async function getMenu(liveHostName: string) : Promise<Menu> {
  const requestUrl = `${liveHostName}/api/menus`;
  const envProtocol = new URL(settings.neonFeUrl).protocol;

  const menuUrl = `${envProtocol}//${requestUrl}`;

  const response = await fetch(menuUrl);
  return response.json();
}

