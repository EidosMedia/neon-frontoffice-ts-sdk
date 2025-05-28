export type SiteNode = {
  id: string;
  name: string;
  nodeType: string;
  title: string;
  uri: string;
  path: string;
  items: SiteNode[];
  hostname: string;
  previewHostname: string;
  attributes?: Record<string, any>;
};

export type SiteApiHostnames = {
  liveHostname: string;
  previewHostname: string;
  stageHostname: string;
};

export type Site = {
  root: SiteNode;
  logoUrl: string;
  menus: Menu[];
  siteName: string;
  nodes: Record<string, SiteNode>;
  apiHostnames: SiteApiHostnames;
  viewStatus: string;
};

export type MenuItem = {
  label: string;
  ref?: string;
  url?: string;
  type: string;
  items: MenuItem[];
};

export type Menu = {
  name: string;
  description: string;
  items: MenuItem[];
  creationDate: string;
  modificationDate: string;
};
