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
    if (vTotal <= 0) return alert("Insira um valor válido");

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
    } catch (err) { alert("Erro ao salvar lançamento"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black antialiased uppercase italic leading-none">
      
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="bg-slate-800 p-2.5 rounded-full border border-slate-700 active:scale-95 shadow-lg">
          <ChevronLeft size={24}/>
        </button>
        <h1 className="text-xl md:text-2xl tracking-tighter">NOVO LANÇAMENTO</h1>
      </header>

      <form onSubmit={handleSalvar} className="max-w-2xl mx-auto bg-[#111827] p-6 md:p-10 rounded-[3rem] border-4 border-slate-800 shadow-2xl space-y-6">
        
        {/* TIPO DE MOVIMENTO */}
        <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl">
          <button type="button" onClick={() => setTipoMovimento('despesa')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${tipoMovimento === 'despesa' ? 'bg-rose-600 shadow-lg scale-[1.02]' : 'text-slate-500'}`}>
            <ArrowDownCircle size={16} className="inline mr-2" /> SAÍDA / DESPESA
          </button>
          <button type="button" onClick={() => setTipoMovimento('receita')} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${tipoMovimento === 'receita' ? 'bg-emerald-600 shadow-lg scale-[1.02]' : 'text-slate-500'}`}>
            <ArrowUpCircle size={16} className="inline mr-2" /> ENTRADA / RECEITA
          </button>
        </div>

        {/* CAMPOS PRINCIPAIS */}
        <div className="space-y-4">
          <div className="relative">
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O QUE FOI COMPRADO/VENDIDO?" className="w-full p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm font-black uppercase" required />
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-4 bg-[#111827] px-2 text-[8px] text-blue-500">VALOR DO LANÇAMENTO</label>
            <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-6 bg-slate-800 rounded-2xl border-2 border-slate-700 text-2xl font-black text-center outline-none" required />
          </div>
        </div>

        {/* PAGAMENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[8px] opacity-50 ml-2">MÉTODO</label>
            <select value={metodoPagamento} onChange={(e) => { setMetodoPagamento(e.target.value); setTipoPagamento(e.target.value === 'Pix' ? 'Dinheiro' : 'Crédito'); }} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[11px] outline-none font-black">
              <option value="Pix">PIX / DINHEIRO</option>
              {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} - {c.nome_cartao}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] opacity-50 ml-2">MODALIDADE</label>
            <select value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value as any)} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[11px] outline-none font-black" disabled={metodoPagamento === 'Pix'}>
              {metodoPagamento === 'Pix' ? <option value="Dinheiro">DINHEIRO (À VISTA)</option> : <><option value="Crédito">CRÉDITO</option><option value="Débito">DÉBITO</option></>}
            </select>
          </div>
        </div>

        {/* DATA E PARCELAS DINÂMICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tipoPagamento === 'Crédito' && metodoPagamento !== 'Pix' && !recorrente ? (
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-[#111827] px-2 text-[8px] text-blue-500">Nº DE PARCELAS</label>
              <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-center font-black" />
            </div>
          ) : (
            <div className="w-full p-5 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center text-emerald-500 text-[10px] font-black italic">
              <Zap size={14} className="mr-2" /> {recorrente ? 'LANÇAMENTO FIXO MENSAL' : 'LIQUIDAÇÃO À VISTA'}
            </div>
          )}
          
          {/* DATA SÓ PARA PIX/DÉBITO */}
          {(metodoPagamento === 'Pix' || tipoPagamento !== 'Crédito') && (
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-[#111827] px-2 text-[8px] text-slate-500">DATA DO EVENTO</label>
              <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-center font-black outline-none" required />
            </div>
          )}
        </div>

        {/* RECORRÊNCIA */}
        <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-black text-[10px] ${recorrente ? 'border-purple-600 bg-purple-900/20 text-purple-400 shadow-lg shadow-purple-900/20' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
          <RefreshCcw size={18} className={recorrente ? 'animate-spin' : ''} style={{animationDuration: '3s'}} />
          {recorrente ? 'RECORRÊNCIA ATIVA (12 MESES)' : 'ATIVAR RECORRÊNCIA MENSAL?'}
        </button>

        <button type="submit" className="w-full bg-blue-600 py-6 rounded-[2rem] shadow-2xl text-[13px] font-black active:scale-95 transition-all flex items-center justify-center gap-3">
          <Save size={20} /> FINALIZAR LANÇAMENTO WOLF
        </button>
      </form>
    </div>
  );
}