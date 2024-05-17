import { Types } from "mongoose";
import { customAlphabet } from "nanoid";

import { Url } from "../models";

export async function findUrlByLongUrl(longUrl: string) {
  return await Url.findOne({ longUrl }).lean();
}

export async function createShortUrl(
  longUrl: string,
  email?: string,
  ttl?: string
) {
  const code = await generateCode();

  const url = new Url({
    longUrl,
    code,
    email,
    createdOn: new Date(),
    expiresOn: ttl,
  });
  await url.save();

  return code;
}

async function generateCode() {
  const alphabet = process.env.NANOID_ALPHABET_SET as string;
  const nanoid = customAlphabet(
    alphabet,
    parseInt(process.env.NO_OF_CHARACTERS as string)
  );
  const code = nanoid();
  const doesCodeAlreadyExists = await findUrlByCode(code);

  if (doesCodeAlreadyExists) await generateCode();
  else return code;
}

export async function findUrlByCode(code: string) {
  return await Url.findOne({ code }).lean();
}

export async function deleteUrlById(id: Types.ObjectId) {
  return await Url.deleteOne(id);
}

export async function getUserUrls(email: string) {
  return await Url.find({ email }).lean();
}
