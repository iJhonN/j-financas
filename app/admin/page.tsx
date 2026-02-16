'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, ShieldCheck, Loader2, Mail, User as UserIcon, 
  Search, CalendarPlus, CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customDays, setCustomDays] = useState<{ [key: string]: number }>({});
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

  // Função para adicionar dias customizados
  const handleAddCustomAccess = async (userId: string, currentExpiresAt: string | null) => {
    const dias = customDays[userId] || 0;
    if (dias <= 0) return;

    const hoje = new Date();
    let dataBase = currentExpiresAt ? new Date(currentExpiresAt) : hoje;
    if (dataBase < hoje) dataBase = hoje;

    const novaData = new Date(dataBase);
    novaData.setDate(novaData.getDate() + dias);

    const { error } = await supabase
      .from('profiles')
      .update({ expires_at: novaData.toISOString() })
      .eq('id', userId);

    if (!error) {
      // Limpa o input do usuário específico e atualiza a lista
      setCustomDays({ ...customDays, [userId]: 0 });
      fetchUsers();
    }
  };

  // Filtro de pesquisa
  const filteredUsers = usersList.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-4 md:p-8 font-black italic antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all border-2 border-transparent hover:border-slate-700">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <ShieldCheck size={32} className="text-amber-500" />
              <h1 className="text-2xl uppercase tracking-tighter">Wolf <span className="text-amber-500">Panel</span></h1>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="PESQUISAR MEMBRO OU E-MAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111827] border-4 border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs uppercase outline-none focus:border-amber-500/50 transition-all font-black"
            />
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-[#111827] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b-4 border-slate-800 bg-slate-800/50 flex justify-between items-center">
            <h2 className="uppercase tracking-widest text-sm text-slate-300">Gestão de Licenças Beta</h2>
            <span className="text-[10px] bg-amber-500 text-black px-3 py-1 rounded-full">{filteredUsers.length} RESULTADOS</span>
          </div>

          <div className="divide-y-4 divide-slate-800">
            {filteredUsers.map((u) => {
              const isExpired = !u.expires_at || new Date(u.expires_at) < new Date();
              const expireDate = u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : 'SEM ACESSO';

              return (
                <div key={u.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-slate-800/30 transition-all">
                  
                  {/* Bloco de Perfil */}
                  <div className="flex items-center gap-4 min-w-[250px]">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg ${isExpired ? 'bg-slate-700' : 'bg-amber-500'}`}>
                      <UserIcon size={28} />
                    </div>
                    <div>
                      <p className="uppercase text-sm leading-none font-black">{u.full_name || 'Membro'}</p>
                      <div className="flex items-center gap-1 text-slate-500 text-[9px] mt-1 uppercase font-black">
                        <Mail size={10} /> {u.email}
                      </div>
                    </div>
                  </div>

                  {/* Bloco de Status e Expiração */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border-2 ${isExpired ? 'border-red-500/20 bg-red-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
                      {isExpired ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                      <div>
                        <p className={`text-[8px] uppercase font-black ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>Vencimento</p>
                        <p className={`text-xs font-black ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{expireDate}</p>
                      </div>
                    </div>

                    {/* Menu de Adição de Dias */}
                    <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border-2 border-slate-700">
                      <input 
                        type="number"
                        placeholder="0"
                        value={customDays[u.id] || ''}
                        onChange={(e) => setCustomDays({ ...customDays, [u.id]: parseInt(e.target.value) })}
                        className="w-16 bg-transparent text-center outline-none font-black text-amber-500 text-sm"
                      />
                      <button 
                        onClick={() => handleAddCustomAccess(u.id, u.expires_at)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2"
                      >
                        <CalendarPlus size={16} />
                        <span className="text-[9px] uppercase font-black pr-1">ADD DIAS</span>
                      </button>
                    </div>

                    {/* Saldo Visual */}
                    <div className="hidden sm:block text-right border-l-2 border-slate-800 pl-4">
                      <p className="text-[8px] text-slate-500 uppercase font-black">Saldo Atual</p>
                      <p className="text-emerald-500 text-xs font-black">
                        {u.saldo_inicial?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
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