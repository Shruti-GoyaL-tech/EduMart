import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// POST: Process the checkout
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");
        
        // 1. Find the user's cart
        const cart = await db.collection("carts").findOne({ userEmail: session.user.email });
        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
        }

        // 2. Update all products in the cart
        await db.collection("products").updateMany(
            { _id: { $in: cart.items.map(id => new ObjectId(id)) } },
            { 
                $set: { 
                    status: "sold", 
                    buyerEmail: session.user.email 
                } 
            }
        );

        // 3. Clear the user's cart
        await db.collection("carts").updateOne(
            { userEmail: session.user.email },
            { $set: { items: [] } }
        );

        // A real-world app would then trigger notifications to sellers.
        // For now, the buyer gets a success message.
        return NextResponse.json({ success: true, message: "Purchase successful! You can view seller details on your account page." });
    } catch (error) {
        console.error("Checkout failed:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
