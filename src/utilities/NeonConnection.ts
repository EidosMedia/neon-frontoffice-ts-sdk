import settings from '../commons/settings';
import { loadSites } from '../services/sites';
import { Site } from '../types/site';
import { makeRequest } from '../utilities/http-client';

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

  async getLiveSitesList() {
    if (this.sites.length === 0) {
      await this.refreshLiveSites();
    }

    return this.sites;
  }

  async refreshLiveSites() {
    this.sites = await loadSites({ sitemap: true, viewStatus: 'live' });

    return this.sites;
  }

  async getPreviewSitesList() {
    if (this.sites.length === 0) {
      await this.refreshPreviewSites();
    }

    return this.sites;
  }

  async refreshPreviewSites() {
    this.sites = await loadSites({ sitemap: true, viewStatus: 'preview' });

    return this.sites;
  }

  async resolveApiHostname(hostname: string) {
    const sites = await this.getLiveSitesList();

    const siteFound = sites.find((site) => site.root.hostname === hostname);

    if (siteFound) {
      return {
        apiHostname: siteFound.apiHostnames.liveHostname,
        viewStatus: 'LIVE',
      };
    }
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  async getSiteByName(name: string) {
    const sites = await this.getLiveSitesList();

    return sites.find((site) => site.root.name === name);
  }

  async getSiteBySiteId(siteId: string) {
    const sites = await this.getLiveSitesList();
    return sites.find((site) => site.root.id === siteId);
  }

  async previewAuthorization(contentId: string, siteName: string, viewStatus: string, previewToken: string) {
    const options = {
      headers: {
          Authorization: 'Bearer ' + previewToken
      }};

    return await makeRequest(`/api/pages/${contentId}/authorization/${siteName}/${viewStatus}`, options);
  }
}
