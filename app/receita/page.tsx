'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, RefreshCcw, 
  Banknote, Calendar, CheckCircle2, PlusCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NovaReceitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Estados do Formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);
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
    const vTotal = Number(valor.replace(/\./g, '').replace(',', '.'));
    if (!descricao || vTotal <= 0) return alert("PREENCHA OS CAMPOS CORRETAMENTE!");

    try {
      setSaving(true);
      const numRepeticoes = recorrente ? 12 : 1;
      const novosLancamentos = [];

      for (let i = 0; i < numRepeticoes; i++) {
        let d = new Date(data + 'T12:00:00');
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);

        novosLancamentos.push({
          user_id: user.id,
          descricao: descricao.toUpperCase(),
          valor: Math.abs(vTotal), // Receita sempre positiva
          data_ordenacao: d.toISOString().split('T')[0],
          tipo: 'receita',
          pago: i === 0, // A primeira já entra como paga
          forma_pagamento: 'Pix',
          recorrente: recorrente
        });
      }

      const { error } = await supabase.from('transacoes').insert(novosLancamentos);

      if (!error) {
        router.push('/');
      } else {
        throw error;
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
      alert("ERRO AO SALVAR RECEITA.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-20">
      
      <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <button onClick={() => router.push('/')} className="p-3 bg-slate-800 rounded-full text-slate-400 border-2 border-slate-700 active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl tracking-tighter italic font-black">ENTRADA DE CAPITAL</h1>
          <p className="text-[9px] text-emerald-500 tracking-widest font-black italic">WOLF FINANCE - RECEITA</p>
        </div>
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto space-y-6">
        
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-6">
          
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 tracking-[0.2em] ml-2 font-black italic">ORIGEM DO GANHO</label>
            <div className="relative">
              <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input 
                type="text" 
                placeholder="EX: VENDA DE PEÇAS, SALÁRIO..." 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 p-5 pl-14 rounded-2xl outline-none focus:border-emerald-500 font-black italic text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 tracking-[0.2em] ml-2 font-black italic">VALOR MENSAL</label>
              <div className="relative">
                <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                <input 
                  type="text" 
                  placeholder="R$ 0,00" 
                  value={valor}
                  onChange={(e) => setValor(formatarMoeda(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-slate-800 p-6 pl-16 rounded-2xl outline-none focus:border-emerald-500 font-black italic text-emerald-500 text-2xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[9px] text-slate-500 tracking-[0.2em] ml-2 font-black italic">
                  {recorrente ? 'DIA DO RECEB.' : 'DATA'}
                </label>
                {recorrente ? (
                   <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={diaRecorrencia} 
                    onChange={(e) => setDiaRecorrencia(Number(e.target.value))} 
                    className="w-full bg-slate-900 border-2 border-purple-500/50 p-4 rounded-2xl text-center font-black text-sm text-purple-400 outline-none italic" 
                  />
                ) : (
                  <div className="relative flex items-center bg-slate-900 border-2 border-slate-800 rounded-2xl px-4 py-4 focus-within:border-emerald-500 transition-all">
                    <Calendar className="text-emerald-500 mr-2 shrink-0" size={18} />
                    <input 
                      type="date" 
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full bg-transparent text-[10px] font-black outline-none italic uppercase"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <button 
                  type="button" 
                  onClick={() => setRecorrente(!recorrente)} 
                  className={`h-[58px] rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-[8px] italic ${recorrente ? 'border-purple-600 bg-purple-900/20 text-purple-400 shadow-xl' : 'border-slate-800 bg-slate-900/30 text-slate-500'}`}
                >
                  <RefreshCcw size={14} className={recorrente ? 'animate-spin' : ''} style={{animationDuration: '3s'}} />
                  {recorrente ? 'RECORRÊNCIA ATIVA' : 'ATIVAR MENSAL?'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="group relative w-full bg-emerald-600 py-6 rounded-[2rem] shadow-2xl overflow-hidden active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest italic">
            {saving ? <Loader2 className="animate-spin"/> : <><CheckCircle2 size={22} /> CONFIRMAR RECEITA</>}
          </div>
        </button>

      </form>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}