'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Zap, Banknote, 
  CreditCard, Navigation, Calendar, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NovoGanhoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);

  // Estados do Formulário
  const [veiculoId, setVeiculoId] = useState('');
  const [dataTrabalho, setDataTrabalho] = useState(new Date().toISOString().split('T')[0]);
  const [valorEspecie, setValorEspecie] = useState('');
  const [valorCartao, setValorCartao] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);

      const { data } = await supabase.from('veiculos').select('*').eq('user_id', session.user.id);
      if (data && data.length > 0) {
        setVeiculos(data);
        setVeiculoId(data[0].id);
      }
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
    if (!veiculoId) return alert("CADASTRE UM VEÍCULO PRIMEIRO!");
    
    setSaving(true);
    const vEspecie = Number(valorEspecie.replace(/\./g, '').replace(',', '.'));
    const vCartao = Number(valorCartao.replace(/\./g, '').replace(',', '.'));

    const { error } = await supabase.from('driver_ganhos').insert([{
      user_id: user.id,
      veiculo_id: veiculoId,
      data_trabalho: dataTrabalho,
      valor_especie: vEspecie,
      valor_cartao: vCartao,
      km_inicial: parseFloat(kmInicial) || 0,
      km_final: parseFloat(kmFinal) || 0
    }]);

    // Opcional: Atualizar o KM atual do veículo automaticamente
    if (!error && kmFinal) {
      await supabase.from('veiculos').update({ km_atual: parseFloat(kmFinal) }).eq('id', veiculoId);
    }

    if (!error) {
      router.push('/driver');
      router.refresh();
    } else {
      setSaving(false);
      alert("ERRO AO SALVAR GANHOS.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-20">
      
      <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto">
        <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border-2 border-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl tracking-tighter italic">BATER META DIÁRIA</h1>
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto space-y-6">
        
        {/* SELEÇÃO DE VEÍCULO E DATA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 tracking-[0.2em] ml-2 font-black">VEÍCULO</label>
            <select 
              value={veiculoId} 
              onChange={(e) => setVeiculoId(e.target.value)}
              className="w-full bg-[#111827] border-2 border-slate-800 p-4 rounded-2xl text-[10px] font-black outline-none focus:border-amber-500 transition-all"
            >
              {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 tracking-[0.2em] ml-2 font-black">DATA</label>
            <input 
              type="date" 
              value={dataTrabalho} 
              onChange={(e) => setDataTrabalho(e.target.value)}
              className="w-full bg-[#111827] border-2 border-slate-800 p-4 rounded-2xl text-[10px] font-black outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* GANHOS (FINANCEIRO) */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-amber-500" />
            <h2 className="text-[10px] tracking-widest font-black">VALORES RECEBIDOS</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input 
                type="text" 
                placeholder="ESPÉCIE / PIX" 
                value={valorEspecie}
                onChange={(e) => setValorEspecie(formatarMoeda(e.target.value))}
                className="w-full bg-slate-900 border-2 border-slate-800 p-5 pl-14 rounded-2xl outline-none focus:border-emerald-500 font-black text-emerald-400 italic text-lg"
              />
            </div>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input 
                type="text" 
                placeholder="CARTÃO / APP" 
                value={valorCartao}
                onChange={(e) => setValorCartao(formatarMoeda(e.target.value))}
                className="w-full bg-slate-900 border-2 border-slate-800 p-5 pl-14 rounded-2xl outline-none focus:border-blue-500 font-black text-blue-400 italic text-lg"
              />
            </div>
          </div>
        </section>

        {/* DESEMPENHO (KM) */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={16} className="text-blue-500" />
            <h2 className="text-[10px] tracking-widest font-black">RODAGEM DO DIA</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] text-slate-500 ml-2 font-black">KM INICIAL</label>
              <input 
                type="number" 
                placeholder="0" 
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] text-slate-500 ml-2 font-black">KM FINAL</label>
              <input 
                type="number" 
                placeholder="0" 
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500 font-black text-center"
              />
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-amber-600 py-6 rounded-[2rem] shadow-xl hover:bg-amber-500 hover:tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm font-black italic shadow-amber-900/10"
        >
          {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> FINALIZAR PLANTÃO</>}
        </button>

      </form>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}