'use client';

import { useTransition } from 'react';
import { archivePackage } from '@/services/packages/packages.service';
import { Button } from '@/components/ui/button';

export function PackageArchiveBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await archivePackage(id);
        })
      }
    >
      {isPending ? 'Archiving...' : 'Archive'}
    </Button>
  );
}
