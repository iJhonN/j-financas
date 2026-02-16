'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, ArrowLeft, ShieldCheck, Loader2, Mail, User as UserIcon, Wallet, Calendar, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const router = useRouter();

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, saldo_inicial, expires_at')
      .order('full_name', { ascending: true });

    if (!error) setUsersList(profiles || []);
    setLoading(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
      if (!session || session.user.email?.trim().toLowerCase() !== adminEmail) {
        router.push('/');
        return;
      }
      fetchUsers();
    };
    checkAdmin();
  }, [router]);

  // Função para adicionar dias de acesso
  const handleAddAccess = async (userId: string, currentExpiresAt: string | null) => {
    const diasParaAdicionar = 30;
    const hoje = new Date();
    let dataBase = currentExpiresAt ? new Date(currentExpiresAt) : hoje;

    // Se a data de expiração já passou, começa a contar de hoje
    if (dataBase < hoje) dataBase = hoje;

    const novaData = new Date(dataBase);
    novaData.setDate(novaData.getDate() + diasParaAdicionar);

    const { error } = await supabase
      .from('profiles')
      .update({ expires_at: novaData.toISOString() })
      .eq('id', userId);

    if (error) {
      alert("Erro ao atualizar acesso");
    } else {
      fetchUsers(); // Atualiza a lista na tela
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-black italic antialiased">
      <div className="max-w-5xl mx-auto">
        
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

        {/* Lista de Usuários */}
        <div className="bg-[#111827] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-4 border-slate-800 bg-slate-800/50">
            <h2 className="uppercase tracking-widest text-sm text-slate-300">Gestão de Acesso Beta</h2>
          </div>

          <div className="divide-y-4 divide-slate-800">
            {usersList.map((u) => {
              const isExpired = !u.expires_at || new Date(u.expires_at) < new Date();
              const expireDate = u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : 'Sem Acesso';

              return (
                <div key={u.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-800/30 transition-all group">
                  
                  {/* Info Usuário */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg">
                      <UserIcon size={28} />
                    </div>
                    <div>
                      <p className="uppercase text-sm leading-none text-white">{u.full_name || 'Membro'}</p>
                      <p className="text-slate-500 text-[10px] mt-1 uppercase truncate max-w-[150px] md:max-w-none">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Status de Acesso */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${isExpired ? 'border-red-500/20 bg-red-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
                      {isExpired ? <AlertCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                      <div className="text-left">
                        <p className={`text-[9px] uppercase leading-none ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>Expira em</p>
                        <p className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{expireDate}</p>
                      </div>
                    </div>

                    {/* Botão Adicionar Dias */}
                    <button 
                      onClick={() => handleAddAccess(u.id, u.expires_at)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-2xl transition-all active:scale-95 shadow-lg group"
                    >
                      <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
                      <span className="text-xs uppercase tracking-tighter text-nowrap">+30 DIAS</span>
                    </button>

                    {/* Saldo apenas para consulta */}
                    <div className="hidden md:flex flex-col items-end min-w-[100px]">
                      <p className="text-[9px] text-slate-500 uppercase">Saldo</p>
                      <p className="text-white text-sm">R$ {u.saldo_inicial?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}