import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

// Helper to extract public_id from a Cloudinary URL
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/');
    return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
};

// PUT: Update an existing product listing (now handles images)
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;
        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const newImages = formData.getAll("newImages"); // Get new image files
        const imagesToRemove = JSON.parse(formData.get("imagesToRemove") || "[]"); // Get URLs to remove

        const client = await clientPromise;
        const db = client.db("EduMart");
        const productsCollection = db.collection("products");

        // 1. Fetch the existing product to get current imageUrls
        const existingProduct = await productsCollection.findOne({ 
            _id: new ObjectId(id), 
            sellerEmail: session.user.email 
        });

        if (!existingProduct) {
            return NextResponse.json({ message: "Product not found or you're not the owner." }, { status: 404 });
        }

        let updatedImageUrls = existingProduct.imageUrls;

        // 2. Delete images from Cloudinary that are marked for removal
        if (imagesToRemove.length > 0) {
            for (const url of imagesToRemove) {
                const publicId = getPublicIdFromUrl(url);
                await cloudinary.uploader.destroy(publicId);
            }
            // Filter out the removed URLs from our array
            updatedImageUrls = updatedImageUrls.filter(url => !imagesToRemove.includes(url));
        }

        // 3. Upload new images to Cloudinary and add their URLs
        if (newImages.length > 0) {
            for (const image of newImages) {
                 if (image instanceof File) {
                    const bytes = await image.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const result = await uploadToCloudinary(buffer);
                    updatedImageUrls.push(result.secure_url);
                 }
            }
        }
        
        // 4. Update the product in MongoDB
        await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { 
                name, 
                description, 
                price: parseFloat(price),
                imageUrls: updatedImageUrls 
            }}
        );

        return NextResponse.json({ success: true, message: "Product updated successfully!" });
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a product listing
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;
        const client = await clientPromise;
        const db = client.db("EduMart");
        const productsCollection = db.collection("products");

        // First, find the product to get its image URLs for deletion from Cloudinary
        const productToDelete = await productsCollection.findOne({
             _id: new ObjectId(id),
             sellerEmail: session.user.email,
        });

        if (!productToDelete) {
            return NextResponse.json({ message: "Product not found or you're not the owner." }, { status: 404 });
        }
        
        // Delete images from Cloudinary
        for (const url of productToDelete.imageUrls) {
            const publicId = getPublicIdFromUrl(url);
            await cloudinary.uploader.destroy(publicId);
        }

        // Then, delete the product from the database
        await productsCollection.deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({ success: true, message: "Product deleted." });
    } catch (error) {
        console.error("Failed to delete product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

