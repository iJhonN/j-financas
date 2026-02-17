'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Plus, Zap, RefreshCcw, Save, 
  Coins, CreditCard, Loader2, ArrowUpCircle, ArrowDownCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LancamentoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartoes, setCartoes] = useState<any[]>([]);

  // Estados do Formulário
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        const { data } = await supabase.from('cartoes').select('*').eq('user_id', session.user.id);
        if (data) setCartoes(data);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (vTotal <= 0) return;

    try {
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
            d = new Date(); d.setDate(cartao.vencimento);
            if (hoje.getDate() > cartao.vencimento) d.setMonth(d.getMonth() + 1);
          }
        }
        d.setMonth(d.getMonth() + i);
        novosLancamentos.push({
          descricao: `${isPix ? "⚡ " : ""}${descricao.toUpperCase()}${numRepeticoes > 1 ? ` - ${(i + 1).toString().padStart(2, '0')}/${numRepeticoes}` : ""}`,
          valor: valorParcela, forma_pagamento: metodoPagamento, tipo: tipoMovimento,
          tipo_pagamento: isPix ? 'Dinheiro' : tipoPagamento, recorrente,
          data_ordenacao: d.toISOString().split('T')[0], user_id: user.id,
          pago: (isPix || tipoMovimento === 'receita') && i === 0
        });
      }
      await supabase.from('transacoes').insert(novosLancamentos);
      router.push('/');
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-3 md:p-6 text-white font-black antialiased uppercase italic leading-none">
      
      {/* HEADER COMPACTO */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-slate-800 p-2 rounded-full border border-slate-700 active:scale-90 transition-all">
            <ChevronLeft size={20}/>
          </button>
          <h1 className="text-lg tracking-tighter uppercase">NOVO LANÇAMENTO</h1>
        </div>
        <Zap size={20} className="text-amber-500 animate-pulse" />
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto bg-[#111827] p-5 rounded-[2rem] border-2 border-slate-800 shadow-2xl space-y-4">
        
        {/* TIPO DE MOVIMENTO COMPACTO */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
          <button type="button" onClick={() => setTipoMovimento('despesa')} className={`py-3 rounded-lg text-[10px] font-black transition-all ${tipoMovimento === 'despesa' ? 'bg-rose-600 shadow-lg' : 'text-slate-500'}`}>
            <ArrowDownCircle size={14} className="inline mr-1" /> SAÍDA
          </button>
          <button type="button" onClick={() => setTipoMovimento('receita')} className={`py-3 rounded-lg text-[10px] font-black transition-all ${tipoMovimento === 'receita' ? 'bg-emerald-600 shadow-lg' : 'text-slate-500'}`}>
            <ArrowUpCircle size={14} className="inline mr-1" /> ENTRADA
          </button>
        </div>

        {/* INPUTS PRINCIPAIS */}
        <div className="space-y-3">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO RÁPIDA" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-[11px] font-black uppercase" required />

          <div className="relative">
            <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-5 bg-slate-900 rounded-xl border-2 border-slate-700 text-xl font-black text-center outline-none text-emerald-400" required />
          </div>
        </div>

        {/* SELETORES EM GRID COMPACTO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[7px] opacity-40 ml-1">MÉTODO PAGAMENTO</label>
            <select value={metodoPagamento} onChange={(e) => { setMetodoPagamento(e.target.value); setTipoPagamento(e.target.value === 'Pix' ? 'Dinheiro' : 'Crédito'); }} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-[10px] font-black outline-none">
              <option value="Pix">PIX / DINHEIRO</option>
              {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[7px] opacity-40 ml-1">MODALIDADE</label>
            <select value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value as any)} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-[10px] font-black outline-none" disabled={metodoPagamento === 'Pix'}>
              {metodoPagamento === 'Pix' ? <option value="Dinheiro">À VISTA</option> : <><option value="Crédito">CRÉDITO</option><option value="Débito">DÉBITO</option></>}
            </select>
          </div>
        </div>

        {/* DATA E PARCELAS LADO A LADO */}
        <div className="grid grid-cols-2 gap-3 items-end">
          {tipoPagamento === 'Crédito' && metodoPagamento !== 'Pix' && !recorrente ? (
            <div className="relative">
              <label className="text-[7px] text-blue-500 ml-1 uppercase">Parcelas</label>
              <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-center font-black text-xs" />
            </div>
          ) : (
            <div className={`p-3 rounded-lg border border-slate-700 text-[9px] font-black text-center ${recorrente ? 'text-purple-400 bg-purple-900/10' : 'text-slate-500 bg-slate-900/50'}`}>
              {recorrente ? 'FIXO MENSAL' : 'À VISTA'}
            </div>
          )}
          
          {/* DATA SÓ PARA PIX/DÉBITO */}
          {(metodoPagamento === 'Pix' || tipoPagamento !== 'Crédito') ? (
            <div className="relative">
              <label className="text-[7px] text-slate-500 ml-1 uppercase">Data</label>
              <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-center font-black text-[10px] outline-none" required />
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-slate-700 text-[9px] font-black text-center text-blue-400 bg-blue-900/10 uppercase">
              Venc. Cartão
            </div>
          )}
        </div>

        {/* BOTÃO RECORRÊNCIA MINI */}
        <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-full py-3 rounded-lg border transition-all flex items-center justify-center gap-2 font-black text-[9px] ${recorrente ? 'border-purple-600 bg-purple-900/30 text-purple-400' : 'border-slate-800 bg-slate-900/30 text-slate-500'}`}>
          <RefreshCcw size={14} className={recorrente ? 'animate-spin' : ''} />
          {recorrente ? 'CONTA FIXA ATIVA' : 'ATIVAR RECORRÊNCIA?'}
        </button>

        <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl shadow-xl text-[11px] font-black active:scale-95 transition-all flex items-center justify-center gap-2">
          <Save size={16} /> CONFIRMAR LANÇAMENTO
        </button>
      </form>

      <footer className="mt-6 text-center text-[8px] text-slate-700 tracking-widest">
        WOLF FINANCE - FAST MODE
      </footer>
    </div>
  );
}