'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type Mode = 'login' | 'register';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('error') === 'confirm' ? 'Link konfirmasi tidak valid atau sudah kedaluwarsa.' : ''
  );
  const [message, setMessage] = useState('');

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const supabase = createClient();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message);
        setIsLoading(false);
        return;
      }
      const next = searchParams.get('next');
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setIsLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace('/');
      return;
    }
    setMessage('Pendaftaran berhasil. Cek email Anda untuk konfirmasi, lalu masuk.');
    setMode('login');
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{mode === 'login' ? 'Masuk' : 'Daftar Akun Baru'}</CardTitle>
        <p className="text-sm text-slate-500">
          {mode === 'login' ? 'Masuk untuk membuka dashboard.' : 'Buat akun untuk mulai mencatat transaksi.'}
        </p>
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Supabase belum dikonfigurasi. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> di environment variables.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || !isSupabaseConfigured}>
            {isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            type="button"
            className="font-medium text-emerald-700 hover:underline"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-slate-900 p-12 text-slate-100">
        <h1 className="text-2xl font-bold leading-tight text-emerald-400">Accounting Management System</h1>
        <div className="space-y-3">
          <p className="text-3xl font-semibold leading-snug">Kelola jurnal, buku besar, dan laporan keuangan dalam satu tempat.</p>
          <p className="text-slate-400">Data tersimpan aman di database dan bisa diakses dari perangkat mana pun.</p>
        </div>
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Accounting Management System</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-xl font-bold text-emerald-600 lg:hidden">Accounting Management System</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
