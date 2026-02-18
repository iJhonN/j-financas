'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Fuel, Wrench, Sparkles, Utensils, 
  PlusCircle, Banknote, Calendar, CheckCircle2, Wind // Importei o Wind para o GNV
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Atalhos atualizados com GNV
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
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none">
      
      <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border-2 border-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl tracking-tighter italic">CUSTO OPERACIONAL</h1>
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto space-y-6">
        
        {/* ATALHOS RÁPIDOS - Agora com 6 opções (2 linhas de 3 no mobile) */}
        <div className="grid grid-cols-3 gap-3">
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
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 tracking-widest ml-2">DETALHE DO GASTO</label>
            <div className="relative">
              <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="OU DIGITE O QUE COMPROU..." 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 p-5 pl-14 rounded-2xl outline-none focus:border-amber-500 font-black italic text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 tracking-widest ml-2">VALOR (R$)</label>
              <div className="relative">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                <input 
                  type="text" 
                  placeholder="0,00" 
                  value={valor}
                  onChange={(e) => setValor(formatarMoeda(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-rose-500 font-black italic text-rose-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 tracking-widest ml-2">DATA</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="date" 
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-amber-500 font-black italic text-[10px]"
                />
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-rose-600 py-6 rounded-[2rem] shadow-xl hover:bg-rose-500 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm font-black italic"
        >
          {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> SALVAR DESPESA</>}
        </button>

      </form>
    </div>
  );
}