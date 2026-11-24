import { describe, expect, test, jest } from "@jest/globals";
import { NeonConnection } from "../../utilities/NeonConnection";
import fs from "fs";
import path from "path";
import { Site } from "../../types/site";
import type { PageData, WebpageModel } from "../../types/content";
import * as siteServices from "../../services/sites";

const connection = new NeonConnection({
  frontOfficeServiceKey: 'yourServiceKey',
  neonFoUrl: 'yourNeonFoUrl',
});

jest.mock("../../conf/versions", () => ({
  VERSIONS:  [
    "NEON.2024.12.aaaaa-SNAPSHOT",
    "NEON.2024.13.ea1-SNAPSHOT",
    "NEON.2024.14.ea1-SNAPSHOT"
  ]
}));

describe("Site refresh", () => {
  const site = (viewStatus: Site["viewStatus"]): Site => ({
    viewStatus, siteName: "Test", logoUrl: "", menus: {}, nodes: {},
    apiHostnames: { liveHostname: "", previewHostname: "", stageHostname: "" },
    root: {
      id: viewStatus, name: "Test", title: "Test", nodeType: "site", uri: "/", url: "/", path: "/",
      hostname: `${viewStatus}.test`, previewHostname: "preview.test", items: [],
    },
  });
  const makeConnection = () => new NeonConnection({ frontOfficeServiceKey: "", neonFoUrl: "https://neon.test" });

  test("concurrent refreshes commit both views together", async () => {
    const client = makeConnection();
    const previous = [site("live"), site("preview")];
    client.sites = previous;
    let finishPreview!: (sites: Site[]) => void;
    const pendingPreview = new Promise<Site[]>(resolve => { finishPreview = resolve; });
    const load = jest.spyOn(siteServices, "loadSites").mockImplementation(async ({ viewStatus }) =>
      viewStatus === "live" ? [site("live")] : pendingPreview);
    try {
      const first = client.refreshSites();
      const second = client.refreshSites();
      await Promise.resolve();
      expect(client.sites).toBe(previous);
      expect(load).toHaveBeenCalledTimes(2);
      finishPreview([site("preview")]);
      await Promise.all([first, second]);
      expect(client.sites.map(s => s.viewStatus)).toEqual(["live", "preview"]);
      expect(client.sites).not.toBe(previous);
    } finally { load.mockRestore(); }
  });

  test("failed refresh retains both views and can retry", async () => {
    const client = makeConnection();
    const previous = [site("live"), site("preview")];
    client.sites = previous;
    const lastLoad = client.lastLoadSites;
    const failure = { status: 502, url: "https://neon.test/api/sites/preview" };
    const load = jest.spyOn(siteServices, "loadSites").mockImplementation(async ({ viewStatus }) => {
      if (viewStatus === "preview") throw failure;
      return [site("live")];
    });
    try {
      await expect(client.refreshSites()).rejects.toBe(failure);
      expect(client.sites).toBe(previous);
      expect(client.lastLoadSites).toBe(lastLoad);
      load.mockImplementation(async ({ viewStatus }) => [site(viewStatus)]);
      await client.refreshSites();
      expect(client.sites.map(s => s.viewStatus)).toEqual(["live", "preview"]);
    } finally { load.mockRestore(); }
  });

  test("single-view refresh preserves the other view", async () => {
    const client = makeConnection();
    const live = site("live");
    const preview = site("preview");
    client.sites = [live, preview];
    const load = jest.spyOn(siteServices, "loadSites").mockImplementation(async ({ viewStatus }) => [site(viewStatus)]);
    try {
      await client.refreshLiveSites();
      expect(client.sites).toContain(preview);
      const refreshedLive = client.sites[0];
      await client.refreshPreviewSites();
      expect(client.sites).toContain(refreshedLive);
      expect(client.sites.map(s => s.viewStatus)).toEqual(["live", "preview"]);
    } finally { load.mockRestore(); }
  });
});

describe("NeonConnection test module.", () => {
  test("Get Dwp linked objects", async () => {
    const dwpModelPath = path.resolve(__dirname, "dwpModel.json");
    const dwpModel = JSON.parse(fs.readFileSync(dwpModelPath, "utf-8"));

    connection.getDwxLinkedObjects(dwpModel, "top").then((result) => {
      expect(result[0].id).toBe("0296-1cf7c25b6434-2d2b47b681fa-1000");
      expect(result[0].title).toBe("Globe First Article");
      expect(result[0].mainPicture).toBe(
        "/resources/0296-1cf7c24a7432-666dd5bf59a6-1000/news.jpeg"
      );
      expect(result[0].summary).toBe("Sample story by cfg by code");
    });
  });

  test("Get Dwp linked objects preserves link metadata", async () => {
    const linkMetadata = {
      metadataType: "pagelink",
      template: "teaser",
      linkAccessories: {
        theme: "default",
        type: "webpage",
        zone: "main",
        linkedType: "article",
        items: {},
      },
    };
    const pageData = {
      model: {
        data: {
          links: {
            pagelink: {
              main: [{ targetId: "node-1", metadata: linkMetadata }],
            },
          },
        },
        nodes: {
          "node-1": { id: "node-1", links: { system: { mainPicture: [] } } },
        },
      },
    } as unknown as PageData<WebpageModel>;

    const linkedObjects = await connection.getDwxLinkedObjects(pageData, "main");

    expect(linkedObjects[0].linkMetadata).toEqual(linkMetadata);
  });
});

describe("NeonConnection startup tests", () => {
  test("should throw error for incompatible backend version", async () => {
    const mockBackendInfo =
        jest.fn().mockImplementation(() =>
            ({version: "1.0.0", type: "SITE", state: "RUNNING"}));

    connection.getBackendInfo = mockBackendInfo as jest.MockedFunction<() => Promise<{
      version: string,
      type: string,
      state: string
    }>>;

    await expect(connection.startup()).rejects.toThrow("Incompatible backend version: 1.0.0");
  });

  test("should throw error when sites list is empty", async () => {
    const mockBackendInfo =
        jest.fn().mockImplementation(() =>
            ({version: "NEON.2024.12.aaaaa-SNAPSHOT", type: "SITE", state: "RUNNING"}));

    const mockLiveSitesList = jest.fn().mockImplementation(() => ([]));

    connection.getBackendInfo = mockBackendInfo as jest.MockedFunction<() => Promise<{
      version: string,
      type: string,
      state: string
    }>>;

    connection.getSitesList = mockLiveSitesList as jest.MockedFunction<() => Promise<Site[]>>;

    await expect(connection.startup()).rejects.toThrow("Failed to retrieve sites data.");
  });

  test("connection startup ok", async () => {
    const site = {
      root: {
        id: "root-123",
        name: "Home",
        nodeType: "root",
        title: "Homepage",
        uri: "/",
        path: "/",
        hostname: "www.example.com",
        previewHostname: "preview.example.com",
        items: []
      }
    };

    const mockBackendInfo =
        jest.fn().mockImplementation(() =>
            ({version: "NEON.2024.12.aaaaa-SNAPSHOT", type: "SITE", state: "RUNNING"}));

    const mockLiveSitesList =
        jest.fn().mockImplementation(() => ([site]));

    connection.getBackendInfo = mockBackendInfo as jest.MockedFunction<() => Promise<{
      version: string,
      type: string,
      state: string
    }>>;

    connection.getSitesList = mockLiveSitesList as jest.MockedFunction<() => Promise<Site[]>>;

    await expect(connection.startup()).resolves.not.toThrow();

    expect(mockBackendInfo).toHaveBeenCalledTimes(1);
    expect(mockLiveSitesList).toHaveBeenCalledTimes(1);
  });
});

describe("NeonConnection hostname resolution during prerendering", () => {
  test("unknown hostname reload throttle does not call Date.now", async () => {
    const dateNow = jest.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("Date.now must not be called");
    });
    const site = { root: { name: "Home", hostname: "www.example.com" } } as unknown as Site;
    const conn = new NeonConnection({ frontOfficeServiceKey: "key", neonFoUrl: "url" });
    conn.getSitesList = jest.fn().mockImplementation(() => Promise.resolve([site])) as typeof conn.getSitesList;
    conn.refreshSites = jest.fn().mockImplementation(async () => {
      conn.lastLoadSites = performance.now();
      return [site];
    }) as typeof conn.refreshSites;

    try {
      await expect(conn.resolveApiHostname("unknown.example.com")).rejects.toThrow(
        "Could not resolve hostname: unknown.example.com"
      );
      expect(conn.refreshSites).toHaveBeenCalledTimes(1);
    } finally {
      dateNow.mockRestore();
    }
  });
});