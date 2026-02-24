'use client';

import { authenticate } from '@/app/lib/actions';
import { Rocket } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? 'Authenticating...' : 'Enter Control Room'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nebula-900/40 via-background to-background z-0" />

            <div className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nebula-500/20 mb-4 animate-float">
                        <Rocket className="w-8 h-8 text-nebula-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Command Access</h1>
                    <p className="text-gray-400">Identify yourself to proceed.</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    {errorMessage && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-4">
                            {errorMessage}
                        </div>
                    )}
                    <LoginButton />
                </form>
            </div>
        </div>
    );
}
