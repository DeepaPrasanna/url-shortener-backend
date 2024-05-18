import request from "supertest";
import mongoose from "mongoose";

import app from "..";
import * as urlService from "../services/url.service";

describe("URL Routes", () => {
  const BASE_URL = "api.teenyurl.in/";
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST api/", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).post("/api/").send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it("should return 422 if the provided URL's hostname matches the configured HOSTNAME", async () => {
      const response = await request(app)
        .post("/api/")
        .send({ url: `http://${BASE_URL}test` });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe("Failed! Domain name not allowed");
    });

    it("should return the shortened URL with 200 status code if the URL already exists in the database", async () => {
      jest.spyOn(urlService, "findUrlByLongUrl").mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: "abc123",
        longUrl: "https://example.com",
        createdOn: new Date(),
      });

      const response = await request(app)
        .post("/api/")
        .send({ url: "https://test.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.result).toBe(`${BASE_URL}abc123`);
    });

    it("should return 200 with the shortened URL if the URL does not exist in the database", async () => {
      jest.spyOn(urlService, "findUrlByLongUrl").mockResolvedValueOnce(null);
      jest.spyOn(urlService, "createShortUrl").mockResolvedValueOnce("def456");

      const response = await request(app)
        .post("/api/")
        .send({ url: "https://test.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.result).toBe(`${BASE_URL}def456`);
    });
  });

  describe("GET /:code", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).get("/-?hdj");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it("should return 400 if code is not found", async () => {
      // Mocking findUrlByCode to return null
      jest.spyOn(urlService, "findUrlByCode").mockResolvedValueOnce(null);

      const response = await request(app).get("/someCode");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("URL not found");
    });

    it("should return 302  if code is found", async () => {
      // Mocking findUrlByCode to return null
      jest.spyOn(urlService, "findUrlByCode").mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: "abc123",
        longUrl: "https://example.com",
        createdOn: new Date(),
      });

      const response = await request(app).get("/someCode");

      expect(response.status).toBe(302);
      // Assert that the response has a Location header with the long URL
      expect(response.header["location"]).toBe("https://example.com");
    });
  });

  describe("DELETE /:code", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).delete("/-?hdj");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it("should return 400 if code is not found", async () => {
      // Mocking findUrlByCode to return null
      jest.spyOn(urlService, "findUrlByCode").mockResolvedValueOnce(null);

      const response = await request(app).delete("/someCode");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("URL not found");
    });

    it("should return 204 if code is found and deleted", async () => {
      // Mocking findUrlByCode to return null
      jest.spyOn(urlService, "findUrlByCode").mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: "abc123",
        longUrl: "https://example.com",
        createdOn: new Date(),
      });

      jest
        .spyOn(urlService, "deleteUrlById")
        .mockResolvedValueOnce({ deletedCount: 1, acknowledged: true });

      const response = await request(app).delete("/abc123");

      expect(response.status).toBe(204);
    });

    it("should return 500 if code is found but not deleted due to some error", async () => {
      // Mocking findUrlByCode to return null
      jest.spyOn(urlService, "findUrlByCode").mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: "abc123",
        longUrl: "https://example.com",
        createdOn: new Date(),
      });

      jest
        .spyOn(urlService, "deleteUrlById")
        .mockResolvedValueOnce({ deletedCount: 0, acknowledged: true });

      const response = await request(app).delete("/abc123");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /history", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).get("/history");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it("should return [] if email is not found", async () => {
      jest.spyOn(urlService, "getUserUrls").mockResolvedValueOnce([]);

      const response = await request(app).get("/history?email=test@test.com");

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });

    it("should return 200 with all the URLs if email exists", async () => {
      const allURLs = [
        {
          _id: new mongoose.Types.ObjectId("66484a548809e52645b49dbd"),
          code: "abc123",
          longUrl: "https://example.com",
          createdOn: new Date("2024-05-18T06:27:32.967Z"),
          email: "test@test.com",
        },
        {
          _id: new mongoose.Types.ObjectId("66484a548809e52645b49dbe"),
          code: "abc456",
          longUrl: "https://test.com",
          createdOn: new Date("2024-05-18T06:27:32.967Z"),
          email: "test@test.com",
        },
      ];
      // Convert dates to ISO strings for comparison
      const expectedURLs = allURLs.map((url) => ({
        ...url,
        _id: url._id.toString(),
        createdOn: url.createdOn.toISOString(),
      }));
      jest.spyOn(urlService, "getUserUrls").mockResolvedValueOnce(allURLs);

      const response = await request(app).get("/history?email=test@test.com");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedURLs);
    });
  });
});
