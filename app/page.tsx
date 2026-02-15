'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, Filter, ChevronDown, Bell, BellOff, Settings, 
  AlertCircle, CheckCircle, Users, Eye, EyeOff, Palette, Send, Megaphone
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

// PALETAS PROFUNDAS RESTAURADAS
const PALETTES = {
  purple: { name: 'Deep Purple', bg: 'bg-[#0a0514]', card: 'bg-[#150b26]', primary: 'bg-[#8b5cf6]', text: 'text-[#a78bfa]', border: 'border-[#8b5cf6]', hover: 'hover:bg-[#7c3aed]', chart: '#8b5cf6', glow: 'shadow-purple-500/20' },
  ocean: { name: 'Deep Ocean', bg: 'bg-[#010816]', card: 'bg-[#061229]', primary: 'bg-[#0ea5e9]', text: 'text-[#7dd3fc]', border: 'border-[#0ea5e9]', hover: 'hover:bg-[#0284c7]', chart: '#0ea5e9', glow: 'shadow-blue-500/20' },
  forest: { name: 'Deep Forest', bg: 'bg-[#020d0a]', card: 'bg-[#081a14]', primary: 'bg-[#10b981]', text: 'text-[#34d399]', border: 'border-[#10b981]', hover: 'hover:bg-[#059669]', chart: '#10b981', glow: 'shadow-emerald-500/20' },
  ruby: { name: 'Deep Ruby', bg: 'bg-[#0d0205]', card: 'bg-[#1c080e]', primary: 'bg-[#e11d48]', text: 'text-[#fb7185]', border: 'border-[#e11d48]', hover: 'hover:bg-[#be123c]', chart: '#e11d48', glow: 'shadow-rose-500/20' }
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  const [loading, setLoading] = useState(true);
  const [currentPalette, setCurrentPalette] = useState<keyof typeof PALETTES>('purple');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });

  const palette = PALETTES[currentPalette];

  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setView('dashboard');
        const saved = localStorage.getItem(`@jfinancas:palette:${session.user.id}`);
        if (saved && PALETTES[saved as keyof typeof PALETTES]) setCurrentPalette(saved as any);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0514]"><Loader2 className="h-12 w-12 animate-spin text-purple-600" /></div>;

  return (
    <div className={`${palette.bg} min-h-screen transition-colors duration-700 font-black italic`}>
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] animate-in fade-in slide-in-from-top-4 duration-300 px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            <AlertCircle size={20}/>
            <p className="text-xs font-black uppercase tracking-widest px-1">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      {view === 'auth' ? (
        <AuthScreen palette={palette} setUser={setUser} setView={setView} showAlert={showAlert} />
      ) : (
        <Dashboard user={user} palette={palette} currentPaletteName={currentPalette} changePalette={(n: any) => { setCurrentPalette(n); localStorage.setItem(`@jfinancas:palette:${user.id}`, n); }} onLogout={() => { supabase.auth.signOut(); window.location.reload(); }} showAlert={showAlert} />
      )}
    </div>
  );
}

// --- AUTENTICAÇÃO ---
function AuthScreen({ palette, setUser, showAlert }: any) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return showAlert("Erro de login", 'error');
      setUser(data.user);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: nome } } });
      if (error) return showAlert(error.message, 'error');
      showAlert("Conta criada!", 'success');
      setAuthMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleAuth} className={`${palette.card} w-full max-w-md rounded-[3rem] p-10 border-4 border-white/5 shadow-2xl`}>
        <div className="flex flex-col items-center mb-10">
          <div className={`${palette.primary} p-5 rounded-3xl text-white mb-4 shadow-2xl ${palette.glow}`}><TrendingUp size={36} /></div>
          <h1 className="text-2xl uppercase tracking-tighter text-white px-1">J FINANÇAS</h1>
        </div>
        <div className="space-y-4">
          {authMode === 'signup' && (
            <input type="text" placeholder="NOME" value={nome} onChange={(e) => setNome(e.target.value.toUpperCase())} className="w-full p-5 bg-black/20 rounded-2xl border-2 border-white/5 outline-none text-white focus:border-white uppercase text-[10px]" required />
          )}
          <input type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-5 bg-black/20 rounded-2xl border-2 border-white/5 outline-none text-white focus:border-white uppercase text-[10px]" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="SENHA" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-5 bg-black/20 rounded-2xl border-2 border-white/5 outline-none text-white focus:border-white text-[10px]" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className={`w-full ${palette.primary} text-white font-black py-6 rounded-[2rem] shadow-xl ${palette.hover} transition-all uppercase text-sm mt-6`}>
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-center text-[10px] text-white/30 mt-6 cursor-pointer uppercase hover:text-white transition-all">
            {authMode === 'login' ? 'Nova conta' : 'Já tenho conta'}
          </p>
        </div>
      </form>
    </div>
  );
}

// --- DASHBOARD ---
function Dashboard({ user, palette, currentPaletteName, changePalette, onLogout, showAlert }: any) {
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

  const handleNomeCartaoChange = (valor: string) => {
    const apenasLetras = valor.replace(/[0-9]/g, '');
    if (apenasLetras.length <= 12) setNomeCartao(apenasLetras.toUpperCase());
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ 
      data: { full_name: novoNome },
      ...(novaSenha && { password: novaSenha })
    });
    if (error) return showAlert(error.message, 'error');
    showAlert("Salvo!", 'success');
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
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    await supabase.from('transacoes').insert([{ descricao: descricao.toUpperCase(), valor: vTotal, forma_pagamento: formaPagamento, data_ordenacao: data, user_id: user.id }]);
    fetchDados(); setIsModalOpen(false); setDescricao(''); setValorDisplay(''); showAlert("Lançado!", 'success');
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoUrl = `https://logo.clearbit.com/${banco.toLowerCase().trim().replace(/\s+/g, '')}.com?size=100`;
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: banco.toUpperCase(), nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: banco.toUpperCase(), nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    if (!res.error) { fetchDados(); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento(''); showAlert("Cartão OK!", 'success'); }
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const transacoesFiltradas = filtroCartao === 'Todos' ? transacoes : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));
  const gastoTotal = transacoesFiltradas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoAtual = saldoInicial - transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER INTEGRADO */}
      <header className={`${palette.card} p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col gap-6 mb-10 relative`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`${palette.primary} p-4 rounded-2xl text-white shadow-2xl ${palette.glow}`}><TrendingUp size={28} /></div>
            <div>
              <h1 className="text-xl md:text-2xl uppercase tracking-tighter text-white">J FINANÇAS</h1>
              <p className={`text-[9px] uppercase ${palette.text}`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={async () => {
                const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                setTotalUsuarios(count || 0); setIsAdminMenuOpen(true);
              }} className="bg-amber-500 text-slate-950 p-3 rounded-full active:scale-90 shadow-lg"><ShieldCheck size={20} /></button>
            )}
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-white/5 p-3 rounded-full border border-white/10 relative">
                <UserCircle size={24} />
                {notifPermission !== 'granted' && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-slate-900"></span>}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-900 border-2 border-white/5 rounded-[2rem] shadow-2xl z-[110] overflow-hidden">
                  <button onClick={() => { setIsProfileMenuOpen(false); setIsConfigModalOpen(true); }} className="w-full flex items-center gap-3 p-5 hover:bg-white/5 text-[10px] uppercase"><Settings className={palette.text} size={18} /> Configurações</button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 p-5 hover:bg-rose-950/30 text-rose-500 border-t border-white/5 text-[10px] uppercase"><LogOut size={18} /> Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-white/5 text-emerald-400 p-4 rounded-3xl border border-white/5 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95"><Coins size={16} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 bg-white/5 text-blue-400 p-4 rounded-3xl border border-white/5 text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95"><CreditCard size={16} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className={`w-full md:w-auto ${palette.primary} text-white p-4.5 rounded-3xl shadow-xl ${palette.hover} active:scale-95 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 leading-none`}><Plus size={20} /> Novo Gasto</button>
        </div>
      </header>

      {/* RESUMO E FILTRO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-10">
        <Card title="Saldo Caixa" value={`R$ ${formatarMoeda(saldoAtual)}`} icon={<Banknote size={24}/>} color={`bg-[#150b26] border-b-8 ${palette.border}`} />
        <Card title={`Gasto ${filtroCartao}`} value={`R$ ${formatarMoeda(gastoTotal)}`} icon={<CreditCard size={24}/>} color="bg-[#150b26] border-b-8 border-rose-600" />
        <Card title="Saldo Inicial" value={`R$ ${formatarMoeda(saldoInicial)}`} icon={<Coins size={24}/>} color="bg-[#150b26] border-b-8 border-emerald-600" />
        <div className="relative">
          <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`${palette.card} w-full p-6 md:p-8 rounded-[2.5rem] border-b-8 border-amber-500 shadow-2xl flex flex-col justify-between h-36 md:h-40 text-left active:scale-95`}>
            <span className="text-white/20 text-[9px] uppercase tracking-widest italic">Filtrar por:</span>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm md:text-xl uppercase px-1 truncate">{filtroCartao}</div>
              <Filter size={20} className="text-amber-500" />
            </div>
          </button>
          {isFilterMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border-2 border-white/5 rounded-3xl shadow-2xl z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 max-h-64 overflow-y-auto">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-5 hover:bg-white/5 text-[10px] uppercase">Geral</button>
                {cartoes.map(c => (
                  <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className={`w-full text-left p-5 hover:bg-white/5 border-t border-white/5 text-[10px] uppercase ${palette.text}`}>{c.banco}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* GRÁFICO DINÂMICO */}
          <div className={`${palette.card} p-8 rounded-[3rem] border border-white/5 shadow-2xl h-96 overflow-hidden`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ name: t.data_ordenacao, valor: t.valor }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900'}} />
                <Area type="monotone" dataKey="valor" stroke={palette.chart} fill={palette.chart} fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* LISTA DE CARTÕES COM LOGOS */}
          <div className={`${palette.card} p-8 rounded-[3rem] border border-white/5 shadow-2xl`}>
            <h2 className="uppercase text-[10px] tracking-widest mb-8">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-5 bg-black/20 rounded-2xl border-2 border-white/5 flex justify-between items-center transition-all hover:border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                       <img src={c.logo_url} alt={c.banco} className="w-full h-full object-contain" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                       <CreditCard size={20} className="text-white/10 hidden" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[8px] text-white/40 uppercase">{c.banco}</p>
                      <p className="text-[11px] uppercase text-white">{c.nome_cartao}</p>
                      <p className={`text-[9px] ${palette.text} uppercase`}>DIA {c.vencimento}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-white/20 hover:text-white transition-all"><Pencil size={16}/></button>
                    <button onClick={async () => { if(confirm("Excluir?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-white/20 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${palette.card} p-8 rounded-[3rem] border border-white/5 shadow-2xl h-full overflow-hidden flex flex-col min-h-[500px]`}>
          <h2 className="uppercase text-[10px] tracking-widest mb-8">Últimos Lançamentos</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {transacoesFiltradas.map(t => (
              <div key={t.id} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                <div>
                  <p className="text-[10px] uppercase text-white leading-none mb-1">{t.descricao}</p>
                  <p className="text-[8px] text-white/30 uppercase">{t.data_ordenacao}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-500 text-xs px-1">R$ {formatarMoeda(t.valor)}</span>
                  <button onClick={async () => { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); }} className="text-white/10 hover:text-rose-500"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÕES (MASTER) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-in fade-in zoom-in-95 font-black italic">
          <form onSubmit={handleUpdateProfile} className={`${palette.card} w-full max-w-sm rounded-[3rem] p-10 border-4 border-white/10 shadow-2xl text-white`}>
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-xl uppercase">Preferências</h2>
               <button type="button" onClick={() => setIsConfigModalOpen(false)} className="bg-white/5 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="mb-10">
              <p className="text-[9px] text-white/40 uppercase mb-6 flex items-center gap-2"><Palette size={14}/> Paleta do App</p>
              <div className="grid grid-cols-4 gap-4 px-2">
                {Object.keys(PALETTES).map((pName) => (
                  <button key={pName} type="button" onClick={() => changePalette(pName as any)} className={`w-12 h-12 rounded-full border-4 ${currentPaletteName === pName ? 'border-white scale-110 shadow-2xl shadow-white/20' : 'border-transparent opacity-40'} ${PALETTES[pName as keyof typeof PALETTES].primary} transition-all active:scale-90`} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] text-white/40 uppercase tracking-widest flex items-center gap-2"><UserCircle size={14}/> Dados da Conta</p>
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value.toUpperCase())} placeholder="NOME" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 outline-none uppercase text-[10px]" />
              <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 outline-none text-[10px]" />
              <button type="submit" className={`w-full ${palette.primary} py-5 rounded-[2rem] uppercase text-xs shadow-lg mt-4`}>Salvar Tudo</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL GASTO CENTRALIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-in fade-in zoom-in-95 font-black italic">
          <form onSubmit={handleSalvarGasto} className={`${palette.card} w-full max-w-sm rounded-[3rem] p-10 border-4 border-white/10 shadow-2xl text-white`}>
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-xl uppercase">Novo Gasto</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white/5 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <input value={descricao} onChange={(e) => setDescricao(e.target.value.toUpperCase())} placeholder="DESCRIÇÃO" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 outline-none uppercase text-[10px]" required />
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${palette.text} text-sm`}>R$</span>
                <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className={`w-full pl-12 p-4 bg-black/20 rounded-2xl border-2 border-white/10 ${palette.text} text-xl outline-none`} required />
              </div>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 text-white uppercase text-[10px] outline-none">
                <option value="Pix">PIX / DINHEIRO</option>
                {cartoes.map(c => (<option key={c.id} value={c.banco}>{c.banco}</option>))}
              </select>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 text-center text-[10px]" required />
              <button type="submit" className={`w-full ${palette.primary} py-5 rounded-[2rem] uppercase text-xs shadow-xl active:scale-95 transition-all`}>Lançar Agora</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO / CARTÃO / ADMIN (ESTRUTURA INTEGRADA) */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-in fade-in zoom-in-95">
          <div className={`${palette.card} w-full max-w-sm rounded-[3rem] p-10 border-4 border-white/10 shadow-2xl text-white`}>
            <h2 className="text-xl mb-8 text-emerald-500 text-center uppercase">Saldo Caixa</h2>
            <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-lg">R$</span>
                <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-black/20 rounded-2xl border-2 border-white/10 text-emerald-500 text-xl outline-none" />
            </div>
            <button onClick={() => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); setSaldoInicial(v); localStorage.setItem(`@jfinancas:saldo:${user.id}`, v.toString()); setIsSaldoModalOpen(false); showAlert("Saldo ajustado!", 'success'); }} className="w-full bg-emerald-600 py-5 rounded-3xl uppercase text-xs font-black">Confirmar</button>
            <button onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 text-[9px] uppercase">Fechar</button>
          </div>
        </div>
      )}

      {isCardModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-in fade-in zoom-in-95">
          <form onSubmit={handleSalvarCartao} className={`${palette.card} w-full max-w-sm rounded-[3rem] p-10 border-4 border-white/10 shadow-2xl text-white`}>
            <h2 className="text-xl mb-10 text-center uppercase tracking-widest">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4">
              <input value={banco} onChange={(e) => setBanco(e.target.value.toUpperCase())} placeholder="BANCO (EX: NUBANK)" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 outline-none uppercase text-[10px]" required />
              <input value={nomeCartao} onChange={(e) => handleNomeCartaoChange(e.target.value)} placeholder="APELIDO" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 outline-none uppercase text-[10px]" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-black/20 rounded-2xl border-2 border-white/10 text-center text-xs" required />
              <button type="submit" className={`w-full ${palette.primary} py-5 rounded-[2rem] uppercase text-xs mt-4`}>Salvar Cartão</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 py-4 text-[9px] uppercase">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {isAdminMenuOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[2500] animate-in fade-in duration-300 font-black italic">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] border-4 border-amber-500/30 shadow-2xl overflow-hidden font-black">
            <div className="bg-amber-500 p-6 flex justify-between items-center text-slate-950">
              <div><h2 className="uppercase tracking-tighter text-xl px-1">Admin Panel</h2><p className="text-[10px] uppercase mt-1">Status Global</p></div>
              <button onClick={() => setIsAdminMenuOpen(false)} className="bg-slate-950/20 p-2 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-10 flex flex-col items-center justify-center bg-slate-800/50 m-4 rounded-[2.5rem] border-2 border-amber-500/10">
                 <Users size={48} className="text-amber-500 mb-2 opacity-50" />
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Usuários</span>
                 <div className="text-7xl text-white tracking-tighter py-6 px-1 font-black italic leading-none">{totalUsuarios}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTE CARD RESUMO INTEGRADO
function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-6 md:p-8 rounded-[2.5rem] shadow-2xl transition-transform active:scale-95 flex flex-col justify-between h-40 text-white font-black italic border border-white/5`}>
      <div className="flex justify-between items-start">
        <span className="text-white/20 text-[9px] uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-white/5 rounded-xl border border-white/10">{icon}</div>
      </div>
      <div className="text-xl md:text-2xl uppercase tracking-tighter truncate leading-tight">{value}</div>
    </div>
  );
}