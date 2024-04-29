import "dotenv/config";
import express, { Express } from "express";

import "./config/db";
import routes from "./routes";

export const app: Express = express();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use(express.json());
app.use("/", routes);

export default app;
