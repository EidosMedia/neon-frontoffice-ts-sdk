import settings from '../commons/settings';
import { loadSites } from '../services/sites';
import { Site } from '../types/site';
import { makeRequest } from './http-client';
import { PageData, WebpageModel, WebpageNodeModel } from '../types/content';
import { VERSIONS } from "../conf/versions";

type NeonConnectionParams = {
  frontOfficeServiceKey: string;
  neonFeUrl: string;
};

type BackendInfo = {
  type: string;
  version: string;
  state: string;
}

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

  async getDwxLinkedObjects(pageData: PageData<WebpageModel>, zoneName?: string): Promise<WebpageNodeModel[]> {
    const zones = Object.keys(pageData.model.data.links?.pagelink || []);

    let linkedObjects: WebpageNodeModel[] = [];

    if (!zoneName || !zones.length || !pageData.model.data.links?.pagelink[zoneName]) {
      return linkedObjects;
    }

    try {
        linkedObjects = pageData.model.data.links?.pagelink[zoneName].map(link => {
            const webPageBaseNode = pageData.model.nodes[link.targetId];

            const mainPicureId = webPageBaseNode?.links?.system?.mainPicture[0].targetId;
            const mainPicuretNode = pageData.model.nodes[mainPicureId];

            const webpageNode: WebpageNodeModel = {
              ...webPageBaseNode,
              mainPicture: mainPicuretNode?.resourceUrl
            };

            return webpageNode;
        });
    } catch (e) {
      throw new Error(`Error during retrieving Dwx linked objects: ${e}`);
    }

    return linkedObjects;
  };

  async getBackendInfo(): Promise<BackendInfo> {
    try {
      const response = await makeRequest('/api');
      return response as BackendInfo;
    } catch (error) {
      console.error('Failed to fetch backend info:', error);
      throw new Error('Error retrieving backend info');
    }
  };

  async startup() {
    const backendInfo = await this.getBackendInfo();
    const backendVersion = backendInfo.version;

    if (!VERSIONS.includes(backendVersion)) {
      throw new Error(`Incompatible backend version: ${backendVersion}`);
    }

    console.log(`Backend version ${backendVersion} is compatible.`);

    const sites = await this.getLiveSitesList();

    if (!sites || sites.length === 0) {
      throw new Error('Failed to retrieve sites data.');
    }

    console.log(`Successfully retrieved ${sites.length} sites.`);
  }
}