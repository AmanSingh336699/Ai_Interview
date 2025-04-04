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
      await connectDb();

      let dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        dbUser = await User.create({
          email: user.email,
          username: user.name || profile?.login,
          avatar: user.image,
        });
      } else if (account?.provider === "github" && !dbUser.avatar) {
        dbUser.avatar = user.image;
        await dbUser.save();
      }

      user.id = dbUser._id.toString();
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
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