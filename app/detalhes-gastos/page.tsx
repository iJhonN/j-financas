'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, CheckCheck, CreditCard, Calendar, 
  Filter, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DetalhesGastos() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [mesAno, setMesAno] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        await fetchData(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const { data: tData } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data_ordenacao', { ascending: false });
      
      const { data: cData } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', userId);

      if (tData) setTransacoes(tData);
      if (cData) setCartoes(cData);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const listaFiltrada = useMemo(() => {
    return transacoes.filter(t => {
      const matchMes = t.data_ordenacao.startsWith(mesAno);
      const matchCartao = filtroCartao === 'Todos' || t.forma_pagamento === filtroCartao;
      return matchMes && matchCartao;
    });
  }, [transacoes, mesAno, filtroCartao]);

  const totalPendente = useMemo(() => {
    return listaFiltrada
      .filter(t => !t.pago && t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);
  }, [listaFiltrada]);

  const pagarTudo = async () => {
    const idsParaPagar = listaFiltrada.filter(t => !t.pago).map(t => t.id);
    
    if (idsParaPagar.length === 0) {
      return showAlert("Nenhum lançamento pendente nesta lista!", "error");
    }

    if (confirm(`Deseja marcar os ${idsParaPagar.length} itens visíveis como pagos?`)) {
      try {
        const { error } = await supabase
          .from('transacoes')
          .update({ pago: true })
          .in('id', idsParaPagar);

        if (error) throw error;
        
        showAlert("Tudo pago com sucesso!");
        fetchData(user.id);
      } catch (err) {
        showAlert("Erro ao processar pagamento", "error");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased pb-20">
      
      {/* Alertas */}
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            <AlertCircle size={20}/>
            <p className="text-[10px] font-black">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 bg-[#111827] p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <button onClick={() => router.back()} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg tracking-tighter">Gerenciar Fatura</h1>
          <p className="text-[8px] text-blue-400 tracking-widest">WOLF FINANCE SYSTEM</p>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </header>

      {/* Resumo e Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 mb-1">PENDENTE NO FILTRO</span>
          <h2 className="text-2xl text-rose-500">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="month" 
            value={mesAno} 
            onChange={(e) => setMesAno(e.target.value)}
            className="w-full bg-[#111827] p-5 pl-12 rounded-3xl border border-slate-800 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filtroCartao} 
            onChange={(e) => setFiltroCartao(e.target.value)}
            className="w-full bg-[#111827] p-5 pl-12 rounded-3xl border border-slate-800 outline-none focus:border-blue-500 transition-all appearance-none"
          >
            <option value="Todos">Todos os Cartões</option>
            <option value="Pix">Pix / Dinheiro</option>
            {cartoes.map(c => (
              <option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>
                {c.banco} - {c.nome_cartao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botão de Ação em Massa */}
      <button 
        onClick={pagarTudo}
        className="w-full mb-8 p-6 bg-emerald-600 hover:bg-emerald-700 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 group"
      >
        <CheckCheck size={24} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm">Liquidar Lançamentos Visíveis</span>
      </button>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {listaFiltrada.length === 0 ? (
          <div className="text-center p-10 bg-[#111827] rounded-3xl border border-slate-800 opacity-50">
            <p className="text-xs">Nenhum lançamento encontrado para este período.</p>
          </div>
        ) : (
          listaFiltrada.map((t) => (
            <div 
              key={t.id} 
              className={`flex justify-between items-center p-5 rounded-[1.8rem] border-2 transition-all ${
                t.pago 
                ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                : 'bg-[#111827] border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${t.valor > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.valor > 0 ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs leading-none mb-1">{t.descricao}</h3>
                  <div className="flex gap-2">
                    <span className="text-[7px] text-slate-500">{t.data_ordenacao.split('-').reverse().join('/')}</span>
                    <span className="text-[7px] text-blue-500">{t.forma_pagamento}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xs md:text-sm ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.valor > 0 ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className={`text-[7px] ${t.pago ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.pago ? 'EFETUADO' : 'AGUARDANDO'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}