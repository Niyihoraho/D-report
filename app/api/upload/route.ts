import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if specific keys are provided
// If CLOUDINARY_URL is set in env, it overrides these or fills in missing ones automatically
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Determine if we should use Cloudinary
        // 1. If we are serverless (Netlify/Vercel) -> MUST use Cloudinary (or some cloud storage)
        // 2. If we are local BUT have Cloudinary configured (CLOUDINARY_URL or keys) -> USE Cloudinary (as requested by user)
        const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;
        const hasCloudinaryConfig = process.env.CLOUDINARY_URL || (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

        if (isServerless || hasCloudinaryConfig) {
            return await uploadToCloudinary(file);
        } else {
            // Use local file system for development if no cloud config present
            return await uploadToLocal(file);
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

async function uploadToCloudinary(file: File) {
    // Basic check to see if we have ANY credentials
    if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY)) {
        console.error("Cloudinary credentials missing");
        return NextResponse.json(
            { error: "Cloud storage not configured properly. Please check your environment variables." },
            { status: 500 }
        );
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload using a stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'd-report-uploads',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Write buffer to stream
            uploadStream.end(buffer);
        });

        const data = result as any;

        return NextResponse.json({
            success: true,
            url: data.secure_url,
            filename: data.public_id,
            provider: 'cloudinary'
        });
    } catch (error) {
        console.error("Cloudinary SDK upload error:", error);
        throw error;
    }
}


async function uploadToLocal(file: File) {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
            console.error("Error creating directory:", e);
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            filename: filename,
            provider: 'local'
        });
    } catch (error) {
        console.error("Local upload error:", error);
        throw error;
    }
}
