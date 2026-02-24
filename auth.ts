
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from './auth.config';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'Admin Login',
            credentials: {
                username: { label: 'Username', type: 'text', placeholder: 'admin' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string() })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log('Invalid credentials format');
                    return null;
                }

                const { username, password } = parsedCredentials.data;

                // Check database first (for changed passwords)
                const adminConfig = await prisma.adminConfig.findUnique({
                    where: { id: 'admin' },
                });

                if (adminConfig) {
                    // DB credentials exist — use bcrypt comparison
                    if (username === adminConfig.username && await bcrypt.compare(password, adminConfig.password)) {
                        return {
                            id: '1',
                            name: 'Admin Controller',
                            email: 'admin@lunar.gallery',
                        };
                    }
                } else {
                    // Fall back to .env credentials (first-time / no password change yet)
                    const envUsername = process.env.ADMIN_USERNAME || 'admin';
                    const envPassword = process.env.ADMIN_PASSWORD;

                    if (username === envUsername && password === envPassword) {
                        return {
                            id: '1',
                            name: 'Admin Controller',
                            email: 'admin@lunar.gallery',
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
