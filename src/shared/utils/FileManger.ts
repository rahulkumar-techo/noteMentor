// src/shared/utils/file-upload/fileManager.ts
// Description: Optimized and safe service layer for file operations (Cloudinary + Sharp)

import sharp from "sharp";
import { deleteFromCloudinary, uploadToCloudinary } from "./upload-cloudinary.utils";


export class FileManger {
    private MAX_SIZE_MB = 10;

    /**
     * Optimize image before uploading
     */
    private async optimizeBuffer(buffer: Buffer) {
        return await sharp(buffer)
            .resize(512, 512, { fit: "cover" })
            .jpeg({ quality: 80 })
            .toBuffer();
    }

    /**
     * Upload multiple files to Cloudinary (parallel)
     */
    async uploadFiles(files: Express.Multer.File[], folder: string) {
        const start = performance.now();

        const results = await Promise.all(
            files.map(async (file) => {
                if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
                    throw new Error(`File too large. Max ${this.MAX_SIZE_MB} MB`);
                }
                const optimized = await this.optimizeBuffer(file.buffer);
                return uploadToCloudinary(optimized, folder);
            })
        );

        return {
            responseTimeMs: Math.round(performance.now() - start),
            data: results.map((r: any) => ({
                secure_url: r.secure_url,
                public_id: r.public_id,
                bytes: r.bytes,
            })),
        };
    }

    /**
     * Replace existing file in Cloudinary
     */
    async updateFile(public_id: string, file: Express.Multer.File, folder: string) {
        const start = performance.now();

        // 🧩 Validate file size before upload
        if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
            throw new Error(`File too large. Max ${this.MAX_SIZE_MB} MB`);
        }

        // 🪄 Optimize the image
        const optimized = await this.optimizeBuffer(file.buffer);

        // ⚡ Delete old & upload new concurrently
        const [_, uploadResult]: any = await Promise.all([
            public_id ? deleteFromCloudinary(public_id) : Promise.resolve(),
            uploadToCloudinary(optimized, folder),
        ]);

        return {
            responseTimeMs: Math.round(performance.now() - start),
            data: {
                secure_url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                bytes: uploadResult.bytes,
            },
        };
    }

    /**
     * Delete multiple files from Cloudinary (parallel)
     */
    async deleteFiles(public_ids: string[]) {
        const start = performance.now();
        const results = await Promise.all(
            public_ids.map((id) => deleteFromCloudinary(id))
        );

        return {
            responseTimeMs: Math.round(performance.now() - start),
            data: results,
        };
    }
}