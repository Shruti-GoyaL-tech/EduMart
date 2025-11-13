import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET: Fetch all offers for items listed by the current user
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");
        
        // Find all offers where the sellerEmail matches the logged-in user
        const offers = await db.collection("offers").find({
            sellerEmail: session.user.email
        }).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(offers);
    } catch (error) {
        console.error("Failed to fetch received offers:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

