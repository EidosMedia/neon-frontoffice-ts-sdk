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
  summary: string;
  sys: Record<string, string>;
  children: string[];
  cacheTTLSeconds: number;
  changeVisibility?: string;
  attributes?: Record<string, any>;
  files: {
    content: {
      mimeType?: string;
      data: ContentElement;
    };
  };
  links: Links;
  resourceUrl: string;
  url: string;
  pubInfo: any;
  version?: string;
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

// =============== new

interface Link {
  targetId: string;
}

interface Hyperlink {
  image: Link[];
}

interface SoftCrops {
  Wide: { id: string };
  Portrait: { id: string };
  Ultrawide: { id: string };
  Square: { id: string };
}

interface Metadata {
  metadataType: string;
  softCrops: SoftCrops;
}

interface MainPicture {
  targetId: string;
  metadata: Metadata;
  dynamicCropsResourceUrls: Record<string, string>;
}

interface System {
  mainPicture: MainPicture[];
}

interface Links {
  hyperlink: Hyperlink;
  system: System;
}

interface PageLinkTargetId {
  targetId: string;
}

interface PageLink {
  [key: string]: PageLinkTargetId[];
}

interface PageLinks {
  pagelink: PageLink;
}

export type WebpageModel = {
  attributes: Record<string, unknown>;
  links: PageLinks;
  resourceUrl: string;
  dataType: string;
} & BaseModel;

export type WebpageNodeModel = {
  mainPicture?: string;
} & BaseModel;

export type VersionPubInfo = {
  siteName: string;
  status: string;
  publicationTime: string;
  canonical: string;
  sectionPath: string;
  visible: boolean;
  publishedBy: {
    userName: string;
    userId: string;
  };
};

export type NodeVersion = {
  title: string;
  type: string;
  versionTimestamp: number;
  versionDate: string;
  nodeId: string;
  major: number;
  minor: number;
  pubInfo: VersionPubInfo;
  live: boolean;
  prevTsVersion: number;
  sourceVersionName?: String;
  workflowStatus?: string;
};

export type NodeHistory = {
  id: string;
  version: string;
  acquireTimestamp: number;
  versions: NodeVersion[];
}

export type Tag = {
  name: string;
  count: number;
};

export type AggregationResult = {
  name: string;
};

export type SearchNodeData = {
  nodeData: BaseModel;
  highlights: Record<string, string[]>;
};

export type PaginatedSearchResult = {
  count: number;
  result: SearchNodeData[];
  limit: number;
  offset: number;

  tags: Record<string, Tag[]>;
  tookMs: number;
  aggregations: Record<string, AggregationResult>;
};

export type PaginatedSearchRagResult = {
  answer: String;
} & PaginatedSearchResult;

export type RagOnItemsResponse = {
  result: {
    input: string;
    answer: string;
    context: any[];
  };
  status: string;
  statusCode: number;
};
