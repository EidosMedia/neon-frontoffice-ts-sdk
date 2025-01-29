import settings from '../commons/settings';
import { getLogoUrl } from '../services/sites/sites';
import { Site } from '../types/site';
import { makeRequest } from './http-client';

type NeonConnectionParams = {
  frontOfficeServiceKey: string;
  neonFeUrl: string;
};

export class NeonConnection {
  REVALIDATE_TIMEOUT = 3600;
  sites: Site[] = [];
  neonFeUrl = '';
  frontOfficeServiceKey = '';

  constructor({ frontOfficeServiceKey, neonFeUrl }: NeonConnectionParams) {
    settings.neonFeUrl = neonFeUrl;
    settings.frontOfficeServiceKey = frontOfficeServiceKey;
  }

  async getSiteViewByURL(url: string) {
    return await makeRequest(`/api/site-view?url=${url}`);
  }

  async getSitesList() {
    if (this.sites.length === 0) {
      await this.refreshSites();
    }

    return this.sites;
  }

  async refreshSites() {
    const sites = await makeRequest(
      `/api/sites/live?${new URLSearchParams({
        siteMap: 'true',
      }).toString()}`
    );

    const sitesWithSitemap = await Promise.all(
      sites.map(async (site: Site) => ({
        ...site,
        logoUrl: await getLogoUrl(site.root.id, site.apiHostnames.liveHostname),
      }))
    );

    this.sites = sitesWithSitemap;
    return this.sites;
  }

  async getSiteByHostname(hostname: string) {
    const sites = await this.getSitesList();

    return sites.find((site) => site.root.hostname === hostname);
  }
  async getSiteByName(name: string) {
    const sites = await this.getSitesList();

    return sites.find((site) => site.root.name === name);
  }

  async getSiteBySiteId(siteId: string) {
    const sites = await this.getSitesList();
    return sites.find((site) => site.root.id === siteId);
  }
}
