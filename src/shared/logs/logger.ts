/**
 * Winston console-only logger
 * No files, only logs to console with colors and timestamps
 */

import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
});

export const log = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    colorize({ all: true }),
    logFormat
  ),
  transports: [
    new transports.Console()
  ],
  exitOnError: false
});