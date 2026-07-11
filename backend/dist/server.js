"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const environment_1 = require("@infra/config/environment");
const prisma_client_1 = require("@infra/database/prisma-client");
const winston_1 = require("@infra/logging/winston");
// Establish Database Connections and Listen on Configured Port
const startServer = async () => {
    try {
        winston_1.logger.info("Initiating database connection handshake...");
        await prisma_client_1.prisma.$connect();
        winston_1.logger.info("PostgreSQL database connection established successfully.");
        app_1.app.listen(environment_1.env.PORT, () => {
            winston_1.logger.info(`🚀 Backend server successfully running in [${environment_1.env.NODE_ENV}] mode on port: ${environment_1.env.PORT}`);
        });
    }
    catch (error) {
        winston_1.logger.error("Fatal exception during server boot pipeline:", error);
        await prisma_client_1.prisma.$disconnect();
        process.exit(1);
    }
};
// Listen for uncaught exceptions globally
process.on("uncaughtException", (error) => {
    winston_1.logger.error("Fatal CRITICAL uncaught exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    winston_1.logger.error("Fatal CRITICAL unhandled promise rejection:", reason);
    process.exit(1);
});
startServer();
