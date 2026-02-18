'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Trash2, Banknote, CreditCard, 
  Calendar, Loader2, TrendingUp, Wallet 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ListaGanhosDriver() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ganhos, setGanhos] = useState<any[]>([]);

  const fetchGanhos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');
    
    const { data } = await supabase
      .from('driver_ganhos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('data_trabalho', { ascending: false });

    setGanhos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGanhos();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("DESEJA REALMENTE APAGAR ESTE REGISTO DE GANHO?")) {
      const { error } = await supabase
        .from('driver_ganhos')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchGanhos();
      } else {
        alert("ERRO AO ELIMINAR REGISTO.");
      }
    }
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-20">
      
      <header className="flex items-center gap-4 mb-8 max-w-2xl mx-auto">
        <button 
          onClick={() => router.push('/driver')} 
          className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border-2 border-slate-700 active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl tracking-tighter italic">REGISTOS DE ENTRADA</h1>
          <p className="text-[9px] text-amber-500 tracking-[0.2em]">HISTÓRICO DE FATURAMENTO</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {ganhos.length > 0 ? ganhos.map((g) => {
          const totalDia = Number(g.valor_especie) + Number(g.valor_cartao);
          
          return (
            <div key={g.id} className="bg-[#111827] rounded-[2rem] border-2 border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-5 flex justify-between items-center bg-slate-900/50 border-b-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-amber-500" />
                  <span className="text-xs tracking-widest">
                    {new Date(g.data_trabalho + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(g.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Banknote size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500">ESPÉCIE</p>
                    <p className="text-sm">{formatarMoeda(Number(g.valor_especie))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500">CARTÃO/APP</p>
                    <p className="text-sm">{formatarMoeda(Number(g.valor_cartao))}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-emerald-500/5 flex justify-between items-center">
                <span className="text-[9px] tracking-widest text-emerald-500">TOTAL DO DIA</span>
                <span className="text-lg font-black text-emerald-500">{formatarMoeda(totalDia)}</span>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 opacity-20">
            <TrendingUp size={64} className="mx-auto mb-4" />
            <p className="text-xs tracking-[0.3em]">NENHUM GANHO ENCONTRADO</p>
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