import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// POST: Buyer confirms the purchase
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { offerId } = await request.json();
        const client = await clientPromise;
        const db = client.db("EduMart");

        // --- NEW VALIDATION ---
        // 1. Check if the buyer has a contact number
        const buyer = await db.collection("users").findOne({ email: session.user.email });
        if (!buyer || !buyer.contactNumber) {
            return NextResponse.json({ message: "Please add a contact number to your account before confirming a purchase." }, { status: 400 });
        }

        const offer = await db.collection("offers").findOne({
            _id: new ObjectId(offerId),
            buyerEmail: session.user.email,
            status: "pending_buyer_confirmation"
        });

        if (!offer) {
            return NextResponse.json({ message: "Offer not found or not pending your confirmation." }, { status: 404 });
        }

        // 1. Mark the product as "sold"
        await db.collection("products").updateOne(
            { _id: offer.productId },
            { $set: { status: "sold" } }
        );

        // 2. Mark this offer as "completed"
        await db.collection("offers").updateOne(
            { _id: offer._id },
            { $set: { status: "completed", updatedAt: new Date() } }
        );
        
        // 3. Create a final transaction document
        await db.collection("transactions").insertOne({
            productId: offer.productId,
            sellerEmail: offer.sellerEmail,
            buyerEmail: offer.buyerEmail,
            finalPrice: offer.offerPrice,
            completedAt: new Date()
        });

        // 4. (Optional) Decline any other offers on this now-sold product
        await db.collection("offers").updateMany(
            { productId: offer.productId, status: { $ne: "completed" } },
            { $set: { status: "declined", updatedAt: new Date() } }
        );

        
        return NextResponse.json({ success: true, message: "Purchase confirmed! Seller details are now in your account." });
    } catch (error) {
        console.error("Failed to confirm purchase:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

