import { Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";

import {
  findUrlByCode,
  deleteUrlById,
  createShortUrl,
  findUrlByLongUrl,
} from "../services";

export async function shortenUrl(req: Request, res: Response) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  const { url } = matchedData(req);

  const hostname = new URL(url).hostname;

  if (hostname === process.env.HOSTNAME) {
    return res.status(422).send({ message: "Failed! Domain name not allowed" });
  }

  // check if the url already exists in db
  const data = await findUrlByLongUrl(url);

  if (data) {
    return res.send({
      message: "success",
      result: `${process.env.HOSTNAME}/${data.code}`,
    });
  }

  const code = await createShortUrl(url);

  return res.send({
    message: "success",
    result: `${process.env.HOSTNAME}/${code}`,
  });
}

export async function getLongUrl(req: Request, res: Response) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  const { code } = matchedData(req);

  const data = await findUrlByCode(code);

  if (!data) return res.status(400).send({ message: "URL not found" });

  return res.redirect(302, data.longUrl);
}

export async function deleteUrl(req: Request, res: Response) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  const { code } = matchedData(req);

  const data = await findUrlByCode(code);

  if (!data) return res.status(400).send({ message: "URL not found" });

  const deletedResult = await deleteUrlById(data._id);

  if (deletedResult.deletedCount)
    return res.status(204).send({ message: "Deleted successfully" });
  else
    return res
      .status(204)
      .send({ message: "Unsuccess! Something bad might have happened" });
}
