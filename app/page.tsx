'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, ChevronDown, Settings, Zap,
  AlertCircle, CheckCircle, Clock, Lock, RefreshCcw, Palette, Search, ChevronLeft, ChevronRight, Circle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

// Temas do Sistema Wolf - Identidade Visual Black & Italic
const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-500/20', chart: '#3b82f6' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-500/20', chart: '#10b981' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-500/20', chart: '#8b5cf6' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-500/20', chart: '#e11d48' }
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

  // Estados de Modais e Interface
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estados de Dados (Supabase)
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [saldoInicial, setSaldoInicial] = useState(0);

  // Estados de Formulários de Lançamento
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Gestão de Perfil e Cartões
  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [saldoDisplay, setSaldoDisplay] = useState('');

  const isAdmin = user?.email === "jhonatha2005@outlook.com";

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
      if (user?.user_metadata?.full_name) setNovoNome(user.user_metadata.full_name);
    } catch (err) { console.error("Erro Supabase:", err); }
  };

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const sanitize = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

  // MÁQUINA DE REGRAS DE LANÇAMENTO
  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return showAlert("Acesso expirado!", "error");
    
    const cleanDesc = sanitize(descricao).toUpperCase();
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    
    if (!cleanDesc || vTotal <= 0) return showAlert("Dados inválidos", "error");

    try {
      const valorComSinal = tipoMovimento === 'receita' ? Math.abs(vTotal) : -Math.abs(vTotal);
      
      // Flags de Controle de Tipo
      const isPix = metodoPagamento === 'Pix';
      const isDebito = tipoPagamento === 'Débito';
      const isCredito = tipoPagamento === 'Crédito';

      // Pix e Débito forçam 1 parcela (à vista)
      const numRepeticoes = (isPix || isDebito) ? 1 : (recorrente ? 12 : parcelas);
      const valorParcela = parseFloat((valorComSinal / numRepeticoes).toFixed(2));
      
      const novosLancamentos = [];
      const hoje = new Date();

      for (let i = 0; i < numRepeticoes; i++) {
        let d = new Date();

        // Lógica de Datas: Crédito usa vencimento do cartão, outros usam data selecionada
        if (isCredito && !isPix) {
           const cartao = cartoes.find(c => `${c.banco} - ${c.nome_cartao}` === metodoPagamento);
           if (cartao) {
              d.setDate(cartao.vencimento);
              if (hoje.getDate() > cartao.vencimento) d.setMonth(d.getMonth() + 1);
           }
        } else {
           d = new Date(dataLancamento + 'T12:00:00');
        }
        
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);

        // Formatação da Descrição com identificadores visuais
        const sufixo = numRepeticoes > 1 ? ` - PARCELA ${(i + 1).toString().padStart(2, '0')}/${numRepeticoes.toString().padStart(2, '0')}` : "";
        const prefixoZap = isPix ? "⚡ " : "";
        const descricaoFinal = `${prefixoZap}${cleanDesc}${sufixo}`;

        novosLancamentos.push({
          descricao: descricaoFinal,
          valor: valorParcela,
          forma_pagamento: metodoPagamento,
          tipo: tipoMovimento,
          tipo_pagamento: isPix ? 'Dinheiro' : tipoPagamento,
          recorrente: recorrente,
          data_ordenacao: d.toISOString().split('T')[0],
          user_id: user.id,
          // Status Pago: Automático para Débito, Pix, Dinheiro e Receitas
          pago: isDebito || isPix || tipoMovimento === 'receita' || tipoPagamento === 'Dinheiro'
        });
      }

      const { error } = await supabase.from('transacoes').insert(novosLancamentos);
      if (error) throw error;
      
      showAlert((isPix || isDebito) ? "Liquidado com sucesso! ⚡" : "Lançado na fatura!"); 
      setIsModalOpen(false);
      setDescricao(''); setValorDisplay(''); setParcelas(1); setRecorrente(false);
      fetchDados(user.id);
    } catch (err) { showAlert("Erro ao salvar lançamento", "error"); }
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Lógica de Filtros e Cálculos de Saldo
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      const matchMonth = d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      const matchSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCard = filtroCartao === 'Todos' || t.forma_pagamento.includes(filtroCartao);
      return matchMonth && matchSearch && matchCard;
    });
  }, [transacoes, selectedDate, searchTerm, filtroCartao]);

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

  const entradasMensais = transacoesFiltradas.filter(t => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
  const saidasMensais = transacoesFiltradas.filter(t => t.valor < 0).reduce((acc, t) => acc + t.valor, 0);
  const saldoCalculado = saldoInicial + transacoes.filter(t => t.pago).reduce((acc, t) => acc + t.valor, 0);

  const formatarDadosGrafico = () => {
    return [...transacoesFiltradas].reverse().map(t => {
      const d = new Date(t.data_ordenacao + 'T12:00:00');
      return { data: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`, valor: parseFloat(Math.abs(t.valor).toFixed(2)) };
    });
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black antialiased overflow-x-hidden pb-24 italic leading-none">
      
      {/* Alertas Flutuantes */}
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            {alertConfig.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <p className="text-[10px] uppercase tracking-widest font-black italic">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      {/* Header Wolf Finance */}
      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Wolf Logo" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter px-1">WOLF FINANCE</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-[9px] md:text-[10px] font-black ${theme.text} uppercase`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-500 text-[7px] font-black uppercase">
                  <Clock size={8} /> {checkingSubscription ? "..." : diasRestantes} DIAS
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all"><UserCircle size={20} /></button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111827] border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2">
                {isAdmin && <button onClick={() => router.push('/admin')} className="w-full flex items-center gap-3 p-4 hover:bg-amber-500/10 text-amber-500 border-b border-slate-800/50 uppercase text-[10px]"><ShieldCheck size={18} /> Admin</button>}
                <button onClick={() => { setIsProfileMenuOpen(false); setIsConfigModalOpen(true); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 border-b border-slate-800/50 uppercase text-[10px]"><Settings size={18} /> Ajustes</button>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 uppercase text-[10px]"><LogOut size={18} /> Sair</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 p-3 rounded-2xl border border-emerald-800/50 text-[10px] uppercase flex items-center justify-center gap-2 bg-emerald-900/20 text-emerald-400 active:scale-95 transition-all"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 p-3 rounded-2xl border border-slate-700 text-[10px] uppercase flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 active:scale-95 transition-all"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className={`w-full md:w-auto p-3.5 rounded-2xl shadow-lg text-[10px] uppercase flex items-center justify-center gap-2 ${theme.primary} text-white active:scale-95 transition-all`}><Plus size={18} /> Novo</button>
        </div>
      </header>

      {/* Grid Principal de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Pago" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} color={`bg-[#111827] border-b-8 ${theme.border}`} />
        <Card title="Gasto Mês" value={`R$ ${formatarMoeda(saidasMensais)}`} icon={<CreditCard size={20}/>} color="bg-[#111827] border-b-8 border-rose-600" onClick={() => router.push('/detalhes-gastos')} />
        <Card title="Entrada Mês" value={`R$ ${formatarMoeda(entradasMensais)}`} icon={<TrendingUp size={20}/>} color="bg-[#111827] border-b-8 border-emerald-600" />
        <div className="bg-[#111827] p-4 rounded-[1.5rem] border-b-8 border-amber-500 flex flex-col justify-between h-32 relative shadow-2xl">
           <div className="flex items-center justify-between uppercase text-[9px] border-b border-white/10 pb-2">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={16}/></button>
              <span>{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={16}/></button>
           </div>
           <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full flex items-center justify-between text-[9px] uppercase font-black bg-slate-800/50 p-2 rounded-lg border border-slate-700 mt-2">
             <span className="truncate">{filtroCartao}</span><ChevronDown size={12}/>
           </button>
           {isFilterMenuOpen && (
             <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border-2 border-slate-800 rounded-xl shadow-2xl z-[500] max-h-40 overflow-y-auto">
               <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black uppercase hover:bg-slate-800">Todos</button>
               {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black uppercase hover:bg-slate-800">{c.banco} - {c.nome_cartao}</button>)}
             </div>
           )}
        </div>
      </div>

      {/* Gráfico de Desempenho */}
      <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 overflow-hidden mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatarDadosGrafico()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="data" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900', color: '#fff'}} formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Valor']}/>
            <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Lista de Cartões e Gastos por Cartão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h3 className="text-[10px] uppercase font-black mb-4 flex items-center gap-2 opacity-50"><CreditCard size={14}/> Faturas Atuais</h3>
          <div className="space-y-3">
            {cartoes.length === 0 && <p className="text-[9px] uppercase text-slate-600 text-center py-4">Nenhum cartão registado</p>}
            {cartoes.map(c => {
              const totalGasto = gastosPorCartao.get(`${c.banco} - ${c.nome_cartao}`) || 0;
              return (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="leading-tight">
                    <p className="text-[10px] uppercase font-black">{c.banco}</p>
                    <p className="text-[8px] text-slate-500 uppercase">{c.nome_cartao} (Venc. {c.vencimento})</p>
                  </div>
                  <p className="text-[11px] font-black text-rose-500 italic">R$ {formatarMoeda(totalGasto)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico de Transações */}
        <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase font-black opacity-50 flex items-center gap-2"><Search size={14}/> Atividade</h3>
            <input 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="BUSCAR..." 
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-[9px] uppercase font-black outline-none w-32 focus:w-48 transition-all"
            />
          </div>
          <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {transacoesFiltradas.length === 0 && <p className="text-[9px] uppercase text-slate-600 text-center py-10">Sem lançamentos este mês</p>}
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 group hover:border-slate-600 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${t.valor > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {t.valor > 0 ? <TrendingUp size={14}/> : <TrendingUp className="rotate-180" size={14}/>}
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] uppercase font-black max-w-[140px] truncate">{t.descricao}</p>
                    <p className="text-[7px] text-slate-500 uppercase font-black">
                      {new Date(t.data_ordenacao + 'T12:00:00').toLocaleDateString('pt-BR')} • {t.forma_pagamento}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-[11px] font-black italic ${t.valor > 0 ? 'text-emerald-500' : 'text-white'}`}>
                      R$ {formatarMoeda(t.valor)}
                    </p>
                    {t.pago && <span className="text-[6px] bg-emerald-500/20 text-emerald-500 px-1.5 rounded-full font-black uppercase tracking-tighter">Liquidado</span>}
                  </div>
                  <button onClick={async () => {
                    if(confirm("Eliminar este lançamento?")) {
                      await supabase.from('transacoes').delete().eq('id', t.id);
                      fetchDados(user.id);
                      showAlert("Lançamento removido");
                    }
                  }} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÕES / PERFIL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <div className="bg-[#111827] w-full max-w-md rounded-[3rem] p-8 border-4 border-slate-800 shadow-2xl relative">
            <button onClick={() => setIsConfigModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full hover:bg-slate-700"><X size={20}/></button>
            <h2 className="text-xl uppercase font-black mb-8 italic flex items-center gap-3"><Settings className={theme.text} /> Ajustes</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black ml-2 opacity-50">Tema do Sistema</label>
                <div className="flex justify-between gap-2 p-2 bg-slate-800 rounded-2xl border border-slate-700">
                  {Object.keys(THEMES).map((tKey) => (
                    <button 
                      key={tKey} 
                      onClick={async () => {
                        setCurrentTheme(tKey as any);
                        await supabase.from('profiles').update({ theme: tKey }).eq('id', user.id);
                      }} 
                      className={`w-full py-3 rounded-xl border-2 transition-all ${currentTheme === tKey ? THEMES[tKey as keyof typeof THEMES].border : 'border-transparent'}`}
                    >
                      <Circle fill={THEMES[tKey as keyof typeof THEMES].chart} className="mx-auto" size={14}/>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black ml-2 opacity-50">Nome de Utilizador</label>
                <input 
                  value={novoNome} 
                  onChange={(e) => setNovoNome(e.target.value)} 
                  className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[10px] font-black uppercase outline-none focus:border-blue-500"
                />
              </div>

              <button 
                onClick={async () => {
                  const { error } = await supabase.auth.updateUser({ data: { full_name: novoNome } });
                  if (!error) showAlert("Perfil Atualizado!");
                }}
                className={`w-full ${theme.primary} py-4 rounded-2xl shadow-xl uppercase text-[10px] font-black active:scale-95 transition-all`}
              >
                Guardar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SALDO INICIAL */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 border-4 border-slate-800 shadow-2xl relative">
            <button onClick={() => setIsSaldoModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full"><X size={20}/></button>
            <h2 className="text-lg uppercase font-black mb-6 italic">Ajustar Saldo Bancário</h2>
            <input 
              type="text" 
              value={saldoDisplay} 
              onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} 
              placeholder="R$ 0,00" 
              className="w-full p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 text-xl font-black text-center outline-none mb-6"
            />
            <button 
              onClick={async () => {
                const valor = Number(saldoDisplay.replace(/\./g, '').replace(',', '.'));
                await supabase.from('profiles').update({ saldo_inicial: valor }).eq('id', user.id);
                setSaldoInicial(valor);
                setIsSaldoModalOpen(false);
                showAlert("Saldo atualizado!");
              }}
              className={`w-full ${theme.primary} py-4 rounded-2xl uppercase text-[10px] font-black active:scale-95 transition-all`}
            >
              Definir Saldo
            </button>
          </div>
        </div>
      )}

      {/* RODAPÉ E ESTILOS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// Componente Card Reutilizável
function Card({ title, value, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`${color} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : ''} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic transition-all animate-in fade-in slide-in-from-bottom-2 duration-500`}
    >
      <div className="flex justify-between items-start w-full tracking-widest">
        <span className="text-white/20 text-[7px] md:text-[10px] uppercase">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md opacity-50">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight">{value}</div>
    </div>
  );
}