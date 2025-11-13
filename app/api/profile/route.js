
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET function (remains the same)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const db = client.db("EduMart");
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, contactNumber: user.contactNumber });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// POST function with enhanced logging
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contactNumber } = await request.json();
    const client = await clientPromise;
    const db = client.db("EduMart");
    const usersCollection = db.collection("users");

    // ✨ NEW LOGGING: Find the user document BEFORE attempting to update it
    const userBeforeUpdate = await usersCollection.findOne({ email: session.user.email });
    console.log("API LOG: Document state before update:", userBeforeUpdate);

    // --- The original update logic ---
    const result = await usersCollection.updateOne(
      { email: session.user.email },
      { $set: { contactNumber: contactNumber } }
    );

    console.log("API LOG: MongoDB update result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found in database." }, { status: 404 });
    }
    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: true, message: "Profile is already up to date." });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("POST /api/profile Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

