'use client';

import { useState, useTransition } from 'react';
import { createStaff, updateStaff } from '@/services/staff/staff.service';
import { StaffRole, StaffUser } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export function StaffManagementClient({ staff }: { staff: StaffUser[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    startTransition(async () => {
      const res = await createStaff({
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
        role: (formData.get('role') as StaffRole) || 'SALES_AGENT',
      });

      if (!res.success) {
        setError(res.message);
        return;
      }
      formEl.reset();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Create Staff Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}
            <div>
              <Label>Full Name *</Label>
              <Input name="name" placeholder="Rahim Uddin" required />
            </div>
            <div>
              <Label>Work Email *</Label>
              <Input
                name="email"
                type="email"
                placeholder="agent@travelpilot.internal"
                required
              />
            </div>
            <div>
              <Label>Initial Password *</Label>
              <Input
                name="password"
                type="password"
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                name="role"
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                defaultValue="SALES_AGENT"
              >
                <option value="SALES_AGENT">SALES_AGENT</option>
                <option value="OWNER_ADMIN">OWNER_ADMIN</option>
              </select>
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Staff Account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Authorized Agency Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-3">Name & Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Last Login</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(staff || []).map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await updateStaff(u.id, {
                              status:
                                u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            });
                            if (!res.success) setError(res.message);
                          })
                        }
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(staff || []).length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No staff members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
