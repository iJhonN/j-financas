'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, ShieldCheck, Settings, LogOut, 
  Loader2, Palette, Bell, CreditCard, Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "jhonatha2005@outlook.com";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased">
      
      {/* Header Simples */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-all shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl tracking-tighter">Minha Conta</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Info do Usuário */}
        <div className="bg-[#111827] p-8 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
            <User size={48} className="text-white" />
          </div>
          <h2 className="text-xl">{user?.user_metadata?.full_name || 'Membro Wolf'}</h2>
          <p className="text-[10px] text-slate-500 lowercase mt-1 font-bold italic">{user?.email}</p>
        </div>

        {/* Menu de Opções Estilo Lista */}
        <div className="bg-[#111827] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
          
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')}
              className="w-full flex items-center justify-between p-6 hover:bg-amber-500/10 text-amber-500 transition-all border-b border-slate-800/50"
            >
              <div className="flex items-center gap-4">
                <ShieldCheck size={20} />
                <span className="text-xs">Painel Administrativo</span>
              </div>
              <ChevronLeft size={16} className="rotate-180" />
            </button>
          )}

          <button 
            className="w-full flex items-center justify-between p-6 hover:bg-slate-800 transition-all border-b border-slate-800/50"
          >
            <div className="flex items-center gap-4">
              <Settings size={20} className="text-blue-500" />
              <span className="text-xs">Configurações do Perfil</span>
            </div>
            <ChevronLeft size={16} className="rotate-180" />
          </button>

          <button 
            className="w-full flex items-center justify-between p-6 hover:bg-slate-800 transition-all border-b border-slate-800/50"
          >
            <div className="flex items-center gap-4">
              <Palette size={20} className="text-emerald-500" />
              <span className="text-xs">Personalizar Tema</span>
            </div>
            <ChevronLeft size={16} className="rotate-180" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-6 hover:bg-rose-950/30 text-rose-500 transition-all"
          >
            <div className="flex items-center gap-4">
              <LogOut size={20} />
              <span className="text-xs">Sair da Conta</span>
            </div>
          </button>
        </div>

        {/* Footer Wolf */}
        <p className="text-center text-[8px] text-slate-600 tracking-[0.3em] font-black uppercase">
          Wolf Finance System v2.0
        </p>
      </div>
    </div>
  );
}