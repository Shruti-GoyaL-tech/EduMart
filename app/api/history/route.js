// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]/route";
// import clientPromise from "@/lib/mongodb";
// import { NextResponse } from "next/server";

// // GET: Fetch the user's purchase and sales history
// export async function GET(request) {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const client = await clientPromise;
//         const db = client.db("EduMart");

//         // 1. Find items the user has bought
//         const boughtItems = await db.collection("products").find({ 
//             buyerEmail: session.user.email 
//         }).toArray();

//         // 2. Find items the user has sold
//         const soldItems = await db.collection("products").find({
//             sellerEmail: session.user.email,
//             status: "sold"
//         }).toArray();
        
//         // 3. For bought items, we need to find the seller's details
//         const sellerEmails = boughtItems.map(item => item.sellerEmail);
//         const sellers = await db.collection("users").find({ email: { $in: sellerEmails } }).project({ name: 1, email: 1, contactNumber: 1 }).toArray();
//         const sellersMap = sellers.reduce((acc, seller) => {
//             acc[seller.email] = seller;
//             return acc;
//         }, {});
//         const boughtItemsWithSeller = boughtItems.map(item => ({
//             ...item,
//             sellerInfo: sellersMap[item.sellerEmail]
//         }));

//         // 4. For sold items, we need the buyer's details
//         const buyerEmails = soldItems.map(item => item.buyerEmail);
//         const buyers = await db.collection("users").find({ email: { $in: buyerEmails } }).project({ name: 1, email: 1, contactNumber: 1 }).toArray();
//         const buyersMap = buyers.reduce((acc, buyer) => {
//             acc[buyer.email] = buyer;
//             return acc;
//         }, {});
//         const soldItemsWithBuyer = soldItems.map(item => ({
//             ...item,
//             buyerInfo: buyersMap[item.buyerEmail]
//         }));


//         return NextResponse.json({ 
//             bought: boughtItemsWithSeller, 
//             sold: soldItemsWithBuyer 
//         });

//     } catch (error) {
//         console.error("Failed to fetch history:", error);
//         return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//     }
// }


import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("EduMart");

        // 1. Get items the user has BOUGHT
        const boughtTransactions = await db.collection("transactions").aggregate([
            { $match: { buyerEmail: session.user.email } },
            { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
            { $lookup: { from: "users", localField: "sellerEmail", foreignField: "email", as: "seller" } },
            { $unwind: "$product" },
            { $unwind: "$seller" },
            { $project: {
                _id: 1,
                finalPrice: 1,
                completedAt: 1,
                productName: "$product.name",
                productImage: { $arrayElemAt: ["$product.imageUrls", 0] },
                sellerName: "$seller.name",
                sellerEmail: "$seller.email",
                sellerContact: "$seller.contactNumber"
            }}
        ]).sort({ completedAt: -1 }).toArray();

        // 2. Get items the user has SOLD
        const soldTransactions = await db.collection("transactions").aggregate([
            { $match: { sellerEmail: session.user.email } },
            { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
            { $lookup: { from: "users", localField: "buyerEmail", foreignField: "email", as: "buyer" } },
            { $unwind: "$product" },
            { $unwind: "$buyer" },
            { $project: {
                _id: 1,
                finalPrice: 1,
                completedAt: 1,
                productName: "$product.name",
                productImage: { $arrayElemAt: ["$product.imageUrls", 0] },
                buyerName: "$buyer.name",
                buyerEmail: "$buyer.email",
                buyerContact: "$buyer.contactNumber"
            }}
        ]).sort({ completedAt: -1 }).toArray();

        return NextResponse.json({
            bought: boughtTransactions,
            sold: soldTransactions
        });

    } catch (error) {
        console.error("Failed to fetch history:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

