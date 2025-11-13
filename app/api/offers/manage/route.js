import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// PUT: Seller accepts or rejects an offer
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { offerId, action } = await request.json(); // action: "accept" or "reject"
        const client = await clientPromise;
        const db = client.db("EduMart");

        const offer = await db.collection("offers").findOne({ _id: new ObjectId(offerId) });

        // Security check: Make sure the person accepting is the seller
        if (!offer || offer.sellerEmail !== session.user.email) {
            return NextResponse.json({ message: "Offer not found or you are not the seller." }, { status: 404 });
        }
        
        if (action === "accept") {
            // 1. Set this offer to "pending_buyer_confirmation"
            await db.collection("offers").updateOne(
                { _id: new ObjectId(offerId) },
                { $set: { status: "pending_buyer_confirmation", updatedAt: new Date() } }
            );

            // // 2. (Optional but recommended) Set all other offers for this product to "declined"
            // await db.collection("offers").updateMany(
            //     { productId: offer.productId, _id: { $ne: new ObjectId(offerId) } },
            //     { $set: { status: "declined", updatedAt: new Date() } }
            // );
            
            return NextResponse.json({ success: true, message: "Offer accepted! Waiting for buyer to confirm." });
        } else if (action === "reject") {
             await db.collection("offers").updateOne(
                { _id: new ObjectId(offerId) },
                { $set: { status: "declined", updatedAt: new Date() } }
            );
            return NextResponse.json({ success: true, message: "Offer declined." });
        }

        return NextResponse.json({ message: "Invalid action." }, { status: 400 });

    } catch (error) {
        console.error("Failed to manage offer:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

