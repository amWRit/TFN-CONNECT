import NextAuth, { NextAuthOptions, Session } from "next-auth";
// Extend the NextAuth Session type to include id on user
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("⚠️  GOOGLE_CLIENT_ID is not set in environment variables");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("⚠️  GOOGLE_CLIENT_SECRET is not set in environment variables");
}
if (!process.env.NEXTAUTH_URL) {
  console.error("⚠️  NEXTAUTH_URL is not set in environment variables");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("⚠️  NEXTAUTH_SECRET is not set in environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const email = user.email || "";
        
        if (!email) {
          console.error("No email provided by Google");
          return false;
        }
        
        // Check if email ends with @teachfornepal.org
        if (email.endsWith("@teachfornepal.org")) {
          return true;
        }
        
        // Check against custom whitelist in DB
        try {
          const found = await prisma.whitelistEmail.findUnique({ 
            where: { email } 
          });
          
          if (found) {
            return true;
          }
        } catch (dbError) {
          console.error("Database error checking whitelist:", dbError);
          // If DB check fails, deny access
          return false;
        }
        
        // Email not whitelisted
        console.log(`Access denied for email: ${email}`);
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      // Attach user id/email/type to session
      if (session.user?.email) {
        // Fetch user from DB and attach id and type - check both email1 and email2
        let user = await prisma.person.findUnique({
          where: { email1: session.user.email },
          select: { id: true, type: true }
        });
        // If not found by email1, try email2
        if (!user) {
          user = await prisma.person.findFirst({
            where: { email2: session.user.email },
            select: { id: true, type: true }
          });
        }
        if (user) {
          session.user.id = user.id;
          (session.user as any).type = user.type;
        }
      }
      session.user.email = session.user.email || "";
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
