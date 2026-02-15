'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, Filter, ChevronDown, Bell, BellOff, Settings, 
  AlertCircle, CheckCircle, Users, Eye, EyeOff, Palette
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

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
  const [theme, setTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  // FUNÇÃO DE LOGOUT CORRIGIDA: Limpa sessão, estado e recarrega a página
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
        const savedTheme = localStorage.getItem(`@jfinancas:theme:${session.user.id}`);
        if (savedTheme) setTheme(savedTheme as any);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-955"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <>
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] animate-in fade-in slide-in-from-top-4 duration-300 px-4 w-full max-w-sm font-black italic">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            {alertConfig.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <p className="text-xs uppercase tracking-widest">{alertConfig.msg}</p>
          </div>
        </div>
      )}
      {view === 'auth' ? (
        <AuthScreen theme={THEMES[theme]} setUser={setUser} setView={setView} showAlert={showAlert} />
      ) : (
        <Dashboard 
          user={user} 
          theme={THEMES[theme]} 
          currentThemeName={theme} 
          setTheme={setTheme} 
          onLogout={handleLogout} 
          showAlert={showAlert} 
        />
      )}
    </>
  );
}

function AuthScreen({ theme, setUser, setView, showAlert }: any) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // SANITIZAÇÃO: Remove tags HTML para evitar injeção
  const sanitize = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitize(email);
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) return showAlert("E-mail ou senha incorretos", 'error');
      setUser(data.user);
      setView('dashboard');
    } else {
      const cleanNome = sanitize(nome);
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { full_name: cleanNome } } });
      if (error) return showAlert(error.message, 'error');
      showAlert("Verifique seu e-mail!", 'success');
      setAuthMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-955 text-white font-black italic">
      <form onSubmit={handleAuth} className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className={`${theme.primary} p-4 rounded-3xl text-white mb-4 shadow-lg ${theme.shadow}`}><TrendingUp size={32} /></div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">J FINANÇAS</h1>
        </div>
        <div className="space-y-4">
          {authMode === 'signup' && (
            <input type="text" placeholder="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 uppercase text-[10px]" required />
          )}
          <input type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 uppercase text-[10px]" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="SENHA" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none focus:border-blue-600 text-[10px]" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className={`w-full ${theme.primary} text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-4 tracking-widest italic`}>
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-center text-[10px] text-slate-500 mt-6 cursor-pointer uppercase hover:text-white transition-all">
            {authMode === 'login' ? 'Não tem conta? Criar nova' : 'Já tem conta? Entrar'}
          </p>
        </div>
      </form>
    </div>
  );
}

function Dashboard({ user, theme, currentThemeName, setTheme, onLogout, showAlert }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [notifPermission, setNotifPermission] = useState('default');

  const [novoNome, setNovoNome] = useState(user?.user_metadata?.full_name || "");
  const [novaSenha, setNovaSenha] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState('');

  const isAdmin = user?.email === "jhonatha2005@outlook.com"; 

  useEffect(() => { 
    fetchDados(); 
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, [user]);

  const fetchDados = async () => {
    const { data: tData } = await supabase.from('transacoes').select('*').order('data_ordenacao', { ascending: false });
    if (tData) setTransacoes(tData);
    const { data: cData } = await supabase.from('cartoes').select('*');
    if (cData) setCartoes(cData);
    const sSalvo = localStorage.getItem(`@jfinancas:saldo:${user.id}`);
    if (sSalvo) setSaldoInicial(Number(sSalvo));
  };

  const sanitize = (val: string) => val.replace(/<[^>]*>?/gm, '').trim();

  const changeTheme = (newTheme: keyof typeof THEMES) => {
    setTheme(newTheme);
    localStorage.setItem(`@jfinancas:theme:${user.id}`, newTheme);
    showAlert("Tema atualizado!", 'success');
  };

  const handleNomeCartaoChange = (valor: string) => {
    const apenasLetras = valor.replace(/[0-9]/g, '');
    if (apenasLetras.length <= 12) setNomeCartao(apenasLetras.toUpperCase());
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNome = sanitize(novoNome);
    const { error } = await supabase.auth.updateUser({ 
      data: { full_name: cleanNome },
      ...(novaSenha && { password: novaSenha })
    });
    if (error) return showAlert(error.message, 'error');
    showAlert("Perfil atualizado!", 'success');
    setIsConfigModalOpen(false);
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = sanitize(descricao);
    if (!cleanDesc) return showAlert("Descrição inválida", "error");
    
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    await supabase.from('transacoes').insert([{ descricao: cleanDesc.toUpperCase(), valor: vTotal, forma_pagamento: formaPagamento, data_ordenacao: data, user_id: user.id }]);
    fetchDados(); setIsModalOpen(false); setDescricao(''); setValorDisplay(''); showAlert("Lançado!", 'success');
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = sanitize(banco);
    const cleanNomeC = sanitize(nomeCartao);
    const logoUrl = `https://logo.clearbit.com/${cleanBanco.toLowerCase().trim().replace(/\s+/g, '')}.com?size=100`;
    
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: cleanBanco.toUpperCase(), nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: cleanBanco.toUpperCase(), nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    
    if (!res.error) { fetchDados(); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento(''); setEditingCardId(null); showAlert("Cartão OK!", 'success'); }
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const transacoesFiltradas = filtroCartao === 'Todos' ? transacoes : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));
  const gastoTotalFiltrado = transacoesFiltradas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoAtual = saldoInicial - transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="min-h-screen bg-slate-955 p-2 md:p-8 text-white font-sans overflow-x-hidden pb-20 italic font-black">
      <header className="flex flex-col gap-4 mb-6 bg-slate-900 p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl relative leading-normal">
        <div className="flex justify-between items-center w-full leading-normal">
          <div className="flex items-center gap-3">
            <div className={`${theme.primary} p-2.5 rounded-2xl text-white shadow-lg ${theme.shadow}`}><TrendingUp size={22} /></div>
            <div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter italic px-1">J FINANÇAS</h1>
              <p className={`text-[9px] md:text-[10px] font-black ${theme.text} mt-1 uppercase`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex gap-2 leading-normal">
            {isAdmin && (
              <button onClick={async () => {
                const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                setTotalUsuarios(count || 0); setIsAdminMenuOpen(true);
              }} className="bg-amber-500 text-slate-950 p-2.5 rounded-full active:scale-95 shadow-lg"><ShieldCheck size={20} /></button>
            )}
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all relative">
                <UserCircle size={20} />
                {notifPermission !== 'granted' && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-slate-900"></span>}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); setIsConfigModalOpen(true); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 rounded-2xl transition-all border-b border-slate-800/50 uppercase text-[10px]"><Settings className={theme.text} size={18} /> Ajustes / Tema</button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 rounded-2xl transition-all uppercase text-[10px] italic"><LogOut size={18} /> Sair do App</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 font-black italic">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-emerald-900/20 text-emerald-400 p-3 rounded-2xl border border-emerald-800/50 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setBanco(''); setNomeCartao(''); setVencimento(''); setIsCardModalOpen(true); }} className="flex-1 bg-slate-800/50 text-slate-300 p-3 rounded-2xl border border-slate-700 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className={`w-full md:w-auto ${theme.primary} text-white p-3.5 rounded-2xl shadow-lg text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${theme.hover} active:scale-95`}><Plus size={18} /> Novo Gasto</button>
        </div>
      </header>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Caixa" value={`R$ ${formatarMoeda(saldoAtual)}`} icon={<Banknote size={20}/>} color={`bg-slate-900 border-b-8 ${theme.border}`} />
        <Card title={`Gasto ${filtroCartao}`} value={`R$ ${formatarMoeda(gastoTotalFiltrado)}`} icon={<CreditCard size={20}/>} color="bg-slate-900 border-b-8 border-rose-600" />
        <Card title="Saldo Inicial" value={`R$ ${formatarMoeda(saldoInicial)}`} icon={<Coins size={20}/>} color="bg-slate-900 border-b-8 border-emerald-600" />
        <div className="relative">
          <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full bg-slate-900 p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-b-8 border-amber-500 flex flex-col justify-between h-32 md:h-36 text-left active:scale-95">
            <span className="text-white/40 font-black text-[7px] md:text-[10px] uppercase tracking-widest leading-normal">Filtrar por:</span>
            <div className="flex items-center justify-between w-full leading-normal">
              <div className="text-sm md:text-xl font-black truncate uppercase italic px-1 leading-tight">{filtroCartao}</div>
              <ChevronDown size={16} className={`text-amber-500 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {isFilterMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 max-h-64 overflow-y-auto font-black text-[10px] uppercase italic">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 border-b border-slate-800/50">Todos os Gastos</button>
                {cartoes.map(c => (
                  <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className={`w-full text-left p-4 hover:bg-slate-800 border-t border-slate-800/50 ${theme.text}`}>
                    {c.banco} <br/><span className="text-[7px] text-slate-500 lowercase">{c.nome_cartao}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO E LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 leading-normal">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 overflow-hidden leading-normal">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ name: t.data_ordenacao, valor: t.valor }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900'}} />
                <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
            <h2 className="text-white font-black mb-6 uppercase text-[10px] tracking-widest italic">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-4 md:p-5 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all font-black italic">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 p-1.5 overflow-hidden">
                      <img src={c.logo_url} alt={c.banco} className="w-full h-full object-contain" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <CreditCard size={20} className="text-slate-500 hidden" />
                    </div>
                    <div className="leading-tight"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">{c.banco}</p><p className="font-black text-xs uppercase mb-1">{c.nome_cartao}</p><p className={`text-[9px] font-bold ${theme.text} uppercase`}>DIA {c.vencimento}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-600 hover:text-white transition-all"><Pencil size={16} /></button>
                    <button onClick={async () => { if(confirm("Remover cartão?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 h-full overflow-hidden flex flex-col shadow-2xl min-h-[500px] leading-normal">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest italic leading-normal">Lançamentos Recentes</h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar font-black italic flex-1">
            {transacoesFiltradas.length > 0 ? transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-800 hover:bg-slate-800/60 transition-all leading-normal">
                <div className="flex-1 min-w-0 mr-3"><p className="font-black text-slate-200 text-[10px] uppercase truncate mb-1 leading-normal">{t.descricao}</p><p className="text-[8px] text-slate-500 font-bold uppercase">{t.data_ordenacao}</p></div>
                <div className="flex items-center gap-2"><span className="font-black text-xs text-rose-500 italic px-1 whitespace-nowrap leading-tight">R$ {formatarMoeda(t.valor)}</span><button onClick={async () => { if(confirm("Apagar gasto?")) { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={14} /></button></div>
              </div>
            )) : <p className="text-center text-slate-600 font-black text-[9px] uppercase mt-20">Vazio</p>}
          </div>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÕES / TEMA */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-in fade-in zoom-in-95 duration-300 font-black italic">
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-8 px-1">
               <h2 className="text-xl uppercase tracking-widest">Ajustes</h2>
               <button type="button" onClick={() => setIsConfigModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 active:scale-95"><X size={20} /></button>
            </div>
            <div className="mb-8">
              <p className="text-[8px] text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2"><Palette size={12}/> Estilo do Aplicativo</p>
              <div className="flex justify-between px-2">
                {Object.keys(THEMES).map((tName) => (
                  <button key={tName} type="button" onClick={() => changeTheme(tName as any)} className={`w-10 h-10 rounded-full border-4 ${currentThemeName === tName ? 'border-white scale-110 shadow-2xl' : 'border-transparent opacity-40'} ${THEMES[tName as keyof typeof THEMES].primary} transition-all`} />
                ))}
              </div>
            </div>
            <div className="space-y-4 font-black leading-normal">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><UserCircle size={12}/> Dados Pessoais</p>
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value.toUpperCase())} placeholder="NOME" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white uppercase text-[10px] font-black" />
              <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA (OPCIONAL)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white text-[10px]" />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-xs mt-2 font-black italic shadow-lg ${theme.shadow} leading-normal`}>Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL GASTO (CENTRALIZADO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-in fade-in zoom-in-95 duration-300 font-black italic">
          <form onSubmit={handleSalvarGasto} className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-8 px-1">
               <h2 className="text-xl uppercase tracking-widest leading-normal">Novo Gasto</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 active:scale-95"><X size={20} /></button>
            </div>
            <div className="space-y-4 font-black">
              <input value={descricao} onChange={(e) => setDescricao(e.target.value.toUpperCase())} placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white uppercase text-[10px] font-black" required />
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.text} text-sm px-1 italic`}>R$</span>
                <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className={`w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 ${theme.text} text-lg outline-none font-black`} required />
              </div>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white uppercase text-[10px] outline-none">
                <option value="Pix">Pix / Dinheiro</option>
                {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} ({c.nome_cartao})</option>))}
              </select>
              <div className="flex justify-center">
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-auto p-3 bg-slate-800 rounded-xl border-2 border-slate-700 text-white text-[10px] outline-none text-center font-black" required />
              </div>
              <button type="submit" className={`w-full ${theme.primary} text-white py-5 rounded-[2rem] shadow-xl ${theme.hover} active:scale-95 transition-all uppercase text-xs mt-2 italic font-black`}>Lançar Agora</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-300 font-black italic">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl text-white">
            <h2 className="text-xl mb-8 text-emerald-500 text-center uppercase tracking-widest px-1">Saldo em Caixa</h2>
            <div className="relative mb-6 leading-normal">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-lg px-1 font-black italic">R$</span>
                <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-emerald-500 text-xl outline-none font-black italic" />
            </div>
            <button onClick={() => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); setSaldoInicial(v); localStorage.setItem(`@jfinancas:saldo:${user.id}`, v.toString()); setIsSaldoModalOpen(false); setSaldoDisplay(''); showAlert("Saldo ajustado!", 'success'); }} className="w-full bg-emerald-600 py-5 rounded-[2rem] uppercase text-xs shadow-lg active:scale-95 font-black leading-normal italic">Confirmar</button>
            <button onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black leading-normal italic">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL CARTÃO */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-in fade-in duration-300 font-black italic">
          <form onSubmit={handleSalvarCartao} className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl text-white">
            <h2 className="text-xl mb-8 text-center uppercase tracking-widest px-1">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4 font-black">
              <input value={banco} onChange={(e) => setBanco(e.target.value.toUpperCase())} placeholder="BANCO (EX: INTER)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white uppercase text-[10px] font-black" required />
              <div>
                <input value={nomeCartao} onChange={(e) => handleNomeCartaoChange(e.target.value)} placeholder="APELIDO DO CARTÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white uppercase text-[10px] font-black" required />
                <p className="text-[7px] text-slate-500 ml-2 mt-1 uppercase italic leading-normal">Apenas letras. Máximo 12 caracteres.</p>
              </div>
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white text-xs text-center font-black" required />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-xs mt-2 active:scale-95 italic font-black leading-normal`}>Salvar Cartão</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black leading-normal">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ADMIN */}
      {isAdminMenuOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[1500] animate-in fade-in duration-300 font-black italic">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] border-4 border-amber-500/30 shadow-2xl overflow-hidden font-black">
            <div className="bg-amber-500 p-6 flex justify-between items-center text-slate-950 font-black">
              <div><h2 className="uppercase tracking-tighter text-xl px-1">Admin Panel</h2><p className="text-[10px] uppercase mt-1">Status Global</p></div>
              <button onClick={() => setIsAdminMenuOpen(false)} className="bg-slate-950/20 p-2 rounded-full leading-normal"><X size={24} /></button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-slate-800/50 m-4 rounded-[2.5rem] border-2 border-amber-500/10 font-black">
                 <Users size={48} className="text-amber-500 mb-2 opacity-50" />
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-normal">Total Usuários</span>
                 <div className="text-7xl text-white tracking-tighter py-4 px-1 font-black italic leading-none">{totalUsuarios}</div>
                 <p className="text-[7px] text-amber-500/40 uppercase mt-2 tracking-widest leading-normal">Base Supabase</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform active:scale-[0.98] border-black/20 flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic leading-normal`}>
      <div className="flex justify-between items-start w-full leading-normal">
        <span className="text-white/20 font-black text-[7px] md:text-[10px] uppercase tracking-widest italic leading-normal">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 opacity-50 leading-normal">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight">{value}</div>
    </div>
  );
}