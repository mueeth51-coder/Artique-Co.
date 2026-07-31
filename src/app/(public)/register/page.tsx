'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/components/site-shell';

export default function RegisterPage() {
  const { registerUser } = useShop();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setMessage('Please complete all fields to create your account.');
      return;
    }

    registerUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
    setMessage('Account registered successfully. You can now continue shopping and place orders.');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Create account</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register / Sign Up</h1>
      <p className="mt-3 text-slate-600">Join Artique Co. to save your details for faster future orders and a smoother checkout experience.</p>

      <div className="mt-6 grid gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-full border border-slate-200 px-4 py-3 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="rounded-full border border-slate-200 px-4 py-3 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-full border border-slate-200 px-4 py-3 text-sm" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Create password" className="rounded-full border border-slate-200 px-4 py-3 text-sm" />
        <button onClick={handleSubmit} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Register account</button>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}

      <div className="mt-5 text-sm text-slate-500">
        Already have an account? <Link href="/admin/login" className="font-semibold text-amber-700">Go to admin login</Link>
      </div>
    </div>
  );
}
