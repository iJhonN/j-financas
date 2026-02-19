'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, CheckCheck, CreditCard, 
  ArrowUpCircle, ArrowDownCircle, Loader2,
  UserCircle, LogOut, Settings, Layers, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DetalhesGastos() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  
  const [showUndo, setShowUndo] = useState(false);
  const [lastUpdatedIds, setLastUpdatedIds] = useState<string[]>([]);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        await fetchData(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const { data: tData } = await supabase.from('transacoes').select('*').eq('user_id', userId).order('data_ordenacao', { ascending: false });
      const { data: cData } = await supabase.from('cartoes').select('*').eq('user_id', userId);
      if (tData) setTransacoes(tData.map(t => ({ ...t, valor: Number(t.valor) })));
      if (cData) setCartoes(cData);
    } catch (err) { console.error(err); }
  };

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const listaFiltrada = useMemo(() => {
    return transacoes.filter(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      const matchMonth = d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      const formaPagamento = t.forma_pagamento || "";
      const matchCard = filtroCartao === 'Todos' || formaPagamento.trim().toUpperCase() === filtroCartao.trim().toUpperCase() || formaPagamento.includes(filtroCartao);
      return matchMonth && matchCard;
    });
  }, [transacoes, selectedDate, filtroCartao]);

  const totalPendente = useMemo(() => {
    return listaFiltrada.filter(t => !t.pago && t.valor < 0).reduce((acc, t) => acc + Math.abs(t.valor), 0);
  }, [listaFiltrada]);

  const pagarTudo = async () => {
    const idsParaPagar = listaFiltrada.filter(t => !t.pago).map(t => t.id);
    if (idsParaPagar.length === 0) return showAlert("Nada pendente aqui!", "error");
    
    const { error } = await supabase.from('transacoes').update({ pago: true }).in('id', idsParaPagar);
    if (!error) {
      setLastUpdatedIds(idsParaPagar);
      setShowUndo(true);
      fetchData(user.id);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setShowUndo(false), 10000);
    }
  };

  const desfazerPagamento = async () => {
    if (lastUpdatedIds.length === 0) return;
    const { error } = await supabase.from('transacoes').update({ pago: false }).in('id', lastUpdatedIds);
    if (!error) { setShowUndo(false); setLastUpdatedIds([]); fetchData(user.id); showAlert("Revertido!"); }
  };

  // --- LÓGICA DE EXCLUSÃO EM MASSA CORRIGIDA ---
  const excluirRecorrencia = async (descricaoCompleta: string, valor: number, dataReferencia: string) => {
    // Pega o nome antes do " - 01/12" ou qualquer separador
    const nomeLimpo = descricaoCompleta.split(' - ')[0].trim();
    
    if (confirm(`LIMPAR RECORRÊNCIA: "${nomeLimpo}" DESTE MÊS EM DIANTE?`)) {
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('user_id', user.id)
          .ilike('descricao', `${nomeLimpo}%`) // Busca por nomes que começam igual
          .eq('valor', valor)                  // Filtra pelo mesmo valor
          .gte('data_ordenacao', dataReferencia); // APAGA DO MÊS CLICADO PARA FRENTE

        if (!error) { 
          showAlert("RECORRÊNCIA REMOVIDA!"); 
          fetchData(user.id); 
        }
      } catch (err) {
        console.error(err);
        showAlert("ERRO AO EXCLUIR.", "error");
      }
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black italic uppercase antialiased pb-32 leading-none relative">
      
      {showUndo && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-md animate-in slide-in-from-bottom-10">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-white/20 backdrop-blur-md">
            <span className="text-[10px] tracking-widest font-black uppercase">Fatura Atualizada!</span>
            <button onClick={desfazerPagamento} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black active:scale-95 transition-all">DESFAZER</button>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-all"><ChevronLeft size={20}/></button>
            <div className="leading-none">
              <h1 className="text-lg md:text-xl font-black tracking-tighter italic uppercase">WOLF FINANCE</h1>
              <p className="text-[9px] text-blue-400 italic uppercase">FATURA DETALHADA</p>
            </div>
          </div>
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all"><UserCircle size={20} /></button>
          {isProfileMenuOpen && (
            <div className="absolute right-4 mt-16 w-48 bg-[#111827] border-2 border-slate-800 rounded-2xl z-[500] overflow-hidden shadow-2xl">
              <button onClick={() => router.push('/')} className="w-full text-left p-4 hover:bg-slate-800 border-b border-slate-800/50 text-[10px] flex items-center gap-2 italic uppercase font-black"><Settings size={14}/> Dashboard</button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full text-left p-4 hover:bg-rose-900/20 text-rose-500 text-[10px] flex items-center gap-2 italic uppercase font-black"><LogOut size={14}/> Sair</button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827] p-5 rounded-[2.5rem] border-b-4 border-amber-500 flex flex-col justify-between h-32 shadow-2xl relative">
          <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-2 font-black italic uppercase">
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={16}/></button>
            <span className="tracking-widest">{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={16}/></button>
          </div>
          <div className="relative mt-2">
            <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full flex items-center justify-between text-[9px] bg-slate-800/30 p-3 rounded-xl border border-slate-700 italic font-black uppercase">
              <span className="truncate">{filtroCartao}</span><CreditCard size={14} className="text-amber-500" />
            </button>
            {isFilterMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border-2 border-slate-800 rounded-2xl z-[1000] max-h-48 overflow-y-auto shadow-2xl">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800 uppercase font-black italic">Todos</button>
                <button onClick={() => { setFiltroCartao('Pix'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800 uppercase font-black italic">Pix / Dinheiro</button>
                {cartoes.map(c => (
                  <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800 uppercase font-black italic">
                    {c.banco} - {c.nome_cartao}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] p-5 rounded-[2.5rem] border-b-4 border-rose-600 flex flex-col justify-center h-32 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-white/20 text-[8px] uppercase tracking-[0.2em] font-black italic">Pendente no Filtro</span>
            <ArrowDownCircle size={14} className="text-rose-500 opacity-30" />
          </div>
          <div className="text-xl md:text-3xl font-black text-rose-500 italic leading-none tracking-tighter">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <button 
        onClick={pagarTudo} 
        className="w-full mb-8 p-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all font-black uppercase tracking-widest text-[11px] border-b-4 border-emerald-800 italic"
      >
        <CheckCheck size={18} className="text-white" />
        <span>Liquidar Fatura Selecionada</span>
      </button>

      <div className="space-y-3">
        {listaFiltrada.length === 0 ? (
          <div className="text-center p-12 bg-[#111827] rounded-[2rem] border border-slate-800 opacity-30 text-[10px] font-black italic uppercase">Nenhum lançamento encontrado...</div>
        ) : (
          listaFiltrada.map((t) => {
             const cartaoInfo = cartoes.find(c => `${c.banco} - ${c.nome_cartao}` === t.forma_pagamento);
             
             return (
               <div key={t.id} className={`flex justify-between items-center p-4 md:p-5 rounded-[2rem] border-2 transition-all ${t.pago ? 'bg-slate-900/40 border-slate-800 opacity-40 scale-[0.98]' : 'bg-[#111827] border-slate-800 shadow-lg'}`}>
                 <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`p-3 rounded-2xl ${t.valor > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {t.valor > 0 ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      {cartaoInfo && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full border border-slate-700 p-1 flex items-center justify-center overflow-hidden">
                           <img src={cartaoInfo.logo_url} className="w-full h-full object-contain" onError={(e: any) => e.currentTarget.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                    <div className="max-w-[120px] md:max-w-none">
                      <h3 className="text-[10px] md:text-xs leading-none mb-1 truncate font-black italic uppercase">{t.descricao}</h3>
                      <p className="text-[7px] font-black opacity-50 uppercase tracking-tighter italic">
                        {t.data_ordenacao.split('-').reverse().join('/')} • {t.forma_pagamento}
                      </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs md:text-sm font-black italic uppercase ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[7px] font-black italic uppercase ${t.pago ? 'text-emerald-500' : 'text-slate-600'}`}>
                        {t.pago ? 'EFETUADO' : 'PENDENTE'}
                      </span>
                    </div>
                    
                    {/* BOTÃO DE EXCLUSÃO DE RECORRÊNCIA EM MASSA */}
                    <button 
                      onClick={() => excluirRecorrencia(t.descricao, t.valor, t.data_ordenacao)}
                      className="p-3 bg-rose-950/30 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 shadow-lg"
                    >
                      <Layers size={14} />
                    </button>
                 </div>
               </div>
             )
          })
        )}
      </div>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase text-center">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}