import request from "supertest";
import mongoose from "mongoose";

import app from "..";
import * as urlService from "../services/url.service";

describe("URL Routes", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app).post("/").send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });

    it("should return 422 if the provided URL's hostname matches the configured HOSTNAME", async () => {
      const response = await request(app)
        .post("/")
        .send({ url: "https://teenyurl.in/test" });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe("Failed! Domain name not allowed");
    });

    it("should return the shortened URL with 200 status code if the URL already exists in the database", async () => {
      jest.spyOn(urlService, "findUrlByLongUrl").mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        code: "abc123",
        longUrl: "https://example.com",
      });

      const response = await request(app)
        .post("/")
        .send({ url: "https://test.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.result).toBe("teenyurl.in/abc123");
    });

    it("should return 200 with the shortened URL if the URL does not exist in the database", async () => {
      jest.spyOn(urlService, "findUrlByLongUrl").mockResolvedValueOnce(null);
      jest.spyOn(urlService, "createShortUrl").mockResolvedValueOnce("def456");

      const response = await request(app)
        .post("/")
        .send({ url: "https://test.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("success");
      expect(response.body.result).toBe("teenyurl.in/def456");
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
      });

      jest
        .spyOn(urlService, "deleteUrlById")
        .mockResolvedValueOnce({ deletedCount: 0, acknowledged: true });

      const response = await request(app).delete("/abc123");

      expect(response.status).toBe(500);
    });
  });
});
