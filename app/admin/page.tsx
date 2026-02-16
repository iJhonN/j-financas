'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, ArrowLeft, ShieldCheck, Loader2, Mail, User } from 'lucide-react';

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

        // Trava de segurança: Redireciona se não for o Admin
        if (!session || session.user.email !== adminEmail) {
          router.push('/');
          return;
        }

        // Buscar todos os perfis (Puxa tudo em uma única chamada eficiente)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
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
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-black italic antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Admin */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/')} 
            className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-amber-500" />
            <h1 className="text-2xl uppercase tracking-tighter">Wolf Control Panel</h1>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-amber-500/20 shadow-2xl flex flex-col items-center">
            <Users size={48} className="text-amber-500 mb-2 opacity-50" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Usuários Ativos</span>
            <div className="text-7xl tracking-tighter py-4">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-[#111827] p-8 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl flex flex-col justify-center">
            <p className="text-slate-400 text-sm uppercase">Segurança do Sistema</p>
            <p className="text-emerald-500 text-xl uppercase mt-2">Banco de Dados Ativo</p>
            <p className="text-slate-600 text-[10px] mt-4 uppercase">Acesso restrito via variável de ambiente.</p>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-[#111827] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-4 border-slate-800 bg-slate-800/50">
            <h2 className="uppercase tracking-widest text-sm">Lista de Membros</h2>
          </div>
          <div className="divide-y-4 divide-slate-800">
            {usersList.length > 0 ? (
              usersList.map((u) => (
                <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950">
                      <User size={28} />
                    </div>
                    <div>
                      <p className="uppercase text-sm leading-none">{u.full_name || 'Usuário Sem Nome'}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1 uppercase">
                        <Mail size={10} /> {u.email || 'Email oculto'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Saldo Registrado</p>
                    <p className="text-emerald-500 uppercase italic leading-none">
                      {u.saldo_inicial?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-600 uppercase text-xs">Nenhum usuário cadastrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}