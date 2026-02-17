'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Plus, Zap, RefreshCcw, Save, 
  Coins, CreditCard, Loader2, ArrowUpCircle, ArrowDownCircle,
  ChevronDown, X, Calendar
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
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate()); // Novo Estado
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
        
        // Lógica para Cartão de Crédito
        if (!isPix && tipoPagamento === 'Crédito') {
          const cartao = cartoes.find(c => `${c.banco} - ${c.nome_cartao}` === metodoPagamento);
          if (cartao) {
            d = new Date(); 
            d.setDate(cartao.vencimento);
            if (hoje.getDate() > cartao.vencimento) d.setMonth(d.getMonth() + 1);
          }
        }
        
        d.setMonth(d.getMonth() + i);
        
        // Se for recorrente, forçamos o dia escolhido pelo usuário
        if (recorrente) {
          d.setDate(diaRecorrencia);
        }

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
    <div className="min-h-screen bg-[#0a0f1d] p-3 md:p-6 text-white font-black antialiased uppercase italic leading-none relative pb-32">
      
      <header className="flex items-center justify-between mb-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-slate-800 p-2 rounded-full border border-slate-700 active:scale-90 transition-all">
            <ChevronLeft size={20}/>
          </button>
          <h1 className="text-lg tracking-tighter uppercase">LANÇAMENTO</h1>
        </div>
        <Zap size={20} className="text-emerald-500 animate-pulse" />
      </header>

      <form onSubmit={handleSalvar} className="max-w-lg mx-auto bg-[#111827] p-5 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl space-y-4">
        
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
          <button type="button" onClick={() => setTipoMovimento('despesa')} className={`py-3 rounded-lg text-[10px] font-black transition-all ${tipoMovimento === 'despesa' ? 'bg-rose-600 shadow-lg' : 'text-slate-500'}`}>
            <ArrowDownCircle size={14} className="inline mr-1" /> DESPESA
          </button>
          <button type="button" onClick={() => setTipoMovimento('receita')} className={`py-3 rounded-lg text-[10px] font-black transition-all ${tipoMovimento === 'receita' ? 'bg-emerald-600 shadow-lg' : 'text-slate-500'}`}>
            <ArrowUpCircle size={14} className="inline mr-1" /> RECEITA
          </button>
        </div>

        <div className="space-y-3">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O QUE FOI LANÇADO?" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-[11px] font-black uppercase" required />
          <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-5 bg-slate-900 rounded-xl border-2 border-slate-700 text-xl font-black text-center outline-none text-emerald-400" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1 relative">
            <label className="text-[7px] opacity-40 ml-1 uppercase">Método</label>
            <button type="button" onClick={() => setIsCardDropdownOpen(!isCardDropdownOpen)} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between active:scale-95 transition-all">
              <div className="flex items-center gap-2">
                {metodoPagamento === 'Pix' ? <Zap size={12} className="text-emerald-500" /> : <CreditCard size={12} className="text-blue-500" />}
                <span className="text-[10px] font-black">{metodoPagamento.split(' - ')[0]}</span>
              </div>
              <ChevronDown size={12} className={isCardDropdownOpen ? 'rotate-180' : ''} />
            </button>

            {isCardDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border-2 border-slate-800 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto">
                <button type="button" onClick={() => { setMetodoPagamento('Pix'); setTipoPagamento('Dinheiro'); setIsCardDropdownOpen(false); }} className="w-full p-3 hover:bg-slate-800 flex items-center gap-3 border-b border-slate-800/50">
                  <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-black"><Zap size={14} /></div>
                  <div className="text-left leading-none"><p className="text-[9px] font-black">PIX / DINHEIRO</p></div>
                </button>
                {cartoes.map((c) => (
                  <button key={c.id} type="button" onClick={() => { setMetodoPagamento(`${c.banco} - ${c.nome_cartao}`); setTipoPagamento('Crédito'); setIsCardDropdownOpen(false); }} className="w-full p-3 hover:bg-slate-800 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="w-6 h-6 bg-slate-700 rounded overflow-hidden border border-slate-600">
                      <img src={c.logo_url} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.src = "/logo.png")} />
                    </div>
                    <div className="text-left leading-none"><p className="text-[9px] font-black">{c.banco}</p><p className="text-[7px] text-slate-500">{c.nome_cartao}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[7px] opacity-40 ml-1 uppercase">Modalidade</label>
            <select value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value as any)} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-[10px] font-black outline-none" disabled={metodoPagamento === 'Pix'}>
              {metodoPagamento === 'Pix' ? <option value="Dinheiro">À VISTA</option> : <><option value="Crédito">CRÉDITO</option><option value="Débito">DÉBITO</option></>}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          {tipoPagamento === 'Crédito' && metodoPagamento !== 'Pix' && !recorrente ? (
            <div className="relative">
              <label className="text-[7px] text-blue-500 ml-1 uppercase font-black">Parcelas</label>
              <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-center font-black text-xs" />
            </div>
          ) : recorrente ? (
            <div className="relative">
              <label className="text-[7px] text-purple-400 ml-1 uppercase font-black italic">Dia do Mês</label>
              <input type="number" min="1" max="31" value={diaRecorrencia} onChange={(e) => setDiaRecorrencia(Number(e.target.value))} className="w-full p-3 bg-slate-800 rounded-lg border border-purple-500/50 text-center font-black text-xs text-purple-400" />
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-slate-700 text-[9px] font-black text-center text-slate-500 bg-slate-900/50 uppercase">À VISTA</div>
          )}
          
          {(metodoPagamento === 'Pix' || tipoPagamento !== 'Crédito') ? (
            <div className="relative">
              <label className="text-[7px] text-slate-500 ml-1 uppercase font-black">Data</label>
              <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-center font-black text-[10px] outline-none" required />
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-slate-700 text-[9px] font-black text-center text-blue-400 bg-blue-900/10 uppercase italic">Fatura Automática</div>
          )}
        </div>

        <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-full py-3 rounded-lg border transition-all flex items-center justify-center gap-2 font-black text-[9px] ${recorrente ? 'border-purple-600 bg-purple-900/30 text-purple-400 shadow-lg' : 'border-slate-800 bg-slate-900/30 text-slate-500'}`}>
          <RefreshCcw size={14} className={recorrente ? 'animate-spin' : ''} style={{animationDuration: '3s'}} />
          {recorrente ? 'RECORRÊNCIA ATIVA' : 'LANÇAMENTO MENSAL?'}
        </button>

        <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl shadow-xl text-[11px] font-black active:scale-95 transition-all flex items-center justify-center gap-2 uppercase">
          <Save size={16} /> Finalizar Lançamento
        </button>
      </form>

      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none z-[10]">
        <p className="text-[7px] tracking-[0.4em] uppercase font-black mb-1">Engineered by</p>
        <p className="text-[10px] tracking-tighter font-black italic uppercase text-blue-500">
          Jhonatha <span className="text-white">| Wolf Finance © 2026</span>
        </p>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}