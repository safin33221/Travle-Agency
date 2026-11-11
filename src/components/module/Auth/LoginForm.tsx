'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, LoginActionResult } from '@/services/auth/login';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { brandConfig } from '@/config/brand.config';

const initialState: LoginActionResult = {
  success: false,
  message: '',
};

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Staff Sign In — {brandConfig.shortName}
        </CardTitle>
        <p className="text-sm text-slate-500">
          Authorized agency team members only. No public sign-up.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message && !state.success && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              {state.message}
            </div>
          )}

          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@travelpilot.internal"
              defaultValue="admin@travelpilot.internal"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              defaultValue="Admin@TravelPilot2026!"
              required
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Authenticating...' : 'Sign In to Workspace'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
