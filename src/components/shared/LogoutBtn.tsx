'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth/logout';
import { Button } from '@/components/ui/button';

export function LogoutBtn() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
