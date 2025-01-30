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
};

export type SiteApiHostnames = {
  liveHostname: string;
  previewHostname: string;
  stageHostname: string;
};

export type Site = {
  root: SiteNode;
  logoUrl: string;
  nodes: Record<string, SiteNode>;
  apiHostnames: SiteApiHostnames;
};
