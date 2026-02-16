'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        router.push('/'); // Redireciona para a Dashboard após login
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password, 
          options: { data: { full_name: nome.trim() } } 
        });
        if (error) throw error;
        alert("Conta criada! Verifique seu e-mail.");
        setAuthMode('login');
      }
    } catch (error: any) {
      alert(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1d] text-white font-black italic">
      <form onSubmit={handleAuth} className="bg-[#111827] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Wolf Finance" className="w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">WOLF FINANCE</h1>
        </div>
        
        <div className="space-y-4">
          {authMode === 'signup' && (
            <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black uppercase text-xs" required />
          )}
          
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs" required />
          
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-4 italic tracking-widest flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
          </button>
          
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-center text-[10px] text-slate-500 mt-6 cursor-pointer uppercase hover:text-white transition-all font-black">
            {authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
          </p>
        </div>
      </form>
    </div>
  );
}