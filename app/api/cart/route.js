import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// GET: Fetch all items in the user's cart
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const client = await clientPromise;
        const db = client.db("EduMart");
        
        const cart = await db.collection("carts").findOne({ userEmail: session.user.email });
        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json({ items: [] });
        }

        // Fetch details for each product in the cart
        const products = await db.collection("products").find({
            _id: { $in: cart.items.map(id => new ObjectId(id)) }
        }).toArray();
        
        return NextResponse.json({ items: products });
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Add an item to the user's shopping cart
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await request.json();
        if (!productId) {
            return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("EduMart");

        await db.collection("carts").updateOne(
            { userEmail: session.user.email },
            { 
                $setOnInsert: { userEmail: session.user.email, createdAt: new Date() },
                $addToSet: { items: new ObjectId(productId) } 
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, message: "Item added to cart!" });

    } catch (error) {
        console.error("Failed to add to cart:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove an item from the cart
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await request.json();
        const client = await clientPromise;
        const db = client.db("EduMart");

        await db.collection("carts").updateOne(
            { userEmail: session.user.email },
            { $pull: { items: new ObjectId(productId) } }
        );

        return NextResponse.json({ success: true, message: "Item removed from cart." });
    } catch (error) {
        console.error("Failed to remove from cart:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

