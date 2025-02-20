import { describe, expect, test, jest } from "@jest/globals";
import { NeonConnection } from "../../utilities/NeonConnection";
import fs from "fs";
import path from "path";
import { Site } from "../../types/site";

const connection = new NeonConnection({
  frontOfficeServiceKey: "yourServiceKey",
  neonFeUrl: "yourNeonFeUrl",
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
            ({version: "NEON.2024.12.ea1-SNAPSHOT", type: "SITE", state: "RUNNING"}));

    const mockLiveSitesList = jest.fn().mockImplementation(() => ([]));

    connection.getBackendInfo = mockBackendInfo as jest.MockedFunction<() => Promise<{
      version: string,
      type: string,
      state: string
    }>>;

    connection.getLiveSitesList = mockLiveSitesList as jest.MockedFunction<() => Promise<Site[]>>;

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
            ({version: "NEON.2024.12.ea1-SNAPSHOT", type: "SITE", state: "RUNNING"}));

    const mockLiveSitesList =
        jest.fn().mockImplementation(() => ([site]));

    connection.getBackendInfo = mockBackendInfo as jest.MockedFunction<() => Promise<{
      version: string,
      type: string,
      state: string
    }>>;

    connection.getLiveSitesList = mockLiveSitesList as jest.MockedFunction<() => Promise<Site[]>>;

    await expect(connection.startup()).resolves.not.toThrow();
  });
});