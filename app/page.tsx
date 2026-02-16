'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, ChevronDown, Settings, 
  AlertCircle, CheckCircle, Users, Eye, EyeOff, Palette, RefreshCcw, Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

// Sistema de Temas Sincronizados
const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-500/20', chart: '#3b82f6' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-500/20', chart: '#10b981' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-500/20', chart: '#8b5cf6' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-500/20', chart: '#e11d48' }
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });

  const theme = THEMES[currentTheme];

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('auth');
    window.location.href = '/'; 
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setView('dashboard');
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="font-black antialiased">
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            {alertConfig.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <p className="text-[10px] uppercase tracking-widest">{alertConfig.msg}</p>
          </div>
        </div>
      )}
      {view === 'auth' ? <AuthScreen theme={theme} setUser={setUser} setView={setView} showAlert={showAlert} /> : <Dashboard user={user} theme={theme} currentThemeName={currentTheme} setTheme={setCurrentTheme} onLogout={handleLogout} showAlert={showAlert} />}
    </div>
  );
}

function AuthScreen({ theme, setUser, setView, showAlert }: any) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) return showAlert("Dados incorretos", 'error');
      setUser(data.user);
    } else {
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { full_name: nome.trim() } } });
      if (error) return showAlert(error.message, 'error');
      showAlert("Conta criada! Verifique o e-mail.", 'success');
      setAuthMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1d] text-white">
      <form onSubmit={handleAuth} className="bg-[#111827] w-full max-w-md rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className={`${theme.primary} p-4 rounded-3xl text-white mb-4 shadow-lg ${theme.shadow}`}><TrendingUp size={32} /></div>
          <h1 className="text-xl md:text-2xl font-black uppercase italic">J FINANÇAS</h1>
        </div>
        <div className="space-y-4">
          {authMode === 'signup' && <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black" required />}
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-white font-black" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <button type="submit" className={`w-full ${theme.primary} text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-4 italic tracking-widest`}>{authMode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-center text-[10px] text-slate-500 mt-6 cursor-pointer uppercase hover:text-white transition-all font-black">{authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}</p>
        </div>
      </form>
    </div>
  );
}

function Dashboard({ user, theme, currentThemeName, setTheme, onLogout, showAlert }: any) {
  const isAdmin = user?.email === "jhonatha2005@outlook.com";
  
  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  // Estados de Dados
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  // Estados do Formulário de Lançamento
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'Crédito' | 'Débito' | 'Dinheiro'>('Dinheiro');
  const [tipoMovimento, setTipoMovimento] = useState<'despesa' | 'receita'>('despesa');
  const [parcelas, setParcelas] = useState(1);
  const [recorrente, setRecorrente] = useState(false);
  const [diaRecorrencia, setDiaRecorrencia] = useState(new Date().getDate());
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  // Estados de Perfil e Saldo
  const [novoNome, setNovoNome] = useState(user?.user_metadata?.full_name || "");
  const [novaSenha, setNovaSenha] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState('');

  useEffect(() => { fetchDados(); }, [user]);

  const fetchDados = async () => {
    const { data: tData } = await supabase.from('transacoes').select('*').order('data_ordenacao', { ascending: false });
    if (tData) setTransacoes(tData);
    const { data: cData } = await supabase.from('cartoes').select('*');
    if (cData) setCartoes(cData);

    const { data: profile } = await supabase.from('profiles').select('saldo_inicial, theme').eq('id', user.id).maybeSingle();
    if (profile) {
      setSaldoInicial(Number(profile.saldo_inicial) || 0);
      if (profile.theme && THEMES[profile.theme as keyof typeof THEMES]) setTheme(profile.theme);
    }
  };

  const sanitize = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = sanitize(descricao);
    if (!cleanDesc) return showAlert("Título inválido", "error");
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (vTotal <= 0) return showAlert("Insira o valor", "error");

    try {
      const valorFinal = tipoMovimento === 'despesa' ? -Math.abs(vTotal) : Math.abs(vTotal);
      const valorParcela = valorFinal / parcelas;
      const novosLancamentos = [];

      for (let i = 0; i < parcelas; i++) {
        const d = new Date(data);
        d.setMonth(d.getMonth() + i);
        if (recorrente) d.setDate(diaRecorrencia);
        
        novosLancamentos.push({
          descricao: parcelas > 1 ? `${cleanDesc.toUpperCase()} (${i + 1}/${parcelas})` : cleanDesc.toUpperCase(),
          valor: valorParcela,
          forma_pagamento: metodoPagamento,
          tipo: tipoMovimento,
          tipo_pagamento: tipoPagamento,
          recorrente: recorrente,
          data_ordenacao: d.toISOString().split('T')[0],
          user_id: user.id
        });
      }

      const { error } = await supabase.from('transacoes').insert(novosLancamentos);
      if (error) throw error;

      showAlert("Lançado com sucesso!", "success");
      setIsModalOpen(false);
      setDescricao(''); setValorDisplay(''); setParcelas(1); setRecorrente(false);
      fetchDados();
    } catch (err) {
      showAlert("Erro ao salvar", "error");
    }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = sanitize(banco).toUpperCase();
    const cleanNomeC = sanitize(nomeCartao).toUpperCase();
    const logoUrl = `https://logo.clearbit.com/${cleanBanco.toLowerCase().replace(/\s/g, '')}.com?size=100`;
    
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    
    if (!res.error) { fetchDados(); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento(''); setEditingCardId(null); showAlert("Cartão salvo!", 'success'); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ data: { full_name: sanitize(novoNome) }, ...(novaSenha && { password: novaSenha }) });
    if (error) return showAlert("Erro ao atualizar", 'error');
    showAlert("Perfil atualizado!", 'success');
    setIsConfigModalOpen(false);
  };

  const changeTheme = async (newTheme: keyof typeof THEMES) => {
    setTheme(newTheme);
    await supabase.from('profiles').update({ theme: newTheme }).eq('id', user.id);
    showAlert("Estilo sincronizado!", 'success');
  };

  const handleConfirmarSaldo = async () => {
    const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.'));
    const { error } = await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id);
    if (!error) { setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); showAlert("Saldo OK!", "success"); }
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const transacoesFiltradas = filtroCartao === 'Todos' ? transacoes : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));
  const entradas = transacoes.filter(t => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
  const saidas = transacoes.filter(t => t.valor < 0).reduce((acc, t) => acc + t.valor, 0);
  const saldoFinal = saldoInicial + entradas + saidas;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-sans overflow-x-hidden pb-24 font-black">
      {/* HEADER INTEGRADO */}
      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full leading-none">
          <div className="flex items-center gap-3">
            <div className={`${theme.primary} p-2.5 rounded-2xl text-white shadow-lg ${theme.shadow}`}><TrendingUp size={22} /></div>
            <div><h1 className="text-lg md:text-xl font-black uppercase tracking-tighter italic px-1">J FINANÇAS</h1><p className={`text-[9px] md:text-[10px] font-black ${theme.text} mt-1 uppercase`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p></div>
          </div>
          <div className="flex gap-2">
            {isAdmin && <button onClick={async () => { const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }); setTotalUsuarios(count || 0); setIsAdminMenuOpen(true); }} className="bg-amber-500 text-slate-950 p-2.5 rounded-full active:scale-95 shadow-lg"><ShieldCheck size={20} /></button>}
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all relative"><UserCircle size={20} /></button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-12 w-64 bg-[#111827] border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setIsProfileMenuOpen(false); setIsConfigModalOpen(true); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 rounded-2xl transition-all border-b border-slate-800/50 uppercase text-[10px]"><Settings className={theme.text} size={18} /> Ajustes / Tema</button>
                <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 rounded-2xl transition-all uppercase text-[10px] italic"><LogOut size={18} /> Sair do App</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 font-black italic">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-emerald-900/20 text-emerald-400 p-3 rounded-2xl border border-emerald-800/50 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 leading-none"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 bg-slate-800/50 text-slate-300 p-3 rounded-2xl border border-slate-700 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 leading-none"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className={`w-full md:w-auto ${theme.primary} text-white p-3.5 rounded-2xl shadow-lg text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${theme.hover} active:scale-95 italic leading-none`}><Plus size={18} /> Novo Lançamento</button>
        </div>
      </header>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 font-black italic">
        <Card title="Saldo Atual" value={`R$ ${formatarMoeda(saldoFinal)}`} icon={<Banknote size={20}/>} color={`bg-[#111827] border-b-8 ${theme.border}`} />
        <Card title="Gasto Mensal" value={`R$ ${formatarMoeda(saidas)}`} icon={<CreditCard size={20}/>} color="bg-[#111827] border-b-8 border-rose-600" />
        <Card title="Entradas" value={`R$ ${formatarMoeda(entradas)}`} icon={<TrendingUp size={20}/>} color="bg-[#111827] border-b-8 border-emerald-600" />
        <div className="relative">
          <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full bg-[#111827] p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-b-8 border-amber-500 flex flex-col justify-between h-32 md:h-36 text-left active:scale-95">
            <span className="text-white/40 text-[7px] md:text-[10px] uppercase tracking-widest">Filtrar por:</span>
            <div className="flex items-center justify-between w-full leading-tight font-black"><div className="text-sm md:text-xl truncate uppercase italic px-1">{filtroCartao}</div><ChevronDown size={16} className={`text-amber-500 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} /></div>
          </button>
          {isFilterMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border-2 border-slate-800 rounded-3xl shadow-2xl z-[400] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 max-h-64 overflow-y-auto uppercase text-[10px] font-black italic">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 border-b border-slate-800/50">Todos os Gastos</button>
                {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className={`w-full text-left p-4 hover:bg-slate-800 border-t border-slate-800/50 ${theme.text}`}>{c.banco} - {c.nome_cartao}</button>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DE GRÁFICO E LANÇAMENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 overflow-hidden leading-normal">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ name: t.data_ordenacao, valor: Math.abs(t.valor) }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900'}} />
                <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl font-black">
            <h2 className="text-white font-black mb-6 uppercase text-[10px] tracking-widest italic px-1">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={c.logo_url} alt={c.banco} className="w-10 h-10 object-contain rounded-lg" onError={(e:any)=>e.target.style.display='none'} />
                    <div className="leading-tight italic"><p className="text-[8px] font-black text-slate-500 uppercase">{c.banco}</p><p className="font-black text-xs uppercase">{c.nome_cartao}</p><p className={`text-[9px] font-bold ${theme.text} uppercase`}>DIA {c.vencimento}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-600 hover:text-white transition-all"><Pencil size={16} /></button>
                    <button onClick={async () => { if(confirm("Excluir cartão?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 h-full overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest leading-normal px-1 italic">Últimos Lançamentos</h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 font-black italic">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all">
                <div className="flex-1 min-w-0 mr-3 leading-tight"><div className="flex items-center gap-2"><p className="text-slate-200 text-[10px] uppercase truncate">{t.descricao}</p>{t.recorrente && <RefreshCcw size={10} className="text-blue-400" />}</div><p className="text-[8px] text-slate-500 uppercase">{t.data_ordenacao} • {t.forma_pagamento}</p></div>
                <div className="flex items-center gap-2 italic"><span className={`text-xs px-1 ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{t.valor > 0 ? '+' : '-'} R$ {formatarMoeda(t.valor)}</span><button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={14} /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL NOVO LANÇAMENTO (REVISADO E COMPLETO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[4000] animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={handleSalvarGasto} className="bg-[#111827] w-full max-w-md rounded-[3rem] p-6 md:p-8 border-4 border-slate-800 shadow-2xl text-white font-black italic">
            <div className="flex justify-between items-center mb-6 px-1">
               <h2 className="text-xl uppercase tracking-widest leading-none">Novo Lançamento</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 font-black">
              <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl">
                <button type="button" onClick={() => setTipoMovimento('despesa')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase transition-all ${tipoMovimento === 'despesa' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Despesa</button>
                <button type="button" onClick={() => setTipoMovimento('receita')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase transition-all ${tipoMovimento === 'receita' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Receita</button>
              </div>

              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que você comprou/recebeu?" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
              
              <div className="relative leading-normal">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${tipoMovimento === 'receita' ? 'text-emerald-500' : 'text-rose-500'} text-sm px-1 italic font-black`}>R$</span>
                <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className={`w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 ${tipoMovimento === 'receita' ? 'text-emerald-400' : 'text-rose-400'} text-lg outline-none font-black italic`} required />
              </div>

              <div className="grid grid-cols-2 gap-3 leading-normal">
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase ml-2 italic">Método</label>
                  <select value={metodoPagamento} onChange={(e) => {
                    setMetodoPagamento(e.target.value);
                    if (e.target.value === 'Pix' || e.target.value === 'Dinheiro') setTipoPagamento('Dinheiro');
                    else setTipoPagamento('Crédito');
                  }} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-[10px] outline-none uppercase font-black">
                    <option value="Pix">Pix / Dinheiro</option>
                    {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} - {c.nome_cartao}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase ml-2 italic">Data</label>
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-[10px] outline-none text-center font-black" required />
                </div>
              </div>

              {metodoPagamento !== 'Pix' && metodoPagamento !== 'Dinheiro' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1"><label className="text-[8px] text-slate-500 uppercase ml-2 italic">Função</label>
                    <select value={tipoPagamento} onChange={(e: any) => setTipoPagamento(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-[10px] outline-none uppercase font-black">
                      <option value="Crédito">Crédito</option>
                      <option value="Débito">Débito</option>
                    </select>
                  </div>
                  {tipoPagamento === 'Crédito' && (
                    <div className="space-y-1"><label className="text-[8px] text-slate-500 uppercase ml-2 italic">Parcelas</label>
                      <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-center font-black" />
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3 leading-normal font-black italic">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-white flex items-center gap-2 italic"><RefreshCcw size={14} className="text-blue-400"/> Recorrente?</span>
                  <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${recorrente ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${recorrente ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {recorrente && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 animate-in slide-in-from-left">
                    <span className="text-[9px] uppercase text-slate-400 italic">Dia da cobrança:</span>
                    <input type="number" min="1" max="31" value={diaRecorrencia} onChange={(e) => setDiaRecorrencia(Number(e.target.value))} className="w-12 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center text-xs font-black" />
                  </div>
                )}
              </div>

              <button type="submit" className={`w-full ${theme.primary} text-white py-5 rounded-[2rem] shadow-xl uppercase text-[10px] mt-2 italic leading-none font-black`}>Finalizar Lançamento</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL AJUSTES / TEMA (CLOUD SYNC) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={handleUpdateProfile} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl text-white font-black italic">
            <div className="flex justify-between items-center mb-8 px-1"><h2 className="text-xl uppercase tracking-widest leading-none">Ajustes</h2><button type="button" onClick={() => setIsConfigModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 active:scale-95"><X size={20} /></button></div>
            <div className="mb-8 font-black">
              <p className="text-[8px] text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2 leading-none"><Palette size={12}/> Estilo do App</p>
              <div className="flex justify-between px-2">{Object.keys(THEMES).map((tName) => <button key={tName} type="button" onClick={() => changeTheme(tName as any)} className={`w-10 h-10 rounded-full border-4 ${currentThemeName === tName ? 'border-white scale-110 shadow-2xl' : 'border-transparent opacity-40'} ${THEMES[tName as keyof typeof THEMES].primary} transition-all`} />)}</div>
            </div>
            <div className="space-y-4 font-black">
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white text-sm font-black" />
              <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white text-sm font-black" />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-[10px] mt-2 font-black shadow-lg leading-none italic`}>Salvar Tudo</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO (CLOUD SYNC) */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 font-black">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl text-white italic">
            <h2 className="text-xl mb-8 text-emerald-500 text-center uppercase tracking-widest leading-none">Saldo Inicial</h2>
            <div className="relative mb-6 leading-none">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-lg px-1 font-black">R$</span>
                <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-emerald-500 text-xl outline-none font-black" />
            </div>
            <button onClick={handleConfirmarSaldo} className="w-full bg-emerald-600 py-5 rounded-[2rem] uppercase text-[10px] shadow-lg active:scale-95 italic leading-none font-black">Confirmar e Sincronizar</button>
            <button onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black italic">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL CARTÃO (COM TRAVA DE 12 CHARS) */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 font-black">
          <form onSubmit={handleSalvarCartao} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl text-white italic">
            <h2 className="text-xl mb-10 text-center uppercase tracking-widest leading-none italic">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4 font-black">
              <input value={banco} onChange={(e) => setBanco(e.target.value.toUpperCase())} placeholder="Banco (Ex: Inter)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
              <div>
                <input value={nomeCartao} onChange={(e) => {
                  const val = e.target.value.replace(/[0-9]/g, '');
                  if (val.length <= 12) setNomeCartao(val.toUpperCase());
                }} placeholder="Apelido (Ex: Principal)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
                <p className="text-[7px] text-slate-500 ml-2 mt-1 uppercase italic font-black leading-none">Máximo 12 letras.</p>
              </div>
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="Dia vencimento" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-sm text-center font-black" required />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-[10px] mt-4 active:scale-95 italic leading-none font-black`}>Salvar Cartão</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black leading-none italic">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ADMIN */}
      {isAdminMenuOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[6000] animate-in fade-in duration-300 font-black italic">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] border-4 border-amber-500/30 shadow-2xl overflow-hidden font-black">
            <div className="bg-amber-500 p-6 flex justify-between items-center text-slate-950 font-black">
              <div><h2 className="uppercase tracking-tighter text-xl px-1">Admin Panel</h2><p className="text-[10px] uppercase mt-1 leading-none font-black">Global Status</p></div>
              <button onClick={() => setIsAdminMenuOpen(false)} className="bg-slate-950/20 p-2 rounded-full leading-none"><X size={24} /></button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-slate-800/50 m-4 rounded-[2.5rem] border-2 border-amber-500/10 font-black">
                 <Users size={48} className="text-amber-500 mb-2 opacity-50" />
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-normal font-black">Total Usuários</span>
                 <div className="text-7xl text-white tracking-tighter py-4 px-1 font-black italic leading-none">{totalUsuarios}</div>
                 <p className="text-[7px] text-amber-500/40 uppercase mt-2 tracking-widest leading-none font-black">Base Supabase</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform active:scale-[0.98] border-black/20 flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic leading-none`}>
      <div className="flex justify-between items-start w-full">
        <span className="text-white/20 font-black text-[7px] md:text-[10px] uppercase tracking-widest italic leading-none">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 opacity-50 leading-none">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight">{value}</div>
    </div>
  );
}