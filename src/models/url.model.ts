import { Schema, model } from "mongoose";

interface IUrl {
  longUrl: string;
  code: string;
}

const urlSchema = new Schema<IUrl>({
  longUrl: { type: String, required: true },
  code: { type: String, required: true },
});

export const Url = model<IUrl>("Url", urlSchema);
