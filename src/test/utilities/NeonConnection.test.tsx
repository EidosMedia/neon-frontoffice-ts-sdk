import { describe, expect, test } from "@jest/globals";
import { NeonConnection } from "../../utilities/NeonConnection";
import fs from "fs";
import path from "path";

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
