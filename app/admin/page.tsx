'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, ArrowLeft, ShieldCheck, Loader2, Mail, User as UserIcon } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0 });
  const [usersList, setUsersList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Puxa o e-mail da variável de ambiente (Oculto no código)
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        // Trava de segurança: Redireciona se não for o Admin cadastrado no .env
        if (!session || session.user.email !== adminEmail) {
          router.push('/');
          return;
        }

        // Buscar todos os perfis da tabela 'profiles'
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, saldo_inicial, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUsersList(profiles || []);
        setStats({ totalUsers: profiles?.length || 0 });
      } catch (err) {
        console.error("Erro no carregamento:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="text-amber-500 text-xs font-black uppercase italic animate-pulse">Autenticando Lobo Alpha...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-black italic antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Admin */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/')} 
            className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all border-2 border-transparent hover:border-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-amber-500" />
            <h1 className="text-2xl uppercase tracking-tighter text-white">Wolf <span className="text-amber-500">Control Panel</span></h1>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-amber-500/20 shadow-2xl flex flex-col items-center group hover:border-amber-500/40 transition-all">
            <Users size={48} className="text-amber-500 mb-2 opacity-50 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Usuários na Alcateia</span>
            <div className="text-7xl tracking-tighter py-4 text-white">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl flex flex-col justify-center">
            <p className="text-slate-400 text-sm uppercase">Status do Sistema</p>
            <p className="text-emerald-500 text-xl uppercase mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Banco de Dados Ativo
            </p>
            <p className="text-slate-600 text-[10px] mt-4 uppercase">Sincronização de Meta-dados Ativada</p>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-[#111827] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-4 border-slate-800 bg-slate-800/50 flex justify-between items-center">
            <h2 className="uppercase tracking-widest text-sm">Membros Recentes</h2>
            <span className="text-[10px] bg-slate-700 px-3 py-1 rounded-full text-slate-400 uppercase">Total: {stats.totalUsers}</span>
          </div>
          
          <div className="divide-y-4 divide-slate-800">
            {usersList.length > 0 ? (
              usersList.map((u) => (
                <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 group-hover:rotate-3 transition-transform">
                      <UserIcon size={28} />
                    </div>
                    <div>
                      <p className="uppercase text-sm leading-none text-white group-hover:text-amber-500 transition-colors">
                        {u.full_name || 'Sem Nome Cadastrado'}
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase">
                        <Mail size={10} /> {u.email || 'E-mail não vinculado'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Saldo em Conta</p>
                    <p className="text-emerald-500 uppercase italic leading-none text-lg">
                      {u.saldo_inicial?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <p className="text-slate-600 uppercase text-xs tracking-[0.2em]">A alcateia está vazia no momento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}