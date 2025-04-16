import { NextAuthOptions } from "next-auth";
import CredentialProviders from "next-auth/providers/credentials";
import { connectDb } from "./connectDb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProviders({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDb();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("All fields are required");
        }
        try {
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("User not found");
          }
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            throw new Error("Invalid password");
          }
          return {
            name: user.username,
            id: user._id as string,
            email: user.email,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDb();
        let dbUser = await User.findOne({ email: user.email || profile?.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: user.email || profile?.email,
            username: user.name || profile?.login,
            avatar: user.image,
            provider: account?.provider,
            password: account?.provider === "github" && undefined,
          });
        } else if (account?.provider === "github" && !dbUser.avatar) {
          dbUser.avatar = user.image;
          dbUser.provider = account?.provider;
          await dbUser.save();
        }
        if (account) {
          account.userId = dbUser._id.toString();
        }
        user.id = dbUser._id.toString();
        return true;
      } catch (error) {
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (account && account.userId) {
        token.id = account.userId;
      } else if (user && user.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        await connectDb();
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          session.user.profileImage = dbUser.avatar;
          session.user.name = dbUser.username;
          session.user.email = dbUser.email;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60,
  },
  secret: process.env.NEXT_SECRET_TOKEN,
};