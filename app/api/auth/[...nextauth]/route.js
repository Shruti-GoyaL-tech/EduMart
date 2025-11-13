
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import clientPromise from "@/lib/mongodb";

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//           hd: "igdtuw.ac.in",
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ profile }) {
//       // Security Check: Deny access if email is not verified or from the wrong domain
//       if (!profile.email_verified || !profile.email.endsWith("@igdtuw.ac.in")) {
//         console.log(`Sign-in denied for invalid email: ${profile.email}`);
//         return false;
//       }

//       // Database Sync: If email is valid, create or update the user
//       try {
//         const client = await clientPromise;
//         const db = client.db("EduMart"); // Ensure this is your correct database name
//         const usersCollection = db.collection("users"); // This will create the 'users' collection

//         await usersCollection.updateOne(
//           { email: profile.email },
//           {
//             $set: {
//               name: profile.name,
//               image: profile.image,
//               lastLogin: new Date(),
//             },
//             $setOnInsert: {
//               email: profile.email,
//               createdAt: new Date(),
//               contactNumber: "",
//             },
//           },
//           { upsert: true }
//         );
        
//         return true; // Allow sign-in
//       } catch (error) {
//         console.error("Database error during sign-in:", error);
//         return false; // Block sign-in if the database fails
//       }
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

export const authOptions = {
  // Use the adapter to save users to your MongoDB
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "EduMart"
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        // Check if the profile and email exist
        if (profile && profile.email) {
          // FIX: Convert email to lowercase before checking the domain
          const email = profile.email.toLowerCase();
          
          // Make sure this domain is exactly correct
          const isAllowed = email.endsWith('@igdtuw.ac.in');
          
          return isAllowed;
        }
        // If profile or email is missing, deny access
        return false;
      }
      return true; // Allow other sign-in methods (if any)
    },
    // ... (other callbacks you might have, like jwt or session)
    async session({ session, token }) {
      // Add user ID to the session
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    // This is the page that shows the "Access Denied" error
    error: '/api/auth/error', 
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };