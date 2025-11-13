
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "igdtuw.ac.in",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // Security Check: Deny access if email is not verified or from the wrong domain
      if (!profile.email_verified || !profile.email.endsWith("@igdtuw.ac.in")) {
        console.log(`Sign-in denied for invalid email: ${profile.email}`);
        return false;
      }

      // Database Sync: If email is valid, create or update the user
      try {
        const client = await clientPromise;
        const db = client.db("EduMart"); // Ensure this is your correct database name
        const usersCollection = db.collection("users"); // This will create the 'users' collection

        await usersCollection.updateOne(
          { email: profile.email },
          {
            $set: {
              name: profile.name,
              image: profile.image,
              lastLogin: new Date(),
            },
            $setOnInsert: {
              email: profile.email,
              createdAt: new Date(),
              contactNumber: "",
            },
          },
          { upsert: true }
        );
        
        return true; // Allow sign-in
      } catch (error) {
        console.error("Database error during sign-in:", error);
        return false; // Block sign-in if the database fails
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

