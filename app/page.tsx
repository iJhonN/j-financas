'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, 
  UserCircle, Loader2, ChevronDown, Zap, CheckCircle, Clock, Search, 
  ChevronLeft, ChevronRight, Circle, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600', chart: '#3b82f6' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', chart: '#10b981' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', chart: '#8b5cf6' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600', chart: '#e11d48' }
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();
  const theme = THEMES[currentTheme];

  // Tour e PWA States
  const [tourStep, setTourStep] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Estados de Dados e UI
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        await fetchDados(session.user.id);
        
        // Lógica do Tour
        if (!localStorage.getItem('wolf_tour_complete')) {
          setTimeout(() => setTourStep(1), 1500);
        }

        // Lógica de Instalação PWA
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        const hasSeenPrompt = localStorage.getItem('wolf_install_prompt_v1');
        if (!isInstalled && !hasSeenPrompt) {
          setTimeout(() => setShowInstallPrompt(true), 6000);
        }
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
    } catch (err) { console.error(err); }
  };

  // Funções de Utilidade
  const showAlert = (msg: string, type: any = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const nextTour = () => setTourStep(prev => prev + 1);
  const endTour = () => { setTourStep(0); localStorage.setItem('wolf_tour_complete', 'true'); };
  
  const closeInstallPrompt = () => {
    localStorage.setItem('wolf_install_prompt_v1', 'true');
    setShowInstallPrompt(false);
  };

  const togglePago = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('transacoes').update({ pago: !currentStatus }).eq('id', id);
    if (!error) fetchDados(user.id);
    else showAlert("Erro ao atualizar", "error");
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
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear() &&
             t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) &&
             (filtroCartao === 'Todos' || t.forma_pagamento.includes(filtroCartao));
    });
  }, [transacoes, selectedDate, searchTerm, filtroCartao]);

  const saldoCalculado = saldoInicial + transacoes.filter(t => t.pago).reduce((acc, t) => acc + t.valor, 0);

  const formatarDadosGrafico = () => [...transacoesFiltradas].reverse().map(t => ({ 
    data: `${new Date(t.data_ordenacao + 'T12:00:00').getDate().toString().padStart(2, '0')}/${new Date(t.data_ordenacao + 'T12:00:00').getMonth() + 1}`, 
    valor: Math.abs(t.valor) 
  }));

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-blue-600"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black antialiased overflow-x-hidden pb-40 italic leading-none uppercase relative">
      
      {/* BANNER PWA */}
      {showInstallPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[10002] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-blue-600 p-5 rounded-[2.5rem] border-2 border-white shadow-2xl flex flex-col gap-3 relative">
            <button onClick={closeInstallPrompt} className="absolute top-4 right-4 bg-white/20 p-1 rounded-full"><X size={16}/></button>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><img src="/logo.png" className="w-8 h-8 object-contain" /></div>
              <div>
                <h3 className="text-[11px] font-black tracking-tighter italic">INSTALAR WOLF FINANCE</h3>
                <p className="text-[8px] normal-case opacity-90">Use como um App na sua tela de início.</p>
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded-xl text-center"><p className="text-[8px] normal-case">Clique no <span className="font-black italic uppercase">menu do navegador</span> e selecione <span className="font-black italic uppercase">"Adicionar à tela de início"</span>.</p></div>
          </div>
        </div>
      )}

      {/* TOUR GUIADO */}
     {/* TOUR GUIADO REFORMULADO - ALTO CONTRASTE */}
      {tourStep > 0 && (
        <div className="fixed inset-0 z-[10000] bg-[#0a0f1d]/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="bg-gradient-to-b from-blue-600 to-blue-800 p-8 rounded-[3rem] border-[3px] border-white/20 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] max-w-sm w-full animate-in zoom-in duration-300 relative">
            
            {/* Indicador de Passo Flutuante */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-xl border-2 border-blue-600">
              PASSO {tourStep} / 5
            </div>

            <div className="flex justify-end mb-2">
               <button onClick={endTour} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X size={18}/></button>
            </div>

            <div className="py-4">
              {tourStep === 1 && (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
                    <Zap size={32} className="text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl mb-4 italic tracking-tighter text-white">BEM-VINDO!</h3>
                  <p className="text-[11px] normal-case mb-8 italic text-blue-50 leading-relaxed font-medium">
                    Iniciando a configuração da sua gestão <span className="font-black text-white uppercase">Wolf Finance</span>. 
                    Pronto para o próximo nível?
                  </p>
                </>
              )}

              {tourStep === 2 && (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <Coins size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl mb-4 italic tracking-tighter text-white uppercase">Saldo Inicial</h3>
                  <p className="text-[11px] normal-case mb-8 italic text-blue-50 leading-relaxed font-medium">
                    Ajuste seu valor atual em conta. Ele serve como a <span className="font-black text-white uppercase text-[10px]">base sólida</span> para todos os cálculos do Dashboard.
                  </p>
                </>
              )}

              {tourStep === 3 && (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <CreditCard size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl mb-4 italic tracking-tighter text-white uppercase">Meus Cartões</h3>
                  <p className="text-[11px] normal-case mb-8 italic text-blue-50 leading-relaxed font-medium">
                    Gerencie seus cartões em uma área <span className="font-black text-white uppercase text-[10px]">exclusiva</span>. O sistema organiza tudo pelo dia do vencimento.
                  </p>
                </>
              )}

              {tourStep === 4 && (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <Plus size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl mb-4 italic tracking-tighter text-white uppercase">Lançamentos</h3>
                  <p className="text-[11px] normal-case mb-8 italic text-blue-50 leading-relaxed font-medium">
                    Registrar entradas e saídas agora é <span className="font-black text-white uppercase text-[10px]">vapt-vupt</span> na nossa nova central de lançamentos.
                  </p>
                </>
              )}

              {tourStep === 5 && (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl mb-4 italic tracking-tighter text-white uppercase text-emerald-400">Pronto!</h3>
                  <p className="text-[11px] normal-case mb-8 italic text-blue-50 leading-relaxed font-medium">
                    Seu saldo só atualiza quando você <span className="font-black text-white uppercase text-[10px]">liquida</span> as contas na lista de atividade.
                  </p>
                </>
              )}

              <button 
                onClick={tourStep === 5 ? endTour : nextTour} 
                className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${tourStep === 5 ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
              >
                {tourStep === 5 ? 'Começar Agora' : 'Próximo Passo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTAS */}
      {alertConfig.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${alertConfig.type === 'error' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'}`}>
            <p className="text-[10px] tracking-widest font-black uppercase italic">{alertConfig.msg}</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col gap-4 mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-lg md:text-xl font-black tracking-tighter italic">WOLF FINANCE</h1>
              <div className="flex items-center gap-2 mt-1 italic">
                <p className={`text-[9px] font-black ${theme.text}`}>OLÁ, {user?.user_metadata?.full_name?.split(' ')[0]}</p>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-500 text-[7px] font-black"><Clock size={8} /> {diasRestantes} DIAS</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/tutorial')} className="bg-slate-800 text-blue-400 p-2.5 rounded-full border border-blue-500/30 active:scale-95 shadow-lg"><HelpCircle size={20}/></button>
            <button onClick={() => router.push('/perfil')} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 active:scale-95 shadow-lg"><UserCircle size={20}/></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsSaldoModalOpen(true)} className={`flex-1 p-3 rounded-2xl border border-emerald-800/50 text-[10px] flex items-center justify-center gap-2 bg-emerald-900/20 text-emerald-400 active:scale-95 transition-all font-black ${tourStep === 2 ? 'ring-4 ring-white animate-pulse' : ''}`}><Coins size={14} /> Saldo</button>
          <button onClick={() => router.push('/cartoes')} className={`flex-1 p-3 rounded-2xl border border-slate-700 text-[10px] flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 active:scale-95 transition-all font-black ${tourStep === 3 ? 'ring-4 ring-white animate-pulse' : ''}`}><CreditCard size={14} /> Cartão</button>
          <button onClick={() => router.push('/lancamento')} className={`w-full md:w-auto p-3.5 rounded-2xl shadow-lg text-[10px] flex items-center justify-center gap-2 ${theme.primary} text-white active:scale-95 transition-all font-black ${tourStep === 4 ? 'ring-4 ring-white animate-pulse' : ''}`}><Plus size={18} /> Novo</button>
        </div>
      </header>

      {/* DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Pago" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} color={`bg-[#111827] border-b-8 ${theme.border}`} />
        <Card title="Gasto Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter(t=>t.valor<0).reduce((a,b)=>a+b.valor,0))}`} icon={<CreditCard size={20}/>} color="bg-[#111827] border-b-8 border-rose-600" onClick={() => router.push('/detalhes-gastos')} />
        <Card title="Entrada Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter(t=>t.valor>0).reduce((a,b)=>a+b.valor,0))}`} icon={<TrendingUp size={20}/>} color="bg-[#111827] border-b-8 border-emerald-600" />
        <div className="bg-[#111827] p-4 rounded-[1.5rem] border-b-8 border-amber-500 flex flex-col justify-between h-32 relative shadow-2xl italic font-black">
           <div className="flex items-center justify-between uppercase text-[9px] border-b border-white/10 pb-2 font-black">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={16}/></button>
              <span>{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={16}/></button>
           </div>
           <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full flex items-center justify-between text-[9px] uppercase font-black bg-slate-800/50 p-2 rounded-lg border border-slate-700 mt-2 truncate"><span className="truncate">{filtroCartao}</span><ChevronDown size={12}/></button>
           {isFilterMenuOpen && (
             <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border-2 border-slate-800 rounded-xl shadow-2xl z-[500] max-h-40 overflow-y-auto">
               <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black uppercase hover:bg-slate-800 italic">Todos</button>
               {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] font-black uppercase hover:bg-slate-800 italic">{c.banco} - {c.nome_cartao}</button>)}
             </div>
           )}
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <h2 className="text-white font-black mb-6 uppercase text-[10px] tracking-widest px-1 italic">Meus Cartões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartoes.map(c => (
              <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between items-center bg-slate-950/50 hover:border-blue-500 transition-all shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                    <img src={c.logo_url} className="w-full h-full object-contain p-1" onError={(e: any) => e.currentTarget.style.display = 'none'} />
                  </div>
                  <div className="leading-tight"><p className="text-[8px] font-black text-slate-500 uppercase italic">{c.banco}</p><p className="font-black text-xs uppercase italic">{c.nome_cartao}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push('/cartoes')} className="text-slate-600 hover:text-white transition-all"><Pencil size={18}/></button>
                  <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(user.id); showAlert("Cartão removido!"); } }} className="text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 flex flex-col shadow-2xl min-h-[500px]">
          <h2 className="text-white font-black mb-4 uppercase text-[10px] tracking-widest italic">Atividade</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-[9px] outline-none font-black uppercase italic" />
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className={`flex justify-between items-center p-4 rounded-2xl border ${t.pago ? 'bg-slate-800/40 border-slate-800' : 'bg-rose-900/10 border-rose-900/30'} ${tourStep === 5 ? 'ring-2 ring-white z-[10001]' : ''}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePago(t.id, t.pago)} className={`p-1.5 rounded-full ${t.pago ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'} transition-all`}>{t.pago ? <CheckCircle size={18}/> : <Circle size={18}/>}</button>
                  <div className="leading-tight truncate max-w-[120px] italic"><p className="text-[10px] uppercase font-black">{t.descricao}</p><p className={`text-[7px] uppercase font-black ${theme.text}`}>{t.forma_pagamento}</p></div>
                </div>
                <div className="text-right"><p className={`text-[10px] font-black ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {formatarMoeda(t.valor)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl relative text-center">
            <button onClick={() => setIsSaldoModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"><X size={20}/></button>
            <h2 className="text-xl mb-8 text-emerald-500 font-black italic uppercase italic">Saldo Bancário</h2>
            <div className="relative mb-6">
              <label className="absolute -top-2 left-3 bg-[#111827] px-1 text-[7px] font-black text-emerald-500 z-10 uppercase">Valor em conta</label>
              <input type="text" value={saldoDisplay} onChange={(e) => setSaldoDisplay(aplicarMascara(e.target.value))} placeholder="R$ 0,00" className="w-full p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 text-emerald-500 text-xl font-black text-center outline-none italic font-black" />
            </div>
            <button onClick={async () => { const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id); setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); fetchDados(user.id); showAlert("Saldo ajustado!"); }} className="w-full bg-emerald-600 py-5 rounded-[2rem] text-[10px] font-black uppercase active:scale-95 shadow-lg italic">Confirmar Novo Saldo</button>
          </div>
        </div>
      )}

      {/* CRÉDITOS FIXOS */}
      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none z-[10] font-black italic">
        <p className="text-[7px] tracking-[0.4em] uppercase font-black mb-1">Engineered by</p>
        <p className="text-[10px] tracking-tighter font-black italic uppercase text-blue-500">
          Jhonatha <span className="text-white">| Wolf Finance © 2026</span>
        </p>
      </div>

      <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; } `}</style>
    </div>
  );
}

function Card({ title, value, icon, color, onClick }: any) {
  return (
    <div onClick={onClick} className={`${color} ${onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-95 transition-all' : ''} p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-32 md:h-36 text-white text-left font-black italic`}>
      <div className="flex justify-between items-start w-full tracking-widest"><span className="text-white/20 text-[7px] md:text-[10px] uppercase font-black">{title}</span><div className="p-1.5 md:p-3 bg-white/5 rounded-xl backdrop-blur-md opacity-50">{icon}</div></div>
      <div className="text-sm md:text-2xl font-black truncate uppercase px-1 leading-tight tracking-tighter">{value}</div>
    </div>
  );
}