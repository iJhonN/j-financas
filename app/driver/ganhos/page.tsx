'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Zap, Banknote, 
  CreditCard, Navigation, CheckCircle2,
  Truck, Bike, Car, Check, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PLATAFORMAS = [
  { nome: 'Uber', slug: 'uber', pasta: 'transporte', tipo: 'transporte' },
  { nome: '99', slug: '99', pasta: 'transporte', tipo: 'transporte' },
  { nome: 'InDrive', slug: 'indrive', pasta: 'transporte', tipo: 'transporte' },
  { nome: 'Maxim', slug: 'maxim', pasta: 'transporte', tipo: 'transporte' },
  { nome: 'Mottu', slug: 'mottu', pasta: 'transporte', tipo: 'transporte' },
  { nome: 'Particular', slug: 'particular', pasta: 'transporte', tipo: 'transporte' },
  { nome: 'iFood', slug: 'ifood', pasta: 'delivery', tipo: 'delivery' },
  { nome: '99 Food', slug: '99food', pasta: 'delivery', tipo: 'delivery' },
  { nome: 'Rappi', slug: 'rappi', pasta: 'delivery', tipo: 'delivery' },
  { nome: 'Uber Eats', slug: 'ubereats', pasta: 'delivery', tipo: 'delivery' },
  { nome: 'Zé Delivery', slug: 'zedelivery', pasta: 'delivery', tipo: 'delivery' },
  { nome: 'Quero Delivery', slug: 'querodelivery', pasta: 'delivery', tipo: 'delivery' },
  { nome: 'Mercado Livre', slug: 'mercadolivre', pasta: 'encomendas', tipo: 'encomendas' },
  { nome: 'Amazon', slug: 'amazon', pasta: 'encomendas', tipo: 'encomendas' },
  { nome: 'Shopee', slug: 'shopee', pasta: 'encomendas', tipo: 'encomendas' },
  { nome: 'Loggi', slug: 'loggi', pasta: 'encomendas', tipo: 'encomendas' },
];

export default function NovoGanhoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);

  const [tabAtiva, setTabAtiva] = useState('transporte');
  const [plataformaSel, setPlataformaSel] = useState<any>(PLATAFORMAS[0]);
  const [veiculoId, setVeiculoId] = useState('');
  const [dataTrabalho, setDataTrabalho] = useState(new Date().toISOString().split('T')[0]);
  const [valorEspecie, setValorEspecie] = useState('');
  const [valorCartao, setValorCartao] = useState('');
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');

  const plataformasFiltradas = useMemo(() => 
    PLATAFORMAS.filter(p => p.tipo === tabAtiva), 
    [tabAtiva]
  );

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
      plataforma: plataformaSel.nome,
      data_trabalho: dataTrabalho,
      valor_especie: vEspecie,
      valor_cartao: vCartao,
      km_inicial: parseFloat(kmInicial) || 0,
      km_final: parseFloat(kmFinal) || 0
    }]);

    if (!error && kmFinal) {
      await supabase.from('veiculos').update({ km_atual: parseFloat(kmFinal) }).eq('id', veiculoId);
    }

    if (!error) {
      router.push('/driver');
    } else {
      setSaving(false);
      alert("ERRO AO SALVAR.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 text-white font-black italic uppercase antialiased leading-none pb-24">
      
      <header className="flex items-center gap-4 mb-6 max-w-lg mx-auto">
        <button onClick={() => router.push('/driver')} className="p-2.5 bg-slate-800 rounded-full text-slate-400 border-2 border-slate-700">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg tracking-tighter italic font-black">REGISTRAR PLANTÃO</h1>
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto space-y-5">
        
        {/* VEÍCULO */}
        <div className="space-y-1.5">
          <label className="text-[8px] text-slate-500 tracking-[0.2em] ml-2 font-black uppercase italic">VEÍCULO</label>
          <select 
            value={veiculoId} 
            onChange={(e) => setVeiculoId(e.target.value)}
            className="w-full bg-[#111827] border-2 border-slate-800 p-4 rounded-2xl text-[10px] font-black outline-none focus:border-amber-500 appearance-none italic"
          >
            {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo}</option>)}
          </select>
        </div>

        {/* TABS */}
        <div className="flex bg-[#111827] p-1 rounded-xl border-2 border-slate-800 shadow-lg">
          <TabBtn active={tabAtiva === 'transporte'} label="Transp." icon={<Car size={12}/>} onClick={() => setTabAtiva('transporte')} />
          <TabBtn active={tabAtiva === 'delivery'} label="Deliv." icon={<Bike size={12}/>} onClick={() => setTabAtiva('delivery')} />
          <TabBtn active={tabAtiva === 'encomendas'} label="Cargas" icon={<Truck size={12}/>} onClick={() => setTabAtiva('encomendas')} />
        </div>

        {/* SELETOR DE PLATAFORMAS - Reduzi a altura máxima para sobrar espaço */}
        <div className="grid grid-cols-4 gap-2 bg-[#111827] p-3 rounded-[2rem] border-2 border-slate-800 max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
          {plataformasFiltradas.map((p) => (
            <button
              key={p.nome}
              type="button"
              onClick={() => setPlataformaSel(p)}
              className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                plataformaSel.nome === p.nome 
                ? 'border-amber-500 bg-amber-500/10 scale-95' 
                : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="w-9 h-9 bg-white rounded-lg p-1 mb-1 flex items-center justify-center overflow-hidden">
                {p.slug === 'particular' ? (
                  <div className="bg-slate-900 w-full h-full rounded-md flex items-center justify-center text-amber-500">
                    <Car size={16} />
                  </div>
                ) : (
                  <img src={`/plataformas/${p.pasta}/${p.slug}.png`} className="w-full h-full object-contain" onError={(e:any)=>e.target.src="/logo.png"} alt={p.nome}/>
                )}
              </div>
              <span className="text-[6px] font-black truncate w-full text-center">{p.nome}</span>
            </button>
          ))}
        </div>

        {/* GANHOS */}
        <section className="bg-[#111827] p-5 rounded-[2rem] border-2 border-slate-800 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-amber-500" />
            <h2 className="text-[9px] tracking-widest font-black uppercase italic">VALORES: {plataformaSel.nome}</h2>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input type="text" placeholder="ESPÉCIE / PIX" value={valorEspecie} onChange={(e) => setValorEspecie(formatarMoeda(e.target.value))} className="w-full bg-slate-900 border-2 border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-emerald-500 font-black text-emerald-400 italic text-base" />
            </div>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input type="text" placeholder="NO APLICATIVO" value={valorCartao} onChange={(e) => setValorCartao(formatarMoeda(e.target.value))} className="w-full bg-slate-900 border-2 border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 font-black text-blue-400 italic text-base" />
            </div>
          </div>
        </section>

        {/* KM E DATA */}
        <section className="bg-[#111827] p-5 rounded-[2rem] border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[7px] text-slate-500 ml-2 font-black uppercase italic tracking-widest">KM INICIAL</label>
              <input type="number" placeholder="0" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 p-3 rounded-xl outline-none text-center font-black focus:border-blue-500 italic text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[7px] text-slate-500 ml-2 font-black uppercase italic tracking-widest">KM FINAL</label>
              <input type="number" placeholder="0" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-800 p-3 rounded-xl outline-none text-center font-black focus:border-blue-500 italic text-sm" />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800/50 pt-3">
            <label className="text-[7px] text-slate-500 ml-2 font-black uppercase italic tracking-widest">DATA DO PLANTÃO</label>
            <div className="relative flex items-center bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-3 focus-within:border-amber-500 transition-all">
               <Calendar className="text-amber-500 mr-3 shrink-0" size={16} />
               <input 
                type="date" 
                value={dataTrabalho} 
                onChange={(e) => setDataTrabalho(e.target.value)} 
                className="w-full bg-transparent text-[10px] font-black outline-none italic uppercase" 
              />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full bg-[#f97316] py-5 rounded-3xl shadow-xl hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm font-black italic">
          {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> FINALIZAR PLANTÃO</>}
        </button>
      </form>

      <footer className="mt-8 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[6px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[9px] text-blue-500">Jhonatha <span className="text-white">| Wolf Driver © 2026</span></p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function TabBtn({ active, label, icon, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[7px] font-black transition-all ${active ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {icon} {label.toUpperCase()}
    </button>
  );
}