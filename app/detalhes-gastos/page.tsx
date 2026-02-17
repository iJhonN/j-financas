'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Trash2, Search, Filter, 
  ArrowUpCircle, ArrowDownCircle, Loader2, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DetalhesGastosPage() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'despesa' | 'receita'>('todos');

  useEffect(() => {
    const fetchTransacoes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      const { data } = await supabase.from('transacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_ordenacao', { ascending: false });
        
      if (data) setTransacoes(data);
      setLoading(false);
    };
    fetchTransacoes();
  }, [router]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
      return matchSearch && matchTipo;
    });
  }, [transacoes, searchTerm, filtroTipo]);

  const handleDeletar = async (id: string) => {
    if (!confirm("Confirmar exclusão desta movimentação?")) return;
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    if (!error) setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="btn-wolf-icon"><ChevronLeft size={24} /></button>
          <h1 className="text-2xl text-wolf-title">HISTÓRICO</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFiltroTipo('despesa')} className={`px-4 py-2 rounded-xl text-[9px] font-black italic border-2 ${filtroTipo === 'despesa' ? 'bg-rose-600 border-rose-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>DESPESAS</button>
          <button onClick={() => setFiltroTipo('receita')} className={`px-4 py-2 rounded-xl text-[9px] font-black italic border-2 ${filtroTipo === 'receita' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>RECEITAS</button>
          <button onClick={() => setFiltroTipo('todos')} className={`px-4 py-2 rounded-xl text-[9px] font-black italic border-2 ${filtroTipo === 'todos' ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>TUDO</button>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="PESQUISAR MOVIMENTAÇÃO..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-wolf pl-12 py-5"
        />
      </div>

      <div className="space-y-3">
        {transacoesFiltradas.map((t) => (
          <div key={t.id} className="card-wolf p-4 flex items-center justify-between border-slate-800/50 hover:bg-slate-800/20 group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${t.tipo === 'receita' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                {t.tipo === 'receita' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
              </div>
              <div>
                <p className="text-[11px] font-black italic uppercase">{t.descricao}</p>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-[8px] text-slate-500 font-black flex items-center gap-1 uppercase italic"><Calendar size={10}/> {new Date(t.data_ordenacao + 'T12:00:00').toLocaleDateString()}</p>
                   <p className="text-[8px] text-blue-500 font-black uppercase italic">{t.forma_pagamento}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <p className={`text-xs font-black italic ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <button onClick={() => handleDeletar(t.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}