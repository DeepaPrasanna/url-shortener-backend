import { body, param } from "express-validator";
import express, { Router } from "express";

import { deleteUrl, getLongUrl, shortenUrl } from "../controllers";

const router: Router = express.Router();

router.post(
  "/api/",
  body("url").notEmpty().isURL().withMessage("Not a valid url"),
  shortenUrl
);

router.get("/:code", param("code").notEmpty().isAlphanumeric(), getLongUrl);

router.delete("/:code", param("code").notEmpty().isAlphanumeric(), deleteUrl);

export default router;
