'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Info, Coins, Save, Loader2, 
  AlertCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SaldoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saldoDisplay, setSaldoDisplay] = useState('');
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      setUser(session.user);
      const { data: profile } = await supabase.from('profiles').select('saldo_inicial').eq('id', session.user.id).maybeSingle();
      
      if (profile?.saldo_inicial !== undefined) {
        setSaldoAtual(profile.saldo_inicial);
        setSaldoDisplay(formatarParaInput(profile.saldo_inicial.toString()));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const formatarParaInput = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const handleSalvar = async () => {
    if (!user) return;
    setSaving(true);
    const valorNumerico = Number(saldoDisplay.replace(/\./g, '').replace(',', '.'));

    const { error } = await supabase
      .from('profiles')
      .update({ saldo_inicial: valorNumerico })
      .eq('id', user.id);

    if (!error) {
      router.push('/');
      router.refresh();
    } else {
      setSaving(false);
      alert("Erro ao salvar saldo.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none relative overflow-hidden">
      
      <header className="flex items-center gap-4 mb-10 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-all active:scale-90 shadow-lg">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl tracking-tighter">AJUSTE DE BANCA</h1>
      </header>

      <main className="max-w-lg mx-auto space-y-6">
        
        {/* CARD EXPLICATIVO */}
        <section className="bg-blue-600/10 border-2 border-blue-500/30 p-6 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Info size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 text-blue-400">
              <AlertCircle size={20} />
              <h2 className="text-[12px] tracking-widest font-black">POR QUE DEFINIR O SALDO?</h2>
            </div>
            <p className="text-[10px] normal-case leading-relaxed text-slate-300 italic">
              O <span className="text-white font-black uppercase">Saldo Atual</span> é o valor real que você tem em conta agora. 
              Ele serve como a base para o Wolf Finance calcular seu lucro, gastos e previsões. 
              Mantenha este valor sempre atualizado para uma gestão de elite.
            </p>
          </div>
        </section>

        {/* INPUT DE SALDO */}
        <section className="bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Coins size={40} className="mx-auto text-emerald-500 animate-bounce" />
            <h3 className="text-sm tracking-widest">DIGITE SEU SALDO ATUAL</h3>
          </div>

          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 text-xl font-black">R$</span>
            <input 
              type="text" 
              value={saldoDisplay} 
              onChange={(e) => setSaldoDisplay(formatarParaInput(e.target.value))}
              placeholder="0,00"
              className="w-full bg-slate-900 border-4 border-slate-800 p-8 pl-16 rounded-[2rem] outline-none focus:border-emerald-500 transition-all text-3xl font-black text-emerald-400 text-center shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <CheckCircle2 size={18} className="text-blue-500" />
            <p className="text-[8px] normal-case text-slate-400">
              Você pode <span className="text-white font-black uppercase">Editar este valor</span> a qualquer momento se cometer um erro.
            </p>
          </div>

          <button 
            onClick={handleSalvar}
            disabled={saving}
            className="w-full bg-blue-600 py-6 rounded-[2.5rem] shadow-xl hover:bg-blue-500 hover:tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm font-black"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> CONFIRMAR SALDO NOVO</>}
          </button>
        </section>

        {/* DICA DE FLUXO */}
        <div className="flex items-center justify-center gap-2 text-slate-600 animate-pulse">
          <p className="text-[9px] font-black uppercase tracking-tighter">Após confirmar, você voltará ao painel</p>
          <ArrowRight size={14} />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1 uppercase">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}