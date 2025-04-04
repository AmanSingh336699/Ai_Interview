import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profileImage?: string;
    } & DefaultSession["user"];
  }
  interface Profile {
    login?: string;
  }
}