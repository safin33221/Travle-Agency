import { Suspense } from 'react';
import { LoginForm } from '@/components/module/Auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-slate-500">Loading sign-in form...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
