import settings from '../commons/settings';
import { Site, Menu } from '../types/site';
import { LiveBlogPost } from '../types/content';
import { makeRequest } from '../utilities/http-client';
import logger from '../utilities/logger';
import { AuthenticatedRequestOptions } from '../types/base';

export async function loadSites({ sitemap, viewStatus }: { sitemap: boolean; viewStatus: string }) {
  const sites = await makeRequest({
    url: `/api/sites/${viewStatus}?${new URLSearchParams({
      siteMap: sitemap.toString(),
    }).toString()}`,
  });

  const sitesWithSitemap = await Promise.all(
    sites.map(async (site: Site) => ({
      ...site,
      logoUrl: await fetchLiveLogoUrl(site),
      viewStatus: `${viewStatus}`,
      menus: await fetchLiveMenus(site),
    }))
  );

  return sitesWithSitemap;

  async function fetchLiveLogoUrl(site: Site) {
    try {
      // i cannot load the preview logo because is not accessible without auth
      // so manage the to ask logoUrl only for live sites also for preview
      return await getLogoUrl(site.root.id, site.apiHostnames.liveHostname);
    } catch (e) {
      logger.warn(`logo not found for site ${site.root.name}, view status site.viewStatus: ${viewStatus} error: ${e}`);
      return '';
    }
  }

  async function fetchLiveMenus(site: Site) {
    try {
      // i cannot load the preview logo because is not accessible without auth
      // so manage the to ask getMenu only for live sites also for preview
      const menus = await getMenu(site.apiHostnames.liveHostname);

      // Try to find possible keys containing menu items
      if (menus && typeof menus === 'object') {
        // Log all keys and their values
        Object.keys(menus).forEach(key => {
          logMenuItems(menus[key].items);
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
    } catch (e) {
      logger.warn(`menu not found for site ${site.root.name} error: ${e}`);
      return '';
    }
  }
}

export async function getLogoUrl(id: string, liveHostName: string) {
  const requestUrl = `${liveHostName}/api/nodes/${id}`;
  const envProtocol = new URL(settings.neonFoUrl).protocol;

  const logoUrl = `${envProtocol}//${requestUrl}`;

  console.log(logoUrl);

  const response = await makeRequest({ url: logoUrl });

  return response.files?.logo.resourceUrl;
}

export async function getMenu(liveHostName: string): Promise<Menu> {
  const requestUrl = `${liveHostName}/api/menus`;
  const envProtocol = new URL(settings.neonFoUrl).protocol;

  const menuUrl = `${envProtocol}//${requestUrl}`;

  const response = await makeRequest({ url: menuUrl });

  return response;
}

export type LiveBlogPostsRequestOptions = {
  apiHostname: string;
  id: string;
  searchParams: unknown;
} & AuthenticatedRequestOptions;

export async function getLiveBlogsPosts({
  apiHostname,
  id,
  searchParams,
  auth,
}: LiveBlogPostsRequestOptions): Promise<{ posts: LiveBlogPost[] }> {
  const response = await makeRequest({ apiHostname, url: `/api/v2/liveblogs/${id}/posts?${searchParams}`, auth });

  // Build an array of LiveBlogPost instances from response.posts
  const posts: LiveBlogPost[] = Array.isArray(response.posts)
    ? response.posts.map((post: any) => ({
        id: post.id,
        sys: post.sys,
        pubInfo: post.pubInfo,
        files: post.files,
        dataType: post.dataType,
      }))
    : [];

  // Optionally, return the full response with typed posts
  return {
    posts,
  };
}
