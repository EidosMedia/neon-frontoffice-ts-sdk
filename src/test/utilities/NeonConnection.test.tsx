import { describe, expect, test, jest } from "@jest/globals";
import { NeonConnection } from "../../utilities/NeonConnection";
import fs from "fs";
import path from "path";
import { Site } from "../../types/site";
import type { PageData, WebpageModel } from "../../types/content";

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
    conn.refreshLiveSites = jest.fn().mockImplementation(() => Promise.resolve([])) as typeof conn.refreshLiveSites;
    conn.refreshPreviewSites = jest.fn().mockImplementation(() => Promise.resolve([])) as typeof conn.refreshPreviewSites;

    try {
      await expect(conn.resolveApiHostname("unknown.example.com")).rejects.toThrow(
        "Could not resolve hostname: unknown.example.com"
      );
      expect(conn.refreshLiveSites).toHaveBeenCalledTimes(1);
    } finally {
      dateNow.mockRestore();
    }
  });
});