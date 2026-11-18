'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Search } from 'lucide-react';
import { login, LoginActionResult } from '@/services/auth/login';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrand } from '@/components/providers/BrandProvider';

const initialState: LoginActionResult = {
  success: false,
  message: '',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const brand = useBrand();
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md shadow-lg border-stone-200/90">
      <CardHeader className="border-b border-stone-100 pb-4">
        <span className="inline-flex w-fit items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-800">
          Operations CRM Desk
        </span>
        <CardTitle className="mt-2 text-2xl font-extrabold text-slate-900">
          Staff Sign In — {brand.agencyName}
        </CardTitle>
        <p className="text-xs text-stone-500">
          Authorized travel counselors and agency administrators only.
        </p>
      </CardHeader>
      <CardContent className="pt-5">
        <form action={formAction} className="space-y-4">
          {callbackUrl && (
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          )}
          {state.message && !state.success && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="counselor@agency.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="mb-0">
                Password
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Signing In...' : 'Sign In to Staff Workspace →'}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
          <Link href="/" className="font-medium text-stone-600 hover:text-teal-700">
            ← Back to Public Website
          </Link>
          <Link href="/track-status" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline">
            <Search className="h-3.5 w-3.5" />
            Track a File
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
