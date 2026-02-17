'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, ChevronDown, Settings, 
  AlertCircle, CheckCircle, Clock, Lock, RefreshCcw, Palette, Search, ChevronLeft, ChevronRight, Circle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

// Temas do Sistema
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

  // Estados de Modais e UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dados do Supabase
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [saldoInicial, setSaldoInicial] = useState(0);

  // Estados de Formulários
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Perfil
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

  const changeTheme = async (newTheme: keyof typeof THEMES) => {
    try {
      setCurrentTheme(newTheme);
      await supabase.from('profiles').update({ theme: newTheme }).eq('id', user.id);
      showAlert("Estilo sincronizado!");
    } catch (err) { showAlert("Erro ao salvar tema", "error"); }
  };

  const togglePago = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('transacoes').update({ pago: !currentStatus }).eq('id', id);
    if (!error) fetchDados(user.id);
    else showAlert("Erro ao atualizar status", "error");
  };

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return showAlert("Acesso expirado!", "error");
    const cleanDesc = sanitize(descricao);
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (!cleanDesc || vTotal <= 0) return showAlert("Dados inválidos", "error");

    try {
      const valorComSinal = tipoMovimento === 'receita' ? Math.abs(vTotal) : -Math.abs(vTotal);
      const valorParcela = parseFloat((valorComSinal / (recorrente ? 1 : parcelas)).toFixed(2));
      const novosLancamentos = [];
      const hoje = new Date();
      const numRepeticoes = recorrente ? 12 : parcelas;

      for (let i = 0; i < numRepeticoes; i++) {
        let d = metodoPagamento === 'Pix' ? new Date(dataLancamento + 'T12:00:00') : new Date();
        
        if (metodoPagamento !== 'Pix' && tipoPagamento === 'Crédito') {
           const cartao = cartoes.find(c => `${c.banco} - ${c.nome_cartao}` === metodoPagamento);
           if (cartao) {
              d.setDate(cartao.vencimento);
              if (hoje.getDate() > cartao.vencimento) d.setMonth(d.getMonth() + 1);
           }
        }
        
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);

        novosLancamentos.push({
          descricao: numRepeticoes > 1 ? `${cleanDesc.toUpperCase()} (${i + 1}/${numRepeticoes})` : cleanDesc.toUpperCase(),
          valor: valorParcela,
          forma_pagamento: metodoPagamento,
          tipo: tipoMovimento,
          tipo_pagamento: tipoPagamento,
          recorrente: recorrente,
          data_ordenacao: d.toISOString().split('T')[0],
          user_id: user.id,
          pago: tipoMovimento === 'receita' || tipoPagamento === 'Débito'
        });
      }
      const { error } = await supabase.from('transacoes').insert(novosLancamentos);
      if (error) throw error;
      showAlert("Lançado com sucesso!"); setIsModalOpen(false);
      setDescricao(''); setValorDisplay(''); setParcelas(1); setRecorrente(false);
      fetchDados(user.id);
    } catch (err) { showAlert("Erro ao salvar", "error"); }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = sanitize(banco).toUpperCase();
    const cleanNomeC = sanitize(nomeCartao).toUpperCase();
    
    // NOVO: Aponta para sua pasta public/logos/nomebanco.svg
    const fileName = cleanBanco.toLowerCase().trim().replace(/\s+/g, '');
    const logoUrl = `/logos/${fileName}.svg`;

    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    
    if (!res.error) { 
      fetchDados(user.id); 
      setIsCardModalOpen(false); 
      setBanco(''); setNomeCartao(''); setVencimento(''); setEditingCardId(null); 
      showAlert("Cartão salvo!"); 
    }
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
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
      {/* Alertas */}
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

      {/* Cards de Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Pago" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} color={`bg-[#111827] border-b-8 ${theme.border}`} />
        <Card title="Gasto Mês" value={`R$ ${formatarMoeda(saidasMensais)}`} icon={<CreditCard size={20}/>} color="bg-[#111827] border-b-8 border-rose-600" />
        <Card title="Entrada Mês" value={`R$ ${formatarMoeda(entradasMensais)}`} icon={<TrendingUp size={20}/>} color="bg-[#111827] border-b-8 border-emerald-600" />
        <div className="bg-[#111827] p-4 rounded-[1.5rem] border-b-8 border-amber-500 flex flex-col justify-between h-32 relative">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Grafico */}
          <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={formatarDadosGrafico()}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="data" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} /><Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900', color: '#fff'}} formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Valor']}/><Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} /></AreaChart></ResponsiveContainer>
          </div>

          {/* LISTA DE CARTÕES COM SVGs LOCAIS E FATURA */}
          <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
            <h2 className="text-white font-black mb-6 uppercase text-[10px] tracking-widest px-1">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map(c => {
                const idCard = `${c.banco} - ${c.nome_cartao}`;
                const faturaMes = gastosPorCartao.get(idCard) || 0;
                return (
                  <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                        <img 
                          src={c.logo_url} 
                          className="w-full h-full object-contain" 
                          onError={(e: any) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} 
                        />
                        <div className="hidden w-full h-full items-center justify-center text-[10px] text-slate-500 uppercase font-black">{c.banco.charAt(0)}</div>
                      </div>
                      <div className="leading-tight">
                        <p className="text-[8px] font-black text-slate-500 uppercase">{c.banco}</p>
                        <p className="font-black text-xs uppercase">{c.nome_cartao}</p>
                        <p className={`text-[9px] font-black uppercase mt-1 ${faturaMes > 0 ? 'text-rose-500' : 'text-slate-600'}`}>Fatura: R$ {formatarMoeda(faturaMes)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-600 hover:text-white"><Pencil size={16}/></button>
                      <button onClick={async () => { if(confirm("Apagar cartão?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(user.id); } }} className="text-slate-600 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Historico */}
        <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 h-full overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
          <div className="flex flex-col gap-4 mb-4">
            <h2 className="text-white font-black mb-2 uppercase text-[10px] tracking-widest">Lançamentos</h2>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} /><input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-[9px] outline-none font-black uppercase" /></div>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className={`flex justify-between items-center p-4 rounded-2xl border ${t.pago ? 'bg-slate-800/40 border-slate-800' : 'bg-rose-900/10 border-rose-900/30'}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePago(t.id, t.pago)} className={`p-1.5 rounded-full ${t.pago ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>{t.pago ? <CheckCircle size={18}/> : <Circle size={18}/>}</button>
                  <div className="leading-tight">
                    <p className={`text-[10px] uppercase truncate max-w-[100px] font-black ${t.pago ? 'text-slate-200' : 'text-rose-400'}`}>{t.descricao}</p>
                    <p className={`text-[7px] uppercase font-black ${theme.text}`}>{t.forma_pagamento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {formatarMoeda(t.valor)}</span>
                  <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(user.id); } }} className="text-slate-700 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000]">
          <form onSubmit={handleSalvarGasto} className="bg-[#111827] w-full max-w-md rounded-[3rem] p-6 border-4 border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl uppercase font-black">Novo Lançamento</h2><button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 p-2 rounded-full"><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl"><button type="button" onClick={() => setTipoMovimento('despesa')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase font-black ${tipoMovimento === 'despesa' ? 'bg-rose-600' : 'text-slate-500'}`}>Despesa</button><button type="button" onClick={() => setTipoMovimento('receita')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase font-black ${tipoMovimento === 'receita' ? 'bg-emerald-600' : 'text-slate-500'}`}>Receita</button></div>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-sm font-black uppercase outline-none" required />
              <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-lg font-black text-center outline-none" required />
              <select value={metodoPagamento} onChange={(e) => { setMetodoPagamento(e.target.value); setTipoPagamento(e.target.value === 'Pix' ? 'Dinheiro' : 'Crédito'); }} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[10px] outline-none uppercase font-black"><option value="Pix">Pix / Dinheiro</option>{cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} - {c.nome_cartao}</option>))}</select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[10px] font-black text-center outline-none" placeholder="PARCELAS" />
                {metodoPagamento === 'Pix' && (<input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-[10px] font-black text-center outline-none" required />)}
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="leading-tight"><p className="text-[9px] uppercase font-black">Recorrente?</p><p className="text-[7px] text-slate-500 uppercase">Gera 12 meses futuros</p></div>
                <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-10 h-5 rounded-full relative transition-all ${recorrente ? 'bg-emerald-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${recorrente ? 'left-6' : 'left-1'}`} /></button>
              </div>
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] shadow-xl uppercase text-[10px] font-black active:scale-95 transition-all`}>Confirmar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CARTÃO */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000]">
          <form onSubmit={handleSalvarCartao} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 border-4 border-slate-800 text-white font-black">
            <h2 className="text-xl mb-6 text-center uppercase tracking-widest font-black">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4">
              <input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="BANCO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-sm uppercase" required />
              <input value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value)} placeholder="APELIDO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-sm uppercase" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-sm text-center outline-none" required />
              <button type="submit" className={`w-full ${theme.primary} py-4 rounded-[2rem] uppercase text-[10px] font-black`}>Salvar</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 py-2 uppercase text-[9px] font-black">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000]">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 text-white font-black">
            <h2 className="text-xl mb-8 text-emerald-500 text-center uppercase">Saldo Inicial</h2>
            <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-emerald-500 text-xl outline-none font-black text-center mb-6" />
            <button onClick={async () => {
              const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.'));
              await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id);
              setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); fetchDados(user.id);
            }} className="w-full bg-emerald-600 py-5 rounded-[2rem] uppercase text-[10px] font-black">Confirmar</button>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAÇÕES */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000]">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.updateUser({ data: { full_name: novoNome }, ...(novaSenha && { password: novaSenha }) });
            if (!error) { showAlert("Perfil atualizado!"); setIsConfigModalOpen(false); }
          }} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 text-white font-black">
            <h2 className="text-xl uppercase mb-8">Ajustes</h2>
            <div className="mb-8"><p className="text-[8px] text-slate-500 uppercase mb-4 tracking-widest"><Palette size={12} className="inline mr-2"/> Estilo</p>
              <div className="flex justify-between">{Object.keys(THEMES).map((tName) => <button key={tName} type="button" onClick={() => changeTheme(tName as any)} className={`w-10 h-10 rounded-full border-4 ${currentTheme === tName ? 'border-white scale-110' : 'border-transparent opacity-40'} ${THEMES[tName as keyof typeof THEMES].primary} transition-all`} />)}</div>
            </div>
            <div className="space-y-4">
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none text-white text-sm font-black" />
              <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 text-white text-sm font-black" />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-[10px] font-black`}>Salvar Tudo</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic`}>
      <div className="flex justify-between items-start w-full">
        <span className="text-white/20 text-[7px] md:text-[10px] uppercase tracking-widest">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md opacity-50">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight">{value}</div>
    </div>
  );
}