'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
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

  // Limpa campos sensíveis ao trocar de modo
  useEffect(() => {
    setPassword('');
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password, 
          options: { 
            data: { full_name: nome.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          } 
        });
        if (error) throw error;
        alert("Conta criada! Verifique seu e-mail para confirmar.");
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
      <form 
        onSubmit={handleAuth} 
        className="bg-[#111827] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl transition-all"
      >
        {/* Header - Logo aumentada com aura sutil */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4">
            {/* O "Brilhinho" sutil que você pediu */}
            <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full" />
            <img 
              src="/logo.png" 
              alt="Wolf Finance Logo" 
              className="relative w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
            />
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
            WOLF <span className="text-blue-500">FINANCE</span>
          </h1>
        </div>
        
        <div className="space-y-5">
          {/* Campo Nome */}
          {authMode === 'signup' && (
            <div className="relative group">
              <label htmlFor="nome" className="sr-only">Nome Completo</label>
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                id="nome"
                type="text" 
                placeholder="NOME COMPLETO" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="w-full p-4 pl-12 bg-slate-800/50 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black uppercase text-xs transition-all" 
                required 
              />
            </div>
          )}
          
          {/* Campo E-mail */}
          <div className="relative group">
            <label htmlFor="email" className="sr-only">E-mail</label>
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              id="email"
              type="email" 
              placeholder="E-MAIL" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 pl-12 bg-slate-800/50 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs transition-all" 
              required 
            />
          </div>
          
          {/* Campo Senha */}
          <div className="relative group">
            <label htmlFor="password" className="sr-only">Senha</label>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="SENHA" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 pl-12 bg-slate-800/50 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs transition-all" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              title={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Botão Principal */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 active:scale-[0.97] transition-all uppercase text-sm mt-4 italic tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              authMode === 'login' ? 'Entrar na Alcateia' : 'Criar minha Conta'
            )}
          </button>
          
          {/* Toggle Link */}
          <button 
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
            className="w-full text-center text-[10px] text-slate-500 mt-6 cursor-pointer uppercase hover:text-blue-400 transition-all font-black tracking-[0.2em]"
          >
            {authMode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já é um membro? Faça login'}
          </button>
        </div>
      </form>
    </div>
  );
}