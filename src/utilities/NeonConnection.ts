import settings from '../commons/settings';
import { loadSites, getLiveBlogsPosts, LiveBlogPostsRequestOptions } from '../services/sites';
import { Site, SiteNode } from '../types/site';
import { makeRequest } from './http-client';
import { PageData, RagOnItemsResponse, WebpageModel, WebpageNodeModel } from '../types/content';
import { VERSIONS } from '../conf/versions';
import { getCurrentUserInfo, GetCurrentUserInfoOptions, getUserAvatar, GetUserAvatarOptions, LoginRequestOptions, login } from '../services/users';
import { promoteContentLive, unpromoteContentLive, updateContentItem, PromoteContentLiveOptions, UpdateContentItemOptions, rollbackVersion, RollbackVersionOptions} from '../services/contents';
import { User } from '../types/user';
import { askAboutContents, AskAboutContentsOptions, SearchOptions, search } from '../services/augmented-search';
import { AuthTokens } from '../types/base';

type NeonConnectionParams = {
  frontOfficeServiceKey: string;
  neonFoUrl: string;
};

type BackendInfo = {
  type: string;
  version: string;
  state: string;
};

export class NeonConnection {
  RELOAD_ATTEMPT_TIME = 10000;
  sites: Site[] = [];
  lastLoadSites: Date = new Date(1970,0,1,0,0,0,0);
  frontOfficeServiceKey = '';

  constructor({ frontOfficeServiceKey, neonFoUrl }: NeonConnectionParams) {
    settings.neonFoUrl = neonFoUrl;
    settings.frontOfficeServiceKey = frontOfficeServiceKey;
  }

  async getCurrentUserInfo(options: GetCurrentUserInfoOptions): Promise<User> {
    return await getCurrentUserInfo(options);
  }

  async getUserAvatar(options: GetUserAvatarOptions): Promise<Response> {
    return await getUserAvatar(options);
  }

  async promoteContentLive(options: PromoteContentLiveOptions): Promise<Response> {
    return await promoteContentLive(options);
  }

  async unpromoteContentLive(options: PromoteContentLiveOptions): Promise<Response> {
    return await unpromoteContentLive(options);
  }

  async updateContentItem(options: UpdateContentItemOptions): Promise<Response> {
    return await updateContentItem(options);
  }

  async askAboutContents(options: AskAboutContentsOptions): Promise<RagOnItemsResponse> {
    return await askAboutContents(options);
  }

  async rollbackVersion(options: RollbackVersionOptions): Promise<Response> {
    return await rollbackVersion(settings.neonFoUrl, options);
  }

  async getLiveBlogsPosts(options: LiveBlogPostsRequestOptions): Promise<Response> {
    return await getLiveBlogsPosts(options);
  }

  async login(options: LoginRequestOptions): Promise<Response> {
    return await login(options);
  }

  async getSitesList() {
    if (this.sites.length === 0) {
      const liveSites = await this.refreshLiveSites();
      const previewSites = await this.refreshPreviewSites();
      this.sites = [...liveSites, ...previewSites];
      this.lastLoadSites = new Date();
    }

    return this.sites;
  }

  async search(options: SearchOptions){
    return await search(options);
  }

  async refreshLiveSites() {
    this.sites = await loadSites({ sitemap: true, viewStatus: 'live' });

    return this.sites;
  }

  async refreshPreviewSites() {
    this.sites = await loadSites({ sitemap: true, viewStatus: 'preview' });

    return this.sites;
  }

  async resolveApiHostname(hostname: string) : Promise<{ apiHostname: string; viewStatus: string; root: SiteNode }> {
    const sites = await this.getSitesList();

    const siteFound = sites.find(site => site.root.hostname === hostname);

    if (siteFound) {
      if (siteFound.viewStatus === 'live') {
        return {
          apiHostname: siteFound.apiHostnames.liveHostname,
          viewStatus: 'LIVE',
          root: siteFound.root,
        };
      } else {
        return {
          apiHostname: siteFound.apiHostnames.previewHostname,
          viewStatus: 'PREVIEW',
          root: siteFound.root,
        };
      }
    } else {
       // could be that is a new site that is not in the list
       if (this.lastLoadSites < new Date(Date.now() - this.RELOAD_ATTEMPT_TIME)) {
          // reload the sites list if the last load was more than 10 seconds ago
          console.log(`Reloading sites list... because hostname ${hostname} not found`);
          const liveSites = await this.refreshLiveSites();
          const previewSites = await this.refreshPreviewSites();
          this.sites = [...liveSites, ...previewSites];
          this.lastLoadSites = new Date();
          return this.resolveApiHostname(hostname);
       }
    }
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  async getSiteByName(name: string) {
    const sites = await this.getSitesList();

    return sites.find(site => site.root.name === name);
  }

  async getSiteBySiteId(siteId: string) {
    const sites = await this.getSitesList();
    return sites.find(site => site.root.id === siteId);
  }

  async previewAuthorization(contentId: string, siteName: string, viewStatus: string, previewToken: string) {
    const auth: AuthTokens = {
      editorialAuth: previewToken,
      webAuth: '',
      contextId: undefined,
    };

    return await makeRequest({ url: `/api/pages/${contentId}/authorization/${siteName}/${viewStatus}`, auth });
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
          mainPicture: mainPicuretNode?.resourceUrl,
        };

        return webpageNode;
      });
    } catch (e) {
      throw new Error(`Error during retrieving Dwx linked objects: ${e}`);
    }

    return linkedObjects;
  }

  async getBackendInfo(): Promise<BackendInfo> {
    try {
      const response = await makeRequest({ url: '/api' });
      return response as BackendInfo;
    } catch (error) {
      console.error('Failed to fetch backend info:', error);
      throw new Error('Error retrieving backend info');
    }
  }

  async startup() {
    const backendInfo = await this.getBackendInfo();
    const backendVersion = backendInfo.version;

    if (!VERSIONS.includes(backendVersion)) {
      throw new Error(`Incompatible backend version: ${backendVersion}`);
    }

    console.log(`Backend version ${backendVersion} is compatible.`);

    const sites = await this.getSitesList();

    if (!sites || sites.length === 0) {
      throw new Error('Failed to retrieve sites data.');
    }

    console.log(`Successfully retrieved ${sites.length} sites.`);
  }
}
