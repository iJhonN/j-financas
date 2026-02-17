'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, CheckCheck, CreditCard, 
  ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle,
  UserCircle, LogOut, Settings, Undo2, X
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
  
  // Estados para o Desfazer (Undo)
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
      if (tData) setTransacoes(tData);
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
      const matchCard = filtroCartao === 'Todos' || t.forma_pagamento === filtroCartao;
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
      
      // Inicia timer para sumir o botão desfazer em 10 segundos
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setShowUndo(false), 10000);
    }
  };

  const desfazerPagamento = async () => {
    if (lastUpdatedIds.length === 0) return;
    
    const { error } = await supabase.from('transacoes').update({ pago: false }).in('id', lastUpdatedIds);
    
    if (!error) {
      setShowUndo(false);
      setLastUpdatedIds([]);
      fetchData(user.id);
      showAlert("Operação revertida!");
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black italic uppercase antialiased pb-32">
      
      {/* Barra de Undo Flutuante */}
      {showUndo && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-md animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-white/20">
            <div className="flex items-center gap-3">
              <Undo2 size={20} className="animate-pulse" />
              <span className="text-[10px]">Fatura Liquidada!</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={desfazerPagamento} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[9px] hover:bg-slate-100 transition-colors">DESFAZER</button>
              <button onClick={() => setShowUndo(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50"><X size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {/* Header Wolf Finance */}
      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 bg-slate-800 rounded-full mr-2 hover:bg-blue-600 transition-all"><ChevronLeft size={20}/></button>
            <img src="/logo.png" alt="Wolf Logo" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-lg md:text-xl font-black tracking-tighter">WOLF FINANCE</h1>
              <p className="text-[9px] text-blue-400">GERENCIAMENTO DE FATURA</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all"><UserCircle size={20} /></button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111827] border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[500] overflow-hidden">
                <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 border-b border-slate-800/50 text-[10px]"><Settings size={18} /> Dashboard</button>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 text-[10px]"><LogOut size={18} /> Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111827] p-6 rounded-[2.5rem] border-b-8 border-amber-500 flex flex-col justify-between h-40 relative shadow-2xl">
          <div className="flex items-center justify-between uppercase text-xs border-b border-white/10 pb-3">
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={20}/></button>
            <span className="tracking-widest">{selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={20}/></button>
          </div>
          <div className="relative mt-2">
            <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full flex items-center justify-between text-[10px] bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
              <span className="truncate">{filtroCartao}</span><CreditCard size={16}/>
            </button>
            {isFilterMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border-2 border-slate-800 rounded-2xl shadow-2xl z-[500] max-h-48 overflow-y-auto">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800">Todos</button>
                <button onClick={() => { setFiltroCartao('Pix'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800">Pix / Dinheiro</button>
                {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 border-b border-slate-800 text-[10px] hover:bg-slate-800">{c.banco} - {c.nome_cartao}</button>)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-[2.5rem] border-b-8 border-rose-600 flex flex-col justify-between h-40 shadow-2xl">
          <div className="flex justify-between items-start w-full text-white/20 text-[10px] uppercase tracking-widest">
            <span>Pendente no Filtro</span>
            <ArrowDownCircle size={20}/>
          </div>
          <div className="text-2xl md:text-3xl font-black text-rose-500 italic">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <button 
        onClick={pagarTudo}
        className="w-full mb-8 p-6 bg-emerald-600 hover:bg-emerald-700 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group"
      >
        <CheckCheck size={24} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm tracking-widest">Liquidar Lançamentos Selecionados</span>
      </button>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {listaFiltrada.length === 0 ? (
          <div className="text-center p-10 bg-[#111827] rounded-[2rem] border border-slate-800 opacity-50 text-[10px]">Vazio...</div>
        ) : (
          listaFiltrada.map((t) => (
            <div key={t.id} className={`flex justify-between items-center p-5 rounded-[2rem] border-2 transition-all ${t.pago ? 'bg-slate-900/40 border-slate-800 opacity-50' : 'bg-[#111827] border-slate-800 shadow-lg'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${t.valor > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.valor > 0 ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs leading-none mb-1">{t.descricao}</h3>
                  <div className="flex gap-2 text-[7px] font-black opacity-50">
                    <span>{t.data_ordenacao.split('-').reverse().join('/')}</span>
                    <span className="text-blue-500">{t.forma_pagamento}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs md:text-sm ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span className={`text-[7px] ${t.pago ? 'text-emerald-500' : 'text-slate-600'}`}>{t.pago ? 'EFETUADO' : 'PENDENTE'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}