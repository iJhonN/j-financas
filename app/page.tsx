'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Landmark, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Megaphone, Send, Users, ChevronRight, Loader2, Filter, 
  ChevronDown, Bell, BellOff, Eye, EyeOff, Settings, AlertCircle, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'auth' | 'dashboard'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState<{show: boolean, msg: string, type: 'error' | 'success'}>({
    show: false, msg: '', type: 'success'
  });

  const showAlert = (msg: string, type: 'error' | 'success' = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error("Erro SW:", err));
    }

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return showAlert(error.message, 'error');
      setUser(data.user);
      setView('dashboard');
      showAlert("Bem-vindo!", 'success');
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, password, options: { data: { full_name: nome } } 
      });
      if (error) return showAlert(error.message, 'error');
      showAlert("Conta criada!", 'success');
      setAuthMode('login');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-955"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <>
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-top-4 duration-300 px-4 w-full max-w-sm">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            {alertConfig.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <p className="text-xs font-black uppercase tracking-widest leading-tight">{alertConfig.msg}</p>
            <button onClick={() => setAlertConfig(prev => ({...prev, show: false}))} className="ml-auto opacity-50"><X size={16}/></button>
          </div>
        </div>
      )}

      {view === 'auth' ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-955 text-white text-sm">
          <form onSubmit={handleAuth} className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-lg"><TrendingUp size={32} /></div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">J FINANÇAS</h1>
            </div>
            <div className="space-y-4">
              {authMode === 'signup' && (
                <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white focus:border-blue-600" required />
              )}
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white focus:border-blue-600" required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white pr-12 focus:border-blue-600" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-4 tracking-widest leading-none">
                {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-center text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest leading-none">
                {authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <Dashboard user={user} onLogout={() => { supabase.auth.signOut(); setView('auth'); showAlert("Sessão encerrada", 'success'); }} showAlert={showAlert} />
      )}
    </>
  );
}

function Dashboard({ user, onLogout, showAlert }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'alerts' | 'users'>('alerts');
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [notifPermission, setNotifPermission] = useState<string>('');
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [buscandoUsers, setBuscandoUsers] = useState(false);

  const [notifTitulo, setNotifTitulo] = useState('');
  const [notifMensagem, setNotifMensagem] = useState('');
  const [novoNome, setNovoNome] = useState(user?.user_metadata?.full_name || "");
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

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

  const fetchContagemUsuarios = async () => {
    setBuscandoUsers(true);
    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (!error && count !== null) setTotalUsuarios(count);
    setBuscandoUsers(false);
  };

  useEffect(() => {
    if (isAdmin && adminTab === 'users' && isAdminMenuOpen) fetchContagemUsuarios();
  }, [adminTab, isAdminMenuOpen]);

  const handleNomeCartaoChange = (valor: string) => {
    const apenasLetras = valor.replace(/[0-9]/g, '');
    if (apenasLetras.length <= 12) setNomeCartao(apenasLetras);
  };

  const toggleNotifications = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
        new Notification("J Finanças", { body: "Notificações ativas! 🚀" });
        showAlert("Notificações ON", 'success');
    }
    setIsProfileMenuOpen(false);
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
    const { error } = await supabase.from('transacoes').insert([{ descricao: descricao.toUpperCase(), valor: vTotal, forma_pagamento: formaPagamento, data_ordenacao: data, user_id: user.id }]);
    if (!error) { fetchDados(); setIsModalOpen(false); setDescricao(''); setValorDisplay(''); showAlert("Salvo!", 'success'); }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoUrl = `https://logo.clearbit.com/${banco.toLowerCase().trim().replace(/\s+/g, '')}.com?size=100`;
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    if (!res.error) { fetchDados(); setIsCardModalOpen(false); showAlert("Cartão salvo!", 'success'); }
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const transacoesFiltradas = filtroCartao === 'Todos' ? transacoes : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));
  const gastoTotalFiltrado = transacoesFiltradas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoAtual = saldoInicial - transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="min-h-screen bg-slate-955 p-2 md:p-8 text-white font-sans overflow-x-hidden pb-20">
      <header className="flex flex-col gap-4 mb-6 bg-slate-900 p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl relative">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20"><TrendingUp size={22} /></div>
            <div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-tight italic">J FINANÇAS</h1>
              <p className="text-[9px] md:text-[10px] font-black text-blue-400 mt-1 uppercase leading-tight italic">Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
            </div>
          </div>
          
          <div className="flex gap-2 leading-none">
            {isAdmin && (
              <button onClick={() => setIsAdminMenuOpen(true)} className="bg-amber-500 text-slate-950 p-2.5 rounded-full shadow-lg border-2 border-amber-400/50 hover:scale-110 active:scale-95 transition-all">
                <ShieldCheck size={20} />
              </button>
            )}
            <div className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all relative">
                <UserCircle size={20} />
                {notifPermission !== 'granted' && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-slate-900"></span>}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 space-y-1">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 mb-1 leading-tight">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Conta</p>
                       <p className="text-xs font-bold text-white truncate mt-1 italic">{user?.email}</p>
                    </div>
                    <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-4 hover:bg-slate-800 rounded-2xl transition-all leading-tight">
                      <div className="flex items-center gap-3 italic">
                        {notifPermission === 'granted' ? <Bell className="text-emerald-500" size={18} /> : <BellOff className="text-rose-500" size={18} />}
                        <span className="text-[10px] font-black uppercase text-slate-300">Notificações</span>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${notifPermission === 'granted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>{notifPermission === 'granted' ? 'ON' : 'OFF'}</span>
                    </button>
                    <button onClick={() => { setIsProfileMenuOpen(false); setIsProfileEditModalOpen(true); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 rounded-2xl transition-all leading-tight italic">
                      <Settings className="text-slate-500" size={18} />
                      <span className="text-[10px] font-black uppercase text-slate-300">Meu Perfil</span>
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 rounded-2xl transition-all border-t border-slate-800/50 mt-1 leading-tight font-black uppercase text-[10px] italic">
                      <LogOut size={18} /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-emerald-900/20 text-emerald-400 p-3 rounded-2xl border border-emerald-800/50 font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all italic leading-tight"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 bg-slate-800/50 text-slate-300 p-3 rounded-2xl border border-slate-700 font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all italic leading-tight"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all italic leading-tight"><Plus size={18} /> Novo Gasto</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Caixa" value={`R$ ${formatarMoeda(saldoAtual)}`} icon={<Banknote size={20}/>} color="bg-slate-900 border-b-8 border-blue-600" />
        <Card title={`Gasto ${filtroCartao}`} value={`R$ ${formatarMoeda(gastoTotalFiltrado)}`} icon={<CreditCard size={20}/>} color="bg-slate-900 border-b-8 border-rose-600" />
        <Card title="Saldo Inicial" value={`R$ ${formatarMoeda(saldoInicial)}`} icon={<Coins size={20}/>} color="bg-slate-900 border-b-8 border-emerald-600" />
        
        <div className="relative">
          <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full bg-slate-900 p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-b-8 border-amber-500 flex flex-col justify-between h-32 md:h-36 text-left active:scale-95 transition-all leading-tight">
            <div className="flex justify-between items-start w-full">
              <span className="text-white/40 font-black text-[7px] md:text-[10px] uppercase tracking-widest leading-tight italic">Filtrar por:</span>
              <div className="p-1.5 bg-white/5 rounded-xl border border-white/5 opacity-50"><Filter size={20}/></div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm md:text-2xl font-black leading-tight tracking-tighter truncate italic uppercase">{filtroCartao}</div>
              <ChevronDown size={16} className={`text-amber-500 transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {isFilterMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 max-h-60 overflow-y-auto">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl flex flex-col uppercase font-black text-[10px] italic">Todos os Gastos</button>
                <button onClick={() => { setFiltroCartao('Pix'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl border-t border-slate-800/50 uppercase font-black text-[10px] text-emerald-400 italic">Pix / Dinheiro</button>
                {cartoes.map(c => (
                  <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl border-t border-slate-800/50 uppercase font-black text-[10px] text-blue-400 italic">
                    {c.banco} <br/><span className="text-[7px] text-slate-500 lowercase font-medium">{c.nome_cartao}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-slate-900 p-4 md:p-8 rounded-[2rem] border border-slate-800 h-64 md:h-80 shadow-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ name: t.data_ordenacao, valor: t.valor }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <Tooltip formatter={(v: any) => [`R$ ${formatarMoeda(v)}`, 'Gasto']} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px'}} />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
            <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest leading-tight italic">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-4 md:p-5 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all">
                  <div className="flex items-center gap-3 italic">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 p-1.5 overflow-hidden">
                      <img src={c.logo_url} alt={c.banco} className="w-full h-full object-contain" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                      <CreditCard size={18} className="text-slate-500 hidden" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{c.banco}</p>
                      <p className="font-black text-xs uppercase italic mb-1">{c.nome_cartao}</p>
                      <p className="text-[9px] font-bold text-blue-400">DIA {c.vencimento}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-500 hover:text-blue-500 transition-all"><Pencil size={16} /></button>
                    <button onClick={async () => { if(confirm("Remover?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 h-[450px] md:h-[600px] overflow-hidden flex flex-col shadow-2xl leading-none italic">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest italic leading-tight">Lançamentos</h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar text-white italic">
            {transacoesFiltradas.length > 0 ? transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-800 hover:bg-slate-800/60 transition-all italic leading-tight">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-black text-slate-200 text-[10px] uppercase tracking-tight truncate leading-tight mb-1 italic">{t.descricao}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">{t.data_ordenacao}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 leading-tight">
                  <span className="font-black text-xs text-rose-500 whitespace-nowrap italic leading-tight">R$ {formatarMoeda(t.valor)}</span>
                  <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); showAlert("Removido", 'success'); } }} className="text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            )) : <p className="text-center text-slate-600 font-black text-[9px] uppercase mt-10">Vazio</p>}
          </div>
        </div>
      </div>

      {isAdminMenuOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 z-[500] animate-in fade-in duration-300 italic">
          <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border-4 border-amber-500/30 shadow-2xl overflow-hidden leading-tight">
            <div className="bg-amber-500 p-6 flex justify-between items-center text-slate-950 italic leading-none">
              <div><h2 className="font-black uppercase tracking-tighter text-xl italic leading-tight">Admin Panel</h2><p className="text-[10px] font-bold uppercase mt-1">Gerenciamento Superior</p></div>
              <button onClick={() => setIsAdminMenuOpen(false)} className="bg-slate-950/20 p-2 rounded-full leading-tight"><X size={24} /></button>
            </div>
            <div className="flex border-b border-slate-800 uppercase font-black text-[9px] italic leading-tight">
              <button onClick={() => setAdminTab('alerts')} className={`flex-1 py-4 ${adminTab === 'alerts' ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}><Megaphone size={14} className="inline mr-2 leading-tight"/> Alertas</button>
              <button onClick={() => setAdminTab('users')} className={`flex-1 py-4 ${adminTab === 'users' ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' : 'text-slate-500'}`}><Users size={14} className="inline mr-2 leading-tight"/> Usuários</button>
            </div>
            <div className="p-8">
              {adminTab === 'alerts' ? (
                <form onSubmit={(e) => { e.preventDefault(); showAlert("Alerta enviado!", "success"); setIsAdminMenuOpen(false); }} className="space-y-4 italic">
                  <input value={notifTitulo} onChange={(e) => setNotifTitulo(e.target.value)} placeholder="TÍTULO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-amber-500" required />
                  <textarea value={notifMensagem} onChange={(e) => setNotifMensagem(e.target.value)} placeholder="MENSAGEM..." rows={3} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-amber-500" required />
                  <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-[2rem] uppercase text-sm flex items-center justify-center gap-2 italic active:scale-95 leading-tight"><Send size={18} /> Disparar</button>
                </form>
              ) : (
                <div className="space-y-4 flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-[2.5rem] border-2 border-amber-500/10 italic leading-tight">
                   <Users size={48} className="text-amber-500 mb-2 opacity-50 leading-tight" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">Total de Usuários</span>
                   <div className="text-7xl font-black text-white tracking-tighter py-2 leading-tight">
                     {buscandoUsers ? <Loader2 className="animate-spin h-8 w-8 text-amber-500" /> : totalUsuarios}
                   </div>
                   <p className="text-[7px] text-amber-500/40 font-bold uppercase tracking-widest italic leading-tight">Sincronizado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[200] italic">
          <form onSubmit={handleSalvarGasto} className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border-t-4 md:border-4 border-slate-800 shadow-2xl overflow-y-auto max-h-[95vh] text-white">
            <h2 className="text-xl font-black uppercase italic mb-6 leading-tight">Novo Gasto</h2>
            <div className="space-y-4 italic">
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-blue-600 transition-all leading-tight" required />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-sm italic leading-tight">R$</span><input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-black text-blue-400 text-lg outline-none focus:border-blue-600 transition-all leading-tight" required /></div>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-blue-600 transition-all leading-tight">
                <option value="Pix">Pix / Dinheiro</option>
                {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} ({c.nome_cartao})</option>))}
              </select>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-bold text-white outline-none focus:border-blue-600 transition-all leading-tight" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-2 active:scale-95 transition-all italic leading-tight">Lançar Agora</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-2 text-center leading-tight">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200] italic">
          <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl text-white">
            <h2 className="text-xl font-black mb-6 text-emerald-500 text-center uppercase italic leading-tight">Saldo Caixa</h2>
            <div className="relative mb-6 leading-tight"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg leading-tight italic">R$</span><input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-black text-emerald-500 text-xl outline-none focus:border-emerald-600 transition-all leading-tight" /></div>
            <button onClick={() => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); setSaldoInicial(v); localStorage.setItem(`@jfinancas:saldo:${user.id}`, v.toString()); setIsSaldoModalOpen(false); setSaldoDisplay(''); showAlert("Saldo ajustado!", 'success'); }} className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl uppercase text-xs shadow-lg active:scale-95 transition-all italic leading-tight">Confirmar</button>
            <button type="button" onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-4 text-center leading-tight">Fechar</button>
          </div>
        </div>
      )}

      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[200] italic">
          <form onSubmit={handleSalvarCartao} className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl text-white leading-tight">
            <h2 className="text-xl font-black mb-6 text-white text-center uppercase tracking-widest italic leading-tight">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4 italic font-black">
              <input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="BANCO (EX: NUBANK)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-blue-600 transition-all leading-tight" required />
              <div className="space-y-1 leading-tight">
                <input value={nomeCartao} onChange={(e) => handleNomeCartaoChange(e.target.value)} placeholder="APELIDO DO CARTÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none focus:border-blue-600 transition-all leading-tight" required />
                <p className="text-[7px] text-slate-500 ml-2 uppercase font-bold italic leading-tight">Máximo 12 letras.</p>
              </div>
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none focus:border-blue-600 transition-all leading-tight" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase text-xs mt-2 active:scale-95 transition-all leading-tight">Confirmar</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-2 text-center leading-tight">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform active:scale-[0.98] border-black/20 flex flex-col justify-between h-32 md:h-36 text-white text-left italic leading-tight`}>
      <div className="flex justify-between items-start w-full leading-tight italic">
        <span className="text-white/40 font-black text-[7px] md:text-[10px] uppercase tracking-widest leading-tight italic">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 opacity-50 italic">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black leading-tight tracking-tighter truncate italic uppercase">{value}</div>
    </div>
  );
}