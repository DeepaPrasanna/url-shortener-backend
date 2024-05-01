import { connect } from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL as string;

async function run(DB_URL: string) {
  await connect(DB_URL);
}

run(DATABASE_URL)
  .then(() => console.log("Database is connected"))
  .catch((err) => console.log(err));
