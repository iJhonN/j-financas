'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil,
  UserCircle, Loader2, ChevronDown, Zap,
  AlertCircle, CheckCircle, Clock, RefreshCcw, Search, ChevronLeft, ChevronRight, Circle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const THEMES = {
  blue: { primary: 'btn-wolf-primary', text: 'text-blue-400', border: 'border-blue-600', chart: '#3b82f6' },
  emerald: { primary: 'btn-wolf-success', text: 'text-emerald-400', border: 'border-emerald-600', chart: '#10b981' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', chart: '#8b5cf6' },
  sunset: { primary: 'btn-wolf-danger', text: 'text-rose-400', border: 'border-rose-600', chart: '#e11d48' }
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const router = useRouter();
  const theme = THEMES[currentTheme];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [saldoInicial, setSaldoInicial] = useState(0);

  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [saldoDisplay, setSaldoDisplay] = useState('');

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const fetchDados = async (userId: string) => {
    try {
      const { data: tData } = await supabase.from('transacoes').select('*').eq('user_id', userId).order('data_ordenacao', { ascending: false });
      if (tData) setTransacoes(tData.map(t => ({ ...t, valor: Number(t.valor), pago: t.pago ?? false })));
      const { data: cData } = await supabase.from('cartoes').select('*').eq('user_id', userId);
      if (cData) setCartoes(cData);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (profile) {
        setSaldoInicial(Number(profile.saldo_inicial) || 0);
        if (profile.theme && THEMES[profile.theme as keyof typeof THEMES]) setCurrentTheme(profile.theme as any);
        const expDate = new Date(profile.expires_at);
        const diff = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        setDiasRestantes(diff > 0 ? diff : 0);
        setIsExpired(diff <= 0);
      }
      setCheckingSubscription(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        await fetchDados(session.user.id);
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

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const togglePago = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('transacoes').update({ pago: !currentStatus }).eq('id', id);
    if (!error) fetchDados(user.id);
    else showAlert("Erro ao atualizar status", "error");
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = banco.toUpperCase();
    const cleanNomeC = nomeCartao.toUpperCase();
    const fileName = cleanBanco.toLowerCase().trim().replace(/\s+/g, '');
    const logoUrl = `/logos/${fileName}.svg`;
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    if (!res.error) {
      fetchDados(user.id); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento(''); setEditingCardId(null); showAlert("Cartão Wolf salvo!");
    }
  };

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return showAlert("Acesso expirado!", "error");
    const cleanDesc = descricao.replace(/<[^>]*>?/gm, '').trim().toUpperCase();
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (!cleanDesc || vTotal <= 0) return showAlert("Dados inválidos", "error");
    try {
      const valorComSinal = tipoMovimento === 'receita' ? Math.abs(vTotal) : -Math.abs(vTotal);
      const isPix = metodoPagamento === 'Pix';
      const isCredito = tipoPagamento === 'Crédito';
      const numRepeticoes = recorrente ? 12 : (isCredito ? parcelas : 1);
      const valorParcela = parseFloat((valorComSinal / numRepeticoes).toFixed(2));
      const novosLancamentos = [];
      for (let i = 0; i < numRepeticoes; i++) {
        let d = new Date(dataLancamento + 'T12:00:00');
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);
        novosLancamentos.push({
          descricao: `${isPix ? "⚡ " : ""}${cleanDesc}${numRepeticoes > 1 ? ` - PARCELA ${(i + 1).toString().padStart(2, '0')}/${numRepeticoes}` : ""}`,
          valor: valorParcela,
          forma_pagamento: metodoPagamento,
          tipo: tipoMovimento,
          tipo_pagamento: isPix ? 'Dinheiro' : tipoPagamento,
          recorrente: recorrente,
          data_ordenacao: d.toISOString().split('T')[0],
          user_id: user.id,
          pago: (isPix || (tipoPagamento === 'Débito' && !recorrente) || tipoMovimento === 'receita') && i === 0
        });
      }
      const { error } = await supabase.from('transacoes').insert(novosLancamentos);
      if (error) throw error;
      showAlert("Lançamento Wolf realizado!"); 
      setIsModalOpen(false); setDescricao(''); setValorDisplay(''); setParcelas(1); setRecorrente(false); fetchDados(user.id);
    } catch (err) { showAlert("Erro ao salvar", "error"); }
  };

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      const matchMonth = d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCard = filtroCartao === 'Todos' || t.forma_pagamento.includes(filtroCartao);
      return matchMonth && matchSearch && matchCard;
    });
  }, [transacoes, selectedDate, searchTerm, filtroCartao]);

  const saldoCalculado = saldoInicial + transacoes.filter(t => t.pago).reduce((acc, t) => acc + t.valor, 0);

  const gastosPorCartao = useMemo(() => {
    const mapa = new Map();
    transacoesFiltradas.forEach(t => {
      if (t.valor < 0 && t.forma_pagamento !== 'Pix') {
        const atual = mapa.get(t.forma_pagamento) || 0;
        mapa.set(t.forma_pagamento, atual + Math.abs(t.valor));
      }
    });
    return mapa;
  }, [transacoesFiltradas]);

  const formatarDadosGrafico = () => {
    return [...transacoesFiltradas].reverse().map(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      return { 
        data: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`, 
        valor: parseFloat(Math.abs(t.valor).toFixed(2)) 
      };
    });
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen p-2 md:p-8">
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500' : 'bg-emerald-950/80 border-emerald-500'}`}>
            <p className="text-[10px] font-black italic uppercase tracking-widest">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      <header className="card-wolf p-4 md:p-6 mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Wolf Logo" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-xl font-black italic uppercase tracking-tighter">WOLF FINANCE</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-[10px] font-black uppercase italic ${theme.text}`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-500 text-[7px] font-black italic">
                  <Clock size={8} /> {diasRestantes} DIAS
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => router.push('/perfil')} className="btn-wolf-icon"><UserCircle size={20} /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 btn-wolf-outline p-3 text-[10px]"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 btn-wolf-outline p-3 text-[10px]"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className={`${theme.primary} flex-1 md:flex-none md:px-8 py-3.5 text-[10px]`}><Plus size={18} /> Novo</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Pago" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} color={`border-b-8 ${theme.border}`} className="card-wolf" />
        <Card title="Gasto Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter((t:any)=>t.valor<0).reduce((a:any,b:any)=>a+b.valor,0))}`} icon={<CreditCard size={20}/>} color="border-b-8 border-rose-600" onClick={() => router.push('/detalhes-gastos')} className="card-wolf-interactive" />
        <Card title="Entrada Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter((t:any)=>t.valor>0).reduce((a:any,b:any)=>a+b.valor,0))}`} icon={<TrendingUp size={20}/>} color="border-b-8 border-emerald-600" className="card-wolf" />
        <div className="card-wolf p-4 flex flex-col justify-between h-32 md:h-36 border-b-8 border-amber-500">
           <div className="flex items-center justify-between text-[9px] border-b border-white/10 pb-2 font-black italic">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={16}/></button>
              <span>{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={16}/></button>
           </div>
           <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="btn-wolf-outline w-full py-2 text-[9px] border-slate-800 bg-slate-900/50">
             <span className="truncate">{filtroCartao}</span><ChevronDown size={12}/>
           </button>
           {isFilterMenuOpen && (
             <div className="absolute bottom-full left-0 right-0 mb-2 card-wolf border-2 border-slate-800 z-[500] max-h-40 overflow-y-auto custom-scrollbar">
               <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black italic uppercase hover:bg-slate-800">Todos</button>
               {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black italic uppercase hover:bg-slate-800">{c.banco} - {c.nome_cartao}</button>)}
             </div>
           )}
        </div>
      </div>

      <div className="card-wolf p-6 h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatarDadosGrafico()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="data" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip contentStyle={{backgroundColor: '#111827', border: '2px solid #1e293b', borderRadius: '1rem', fontWeight: '900'}} />
            <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card-wolf p-5 md:p-8">
          <h2 className="text-[10px] font-black italic uppercase tracking-widest text-slate-500 mb-6">Meus Cartões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartoes.map(c => {
              const faturaMes = gastosPorCartao.get(`${c.banco} - ${c.nome_cartao}`) || 0;
              return (
                <div key={c.id} className="card-wolf-interactive p-4 border-2 border-slate-800/50 bg-slate-950/30 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700 group-hover:border-blue-500">
                      <img src={c.logo_url} className="w-full h-full object-contain" onError={(e: any) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[8px] font-black text-slate-500 uppercase italic">{c.banco}</p>
                      <p className="font-black text-xs uppercase italic">{c.nome_cartao}</p>
                      <p className={`text-[9px] font-black uppercase italic mt-1 ${faturaMes > 0 ? 'text-rose-500' : 'text-slate-600'}`}>Fatura: R$ {formatarMoeda(faturaMes)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-500 hover:text-white"><Pencil size={16}/></button>
                    <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(user.id); } }} className="text-slate-500 hover:text-rose-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-wolf flex flex-col min-h-[500px]">
          <div className="p-6 pb-2">
            <h2 className="text-[10px] font-black italic uppercase tracking-widest text-slate-500 mb-4">Atividade</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-wolf py-2 pl-9 pr-4 text-[9px]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
            {transacoesFiltradas.map((t:any) => (
              <div key={t.id} className="p-4 flex items-center justify-between border-b-2 border-slate-800/50 hover:bg-slate-800/30 transition-all rounded-2xl">
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePago(t.id, t.pago)} className={`p-1.5 rounded-full ${t.pago ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-600 bg-slate-800'}`}>{t.pago ? <CheckCircle size={18}/> : <Circle size={18}/>}</button>
                  <div className="leading-tight">
                    <p className="text-[10px] uppercase truncate max-w-[100px] font-black italic">{t.descricao}</p>
                    <p className={`text-[7px] uppercase font-black italic ${theme.text}`}>{t.forma_pagamento}</p>
                  </div>
                </div>
                <p className={`text-[10px] font-black italic ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {formatarMoeda(t.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[5000]">
          <form onSubmit={handleSalvarGasto} className="card-wolf w-full max-w-md p-6 border-slate-700">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black italic uppercase tracking-tighter">Novo Lançamento</h2><button type="button" onClick={() => setIsModalOpen(false)} className="btn-wolf-icon"><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800">
                <button type="button" onClick={() => setTipoMovimento('despesa')} className={`flex-1 py-3 btn-wolf text-[10px] rounded-xl ${tipoMovimento === 'despesa' ? 'bg-rose-600' : 'text-slate-500'}`}>Despesa</button>
                <button type="button" onClick={() => setTipoMovimento('receita')} className={`flex-1 py-3 btn-wolf text-[10px] rounded-xl ${tipoMovimento === 'receita' ? 'bg-emerald-600' : 'text-slate-500'}`}>Receita</button>
              </div>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO" className="input-wolf" required />
              <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="input-wolf text-lg text-center" required />
              <div className="grid grid-cols-2 gap-2">
                <select value={metodoPagamento} onChange={(e) => { setMetodoPagamento(e.target.value); setTipoPagamento(e.target.value === 'Pix' ? 'Dinheiro' : 'Crédito'); }} className="input-wolf text-[10px]">
                  <option value="Pix">Pix / Dinheiro</option>
                  {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} - {c.nome_cartao}</option>))}
                </select>
                <select value={tipoPagamento} onChange={(e:any) => setTipoPagamento(e.target.value)} className="input-wolf text-[10px]" disabled={metodoPagamento === 'Pix'}>
                  {metodoPagamento === 'Pix' ? <option value="Dinheiro">Dinheiro (À Vista)</option> : <><option value="Crédito">Crédito</option><option value="Débito">Débito</option></>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tipoPagamento === 'Crédito' && metodoPagamento !== 'Pix' ? (
                  <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="input-wolf text-[10px] text-center" placeholder="Parcelas" />
                ) : (
                  <div className="input-wolf text-[8px] flex items-center justify-center text-emerald-500 italic">À Vista</div>
                )}
                <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="input-wolf text-[10px] text-center" required />
              </div>
              <button type="submit" className={`${theme.primary} w-full py-5`}>Confirmar Lançamento</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <div className="card-wolf w-full max-w-sm p-10 border-slate-700 relative">
            <button onClick={() => setIsSaldoModalOpen(false)} className="btn-wolf-icon absolute top-6 right-6"><X size={20}/></button>
            <h2 className="text-xl mb-8 text-emerald-500 text-center font-black italic uppercase">Saldo Bancário</h2>
            <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="input-wolf text-emerald-500 text-xl text-center py-5 border-slate-800" />
            <button onClick={async () => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id); setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); fetchDados(user.id); showAlert("Saldo ajustado!"); }} className="btn-wolf-success w-full py-5 mt-6 shadow-lg">Confirmar Novo Saldo</button>
          </div>
        </div>
      )}

      {/* MODAL CARTÃO */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <form onSubmit={handleSalvarCartao} className="card-wolf w-full max-w-sm p-8 border-slate-700 relative">
            <button type="button" onClick={() => setIsCardModalOpen(false)} className="btn-wolf-icon absolute top-6 right-6"><X size={20}/></button>
            <h2 className="text-xl mb-6 text-center font-black italic uppercase">Salvar Cartão</h2>
            <div className="space-y-4">
              <input value={banco} onChange={(e) => setBanco(e.target.value.toUpperCase())} placeholder="BANCO (EX: NUBANK)" className="input-wolf" required />
              <input value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value.toUpperCase())} placeholder="NOME NO APP" className="input-wolf" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="input-wolf text-center" required />
              <button type="submit" className={`${theme.primary} w-full py-4`}>Salvar Cartão</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color, onClick, className }: any) {
  return (
    <div onClick={onClick} className={`${className} ${color} p-4 md:p-7 flex flex-col justify-between h-32 md:h-36 cursor-pointer active:scale-95 transition-all`}>
      <div className="flex justify-between items-start w-full">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md opacity-50">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight tracking-tighter italic">{value}</div>
    </div>
  );
}