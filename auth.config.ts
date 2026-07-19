import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { z } from "zod";
import bcryptjs from "bcryptjs";

// Import your Prisma client
// import { prisma } from "@/lib/prisma";

export default {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Get user from database
        // const user = await prisma.user.findUnique({
        //   where: { email },
        // });

        // if (!user || !user.password) return null;

        // const passwordsMatch = await bcryptjs.compare(
        //   password,
        //   user.password
        // );

        // if (!passwordsMatch) return null;

        // return {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   image: user.avatar,
        // };

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
