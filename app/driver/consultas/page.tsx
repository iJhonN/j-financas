'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Calendar, TrendingUp, 
  ChevronRight, Wallet, Car, Filter,
  History as HistoryIcon // <--- Renomeamos aqui para evitar conflito
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ConsultasDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [relatorioMensal, setRelatorioMensal] = useState<any[]>([]);

  const fetchConsultas = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');

    const [ { data: ganhos }, { data: despesas } ] = await Promise.all([
      supabase
        .from('driver_ganhos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_trabalho', { ascending: false }),
      supabase
        .from('driver_despesas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_despesa', { ascending: false })
    ]);

    const agrupado: any = {};

    ganhos?.forEach(g => {
      const data = new Date(g.data_trabalho + 'T12:00:00');
      const mesAno = data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
      
      if (!agrupado[mesAno]) {
        agrupado[mesAno] = { mes: mesAno, ganhos: 0, despesas: 0, diasTrabalhados: new Set(), timestamp: data.getTime() };
      }
      
      agrupado[mesAno].ganhos += (Number(g.valor_especie) + Number(g.valor_cartao));
      agrupado[mesAno].diasTrabalhados.add(g.data_trabalho);
    });

    despesas?.forEach(d => {
      const data = new Date(d.data_despesa + 'T12:00:00');
      const mesAno = data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

      if (!agrupado[mesAno]) {
        agrupado[mesAno] = { mes: mesAno, ganhos: 0, despesas: 0, diasTrabalhados: new Set(), timestamp: data.getTime() };
      }

      agrupado[mesAno].despesas += Number(d.valor);
    });

    const resultadoOrdenado = Object.values(agrupado).sort((a: any, b: any) => b.timestamp - a.timestamp);
    setRelatorioMensal(resultadoOrdenado);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-amber-500"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-12">
      
      <header className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border-2 border-slate-700 active:scale-95 shadow-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl tracking-tighter italic">HISTÓRICO MENSAL</h1>
        </div>
        <div className="p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-500/20">
          <HistoryIcon size={20} /> {/* <--- Usamos o nome renomeado aqui */}
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {relatorioMensal.length > 0 ? relatorioMensal.map((item, idx) => (
          <div key={idx} className="bg-[#111827] rounded-[2.5rem] border-2 border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-amber-500/30">
            <div className="p-6 border-b-2 border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Calendar className="text-amber-500" size={18} />
                <span className="tracking-widest text-sm font-black">{item.mes}</span>
              </div>
              <span className="text-[10px] bg-amber-500 text-black px-3 py-1 rounded-full font-black">
                {item.diasTrabalhados.size} DIAS ATIVOS
              </span>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8 relative">
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 tracking-widest">FATURAMENTO</p>
                <p className="text-xl text-emerald-500 font-black">{formatarMoeda(item.ganhos)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 tracking-widest">DESPESAS</p>
                <p className="text-xl text-rose-500 font-black">{formatarMoeda(item.despesas)}</p>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-12 bg-slate-800" />
            </div>

            <div className="px-8 pb-8 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-blue-400 tracking-widest mb-1">LUCRO REAL DO MÊS</p>
                <p className="text-2xl text-white font-black">{formatarMoeda(item.ganhos - item.despesas)}</p>
              </div>
              <button 
                onClick={() => router.push('/driver/relatorios')}
                className="bg-slate-800 p-4 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-slate-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 opacity-20 italic">
            <TrendingUp size={64} className="mx-auto mb-4" />
            <p className="text-xs tracking-[0.3em]">SEM REGISTROS NO HISTÓRICO</p>
          </div>
        )}
      </div>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}