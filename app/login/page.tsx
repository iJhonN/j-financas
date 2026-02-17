'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ShieldCheck, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import BackgroundPaths from '@/components/BackgroundPaths';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [nome, setNome] = useState('');
  const [pin, setPin] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const router = useRouter();

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN;

  const validatePassword = (pass: string) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasLength = pass.length >= 10;
    if (!pass) return "";
    if (!hasLength) return "Mínimo de 10 caracteres";
    if (!hasUpper) return "Pelo menos uma letra maiúscula";
    if (!hasSymbol) return "Pelo menos um símbolo (!@#...)";
    return "";
  };

  useEffect(() => {
    setPassword('');
    setPasswordError('');
    setPin('');
    setStep(1);
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const error = validatePassword(password);
      if (error) {
        setPasswordError(error);
        return;
      }
    }
    if (loading) return;
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'login') {
        if (cleanEmail === ADMIN_EMAIL && step === 1) {
          const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (error) throw error;
          setStep(2);
          setLoading(false);
          return;
        }
        if (step === 2) {
          if (pin === ADMIN_PIN) {
            router.push('/');
            router.refresh();
          } else {
            throw new Error("PIN de segurança incorreto.");
          }
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
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
    <>
      <BackgroundPaths />

      {/* h-dvh garante altura real do dispositivo. justify-center centraliza verticalmente. */}
      <div className="h-dvh w-full flex items-center justify-center p-4 text-white font-black italic relative z-10 overflow-hidden">
        
        <form 
          onSubmit={handleAuth} 
          className="bg-[#111827]/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] p-7 md:p-10 border-4 border-slate-800/50 shadow-2xl transition-all flex flex-col justify-center"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6 md:mb-10 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-125" />
              <img 
                src="/logo.png" 
                alt="Wolf Finance Logo" 
                className="relative w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">
              WOLF <span className="text-blue-500">FINANCE</span>
            </h1>
          </div>
          
          <div className="space-y-4">
            {step === 1 ? (
              <>
                {authMode === 'signup' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input type="text" placeholder="NOME" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black uppercase text-xs" required />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 pl-12 bg-slate-900/50 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black text-xs" required />
                </div>
                
                <div className="relative group">
                  {authMode === 'signup' && !password && (
                    <div className="flex items-center gap-1 mb-1 text-[7px] md:text-[8px] text-blue-400 font-black uppercase tracking-[0.2em] animate-pulse">
                      <Info size={10} />
                      10+ chars, 1 Maiúscula e 1 Símbolo
                    </div>
                  )}
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-500'}`} size={18} />
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {authMode === 'signup' && passwordError && (
                    <p className="absolute -bottom-5 left-2 text-[8px] text-red-500 font-black uppercase italic tracking-widest animate-pulse">
                      {passwordError}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <ShieldCheck className="text-blue-500" size={32} />
                  <p className="text-center text-[10px] text-blue-400 uppercase tracking-widest font-black">PIN de Segurança</p>
                </div>
                <input autoFocus type="password" maxLength={6} placeholder="******" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-4 text-center text-3xl tracking-[0.5em] bg-blue-900/20 rounded-2xl border-2 border-blue-600 outline-none text-white font-black" required />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 md:py-5 rounded-[2rem] shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-[0.97] transition-all uppercase text-xs md:text-sm mt-2 italic tracking-widest flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : (step === 2 ? 'Validar PIN' : (authMode === 'login' ? 'Entrar' : 'Cadastrar'))}
            </button>
            
            {step === 1 && (
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-center text-[9px] text-slate-500 mt-4 cursor-pointer uppercase hover:text-blue-400 transition-all font-black">
                {authMode === 'login' ? 'Não tem conta? Registre-se' : 'Já sou membro? Login'}
              </button>
            )}
          </div>
        </form>

        {/* Créditos posicionado fixo na base para não atrapalhar o centro */}
        <div className="absolute bottom-6 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none">
          <p className="text-[7px] tracking-[0.4em] uppercase font-black mb-1">Engineered by</p>
          <p className="text-[10px] tracking-tighter font-black italic uppercase text-blue-500">
            Jhonatha <span className="text-white">| Wolf Finance © 2026</span>
          </p>
        </div>

      </div>
    </>
  );
}