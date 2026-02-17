'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, ShieldCheck, Settings, LogOut, 
  Loader2, Palette, Lock, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600' }
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
    
    if (novaSenha !== confirmarSenha) return showAlert("Senhas novas não coincidem", "error");
    if (!regex.test(novaSenha)) return showAlert("Nova senha sem Maiúscula/Símbolo", "error");

    // Passo 1: Validar a senha antiga tentando um re-login silencioso
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAntiga,
    });

    if (authError) return showAlert("Senha antiga incorreta", "error");

    // Passo 2: Se a antiga estiver certa, atualiza para a nova
    const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
    
    if (!updateError) {
      showAlert("Senha Wolf atualizada!");
      setSenhaAntiga(''); setNovaSenha(''); setConfirmarSenha('');
    } else {
      showAlert("Erro ao processar troca", "error");
    }
  };
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased pb-20">
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            <p className="text-[10px] tracking-widest uppercase">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-all shadow-lg"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl tracking-tighter">AJUSTES WOLF</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest font-black">NOME DE USUÁRIO</label>
          <div className="flex gap-2">
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="flex-1 bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-xs uppercase italic" />
            <button onClick={async () => { await supabase.auth.updateUser({ data: { full_name: novoNome.toUpperCase() } }); showAlert("Perfil Salvo!"); }} className="bg-blue-600 px-6 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-[10px] font-black">SALVAR</button>
          </div>
        </section>

        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest font-black">TEMA DO SISTEMA</label>
          <div className="flex justify-between px-2">
            {Object.keys(THEMES).map((tKey) => (
              <button key={tKey} onClick={() => { setCurrentTheme(tKey as any); supabase.from('profiles').update({ theme: tKey }).eq('id', user.id); showAlert("Estilo Aplicado!"); }} className={`w-12 h-12 rounded-full border-4 transition-all ${currentTheme === tKey ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-30'} ${THEMES[tKey as keyof typeof THEMES].primary}`} />
            ))}
          </div>
        </section>
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <label className="text-[10px] text-slate-500 mb-4 block tracking-widest font-black">ALTERAR SENHA</label>
          <form onSubmit={handleUpdateSenha} className="space-y-4">
            <input type="password" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} placeholder="SENHA ATUAL" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
            
            <div className="h-px bg-white/5 my-2" />

            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-500">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            
            <input type={showPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="CONFIRMAR NOVA SENHA" className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase italic" required />
            
            <button type="submit" className="w-full bg-slate-100 text-black py-4 rounded-2xl hover:bg-white active:scale-95 transition-all text-[10px] font-black uppercase">CONFIRMAR TROCA</button>
          </form>
        </section>

        <div className="space-y-3">
          {isAdmin && <button onClick={() => router.push('/admin')} className="w-full flex items-center gap-4 p-5 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl text-amber-500 font-black text-[10px] italic"><ShieldCheck size={20} /> PAINEL ADMIN</button>}
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center gap-4 p-5 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl text-rose-500 font-black text-[10px] italic"><LogOut size={20} /> SAIR DO WOLF</button>
        </div>
      </div>
    </div>
  );
}