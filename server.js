import { createServer } from "node:http";
import dotenv from "dotenv/config.js";
import portFinder from "portfinder";
import chalk from "chalk";

import app from "./src/app.js";
import socketIo from "./src/socketIo/socketIo.js";
import connectToDB from "./src/utils/db.js";

const startServer = async () => {
  const port = process.env.PORT || 5000;

  try {
    await connectToDB({ localDb: false });

    // Find an available port if the default one is in use
    const availablePort = await portFinder.getPortPromise({ port });

    const server = createServer(app);
    socketIo(server);

    server.listen(availablePort, () => {
      console.log(
        chalk.greenBright(
          `Server is running on ${chalk.blueBright.underline(`http://localhost:${availablePort}`)}`,
        ),
      );
    });
  } catch (err) {
    console.log(err);
  }
};

// Start the server with an immediately invoked function
(async () => await startServer())();
