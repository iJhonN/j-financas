'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Landmark, Coins, Pencil, LogOut, UserCircle, ShieldCheck, CalendarClock, Wallet, CheckCircle2, Loader2, Filter, ChevronDown
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
  const [loading, setLoading] = useState(true);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
      setUser(data.user);
      setView('dashboard');
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, password, options: { data: { full_name: nome } } 
      });
      if (error) return alert(error.message);
      alert("Conta criada!");
      setAuthMode('login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-955 text-white">
        <form onSubmit={handleAuth} className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border-4 border-slate-800 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-lg shadow-blue-500/20"><TrendingUp size={32} /></div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">J FINANÇAS</h1>
          </div>
          <div className="space-y-4">
            {authMode === 'signup' && (
              <input type="text" placeholder="NOME COMPLETO" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none font-bold text-white focus:border-blue-600 uppercase text-xs" required />
            )}
            <input type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none font-bold text-white focus:border-blue-600 uppercase text-xs" required />
            <input type="password" placeholder="SENHA" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none font-bold text-white focus:border-blue-600 uppercase text-xs" required />
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase text-sm mt-4 tracking-widest">{authMode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="w-full text-center text-[10px] font-black text-slate-500 uppercase mt-4 tracking-widest">{authMode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}</button>
          </div>
        </form>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={() => { supabase.auth.signOut(); setView('auth'); }} />;
}

function Dashboard({ user, onLogout }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  
  const [novoNome, setNome] = useState(user?.user_metadata?.full_name || "");
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

  useEffect(() => { fetchDados(); }, [user]);

  const fetchDados = async () => {
    const { data: tData } = await supabase.from('transacoes').select('*').order('data_ordenacao', { ascending: false });
    if (tData) setTransacoes(tData);
    const { data: cData } = await supabase.from('cartoes').select('*');
    if (cData) setCartoes(cData);
    const sSalvo = localStorage.getItem(`@jfinancas:saldo:${user.id}`);
    if (sSalvo) setSaldoInicial(Number(sSalvo));
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.updateUser({ data: { full_name: novoNome } });
    if (novaSenha && novaSenha === confirmarNovaSenha) {
      await supabase.auth.updateUser({ password: novaSenha });
      alert("Senha alterada!");
    }
    setIsProfileModalOpen(false);
    window.location.reload();
  };

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    const { error } = await supabase.from('transacoes').insert([{ 
        descricao: descricao.toUpperCase(), valor: vTotal, forma_pagamento: formaPagamento, data_ordenacao: data, user_id: user.id 
    }]);
    if (!error) { fetchDados(); setIsModalOpen(false); setDescricao(''); setValorDisplay(''); }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoUrl = `/logos/${banco.toLowerCase().trim().replace(/\s+/g, '-')}.svg`;
    if (editingCardId) {
      await supabase.from('cartoes').update({ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    } else {
      await supabase.from('cartoes').insert([{ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    }
    fetchDados(); setEditingCardId(null); setIsCardModalOpen(false);
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  
  const transacoesFiltradas = filtroCartao === 'Todos' 
    ? transacoes 
    : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));

  const gastoTotalFiltrado = transacoesFiltradas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldoAtual = saldoInicial - transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="min-h-screen bg-slate-955 p-3 md:p-8 text-white font-sans overflow-x-hidden pb-10">
      <header className="flex flex-col gap-4 mb-6 bg-slate-900/80 backdrop-blur-md p-5 rounded-[2rem] border border-slate-800 shadow-2xl sticky top-2 z-40">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20"><TrendingUp size={22} /></div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter italic leading-none">J FINANÇAS</h1>
              <p className="text-[8px] font-black text-blue-400 mt-1 uppercase tracking-widest">{user?.user_metadata?.full_name?.split(' ')[0] || "Usuário"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border border-slate-700 font-black text-[9px] uppercase transition-all ${filtroCartao !== 'Todos' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800'}`}
                >
                  <Filter size={12} />
                  <ChevronDown size={12} className={`transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFilterMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 max-h-80 overflow-y-auto">
                      <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl transition-all flex flex-col">
                        <span className="text-[10px] font-black uppercase">Todos os Gastos</span>
                      </button>
                      <button onClick={() => { setFiltroCartao('Pix'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl transition-all flex flex-col border-t border-slate-800/50">
                        <span className="text-[10px] font-black uppercase text-emerald-400">Pix / Dinheiro</span>
                      </button>
                      {cartoes.map(c => (
                        <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 rounded-2xl transition-all flex flex-col border-t border-slate-800/50">
                          <span className="text-[10px] font-black uppercase text-blue-400">{c.banco}</span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase truncate">{c.nome_cartao}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <button onClick={() => setIsProfileModalOpen(true)} className="bg-slate-800 text-slate-300 p-2 rounded-full border border-slate-700 hover:bg-blue-600 transition-all"><UserCircle size={20} /></button>
            <button onClick={onLogout} className="bg-slate-800 text-rose-500 p-2 rounded-full border border-slate-700 hover:bg-rose-600 transition-all"><LogOut size={20} /></button>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-emerald-900/20 text-emerald-400 p-3 rounded-2xl border border-emerald-800/50 font-black text-[9px] uppercase flex items-center justify-center gap-2 transition-active active:scale-95"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className="flex-1 bg-slate-800/50 text-slate-300 p-3 rounded-2xl border border-slate-700 font-black text-[9px] uppercase flex items-center justify-center gap-2 transition-active active:scale-95"><CreditCard size={14} /> Cartão</button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-600 text-white p-4 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"><Plus size={18} /> Novo Gasto</button>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card title="Saldo Caixa" value={`R$ ${formatarMoeda(saldoAtual)}`} icon={<Banknote size={16}/>} color="bg-slate-900 border-l-4 border-blue-600" />
        <Card title="Gasto Todos" value={`R$ ${formatarMoeda(gastoTotalFiltrado)}`} icon={<CreditCard size={16}/>} color="bg-slate-900 border-l-4 border-rose-600" />
        <Card title="Saldo Inicial" value={`R$ ${formatarMoeda(saldoInicial)}`} icon={<Coins size={16}/>} color="bg-slate-900 border-l-4 border-emerald-600" />
        <Card title="Filtro" value={filtroCartao} icon={<Filter size={16}/>} color="bg-slate-900 border-l-4 border-amber-500" />
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900 p-5 rounded-[2.5rem] border border-slate-800 h-64 shadow-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ name: t.data_ordenacao, valor: t.valor }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" hide />
              <Tooltip formatter={(v: any) => [`R$ ${formatarMoeda(v)}`, 'Gasto']} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px'}} />
              <Area type="monotone" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest opacity-50">Meus Cartões</h2>
          <div className="space-y-3">
            {cartoes.map(c => (
              <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 p-1.5">
                    <img src={c.logo_url} alt={c.banco} className="w-full h-full object-contain" onError={(e: any) => e.target.src = "https://cdn-icons-png.flaticon.com/512/60/60378.png"} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase">{c.banco}</p>
                    <p className="font-black text-xs uppercase italic">{c.nome_cartao}</p>
                    <p className="text-[9px] font-bold text-blue-400">DIA {c.vencimento}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-500"><Pencil size={16} /></button>
                  <button onClick={async () => { if(confirm("Remover?")) await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); }} className="text-slate-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest opacity-50">Lançamentos ({filtroCartao})</h2>
          <div className="space-y-3">
            {transacoesFiltradas.length > 0 ? transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-black text-slate-200 text-[10px] uppercase truncate tracking-tight">{t.descricao}</p>
                  <p className="text-[8px] text-slate-500 font-bold">{t.data_ordenacao} • {t.forma_pagamento}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-rose-500 whitespace-nowrap">R$ {formatarMoeda(t.valor)}</span>
                  <button onClick={async () => { if(confirm("Apagar?")) await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); }} className="text-slate-700"><Trash2 size={14} /></button>
                </div>
              </div>
            )) : <p className="text-center text-slate-600 font-black text-[9px] uppercase py-10">Sem registros</p>}
          </div>
        </div>
      </div>

      {/* MODAL GASTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-4 z-[200]">
          <form onSubmit={handleSalvarGasto} className="bg-slate-900 w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] p-8 border-t-4 border-blue-600 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase italic mb-6">Novo Gasto</h2>
            <div className="space-y-4">
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O QUE FOI COMPRADO?" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white uppercase text-xs font-bold focus:border-blue-600 outline-none" required />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-sm">R$</span><input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-black text-blue-400 text-lg outline-none focus:border-blue-600" required /></div>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none">
                <option value="Pix">Pix / Dinheiro</option>
                {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} ({c.nome_cartao})</option>))}
              </select>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-bold text-white outline-none" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl uppercase text-sm mt-4 active:scale-95 transition-all">Lançar Agora</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-4 text-center">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PERFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[200]">
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 w-full max-w-md rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase italic mb-6 text-center">Perfil</h2>
            <div className="space-y-4">
              <input value={novoNome} onChange={(e) => setNome(e.target.value)} placeholder="NOME" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" />
              <input type="password" placeholder="NOVA SENHA" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" />
              <input type="password" placeholder="CONFIRMAR SENHA" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase text-xs mt-2">Salvar</button>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-4 text-center">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CARTÃO */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[200]">
          <form onSubmit={handleSalvarCartao} className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-white text-center uppercase italic">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4">
              <input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="BANCO (EX: NUBANK)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" required />
              <input value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value)} placeholder="NOME NO CARTÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase text-xs mt-2">Salvar</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-4 text-center">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[200]">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-emerald-500 text-center uppercase italic">Saldo Inicial</h2>
            <div className="relative mb-6"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">R$</span><input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-black text-emerald-500 text-xl outline-none" /></div>
            <button onClick={() => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); setSaldoInicial(v); localStorage.setItem(`@jfinancas:saldo:${user.id}`, v.toString()); setIsSaldoModalOpen(false); setSaldoDisplay(''); }} className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl uppercase text-xs shadow-lg shadow-emerald-500/20">Atualizar</button>
            <button type="button" onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-4 text-center tracking-widest">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 rounded-[2rem] shadow-xl flex flex-col justify-between h-28 border border-white/5`}>
      <div className="flex justify-between items-start">
        <span className="text-white/30 font-black text-[7px] uppercase tracking-widest leading-none truncate">{title}</span>
        <div className="text-white/20">{icon}</div>
      </div>
      <div className="text-lg font-black leading-none tracking-tighter truncate italic">{value}</div>
    </div>
  );
}