import request from "supertest";

import * as urlService from "../services/url.service";
import app from "..";

jest.mock("../services/url.service");

describe("URL Routes", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).post("/").send({});

      console.log(response);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });
  });

  //   describe("GET /:code", () => {
  //     it("should return 400 if code is not found", async () => {
  //       // Mocking findUrlByCode to return undefined
  //       (urlService.findUrlByCode as jest.Mock).mockResolvedValueOnce(undefined);

  //       const response = await request(app).get("/someCode");

  //       expect(response.status).toBe(400);
  //       expect(response.body.message).toBe("URL not found");
  //     });

  //     // Write more tests for other scenarios...
  //   });

  //   describe("DELETE /:code", () => {
  //     it("should return 400 if code is not found", async () => {
  //       // Mocking findUrlByCode to return undefined
  //       (urlService.findUrlByCode as jest.Mock).mockResolvedValueOnce(undefined);

  //       const response = await request(app).delete("/someCode");

  //       expect(response.status).toBe(400);
  //       expect(response.body.message).toBe("URL not found");
  //     });

  //     // Write more tests for other scenarios...
  //   });
});
