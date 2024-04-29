import { connect } from "mongoose";

async function run() {
  await connect(process.env.DATABASE_URL as string);
}

run()
  .then(() => console.log("Database is connected"))
  .catch((err) => console.log(err));
