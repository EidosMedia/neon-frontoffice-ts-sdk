import { Site, SiteNode } from './site';

export type PageConfiguration = {
  development?: boolean;
  reactionsEnabled?: boolean;
};

export type PageModel = {
  aggregators: string[];
  buildDate: string;
  builder: string[];
  builtByConfigModelBuilder: boolean;
  data: SiteNode;
  dataType: string;
  defaultContent: boolean;
  errors: string[];
  etag: string;
  id: string;
  invalidationPriority: number;
  lastModified: number;
  modelSourceClass: string;
  nodes: Record<string, SiteNode>;
  page: number;
  totalPages: number;
};

export type PageData = {
  configuration: PageConfiguration;
  model: PageModel;
  nodesUrl: Record<string, string>;
  requestParam: Record<string, string>;
  resourcesUrls: Record<string, string>;
  siteData: Site;
  siteNode: SiteNode;
};
