'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Plus, Zap, RefreshCcw, Save, 
  Coins, CreditCard, Loader2, ArrowUpCircle, ArrowDownCircle,
  ChevronDown, X, Calendar, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LancamentoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [isCardDropdownOpen, setIsCardDropdownOpen] = useState(false);

  // Estados do Formulário
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      setUser(session.user);
      const { data } = await supabase.from('cartoes').select('*').eq('user_id', session.user.id);
      if (data) setCartoes(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (vTotal <= 0) return;

    try {
      setLoading(true);
      const valorComSinal = tipoMovimento === 'receita' ? Math.abs(vTotal) : -Math.abs(vTotal);
      const isPix = metodoPagamento === 'Pix';
      const numRepeticoes = recorrente ? 12 : (tipoPagamento === 'Crédito' ? parcelas : 1);
      const valorParcela = parseFloat((valorComSinal / numRepeticoes).toFixed(2));
      const novosLancamentos = [];
      const hoje = new Date();

      for (let i = 0; i < numRepeticoes; i++) {
        let d = new Date(dataLancamento + 'T12:00:00');
        
        if (!isPix && tipoPagamento === 'Crédito') {
          const cartao = cartoes.find(c => `${c.banco} - ${c.nome_cartao}` === metodoPagamento);
          if (cartao) {
            d = new Date(); 
            d.setDate(cartao.vencimento);
            if (hoje.getDate() > cartao.vencimento) d.setMonth(d.getMonth() + 1);
          }
        }
        
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);

        novosLancamentos.push({
          descricao: `${isPix ? "⚡ " : ""}${descricao.toUpperCase()}${numRepeticoes > 1 ? ` - ${(i + 1).toString().padStart(2, '0')}/${numRepeticoes}` : ""}`,
          valor: valorParcela, 
          forma_pagamento: metodoPagamento, 
          tipo: tipoMovimento,
          tipo_pagamento: isPix ? 'Dinheiro' : tipoPagamento, 
          recorrente,
          data_ordenacao: d.toISOString().split('T')[0], 
          user_id: user.id,
          pago: (isPix || tipoMovimento === 'receita') && i === 0
        });
      }
      await supabase.from('transacoes').insert(novosLancamentos);
      router.push('/');
    } catch (err) { console.error(err); setLoading(false); }
  };

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-3 md:p-6 text-white font-black antialiased uppercase italic leading-none relative pb-10">
      
      <header className="flex items-center justify-between mb-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-slate-800 p-2.5 rounded-full border border-slate-700 hover:bg-slate-700 transition-all active:scale-90">
            <ChevronLeft size={20}/>
          </button>
          <h1 className="text-lg tracking-tighter">NOVO LANÇAMENTO</h1>
        </div>
        <Zap size={20} className="text-emerald-500 animate-pulse" />
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-6">
        
        {/* Toggle Tipo Movimento */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
          <TypeBtn active={tipoMovimento === 'despesa'} onClick={() => setTipoMovimento('despesa')} color="rose" icon={<ArrowDownCircle size={16}/>} label="DESPESA" />
          <TypeBtn active={tipoMovimento === 'receita'} onClick={() => setTipoMovimento('receita')} color="emerald" icon={<ArrowUpCircle size={16}/>} label="RECEITA" />
        </div>

        <div className="space-y-4">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO DO LANÇAMENTO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-[11px] font-black focus:border-blue-500 transition-all" required />
          <div className="relative group">
            <input type="text" value={valorDisplay} onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                v = (Number(v) / 100).toFixed(2).replace('.', ',');
                v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                setValorDisplay(v);
            }} placeholder="R$ 0,00" className="w-full p-6 bg-slate-900 rounded-2xl border-2 border-slate-800 text-2xl font-black text-center outline-none text-emerald-400 focus:border-emerald-500 transition-all" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-[7px] opacity-40 ml-1">FORMA DE PAGAMENTO</label>
            <button type="button" onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 flex items-center justify-between hover:bg-slate-700 transition-all active:scale-95">
              <div className="flex items-center gap-2">
                {metodoPagamento === 'Pix' ? <Zap size={14} className="text-emerald-500" /> : <CreditCard size={14} className="text-blue-500" />}
                <span className="text-[10px] font-black">{metodoPagamento.split(' - ')[0]}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isCardDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCardDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border-2 border-slate-800 rounded-2xl shadow-2xl z-[100] max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                <DropdownItem icon={<div className="bg-emerald-500 text-black rounded p-1"><Zap size={12}/></div>} label="PIX / DINHEIRO" onClick={() => { setMetodoPagamento('Pix'); setTipoPagamento('Dinheiro'); setIsCardDropdownOpen(false); }} />
                {cartoes.map((c) => (
                  <DropdownItem key={c.id} icon={<img src={c.logo_url} className="w-6 h-6 object-contain p-1 bg-slate-700 rounded" onError={(e) => (e.currentTarget.src = "/logo.png")} />} label={c.banco} sublabel={c.nome_cartao} onClick={() => { setMetodoPagamento(`${c.banco} - ${c.nome_cartao}`); setTipoPagamento('Crédito'); setIsCardDropdownOpen(false); }} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[7px] opacity-40 ml-1">MODALIDADE</label>
            <select value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value as any)} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[10px] font-black outline-none appearance-none cursor-pointer focus:border-blue-500" disabled={metodoPagamento === 'Pix'}>
              {metodoPagamento === 'Pix' ? <option value="Dinheiro">À VISTA</option> : <><option value="Crédito">CRÉDITO</option><option value="Débito">DÉBITO</option></>}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
             <label className="text-[7px] opacity-40 ml-1">{recorrente ? 'DIA DO MÊS' : (tipoPagamento === 'Crédito' ? 'PARCELAS' : 'MODO')}</label>
             {tipoPagamento === 'Crédito' && !recorrente ? (
                <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-3.5 bg-slate-800 rounded-xl border-2 border-slate-700 text-center font-black text-xs focus:border-blue-500 outline-none" />
             ) : recorrente ? (
                <input type="number" min="1" max="31" value={diaRecorrencia} onChange={(e) => setDiaRecorrencia(Number(e.target.value))} className="w-full p-3.5 bg-slate-800 rounded-xl border-2 border-purple-500/50 text-center font-black text-xs text-purple-400 outline-none" />
             ) : (
                <div className="p-3.5 rounded-xl border-2 border-slate-800 text-[9px] font-black text-center text-slate-600 bg-slate-900/50 uppercase">À VISTA</div>
             )}
          </div>
          <div className="space-y-1">
             <label className="text-[7px] opacity-40 ml-1">DATA DE REFERÊNCIA</label>
             {(metodoPagamento === 'Pix' || tipoPagamento !== 'Crédito') ? (
                <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full p-3.5 bg-slate-800 rounded-xl border-2 border-slate-700 text-center font-black text-[10px] focus:border-blue-500 outline-none" required />
             ) : (
                <div className="p-3.5 rounded-xl border-2 border-blue-900/30 text-[9px] font-black text-center text-blue-500 bg-blue-900/10 uppercase italic">Automática</div>
             )}
          </div>
        </div>

        <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-full py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-black text-[9px] hover:-translate-y-1 ${recorrente ? 'border-purple-600 bg-purple-900/20 text-purple-400 shadow-xl' : 'border-slate-800 bg-slate-900/30 text-slate-500'}`}>
          <RefreshCcw size={16} className={recorrente ? 'animate-spin' : ''} style={{animationDuration: '3s'}} />
          {recorrente ? 'CONFIGURAÇÃO RECORRENTE ATIVA' : 'ATIVAR LANÇAMENTO MENSAL?'}
        </button>

        <button type="submit" disabled={loading} className="group relative w-full bg-blue-600 py-5 rounded-[2rem] shadow-2xl overflow-hidden active:scale-95 transition-all">
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
            {loading ? <Loader2 className="animate-spin"/> : <><Save size={18} /> CONFIRMAR LANÇAMENTO</>}
          </div>
        </button>
      </form>

      <footer className="relative mt-12 pb-8 flex flex-col items-center opacity-30 hover:opacity-100 transition-all font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}

// Componentes Auxiliares
function TypeBtn({ active, onClick, color, icon, label }: any) {
  const styles: any = {
    rose: active ? 'bg-rose-600 shadow-lg shadow-rose-900/20' : 'text-slate-500 hover:text-rose-400',
    emerald: active ? 'bg-emerald-600 shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-emerald-400'
  };
  return (
    <button type="button" onClick={onClick} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${styles[color]}`}>
      {icon} {label}
    </button>
  );
}

function DropdownItem({ icon, label, sublabel, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className="w-full p-4 hover:bg-slate-800/80 flex items-center justify-between border-b border-slate-800/50 transition-colors group">
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-left leading-none">
          <p className="text-[10px] font-black uppercase">{label}</p>
          {sublabel && <p className="text-[7px] text-slate-500 uppercase mt-1">{sublabel}</p>}
        </div>
      </div>
      <Check size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}