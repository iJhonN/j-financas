'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Acesso Negado. Verifique os dados.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Wolf Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">WOLF FINANCE</h1>
          <p className="text-[9px] font-black italic text-blue-500 uppercase tracking-[0.2em]">Gestão GR Auto Peças</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="p-4 bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl text-rose-500 text-[9px] font-black italic text-center uppercase">{error}</div>}
          
          <input 
            type="email" 
            placeholder="E-MAIL DE ACESSO" 
            className="input-wolf py-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input 
            type="password" 
            placeholder="SENHA DE ACESSO" 
            className="input-wolf py-5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className="btn-wolf-primary w-full py-6 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <><span className="text-[11px] font-black italic uppercase">ENTRAR NO SISTEMA</span> <ArrowRight size={18}/></>}
          </button>
        </form>
        
        <p className="mt-8 text-center text-[8px] text-slate-600 font-black italic uppercase">© 2026 WOLF SYSTEM - SEGURANÇA MÁXIMA</p>
      </div>
    </div>
  );
}