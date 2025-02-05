import { Site, SiteNode } from './site';

export type PageConfiguration = {
  development?: boolean;
  reactionsEnabled?: boolean;
};

export type ContentElement = {
  nodeType: string;
  elements: ContentElement[];
  value: string;
  attributes: Record<string, string>;
  dynamicCropsResourceUrls?: Record<string, string>;
};

export type BaseModel = {
  id: string;
  foreignId: string;
  title: string;
  sys: Record<string, string>;
  cacheTTLSeconds: number;
  files: {
    content: {
      mimeType?: string;
      data: ContentElement;
    };
  };
};

export type PageModel<GenericNodeModel> = {
  aggregators: string[];
  buildDate: string;
  builder: string[];
  builtByConfigModelBuilder: boolean;
  data: GenericNodeModel;
  dataType: string;
  defaultContent: boolean;
  errors: string[];
  etag: string;
  id: string;
  invalidationPriority: number;
  lastModified: number;
  modelSourceClass: string;
  nodes: Record<string, BaseModel>;
  page: number;
  totalPages: number;
} & BaseModel;

export type PageData<GenericModel extends BaseModel> = {
  configuration: PageConfiguration;
  model: PageModel<GenericModel>;
  nodesUrl: Record<string, string>;
  requestParam: Record<string, string>;
  resourcesUrls: Record<string, string>;
  siteData: Site;
  siteNode: SiteNode;
};
