'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, ArrowLeft, ShieldCheck, Loader2, Mail, User as UserIcon, Wallet } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0 });
  const [usersList, setUsersList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
        const userEmail = session?.user?.email?.trim().toLowerCase();

        // Trava de segurança
        if (!session || userEmail !== adminEmail) {
          router.push('/');
          return;
        }

        // Busca apenas as colunas que confirmamos que existem no seu JSON
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, saldo_inicial');

        if (error) throw error;

        setUsersList(profiles || []);
        setStats({ totalUsers: profiles?.length || 0 });
      } catch (err) {
        console.error("Erro ao carregar admin:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-black italic antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-amber-500" />
            <h1 className="text-2xl uppercase tracking-tighter">Wolf Control Panel</h1>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-amber-500/20 flex flex-col items-center">
            <Users size={48} className="text-amber-500 mb-2 opacity-50" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Membros na Alcateia</span>
            <div className="text-7xl tracking-tighter py-4 font-black">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-slate-800 flex flex-col justify-center">
            <p className="text-slate-400 text-sm uppercase">Segurança</p>
            <p className="text-emerald-500 text-xl uppercase mt-2">Dados Sincronizados</p>
            <p className="text-slate-600 text-[10px] mt-4 uppercase font-black">Conectado: {process.env.NEXT_PUBLIC_ADMIN_EMAIL}</p>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-[#111827] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-4 border-slate-800 bg-slate-800/50 flex justify-between">
            <h2 className="uppercase tracking-widest text-sm font-black text-slate-300">Lista de Membros</h2>
          </div>
          <div className="divide-y-4 divide-slate-800">
            {usersList.map((u) => (
              <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 group-hover:rotate-3 transition-transform">
                    <UserIcon size={28} />
                  </div>
                  <div>
                    <p className="uppercase text-sm leading-none font-black text-white">{u.full_name || 'Usuário Anonimo'}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase font-black">
                      <Mail size={10} /> {u.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Saldo em Conta</p>
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <Wallet size={14} className="text-emerald-500" />
                    <p className="text-emerald-500 uppercase font-black text-lg">
                      {u.saldo_inicial?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}