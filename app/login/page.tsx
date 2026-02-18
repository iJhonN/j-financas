'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ShieldCheck, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import BackgroundPaths from '@/components/BackgroundPaths';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [pin, setPin] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN;

  const validatePassword = useCallback((pass: string) => {
    if (!pass) return "";
    if (pass.length < 10) return "Mínimo de 10 caracteres";
    if (!/[A-Z]/.test(pass)) return "Pelo menos uma letra maiúscula";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Pelo menos um símbolo (!@#...)";
    return "";
  }, []);

  useEffect(() => {
    setPassword('');
    setPasswordError('');
    setPin('');
    setStep(1);
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (authMode === 'signup') {
      const error = validatePassword(password);
      if (error) return setPasswordError(error);
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;

        // Lógica de Segundo Passo para Admin
        if (cleanEmail === ADMIN_EMAIL && step === 1) {
          setStep(2);
          setLoading(false);
          return;
        }

        if (step === 2 && pin !== ADMIN_PIN) throw new Error("PIN de segurança incorreto.");
        
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password, 
          options: { data: { full_name: nome.trim() } } 
        });
        if (error) throw error;
        alert("CONTA CRIADA! ACESSO LIBERADO."); // Ajustado para sua nova política sem verificação de e-mail
        setAuthMode('login');
      }
    } catch (error: any) {
      alert(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundPaths />
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4 text-white font-black italic z-10 overflow-hidden">
        
        <form 
          onSubmit={handleAuth} 
          className="bg-[#111827]/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] p-7 md:p-10 border-4 border-slate-800/50 shadow-2xl transition-all duration-500 hover:border-blue-500/30"
        >
          {/* Logo e Título */}
          <div className="flex flex-col items-center mb-8 md:mb-10 text-center group">
            <div className="relative mb-3 transition-transform duration-500 group-hover:scale-110">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-125 animate-pulse" />
              <img src="/logo.png" alt="Wolf Logo" className="relative w-24 h-24 md:w-36 md:h-36 object-contain" />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
              WOLF <span className="text-blue-500">FINANCE</span>
            </h1>
          </div>
          
          <div className="space-y-4">
            {step === 1 ? (
              <>
                {authMode === 'signup' && (
                  <InputGroup icon={<User size={18}/>} placeholder="NOME COMPLETO">
                    <input type="text" placeholder="NOME" value={nome} onChange={(e) => setNome(e.target.value)} className="auth-input" required />
                  </InputGroup>
                )}
                
                <InputGroup icon={<Mail size={18}/>} placeholder="E-MAIL">
                  <input type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" required />
                </InputGroup>
                
                <div className="relative group">
                  {authMode === 'signup' && !password && (
                    <div className="flex items-center gap-1 mb-1 text-[7px] text-blue-400 font-black uppercase tracking-widest animate-in fade-in">
                      <Info size={10} /> REQUISITOS: 10+ CHARS, MAIÚSCULA E SÍMBOLO
                    </div>
                  )}
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors ${passwordError ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-500'}`}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="SENHA" 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authMode === 'signup') setPasswordError(validatePassword(e.target.value));
                    }} 
                    className={`w-full p-4 pl-12 bg-slate-900/50 rounded-2xl border-2 outline-none text-white font-black text-xs transition-all ${passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-blue-600'}`} 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {authMode === 'signup' && passwordError && (
                    <p className="absolute -bottom-5 left-2 text-[8px] text-red-500 font-black uppercase italic tracking-widest animate-pulse">{passwordError}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <ShieldCheck className="text-blue-500 animate-bounce" size={32} />
                  <p className="text-center text-[10px] text-blue-400 uppercase tracking-widest font-black">PIN de Segurança</p>
                </div>
                <input autoFocus type="password" maxLength={6} placeholder="******" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 text-center text-3xl tracking-[0.5em] bg-blue-900/20 rounded-2xl border-2 border-blue-600 outline-none text-white font-black transition-all focus:bg-blue-900/30" required />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white font-black py-4 md:py-5 rounded-[2rem] shadow-xl hover:bg-blue-500 hover:shadow-blue-500/20 hover:tracking-widest active:scale-[0.97] transition-all flex items-center justify-center gap-3 uppercase text-xs md:text-sm mt-4 italic"
            >
              {loading ? <Loader2 className="animate-spin" /> : (step === 2 ? 'Validar PIN' : (authMode === 'login' ? 'Acessar Alcateia' : 'Criar Conta'))}
            </button>
            
            {step === 1 && (
              <button 
                type="button" 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                className="w-full text-center text-[9px] text-slate-500 mt-4 uppercase hover:text-blue-400 transition-all font-black"
              >
                {authMode === 'login' ? 'Novo por aqui? Junte-se à Alcateia' : 'Já possui acesso? Fazer Login'}
              </button>
            )}
          </div>
        </form>

        {/* Créditos fixos */}
        <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none z-[10]">
          <p className="text-[7px] tracking-[0.4em] uppercase font-black mb-1">Engineered by</p>
          <p className="text-[10px] tracking-tighter font-black italic uppercase text-blue-500">
            Jhonatha <span className="text-white">| Wolf Finance © 2026</span>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .auth-input {
          width: 100%;
          padding: 1rem;
          padding-left: 3rem;
          background-color: rgba(15, 23, 42, 0.5);
          border-radius: 1rem;
          border: 2px solid #334155;
          outline: none;
          color: white;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 0.75rem;
          transition: all 0.3s;
        }
        .auth-input:focus {
          border-color: #2563eb;
          background-color: rgba(15, 23, 42, 0.8);
        }
      `}</style>
    </>
  );
}

function InputGroup({ icon, children }: any) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-10">
        {icon}
      </div>
      {children}
    </div>
  );
}