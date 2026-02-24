'use client';

import { changePassword } from "@/app/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-nebula-500 hover:bg-nebula-400 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? 'Updating...' : 'Update Password'}
        </button>
    );
}

export default function PasswordChangeForm() {
    const [state, dispatch] = useFormState(changePassword, undefined);
    const formRef = useRef<HTMLFormElement>(null);
    const isSuccess = state === 'success';

    useEffect(() => {
        if (isSuccess && formRef.current) {
            formRef.current.reset();
        }
    }, [isSuccess]);

    return (
        <form ref={formRef} action={dispatch} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
                <input
                    name="currentPassword"
                    type="password"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                    placeholder="••••••••"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                    placeholder="Min. 6 characters"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                    placeholder="••••••••"
                />
            </div>

            {state && state !== 'success' && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-4">
                    {state}
                </div>
            )}
            {isSuccess && (
                <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg py-2 px-4">
                    ✓ Password updated successfully!
                </div>
            )}

            <SubmitButton />
        </form>
    );
}
