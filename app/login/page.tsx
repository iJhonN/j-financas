'use client';

import React, { useState } from 'react';
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
        router.refresh(); // Garante que o estado da sessão seja atualizado no servidor
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password, 
          options: { 
            data: { full_name: nome.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback` // Boa prática para links de confirmação
          } 
        });
        if (error) throw error;
        alert("Sucesso! Verifique seu e-mail para confirmar o cadastro.");
        setAuthMode('login');
      }
    } catch (error: any) {
      // Tradução simples de erros comuns do Supabase
      const message = error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos.' 
        : error.message;
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1d] text-white font-black italic">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleAuth} 
          className="bg-[#111827] rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl transition-all duration-300"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
               <img src="/logo.png" alt="Wolf Finance" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
              WOLF <span className="text-blue-500">FINANCE</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase not-italic tracking-widest mt-1">
              {authMode === 'login' ? 'Área de Acesso' : 'Crie sua conta'}
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Campo Nome (Apenas Signup) */}
            {authMode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="NOME COMPLETO" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  className="w-full p-4 pl-12 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black uppercase text-xs transition-colors" 
                  required 
                />
              </div>
            )}
            
            {/* Campo Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="E-MAIL" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-4 pl-12 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs transition-colors" 
                required 
              />
            </div>
            
            {/* Campo Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="SENHA" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-4 pl-12 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs transition-colors" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Botão Submit */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all uppercase text-sm mt-4 italic tracking-widest flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
            </button>
            
            {/* Toggle Login/Signup */}
            <button 
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setNome(''); // Limpa o nome ao alternar
              }} 
              className="w-full text-center text-[10px] text-slate-500 mt-6 cursor-pointer uppercase hover:text-white transition-all font-black tracking-widest"
            >
              {authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}