'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, TrendingUp, 
  Banknote, Calendar, CheckCircle2, 
  Zap, Car, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Exportação padrão obrigatória para o Next.js reconhecer como módulo
export default function LancamentosDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ganhos, setGanhos] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);
      
      // Busca ganhos do driver
      const { data } = await supabase
        .from('driver_ganhos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_trabalho', { ascending: false });
        
      if (data) setGanhos(data);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-20">
      
      <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 border-2 border-slate-700 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl tracking-tighter italic font-black">HISTÓRICO DE CORRIDAS</h1>
          <p className="text-[9px] text-amber-500 tracking-widest font-black uppercase">Wolf Driver - Ganhos</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto space-y-4">
        {ganhos.length === 0 ? (
          <div className="text-center p-12 bg-[#111827] rounded-[2rem] border border-slate-800 opacity-30 text-[10px]">
            NENHUM GANHO REGISTRADO NO DRIVER
          </div>
        ) : (
          ganhos.map((g) => (
            <div key={g.id} className="bg-[#111827] p-5 rounded-[2rem] border-2 border-slate-800 shadow-lg flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase italic">{g.plataforma}</h3>
                  <p className="text-[7px] opacity-50 font-black italic">
                    {g.data_trabalho.split('-').reverse().join('/')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-500 italic">
                  R$ {(Number(g.valor_especie) + Number(g.valor_cartao)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[7px] text-slate-500 italic font-black">PLANTÃO FINALIZADO</p>
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase text-center">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}