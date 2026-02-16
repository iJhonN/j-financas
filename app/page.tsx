'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, LogOut, 
  UserCircle, ShieldCheck, Loader2, ChevronDown, Settings, 
  AlertCircle, CheckCircle, Clock, Lock, RefreshCcw, Palette
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

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [isExpired, setIsExpired] = useState(true);
  const router = useRouter();
  const theme = THEMES[currentTheme];

  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Estados de Dados
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');

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

  // Perfil e Saldo
  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState('');

  const isAdmin = user?.email === "jhonatha2005@outlook.com";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchDados(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchDados = async (userId: string) => {
    const { data: tData } = await supabase.from('transacoes').select('*').eq('user_id', userId).order('data_ordenacao', { ascending: false });
    if (tData) setTransacoes(tData.map(t => ({ ...t, valor: Number(t.valor) })));
    
    const { data: cData } = await supabase.from('cartoes').select('*').eq('user_id', userId);
    if (cData) setCartoes(cData);

    const { data: profile } = await supabase.from('profiles').select('saldo_inicial, theme, expires_at').eq('id', userId).maybeSingle();
    
    if (profile) {
      setSaldoInicial(Number(profile.saldo_inicial) || 0);
      if (profile.theme && THEMES[profile.theme as keyof typeof THEMES]) setCurrentTheme(profile.theme as any);
      
      const expDate = new Date(profile.expires_at);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dias = diffDays > 0 ? diffDays : 0;
      setDiasRestantes(dias);
      setIsExpired(dias <= 0);
    }
    setNovoNome(user?.user_metadata?.full_name || "");
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
    } catch (err) {
      showAlert("Erro ao salvar tema", "error");
    }
  };

  const handleSalvarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return showAlert("Acesso expirado!", "error");
    const cleanDesc = sanitize(descricao);
    const vTotal = Number(valorDisplay.replace(/\./g, '').replace(',', '.'));
    if (!cleanDesc || vTotal <= 0) return showAlert("Dados inválidos", "error");

    try {
      const valorBase = tipoMovimento === 'despesa' ? -Math.abs(vTotal) : Math.abs(vTotal);
      const valorParcela = parseFloat((valorBase / parcelas).toFixed(2));
      
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
      await supabase.from('transacoes').insert(novosLancamentos);
      showAlert("Lançado com sucesso!");
      setIsModalOpen(false);
      setDescricao(''); setValorDisplay(''); setParcelas(1); setRecorrente(false);
      fetchDados(user.id);
    } catch (err) { showAlert("Erro ao salvar", "error"); }
  };

  const handleSalvarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = sanitize(banco).toUpperCase();
    const cleanNomeC = sanitize(nomeCartao).toUpperCase();
    const logoUrl = `https://logo.clearbit.com/${cleanBanco.toLowerCase().replace(/\s/g, '')}.com?size=100`;
    let res;
    if (editingCardId) res = await supabase.from('cartoes').update({ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl }).eq('id', editingCardId);
    else res = await supabase.from('cartoes').insert([{ banco: cleanBanco, nome_cartao: cleanNomeC, vencimento: Number(vencimento), logo_url: logoUrl, user_id: user.id }]);
    if (!res.error) { fetchDados(user.id); setIsCardModalOpen(false); setBanco(''); setNomeCartao(''); setVencimento(''); setEditingCardId(null); showAlert("Cartão salvo!"); }
  };

  const aplicarMascara = (valor: string) => {
    let v = valor.replace(/\D/g, '');
    v = (Number(v) / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatarDadosGrafico = () => {
    return [...transacoesFiltradas].reverse().map(t => {
      const d = new Date(t.data_ordenacao);
      return {
        data: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        valor: parseFloat(Math.abs(t.valor).toFixed(2))
      };
    });
  };

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const transacoesFiltradas = filtroCartao === 'Todos' ? transacoes : transacoes.filter(t => t.forma_pagamento.includes(filtroCartao));

  const entradasMensais = transacoes.filter(t => {
    const d = new Date(t.data_ordenacao);
    return Number(t.valor) > 0 && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  }).reduce((acc, t) => acc + Number(t.valor), 0);

  const saidasMensais = transacoes.filter(t => {
    const d = new Date(t.data_ordenacao);
    return Number(t.valor) < 0 && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  }).reduce((acc, t) => acc + Number(t.valor), 0);

  const saldoCalculado = saldoInicial + transacoes.reduce((acc, t) => acc + Number(t.valor), 0);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black antialiased overflow-x-hidden pb-24 italic">
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            {alertConfig.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <p className="text-[10px] uppercase tracking-widest font-black">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="mb-6 bg-rose-600/20 border-2 border-rose-600 p-4 rounded-3xl flex items-center gap-4 animate-pulse leading-none">
          <div className="bg-rose-600 p-2 rounded-xl text-white shadow-lg"><Lock size={20} /></div>
          <div className="leading-none">
            <h3 className="text-xs uppercase font-black">Acesso Beta Expirado</h3>
            <p className="text-[9px] text-rose-400 uppercase mt-1 font-black">Fale com o administrador para renovar!</p>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl leading-none">
        <div className="flex justify-between items-center w-full leading-none">
          <div className="flex items-center gap-3 leading-none">
            <img src="/logo.png" alt="Wolf Logo" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter px-1">WOLF FINANCE</h1>
              <div className="flex items-center gap-2 mt-1 leading-none font-black">
                <p className={`text-[9px] md:text-[10px] font-black ${theme.text} uppercase`}>Olá, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isExpired ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-amber-500/50 text-amber-500 bg-amber-500/10'} text-[7px] font-black uppercase tracking-widest`}>
                  <Clock size={8} /> {diasRestantes} DIAS
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 relative transition-all leading-none font-black"><UserCircle size={20} /></button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-12 w-64 bg-[#111827] border-2 border-slate-800 rounded-[2rem] shadow-2xl z-[500] overflow-hidden animate-in fade-in slide-in-from-top-2">
                {isAdmin && (
                  <button onClick={() => router.push('/admin')} className="w-full flex items-center gap-3 p-4 hover:bg-amber-500/10 text-amber-500 border-b border-slate-800/50 uppercase text-[10px] font-black">
                    <ShieldCheck size={18} /> Painel de Controle
                  </button>
                )}
                <button onClick={() => { setIsProfileMenuOpen(false); setIsConfigModalOpen(true); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-800 border-b border-slate-800/50 uppercase text-[10px] font-black"><Settings className={theme.text} size={18} /> Ajustes / Tema</button>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center gap-3 p-4 hover:bg-rose-900/20 text-rose-500 transition-all uppercase text-[10px] font-black"><LogOut size={18} /> Sair do App</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 font-black leading-none">
          <button disabled={isExpired} onClick={() => setIsSaldoModalOpen(true)} className={`flex-1 p-3 rounded-2xl border border-emerald-800/50 text-[10px] uppercase flex items-center justify-center gap-2 leading-none transition-all ${isExpired ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-emerald-900/20 text-emerald-400 active:scale-95'}`}><Coins size={14} /> Saldo</button>
          <button disabled={isExpired} onClick={() => { setEditingCardId(null); setIsCardModalOpen(true); }} className={`flex-1 p-3 rounded-2xl border border-slate-700 text-[10px] uppercase flex items-center justify-center gap-2 leading-none transition-all ${isExpired ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-slate-800/50 text-slate-300 active:scale-95'}`}><CreditCard size={14} /> Cartão</button>
          <button disabled={isExpired} onClick={() => setIsModalOpen(true)} className={`w-full md:w-auto p-3.5 rounded-2xl shadow-lg text-[10px] uppercase flex items-center justify-center gap-2 transition-all ${isExpired ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : `${theme.primary} text-white active:scale-95`}`}><Plus size={18} /> Novo Lançamento</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 font-black leading-none">
        <Card title="Saldo Atual" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} color={`bg-[#111827] border-b-8 ${theme.border}`} />
        <Card title="Gasto Mensal" value={`R$ ${formatarMoeda(saidasMensais)}`} icon={<CreditCard size={20}/>} color="bg-[#111827] border-b-8 border-rose-600" />
        <Card title="Entradas" value={`R$ ${formatarMoeda(entradasMensais)}`} icon={<TrendingUp size={20}/>} color="bg-[#111827] border-b-8 border-emerald-600" />
        <div className="relative font-black leading-none">
          <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full bg-[#111827] p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-b-8 border-amber-500 flex flex-col justify-between h-32 md:h-36 text-left leading-none font-black">
            <span className="text-white/40 text-[7px] md:text-[10px] uppercase tracking-widest leading-none font-black">Filtrar por:</span>
            <div className="flex items-center justify-between w-full leading-tight font-black"><div className="text-sm md:text-xl truncate uppercase italic px-1 leading-none font-black">{filtroCartao}</div><ChevronDown size={16} /></div>
          </button>
          {isFilterMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border-2 border-slate-800 rounded-3xl shadow-2xl z-[400] overflow-hidden font-black">
              <div className="p-2 max-h-64 overflow-y-auto uppercase text-[10px]">
                <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-4 hover:bg-slate-800 border-b border-slate-800/50 font-black">Todos os Gastos</button>
                {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(c.banco); setIsFilterMenuOpen(false); }} className={`w-full text-left p-4 hover:bg-slate-800 border-t border-slate-800/50 ${theme.text} font-black`}>{c.banco} - {c.nome_cartao}</button>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 leading-none">
        <div className="lg:col-span-2 space-y-6 leading-none">
          <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 overflow-hidden font-black">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatarDadosGrafico()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="data" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900', color: '#fff'}} 
                  formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Valor']}
                />
                <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl font-black leading-none">
            <h2 className="text-white font-black mb-6 uppercase text-[10px] tracking-widest px-1 leading-none">Meus Cartões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cartoes.map(c => (
                <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all leading-none font-black">
                  <div className="flex items-center gap-3 leading-none font-black">
                    <img src={c.logo_url} className="w-10 h-10 object-contain rounded-lg" onError={(e:any)=>e.currentTarget.style.display='none'} alt="" />
                    <div className="leading-tight font-black"><p className="text-[8px] font-black text-slate-500 uppercase">{c.banco}</p><p className="font-black text-xs uppercase">{c.nome_cartao}</p><p className={`text-[9px] font-bold ${theme.text} uppercase`}>DIA {c.vencimento}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={isExpired} onClick={() => { setEditingCardId(c.id); setBanco(c.banco); setNomeCartao(c.nome_cartao); setVencimento(c.vencimento.toString()); setIsCardModalOpen(true); }} className={`text-slate-600 ${isExpired ? 'opacity-20' : 'hover:text-white'}`}><Pencil size={16} /></button>
                    <button disabled={isExpired} onClick={async () => { if(confirm("Excluir cartão?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(user.id); showAlert("Removido"); } }} className={`text-slate-600 ${isExpired ? 'opacity-20' : 'hover:text-rose-500'}`}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 h-full overflow-hidden flex flex-col shadow-2xl min-h-[500px] leading-none">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest px-1">Últimos Lançamentos</h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 font-black leading-none">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-600 leading-none">
                <div className="flex-1 min-w-0 mr-3 leading-tight font-black"><div className="flex items-center gap-2 font-black"><p className="text-slate-200 text-[10px] uppercase truncate font-black">{t.descricao}</p>{t.recorrente && <RefreshCcw size={10} className="text-blue-400 font-black" />}</div><p className="text-[8px] text-slate-500 uppercase font-black">{t.data_ordenacao} • {t.forma_pagamento}</p></div>
                <div className="flex items-center gap-2 leading-none font-black"><span className={`text-xs px-1 ${Number(t.valor) > 0 ? 'text-emerald-500' : 'text-rose-500'} font-black`}>R$ {formatarMoeda(t.valor)}</span><button disabled={isExpired} onClick={async () => { if(confirm("Apagar?")) { await supabase.from('transacoes').delete().eq('id', t.id); fetchDados(user.id); showAlert("Removido"); } }} className={`text-slate-700 ${isExpired ? 'opacity-20' : 'hover:text-rose-500'}`}><Trash2 size={14} /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && !isExpired && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[4000] animate-in fade-in zoom-in-95 leading-none font-black">
          <form onSubmit={handleSalvarGasto} className="bg-[#111827] w-full max-w-md rounded-[3rem] p-6 md:p-8 border-4 border-slate-800 shadow-2xl text-white font-black">
            <div className="flex justify-between items-center mb-6 leading-none">
               <h2 className="text-xl uppercase tracking-widest font-black">Novo Lançamento</h2>
               <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 leading-none"><X size={20} /></button>
            </div>
            <div className="space-y-4 font-black leading-none">
              <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl leading-none">
                <button type="button" onClick={() => setTipoMovimento('despesa')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase transition-all font-black ${tipoMovimento === 'despesa' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}>Despesa</button>
                <button type="button" onClick={() => setTipoMovimento('receita')} className={`flex-1 py-3 rounded-xl text-[10px] uppercase transition-all font-black ${tipoMovimento === 'receita' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Receita</button>
              </div>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
              <div className="relative leading-none">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${tipoMovimento === 'receita' ? 'text-emerald-500' : 'text-rose-500'} text-sm font-black`}>R$</span>
                <input type="text" value={valorDisplay} onChange={(e) => setValorDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className={`w-full pl-10 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 ${tipoMovimento === 'receita' ? 'text-emerald-400' : 'text-rose-400'} text-lg outline-none font-black`} required />
              </div>
              
              <div className="space-y-4 font-black">
                <div className="space-y-1 font-black"><label className="text-[8px] text-slate-500 uppercase ml-2">Método / Cartão</label>
                  <select value={metodoPagamento} onChange={(e) => { setMetodoPagamento(e.target.value); if (e.target.value === 'Pix' || e.target.value === 'Dinheiro') setTipoPagamento('Dinheiro'); else setTipoPagamento('Crédito'); }} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-[10px] outline-none uppercase font-black">
                    <option value="Pix">Pix / Dinheiro</option>
                    {cartoes.map(c => (<option key={c.id} value={`${c.banco} - ${c.nome_cartao}`}>{c.banco} - {c.nome_cartao}</option>))}
                  </select>
                </div>
                <div className="space-y-1 font-black leading-none"><label className="text-[8px] text-slate-500 uppercase ml-2">Data do Lançamento</label>
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-[10px] outline-none text-center font-black" required />
                </div>
              </div>

              {metodoPagamento !== 'Pix' && metodoPagamento !== 'Dinheiro' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 leading-none font-black">
                  <div className="space-y-1 leading-none"><label className="text-[8px] text-slate-500 uppercase ml-2">Função</label>
                    <select value={tipoPagamento} onChange={(e: any) => setTipoPagamento(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-[10px] outline-none uppercase font-black">
                      <option value="Crédito">Crédito</option>
                      <option value="Débito">Débito</option>
                    </select>
                  </div>
                  {tipoPagamento === 'Crédito' && (
                    <div className="space-y-1 leading-none"><label className="text-[8px] text-slate-500 uppercase ml-2">Parcelas</label>
                      <input type="number" min="1" max="48" value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-center font-black" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3 font-black leading-none">
                <div className="flex items-center justify-between leading-none">
                  <span className="text-[10px] uppercase text-white flex items-center gap-2 font-black"><RefreshCcw size={14} className="text-blue-400 font-black"/> Recorrente?</span>
                  <button type="button" onClick={() => setRecorrente(!recorrente)} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${recorrente ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${recorrente ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {recorrente && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 animate-in slide-in-from-left leading-none font-black">
                    <span className="text-[9px] uppercase text-slate-400 font-black">Dia da cobrança:</span>
                    <input type="number" min="1" max="31" value={diaRecorrencia} onChange={(e) => setDiaRecorrencia(Number(e.target.value))} className="w-12 bg-slate-800 border border-slate-700 rounded-lg p-1 text-center text-xs font-black" />
                  </div>
                )}
              </div>
              <button type="submit" className={`w-full ${theme.primary} text-white py-5 rounded-[2rem] shadow-xl uppercase text-[10px] mt-2 active:scale-95 transition-all font-black`}>Finalizar Lançamento</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CARTÃO */}
      {isCardModalOpen && !isExpired && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 leading-none font-black">
          <form onSubmit={handleSalvarCartao} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 md:p-10 border-4 border-slate-800 shadow-2xl text-white italic leading-none">
            <h2 className="text-xl mb-10 text-center uppercase tracking-widest font-black">{editingCardId ? 'Editar' : 'Novo'} Cartão</h2>
            <div className="space-y-4 font-black">
              <input value={banco} onChange={(e) => setBanco(e.target.value.toUpperCase())} placeholder="BANCO (EX: INTER)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
              <input value={nomeCartao} onChange={(e) => { const val = e.target.value.replace(/[0-9]/g, ''); if (val.length <= 12) setNomeCartao(val.toUpperCase()); }} placeholder="APELIDO (MAX 12 LETRAS)" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-sm uppercase font-black" required />
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-sm text-center font-black" required />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-[10px] mt-4 active:scale-95 font-black`}>Salvar Cartão</button>
              <button type="button" onClick={() => setIsCardModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SALDO */}
      {isSaldoModalOpen && !isExpired && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 font-black leading-none italic">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl text-white italic leading-none">
            <h2 className="text-xl mb-8 text-emerald-500 text-center uppercase tracking-widest font-black">Saldo Inicial</h2>
            <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-lg px-1 font-black">R$</span>
                <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="0,00" className="w-full pl-12 p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-emerald-500 text-xl outline-none font-black" />
            </div>
            <button onClick={async () => {
              const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.'));
              const { error } = await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id);
              if (!error) { setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); showAlert("Saldo OK!"); }
            }} className="w-full bg-emerald-600 py-5 rounded-[2rem] uppercase text-[10px] shadow-lg active:scale-95 font-black">Confirmar</button>
            <button onClick={() => setIsSaldoModalOpen(false)} className="w-full text-slate-500 py-4 mt-2 uppercase text-[9px] font-black">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL AJUSTES */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-4 z-[5000] animate-in fade-in zoom-in-95 leading-none italic font-black">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.updateUser({ data: { full_name: sanitize(novoNome) }, ...(novaSenha && { password: novaSenha }) });
            if (!error) { showAlert("Perfil atualizado!"); setIsConfigModalOpen(false); }
          }} className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl text-white font-black italic leading-none">
            <div className="flex justify-between items-center mb-8 px-1 font-black"><h2 className="text-xl uppercase tracking-widest font-black">Ajustes</h2><button type="button" onClick={() => setIsConfigModalOpen(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 leading-none font-black"><X size={20} /></button></div>
            <div className="mb-8 font-black">
              <p className="text-[8px] text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2 font-black leading-none"><Palette size={12}/> Estilo do App</p>
              <div className="flex justify-between px-2 font-black">{Object.keys(THEMES).map((tName) => <button key={tName} type="button" onClick={() => changeTheme(tName as any)} className={`w-10 h-10 rounded-full border-4 font-black ${currentTheme === tName ? 'border-white scale-110' : 'border-transparent opacity-40'} ${THEMES[tName as keyof typeof THEMES].primary} transition-all`} />)}</div>
            </div>
            <div className="space-y-4 font-black">
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="NOME" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 outline-none text-white text-sm font-black" />
              <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="NOVA SENHA" className="w-full p-4 bg-slate-800 rounded-2xl border-2 border-slate-700 text-white text-sm font-black" />
              <button type="submit" className={`w-full ${theme.primary} py-5 rounded-[2rem] uppercase text-[10px] mt-2 font-black italic`}>Salvar Tudo</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform active:scale-[0.98] border-black/20 flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic leading-none`}>
      <div className="flex justify-between items-start w-full leading-none">
        <span className="text-white/20 font-black text-[7px] md:text-[10px] uppercase tracking-widest italic leading-none font-black">
          {title}
        </span>
        <div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 opacity-50 leading-none font-black">
          {icon}
        </div>
      </div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight font-black">
        {value}
      </div>
    </div>
  );
}