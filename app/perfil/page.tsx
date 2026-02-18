'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, ShieldCheck, Settings, LogOut, 
  Loader2, Palette, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Save
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

  const theme = THEMES[currentTheme];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      setUser(session.user);
      setNovoNome(session.user.user_metadata?.full_name || '');
      
      const { data: profile } = await supabase.from('profiles').select('theme').eq('id', session.user.id).maybeSingle();
      if (profile?.theme) setCurrentTheme(profile.theme as any);
      setLoading(false);
    };
    init();
  }, [router]);

  const showAlert = (msg: string, type = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(p => ({ ...p, show: false })), 4000);
  };

  const handleUpdateSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) return showAlert("Senhas não coincidem", "error");
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/.test(novaSenha)) return showAlert("Use Maiúscula e Símbolo", "error");

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaAntiga,
    });

    if (authError) {
      setLoading(false);
      return showAlert("Senha atual incorreta", "error");
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
    setLoading(false);
    
    if (!updateError) {
      showAlert("Senha alterada!");
      setSenhaAntiga(''); setNovaSenha(''); setConfirmarSenha('');
    } else showAlert("Erro ao atualizar", "error");
  };

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased pb-20 leading-none">
      
      {/* ALERTAS PREMIUM */}
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 mb-10 max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all shadow-lg">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl tracking-tighter italic">CONFIGURAÇÕES</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* IDENTIDADE */}
        <section className="bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl hover:border-slate-700 transition-colors">
          <label className="text-[9px] text-slate-500 mb-5 block tracking-[0.3em] font-black">IDENTIDADE NA ALCATEIA</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="flex-1 bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-xs uppercase transition-all" />
            <button onClick={async () => { await supabase.auth.updateUser({ data: { full_name: novoNome.toUpperCase() } }); showAlert("Nome Atualizado!"); }} 
                    className={`${theme.primary} px-8 py-4 rounded-2xl active:scale-95 transition-all text-[10px] font-black shadow-lg hover:brightness-110 flex items-center justify-center gap-2`}>
              <Save size={16}/> SALVAR
            </button>
          </div>
        </section>

        {/* PERSONALIZAÇÃO DE TEMA */}
        <section className="bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl">
          <label className="text-[9px] text-slate-500 mb-6 block tracking-[0.3em] text-center font-black">ESTILO DO SISTEMA</label>
          <div className="flex justify-around items-center gap-4">
            {Object.keys(THEMES).map((tKey) => (
              <button 
                key={tKey} 
                onClick={async () => { 
                  setCurrentTheme(tKey as any); 
                  await supabase.from('profiles').update({ theme: tKey }).eq('id', user.id); 
                  showAlert("Wolf Estilizado!"); 
                }} 
                className={`group relative w-16 h-16 rounded-3xl border-4 transition-all duration-300 hover:scale-110 active:scale-90 ${currentTheme === tKey ? 'border-white shadow-[0_0_25px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-40 hover:opacity-100'} ${THEMES[tKey as keyof typeof THEMES].primary}`} 
              >
                {currentTheme === tKey && <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in"><CheckCircle size={24} className="text-white"/></div>}
              </button>
            ))}
          </div>
        </section>

        {/* SEGURANÇA E ACESSO */}
        <section className="bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl">
          <label className="text-[9px] text-slate-500 mb-6 block tracking-[0.3em] font-black">SEGURANÇA DA CONTA</label>
          <form onSubmit={handleUpdateSenha} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18}/>
              <input type="password" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} placeholder="SENHA ATUAL" className="auth-input" required />
            </div>
            
            <div className="relative group">
              <input type={showPassword ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="auth-input" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>

            <input type={showPassword ? "text" : "password"} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="CONFIRMAR NOVA" className="auth-input" required />
            
            <button type="submit" className="w-full bg-white text-black py-5 rounded-[2rem] hover:bg-slate-200 hover:tracking-widest active:scale-[0.97] transition-all text-[11px] font-black shadow-xl mt-4">
              ATUALIZAR CREDENCIAIS
            </button>
          </form>
        </section>

        {/* NAVEGAÇÃO FINAL */}
        <div className="space-y-4 pt-4">
          {user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
            <NavButton onClick={() => router.push('/admin')} icon={<ShieldCheck size={22} />} label="PAINEL DO ADMINISTRADOR" color="amber" />
          )}
          <NavButton onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} icon={<LogOut size={22} />} label="SAIR DO SISTEMA" color="rose" />
        </div>
      </div>

      <footer className="relative mt-12 pb-8 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 font-black italic pointer-events-none">
        <p className="text-[7px] tracking-[0.4em] mb-1 uppercase">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>

      <style jsx global>{`
        .auth-input {
          width: 100%;
          background-color: #0f172a;
          border: 2px solid #1e293b;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 1.25rem;
          outline: none;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          font-size: 0.75rem;
          transition: all 0.3s;
        }
        .auth-input:focus {
          border-color: #2563eb;
          background-color: #020617;
        }
      `}</style>
    </div>
  );
}

// COMPONENTES AUXILIARES
function NavButton({ onClick, icon, label, color }: any) {
  const colors: any = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-6 border-2 rounded-[2.5rem] transition-all active:scale-[0.98] group ${colors[color]}`}>
      <div className="flex items-center gap-4">{icon}<span className="text-[10px] font-black tracking-widest">{label}</span></div>
      <ChevronLeft size={18} className="rotate-180 group-hover:translate-x-2 transition-transform" />
    </button>
  );
}