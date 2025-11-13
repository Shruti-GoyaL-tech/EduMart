import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// GET: Fetch all offers made by the currently logged-in user
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");

        // Find offers where the buyerEmail matches the logged-in user's email
        const offers = await db.collection("offers").aggregate([
            { $match: { buyerEmail: session.user.email } },
            // Also fetch the product details for each offer
            { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
            { $unwind: "$product" }, // Unwind the product array
            { $sort: { createdAt: -1 } }
        ]).toArray();

        return NextResponse.json(offers);
    } catch (error) {
        console.error("Failed to fetch user offers:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new offer
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId, sellerEmail, offerPrice } = await request.json();
        const client = await clientPromise;
        const db = client.db("EduMart");

        // --- THIS IS THE FIX ---
        // Check if user already has an ACTIVE offer on this item
        const existingActiveOffer = await db.collection("offers").findOne({
            productId: new ObjectId(productId),
            buyerEmail: session.user.email,
            status: { $in: ["pending_seller", "pending_buyer_confirmation"] }
        });

        if (existingActiveOffer) {
            return NextResponse.json({ message: "You already have an active offer on this item." }, { status: 400 });
        }
        
        // If a "declined" offer exists, delete it so the new one can be created.
        await db.collection("offers").deleteOne({
            productId: new ObjectId(productId),
            buyerEmail: session.user.email,
            status: "declined"
        });

        // Create the new offer
        const newOffer = {
            productId: new ObjectId(productId),
            buyerEmail: session.user.email,
            sellerEmail,
            offerPrice: parseFloat(offerPrice),
            status: "pending_seller", // Initial status
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("offers").insertOne(newOffer);
        return NextResponse.json({ success: true, message: "Offer submitted!" });
    } catch (error) {
        console.error("Failed to create offer:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Edit an existing offer (by buyer)
export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { offerId, newPrice } = await request.json();
        const client = await clientPromise;
        const db = client.db("EduMart");

        const result = await db.collection("offers").updateOne(
            { _id: new ObjectId(offerId), buyerEmail: session.user.email, status: "pending_seller" },
            { $set: { offerPrice: parseFloat(newPrice), updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Offer not found or cannot be edited." }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Offer updated!" });
    } catch (error) {
        console.error("Failed to update offer:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Withdraw an offer (by buyer)
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { offerId } = await request.json();
        const client = await clientPromise;
        const db = client.db("EduMart");

        const result = await db.collection("offers").deleteOne({
            _id: new ObjectId(offerId),
            buyerEmail: session.user.email,
             // Can delete if pending OR if it has been declined
            status: { $in: ["pending_seller", "pending_buyer_confirmation", "declined"] }
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Offer not found or cannot be deleted." }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: "Offer withdrawn." });
    } catch (error) {
        console.error("Failed to delete offer:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

