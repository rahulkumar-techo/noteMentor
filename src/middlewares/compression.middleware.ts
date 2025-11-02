/**
 * @file compression.middleware.js
 * @description Express middleware for automatic Brotli/Gzip compression using Node.js built-in zlib.
 */

import { NextFunction, Request, Response } from "express";
import zlib from "zlib";

/**
 * Compression middleware for Express
 */
export const compressionMiddleware = (req:Request, res:Response, next:NextFunction) => {
  const acceptEncoding = req.headers["accept-encoding"] || "";

  // Store original send()
  const originalSend = res.send.bind(res);

  res.send = function(body): Response {
    // Convert objects to JSON strings
    if (typeof body === "object") {
      body = JSON.stringify(body);
      res.setHeader("Content-Type", "application/json");
    }

    const buffer = Buffer.from(body);

    // Use Brotli if supported
    if (acceptEncoding.includes("br")) {
      zlib.brotliCompress(buffer, (err, compressed) => {
        if (err) return next(err);
        res.setHeader("Content-Encoding", "br");
        res.setHeader("Content-Length", compressed.length);
        originalSend.call(this, compressed);
      });
      return res;
    }

    // Else use Gzip
    if (acceptEncoding.includes("gzip")) {
      zlib.gzip(buffer, (err, compressed) => {
        if (err) return next(err);
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Length", compressed.length);
        originalSend.call(this, compressed);
      });
      return res;
    }

    // If no compression supported
    return originalSend.call(this, body);
  };

  next();
};
