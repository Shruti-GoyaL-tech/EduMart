import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET: Fetch all products that are currently available for sale
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("EduMart");
        
        // Find all products where status is 'available'
        const products = await db.collection("products")
            .find({ status: "available" })
            .sort({ createdAt: -1 }) // Show newest items first
            .toArray();

        return NextResponse.json(products);
    } catch (error) {
        console.error("Failed to fetch market products:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
