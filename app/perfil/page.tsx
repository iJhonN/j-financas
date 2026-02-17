'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, ShieldCheck, Settings, LogOut, 
  Loader2, Palette, Lock, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600', hover: 'hover:bg-blue-700' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', hover: 'hover:bg-emerald-700' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', hover: 'hover:bg-violet-700' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600', hover: 'hover:bg-rose-700' }
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  
  const [novoNome, setNovoNome] = useState('');
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const theme = THEMES[currentTheme];
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        setNovoNome(session.user.user_metadata?.full_name || '');
        const { data: profile } = await supabase.from('profiles').select('theme').eq('id', session.user.id).maybeSingle();
        if (profile?.theme) setCurrentTheme(profile.theme as any);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const handleUpdateSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
    if (novaSenha !== confirmarSenha) return showAlert("Senhas não coincidem", "error");
    if (!regex.test(novaSenha)) return showAlert("Use Maiúscula e Símbolo", "error");

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAntiga,
    });

    if (authError) return showAlert("Senha atual incorreta", "error");

    const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
    if (!updateError) {
      showAlert("Senha alterada!");
      setSenhaAntiga(''); setNovaSenha(''); setConfirmarSenha('');
    } else showAlert("Erro ao atualizar", "error");
  };
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased pb-20">
      
      {/* Alertas */}
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500' : 'bg-emerald-950/80 border-emerald-500'}`}>
            <p className="text-[10px] font-black">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all shadow-lg text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl tracking-tighter">PERFIL WOLF</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* NOME */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest">NOME DO OPERADOR</label>
          <div className="flex gap-2">
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="flex-1 bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase" />
            <button onClick={async () => { await supabase.auth.updateUser({ data: { full_name: novoNome.toUpperCase() } }); showAlert("Salvo!"); }} 
                    className={`${theme.primary} ${theme.hover} px-6 rounded-2xl active:scale-95 transition-all text-[10px] font-black shadow-lg`}>
              SALVAR
            </button>
          </div>
        </section>

        {/* TEMAS */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest text-center">COR DO SISTEMA</label>
          <div className="flex justify-around items-center">
            {Object.keys(THEMES).map((tKey) => (
              <button 
                key={tKey} 
                onClick={() => { setCurrentTheme(tKey as any); supabase.from('profiles').update({ theme: tKey }).eq('id', user.id); showAlert("Estilo Wolf!"); }} 
                className={`w-14 h-14 rounded-full border-4 transition-all hover:scale-110 active:scale-90 ${currentTheme === tKey ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-30'} ${THEMES[tKey as keyof typeof THEMES].primary}`} 
              />
            ))}
          </div>
        </section>
        {/* SENHA */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest">SEGURANÇA</label>
          <form onSubmit={handleUpdateSenha} className="space-y-4">
            <input type="password" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} placeholder="SENHA ATUAL" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            <input type={showPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="CONFIRMAR NOVA" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
            <button type="submit" className="w-full bg-white text-black py-5 rounded-[2rem] hover:bg-slate-200 active:scale-[0.97] transition-all text-[11px] font-black shadow-xl">
              ATUALIZAR CREDENCIAIS
            </button>
          </form>
        </section>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="space-y-4">
          {isAdmin && (
            <button onClick={() => router.push('/admin')} className="w-full flex items-center justify-between p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-[2rem] text-amber-500 hover:bg-amber-500/20 active:scale-[0.98] transition-all group">
              <div className="flex items-center gap-4"><ShieldCheck size={22} /><span className="text-[10px] font-black">PAINEL DO ADMINISTRADOR</span></div>
              <ChevronLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center justify-between p-6 bg-rose-500/10 border-2 border-rose-500/30 rounded-[2rem] text-rose-500 hover:bg-rose-500/20 active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-4"><LogOut size={22} /><span className="text-[10px] font-black">SAIR DO SISTEMA</span></div>
            <ChevronLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}