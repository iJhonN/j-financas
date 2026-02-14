'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Landmark, Coins, Pencil, LogOut, UserCircle, ShieldCheck, CalendarClock, Wallet, CheckCircle2, Loader2
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
  const [loading, setLoading] = useState(true); // Estado para o login automático

  // --- LÓGICA DE LOGIN AUTOMÁTICO INTEGRADA ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setView('dashboard');
      }
      setLoading(false); // Libera a tela após a verificação
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

  // Tela de carregamento enquanto verifica se você já está logado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-955 text-white">
        <form onSubmit={handleAuth} className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-lg shadow-blue-500/20"><TrendingUp size={32} /></div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">J FINANÇAS</h1>
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

// O restante do seu componente Dashboard permanece exatamente igual para não perder suas funções
function Dashboard({ user, onLogout }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  
  const [novoNome, setNovoNome] = useState(user?.user_metadata?.full_name || "");
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [descricao, setDescricao] = useState('');
  const [valorDisplay, setValorDisplay] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [tipoPagamento, setTipoPagamento] = useState<'avista' | 'parcelado' | 'recorrente' | 'debito'>('avista');
  const [diaCobranca, setDiaCobranca] = useState('');
  const [parcelas, setParcelas] = useState(1);
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
    if (novoNome !== user?.user_metadata?.full_name) {
      await supabase.auth.updateUser({ data: { full_name: novoNome } });
    }
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
    let descFinal = descricao;
    if (tipoPagamento === 'recorrente') descFinal += ` (Mensal - Dia ${diaCobranca})`;
    else if (tipoPagamento === 'debito') descFinal += ` (Débito Automático)`;
    else if (tipoPagamento === 'parcelado' && parcelas > 1) descFinal += ` (${parcelas}x)`;
    else if (tipoPagamento === 'avista') descFinal += ` (À Vista)`;

    const { error } = await supabase.from('transacoes').insert([{ descricao: descFinal, valor: vTotal, forma_pagamento: formaPagamento, data_ordenacao: data, user_id: user.id }]);
    if (!error) { fetchDados(); setIsModalOpen(false); setDescricao(''); setValorDisplay(''); setParcelas(1); setTipoPagamento('avista'); setDiaCobranca(''); }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoUrl = `/logos/${banco.toLowerCase().trim().replace(/\s+/g, '-')}.svg`;
    if (editingCardId) {
      await supabase.from('cartoes').update({ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    } else {
      await supabase.from('cartoes').insert([{ banco, nome_cartao: nomeCartao, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    }
    fetchDados(); setEditingCardId(null); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento('');
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const saldoAtual = saldoInicial - transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="min-h-screen bg-slate-955 p-2 md:p-8 text-white font-sans overflow-x-hidden">
      <header className="flex flex-col gap-4 mb-6 bg-slate-900 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-blue-600 p-2 md:p-3 rounded-2xl text-white"><TrendingUp size={24} /></div>
            <div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none">J FINANÇAS</h1>
              <p className="text-[9px] md:text-[10px] font-black text-blue-400 mt-1 uppercase tracking-widest leading-none">Bem vindo(a), {user?.user_metadata?.full_name || "Usuário"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsProfileModalOpen(true)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 transition-all"><UserCircle size={20} /></button>
            <button onClick={onLogout} className="bg-slate-800 text-rose-500 p-2.5 rounded-full border border-slate-700 hover:bg-rose-600 transition-all"><LogOut size={20} /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full">
          <button onClick={() => setIsSaldoModalOpen(true)} className="flex-1 bg-emerald-900/20 text-emerald-400 p-3 rounded-2xl border border-emerald-800/50 font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-inner"><Coins size={14} /> Saldo</button>
          <button onClick={() => { setEditingCardId(null); setBanco(''); setNomeCartao(''); setVencimento(''); setIsCardModalOpen(true); }} className="flex-1 bg-slate-800/50 text-slate-300 p-3 rounded-2xl border border-slate-700 font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-inner"><CreditCard size={14} /> Cartão</button>
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"><Plus size={18} /> Novo Gasto</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Caixa" value={`R$ ${formatarMoeda(saldoAtual)}`} icon={<Banknote />} color="bg-slate-900 border-b-4 md:border-b-8 border-blue-600" />
        <Card title="Gasto Total" value={`R$ ${formatarMoeda(transacoes.reduce((acc, t) => acc + Number(t.valor), 0))}`} icon={<CreditCard />} color="bg-slate-900 border-b-4 md:border-b-8 border-rose-600" />
        <Card title="Saldo Inicial" value={`R$ ${formatarMoeda(saldoInicial)}`} icon={<Coins />} color="bg-slate-900 border-b-4 md:border-b-8 border-emerald-600" />
        <Card title="Status" value="Ativo" icon={<ShieldCheck />} color="bg-slate-900 border-b-4 md:border-b-8 border-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-slate-900 p-4 md:p-8 rounded-[2rem] border border-slate-800 h-64 md:h-80 shadow-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...transacoes].reverse().map(t => ({ name: t.data_ordenacao, valor: t.valor }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" hide />
                <Tooltip formatter={(v: any) => [`R$ ${formatarMoeda(v)}`, 'Gasto']} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px'}} />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
            <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-4 md:p-5 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all group">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 p-1.5">
                      <img src={c.logo_url} alt={c.banco} className="w-full h-full object-contain" onError={(e: any) => e.target.src = "https://cdn-icons-png.flaticon.com/512/60/60378.png"} />
                    </div>
                    <div>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase">{c.banco}</p>
                      <p className="font-black text-xs md:text-sm">{c.nome_cartao}</p>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Dia {c.vencimento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className="text-slate-500 hover:text-blue-500"><Pencil size={16} /></button>
                    <button onClick={async () => { if(confirm("Remover?")) await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(); }} className="text-slate-500 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-800 h-[450px] md:h-[600px] overflow-hidden flex flex-col shadow-2xl">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest">Lançamentos</h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {transacoes.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:bg-slate-800/60 transition-all">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-black text-slate-200 text-[10px] md:text-[11px] uppercase tracking-tight truncate">{t.descricao}</p>
                  <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase">{t.data_ordenacao}</p>
                  <p className="text-[7px] md:text-[8px] font-bold text-blue-400 uppercase tracking-tighter truncate">{t.forma_pagamento}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-black text-xs md:text-sm text-rose-500">R$ {formatarMoeda(t.valor)}</span>
                  <button onClick={async () => { if(confirm("Apagar?")) await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(); }} className="text-slate-700 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAIS (GASTO, PERFIL, CARTÃO, SALDO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-50 animate-in fade-in duration-300">
          <form onSubmit={handleSalvarGasto} className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border-t-4 md:border-4 border-slate-800 shadow-2xl overflow-y-auto max-h-[95vh]">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-6">Novo Gasto</h2>
            <div className="space-y-4">
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white uppercase text-xs font-bold focus:border-blue-600 outline-none" required />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-sm">R$</span><input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-black text-blue-400 text-lg outline-none focus:border-blue-600" required /></div>
              
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase ml-2">Pagar com:</label>
                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none">
                  <option value="Pix">Pix / Dinheiro</option>
                  {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} ({c.nome_cartao})</option>))}
                </select>
              </div>

              {formaPagamento !== "Pix" && (
                <div className="bg-slate-950/50 p-4 rounded-3xl border-2 border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setTipoPagamento('avista')} className={`p-3 rounded-xl border-2 text-[8px] font-black uppercase transition-all flex items-center justify-center gap-1 ${tipoPagamento === 'avista' ? 'border-blue-600 bg-blue-600/10 text-blue-400' : 'border-slate-800 text-slate-600'}`}><CheckCircle2 size={12}/> À Vista</button>
                    <button type="button" onClick={() => setTipoPagamento('parcelado')} className={`p-3 rounded-xl border-2 text-[8px] font-black uppercase transition-all flex items-center justify-center gap-1 ${tipoPagamento === 'parcelado' ? 'border-blue-600 bg-blue-600/10 text-blue-400' : 'border-slate-800 text-slate-600'}`}><CreditCard size={12}/> Parcelado</button>
                    <button type="button" onClick={() => setTipoPagamento('recorrente')} className={`p-3 rounded-xl border-2 text-[8px] font-black uppercase transition-all flex items-center justify-center gap-1 ${tipoPagamento === 'recorrente' ? 'border-blue-600 bg-blue-600/10 text-blue-400' : 'border-slate-800 text-slate-600'}`}><CalendarClock size={12}/> Recorrente</button>
                    <button type="button" onClick={() => setTipoPagamento('debito')} className={`p-3 rounded-xl border-2 text-[8px] font-black uppercase transition-all flex items-center justify-center gap-1 ${tipoPagamento === 'debito' ? 'border-emerald-600 bg-emerald-600/10 text-emerald-400' : 'border-slate-800 text-slate-600'}`}><Wallet size={12}/> Débito</button>
                  </div>
                  {tipoPagamento === 'recorrente' && (<div className="space-y-1 animate-in fade-in"><label className="text-[9px] font-black text-slate-400 uppercase">Dia Mensal:</label><input type="number" min="1" max="31" value={diaCobranca} onChange={(e) => setDiaCobranca(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs" required /></div>)}
                  {tipoPagamento === 'parcelado' && (<div className="space-y-1 animate-in fade-in"><label className="text-[9px] font-black text-slate-400 uppercase">Parcelas:</label><input type="number" min="2" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs" /></div>)}
                </div>
              )}
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 font-bold text-white outline-none" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase text-sm mt-2">Lançar Agora</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-2 text-center">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-6 text-center">Perfil</h2>
            <div className="space-y-4">
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" />
              <input type="password" placeholder="NOVA SENHA" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" />
              <input type="password" placeholder="CONFIRMAR SENHA" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase text-xs mt-2">Salvar Alterações</button>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-2 text-center">Fechar</button>
            </div>
          </form>
        </div>
      )}

      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSalvarCartao} className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-white text-center uppercase tracking-widest">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4">
              <input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="BANCO (EX: INTER)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" required />
              <input value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value)} placeholder="NOME NO CARTÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs uppercase outline-none" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white font-bold text-xs outline-none" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl uppercase text-xs mt-2">Salvar</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 font-bold uppercase text-[9px] mt-2 text-center">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 md:p-10 border-4 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-emerald-500 text-center uppercase tracking-widest">Saldo Inicial</h2>
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
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform active:scale-[0.98] border-black/20 flex flex-col justify-between h-24 md:h-36`}>
      <div className="flex justify-between items-start">
        <span className="text-white/40 font-black text-[7px] md:text-[10px] uppercase tracking-widest leading-none truncate">{title}</span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 opacity-50">{icon}</div>
      </div>
      <div className="text-sm md:text-2xl font-black leading-none tracking-tighter truncate">{value}</div>
    </div>
  );
}