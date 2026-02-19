'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, TrendingUp, Loader2,
  UserCircle, Layers, Banknote, Calendar, Search, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DetalhesReceitas() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        await fetchReceitas(session.user.id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchReceitas = async (userId: string) => {
    try {
      // Busca apenas transações do tipo 'receita'
      const { data } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .eq('tipo', 'receita')
        .order('data_ordenacao', { ascending: false });
      
      if (data) setTransacoes(data.map(t => ({ ...t, valor: Number(t.valor) })));
    } catch (err) { console.error(err); }
  };

  const listaFiltrada = useMemo(() => {
    return transacoes.filter(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      const matchMonth = d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [transacoes, selectedDate, searchTerm]);

  const totalReceitaMes = useMemo(() => {
    return listaFiltrada.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  }, [listaFiltrada]);

  const excluirRecorrencia = async (descricaoBase: string, valor: number, dataInicio: string) => {
    const nomeLimpo = descricaoBase.split(' - ')[0].trim();
    if (confirm(`EXCLUIR RECEITA MENSAL: "${nomeLimpo}"?`)) {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('user_id', user.id)
        .ilike('descricao', `${nomeLimpo}%`)
        .eq('valor', valor)
        .gte('data_ordenacao', dataInicio);

      if (!error) fetchReceitas(user.id);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black italic uppercase antialiased pb-32 leading-none">
      
      {/* Header */}
      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 bg-slate-800 rounded-full hover:bg-emerald-600 transition-all"><ChevronLeft size={20}/></button>
            <div className="leading-none">
              <h1 className="text-lg md:text-xl tracking-tighter italic">WOLF FINANCE</h1>
              <p className="text-[9px] text-emerald-400 tracking-widest">HISTÓRICO DE ENTRADAS</p>
            </div>
          </div>
          <TrendingUp size={24} className="text-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Seletor de Data */}
        <div className="bg-[#111827] p-6 rounded-[2.5rem] border-b-4 border-amber-500 flex flex-col justify-center h-32 shadow-2xl">
          <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2">
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={16}/></button>
            <span className="tracking-widest uppercase">{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={16}/></button>
          </div>
          <div className="mt-4 flex items-center gap-2 opacity-40">
            <Calendar size={14} />
            <span className="text-[8px] tracking-[0.3em]">FILTRO MENSAL</span>
          </div>
        </div>

        {/* Totalizador Verde */}
        <div className="bg-[#111827] p-6 rounded-[2.5rem] border-b-4 border-emerald-600 flex flex-col justify-center h-32 shadow-2xl">
          <span className="text-white/20 text-[8px] tracking-[0.2em] mb-2">TOTAL RECEBIDO</span>
          <div className="text-2xl md:text-4xl font-black text-emerald-500 italic tracking-tighter">
            R$ {totalReceitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="BUSCAR RECEITA..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111827] border-2 border-slate-800 p-5 pl-14 rounded-2xl outline-none focus:border-emerald-500 font-black italic text-sm transition-all"
        />
      </div>

      {/* Lista de Entradas */}
      <div className="space-y-3">
        {listaFiltrada.length === 0 ? (
          <div className="text-center p-12 bg-[#111827] rounded-[2rem] border border-slate-800 opacity-30 text-[10px] italic">NENHUMA RECEITA NESTE PERÍODO</div>
        ) : (
          listaFiltrada.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-4 md:p-5 rounded-[2rem] border-2 border-slate-800 bg-[#111827] shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs font-black italic uppercase">{t.descricao}</h3>
                  <p className="text-[7px] font-black opacity-50 italic">
                    {t.data_ordenacao.split('-').reverse().join('/')} • {t.forma_pagamento}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <p className="text-xs md:text-base font-black text-emerald-500 italic">
                  R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <button 
                  onClick={() => excluirRecorrencia(t.descricao, t.valor, t.data_ordenacao)}
                  className="p-3 bg-rose-950/30 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                >
                  <Layers size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase text-center">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}