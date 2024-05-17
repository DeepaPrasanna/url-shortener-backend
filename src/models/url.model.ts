import { Schema, model } from "mongoose";

interface IUrl {
  longUrl: string;
  code: string;
  email?: string;
  createdOn: Date;
  expiresOn?: Date;
}

const urlSchema = new Schema<IUrl>({
  longUrl: { type: String, required: true },
  code: { type: String, required: true },
  createdOn: { type: Date, required: true },
  email: { type: String, required: false },
  expiresOn: { type: Date, required: false },
});

export const Url = model<IUrl>("Url", urlSchema);
