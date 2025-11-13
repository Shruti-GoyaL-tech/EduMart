import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image buffers to Cloudinary
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

// GET: Fetch all products listed by the currently logged-in user
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json([]);
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");
        const products = await db.collection("products")
            .find({ sellerEmail: session.user.email })
            .sort({ createdAt: -1 })
            .toArray();
        return NextResponse.json(products);
    } catch (error) {
        console.error("Failed to fetch user products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


// POST: Create a new product listing
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");

        // --- VALIDATION: Check if the seller has a contact number ---
        const seller = await db.collection("users").findOne({ email: session.user.email });
        if (!seller || !seller.contactNumber) {
            return NextResponse.json({ message: "Please add a contact number to your account before listing an item." }, { status: 400 });
        }
        
        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const images = formData.getAll("images");

        if (!name || !price || images.length === 0) {
            return NextResponse.json({ message: "Name, price, and at least one image are required." }, { status: 400 });
        }

        const imageUrls = [];
        for (const image of images) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const result = await uploadToCloudinary(buffer);
            imageUrls.push(result.secure_url);
        }

        const newProduct = {
            name,
            description,
            price: parseFloat(price),
            imageUrls,
            sellerEmail: session.user.email,
            status: "available",
            createdAt: new Date(),
        };

        await db.collection("products").insertOne(newProduct);

        return NextResponse.json({ success: true, message: "Product listed successfully!" });
    } catch (error) {
        console.error("Failed to list product:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

