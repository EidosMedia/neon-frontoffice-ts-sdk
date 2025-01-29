export type PageNode = {
  id: string;
  title: string;
  summary: string;
  sys: {
    baseType: string;
    type: string;
  };
  pubInfo: {
    publicationTime: string;
    visible: true;
  };
  attributes: Record<string, string>;
  files: {
    content: {
      fileName: string;
      mimeType: string;
      updatedBy: { userId: string };
      updateTime: string;
      size: number;
      data: string;
    };
  };
  links: {
    hyperlink: {
      image: [{ targetId: string }, { targetId: string }];
    };
    system: {
      mainPicture: [{ targetId: string }];
    };
  };
  url: string;
  resourceUrl: string;
  picture: string;
  dataType: string;
};
