'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Fuel, Wrench, Sparkles, Utensils, 
  PlusCircle, Banknote, Calendar, CheckCircle2, Wind
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ATALHOS = [
  { label: 'GASOLINA', icon: <Fuel size={20} />, color: 'text-amber-500' },
  { label: 'ETANOL', icon: <Fuel size={20} />, color: 'text-emerald-500' },
  { label: 'GNV', icon: <Wind size={20} />, color: 'text-cyan-400' },
  { label: 'BORRACHARIA', icon: <Wrench size={20} />, color: 'text-blue-500' },
  { label: 'LAVAGEM', icon: <Sparkles size={20} />, color: 'text-purple-500' },
  { label: 'COMIDA', icon: <Utensils size={20} />, color: 'text-rose-500' },
];

export default function NovaDespesaDriver() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [veiculoAtivo, setVeiculoAtivo] = useState<string | null>(null);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);

      const { data: vData } = await supabase
        .from('veiculos')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (vData) setVeiculoAtivo(vData.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const formatarMoeda = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return alert("PREENCHA OS CAMPOS!");

    setSaving(true);
    const valorNumerico = Number(valor.replace(/\./g, '').replace(',', '.'));

    const { error } = await supabase.from('driver_despesas').insert([{
      user_id: user.id,
      veiculo_id: veiculoAtivo,
      descricao: descricao.toUpperCase(),
      valor: valorNumerico,
      data_despesa: data,
      categoria: descricao.toUpperCase()
    }]);

    if (!error) {
      router.push('/driver');
    } else {
      setSaving(false);
      alert("ERRO AO SALVAR DESPESA.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 text-white font-black italic uppercase antialiased leading-none pb-24">
      
      <header className="flex items-center gap-4 mb-6 max-w-lg mx-auto">
        <button onClick={() => router.push('/driver')} className="p-2.5 bg-slate-800 rounded-full text-slate-400 border-2 border-slate-700 active:scale-95 transition-all">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg tracking-tighter italic font-black uppercase">CUSTO OPERACIONAL</h1>
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto space-y-5">
        
        {/* ATALHOS RÁPIDOS */}
        <div className="grid grid-cols-3 gap-2.5">
          {ATALHOS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setDescricao(item.label)}
              className={`p-4 rounded-2xl bg-[#111827] border-2 border-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 ${descricao === item.label ? 'border-amber-500 bg-amber-500/10' : ''}`}
            >
              <span className={item.color}>{item.icon}</span>
              <span className="text-[7px] font-black">{item.label}</span>
            </button>
          ))}
        </div>

        {/* CAMPOS DE ENTRADA */}
        <section className="bg-[#111827] p-5 rounded-[2rem] border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] text-slate-500 tracking-[0.2em] ml-2 font-black italic uppercase">DETALHE DO GASTO</label>
            <div className="relative">
              <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="OU DIGITE O QUE COMPROU..." 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 font-black italic text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[8px] text-slate-500 tracking-[0.2em] ml-2 font-black italic uppercase">VALOR (R$)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                <input 
                  type="text" 
                  placeholder="0,00" 
                  value={valor}
                  onChange={(e) => setValor(formatarMoeda(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-slate-800 p-3.5 pl-11 rounded-xl outline-none focus:border-rose-500 font-black italic text-rose-500 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] text-slate-500 tracking-[0.2em] ml-2 font-black italic uppercase">DATA</label>
              <div className="relative flex items-center bg-slate-900 border-2 border-slate-800 rounded-xl px-3 py-3 focus-within:border-amber-500 transition-all">
                <Calendar className="text-slate-500 mr-2 shrink-0" size={16} />
                <input 
                  type="date" 
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-black outline-none italic uppercase"
                />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-rose-600 py-5 rounded-3xl shadow-xl hover:bg-rose-500 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm font-black italic"
        >
          {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> SALVAR DESPESA</>}
        </button>

      </form>

      <footer className="mt-8 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[6px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[9px] text-blue-500">Jhonatha <span className="text-white">| Wolf Driver © 2026</span></p>
      </footer>
    </div>
  );
}