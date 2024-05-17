import { body, param, query } from "express-validator";
import express, { Router } from "express";

import {
  deleteUrl,
  getLongUrl,
  shortenUrl,
  healthCheck,
  getUserHistory,
} from "../controllers";

const router: Router = express.Router();

router.post(
  "/api/",
  body("url").notEmpty().isURL().withMessage("Not a valid url"),
  body("ttl").optional().isString().withMessage("Enter a proper date"),
  body("email").optional().isEmail().withMessage("Enter a valid email"),
  shortenUrl
);

router.get("/", healthCheck);

router.get(
  "/history",
  query("email").notEmpty().isEmail().withMessage("Email is mandatory"),
  getUserHistory
);

router.get("/:code", param("code").notEmpty().isAlphanumeric(), getLongUrl);

router.delete("/:code", param("code").notEmpty().isAlphanumeric(), deleteUrl);

export default router;
