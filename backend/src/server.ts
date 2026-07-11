import { app } from "./app";
import { env } from "@infra/config/environment";
import { prisma } from "@infra/database/prisma-client";
import { logger } from "@infra/logging/winston";

// Establish Database Connections and Listen on Configured Port
const startServer = async (): Promise<void> => {
  try {
    logger.info("Initiating database connection handshake...");
    await prisma.$connect();
    logger.info("PostgreSQL database connection established successfully.");

    app.listen(env.PORT, () => {
      logger.info(`🚀 Backend server successfully running in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Fatal exception during server boot pipeline:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Listen for uncaught exceptions globally
process.on("uncaughtException", (error) => {
  logger.error("Fatal CRITICAL uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Fatal CRITICAL unhandled promise rejection:", reason);
  process.exit(1);
});

startServer();
