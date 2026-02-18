'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Fuel, Wrench, Utensils, Wind, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ListaDespesasDriver() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [despesas, setDespesas] = useState<any[]>([]);

  const fetchDespesas = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data } = await supabase
      .from('driver_despesas')
      .select('*')
      .eq('user_id', session.user.id)
      .order('data_despesa', { ascending: false });

    setDespesas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDespesas(); }, []);

  const getIcon = (cat: string) => {
    if (cat.includes('GASOLINA') || cat.includes('ETANOL')) return <Fuel className="text-amber-500" />;
    if (cat.includes('GNV')) return <Wind className="text-cyan-400" />;
    if (cat.includes('COMIDA')) return <Utensils className="text-rose-500" />;
    return <Wrench className="text-slate-400" />;
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 text-white font-black italic uppercase antialiased">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full border-2 border-slate-700"><ArrowLeft size={20}/></button>
        <h1 className="text-xl tracking-tighter">LISTA DE CUSTOS</h1>
      </header>

      <div className="space-y-3 max-w-lg mx-auto">
        {despesas.map((d) => (
          <div key={d.id} className="bg-[#111827] p-5 rounded-3xl border-2 border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-2xl">{getIcon(d.descricao)}</div>
              <div>
                <p className="text-xs">{d.descricao}</p>
                <p className="text-[10px] text-slate-500">{new Date(d.data_despesa).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-rose-500 text-sm">R$ {Number(d.valor).toFixed(2)}</p>
              <button onClick={async () => { if(confirm("EXCLUIR?")) { await supabase.from('driver_despesas').delete().eq('id', d.id); fetchDespesas(); } }} className="text-slate-600 hover:text-rose-500"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}