'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Trash2, CreditCard, Banknote, Plus, X, Coins, Pencil, 
  UserCircle, Loader2, ChevronDown, Zap, CheckCircle, Clock, Search, 
  ChevronLeft, ChevronRight, Circle, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

// Configuração de Temas e Conteúdo do Tour
const THEMES = {
  blue: { primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600', chart: '#3b82f6' },
  emerald: { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-600', chart: '#10b981' },
  purple: { primary: 'bg-violet-600', text: 'text-violet-400', border: 'border-violet-600', chart: '#8b5cf6' },
  sunset: { primary: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-600', chart: '#e11d48' }
};

const TOUR_CONTENT = [
  { icon: <Zap size={32}/>, title: "BEM-VINDO!", desc: "Iniciando sua gestão WOLF FINANCE." },
  { icon: <Coins size={32}/>, title: "SALDO INICIAL", desc: "Defina sua base de cálculo no Dashboard." },
  { icon: <CreditCard size={32}/>, title: "MEUS CARTÕES", desc: "Área exclusiva para organizar suas faturas." },
  { icon: <Plus size={32}/>, title: "LANÇAMENTOS", desc: "Central de entradas e saídas rápidas." },
  { icon: <CheckCircle size={32} className="text-emerald-400"/>, title: "LIQUIDAÇÃO", desc: "Confirme o pagamento para atualizar o saldo real." }
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('blue');
  const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: 'success' });
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isSaldoModalOpen, setIsSaldoModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [filtroCartao, setFiltroCartao] = useState('Todos');
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoDisplay, setSaldoDisplay] = useState('');

  const theme = THEMES[currentTheme];

  // Busca de dados otimizada (Paralela)
  const fetchDados = useCallback(async (userId: string) => {
    try {
      const [{ data: tData }, { data: cData }, { data: profile }] = await Promise.all([
        supabase.from('transacoes').select('*').eq('user_id', userId).order('data_ordenacao', { ascending: false }),
        supabase.from('cartoes').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      ]);

      if (tData) setTransacoes(tData.map(t => ({ ...t, valor: Number(t.valor), pago: t.pago ?? false })));
      if (cData) setCartoes(cData);
      if (profile) {
        setSaldoInicial(Number(profile.saldo_inicial) || 0);
        if (profile.theme) setCurrentTheme(profile.theme as any);
        const diff = Math.ceil((new Date(profile.expires_at).getTime() - new Date().getTime()) / (86400000));
        setDiasRestantes(Math.max(0, diff));
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);
      await fetchDados(session.user.id);
      
      if (!localStorage.getItem('wolf_tour_complete')) setTimeout(() => setTourStep(1), 1500);
      if (!window.matchMedia('(display-mode: standalone)').matches && !localStorage.getItem('wolf_install_prompt_v1')) {
        setTimeout(() => setShowInstallPrompt(true), 6000);
      }
      setLoading(false);
    };
    init();
  }, [router, fetchDados]);

  const showAlert = (msg: string, type = 'success') => {
    setAlertConfig({ show: true, msg, type });
    setTimeout(() => setAlertConfig(p => ({ ...p, show: false })), 4000);
  };

  const formatarMoeda = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const transacoesFiltradas = useMemo(() => transacoes.filter(t => {
    const d = new Date(t.data_ordenacao + 'T12:00:00');
    return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear() &&
           t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (filtroCartao === 'Todos' || t.forma_pagamento.includes(filtroCartao));
  }), [transacoes, selectedDate, searchTerm, filtroCartao]);

  const saldoCalculado = saldoInicial + transacoes.filter(t => t.pago).reduce((acc, t) => acc + t.valor, 0);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-blue-600"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black antialiased overflow-x-hidden pb-10 italic uppercase relative leading-none">
      
      {/* TOUR MODAL OTIMIZADO */}
      {tourStep > 0 && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 pointer-events-none">
          <div className="pointer-events-auto bg-gradient-to-b from-blue-600 to-blue-800 p-8 rounded-[3rem] border-[3px] border-white/20 shadow-2xl max-w-sm w-full animate-in zoom-in relative text-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-700 px-4 py-1.5 rounded-full text-[10px] shadow-xl border-2 border-blue-600 font-black">PASSO {tourStep} / 5</div>
            <button onClick={() => {setTourStep(0); localStorage.setItem('wolf_tour_complete', 'true');}} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={18}/></button>
            <div className="py-4">
              <div className="mb-4">{TOUR_CONTENT[tourStep-1].icon}</div>
              <h3 className="text-2xl mb-4 italic tracking-tighter">{TOUR_CONTENT[tourStep-1].title}</h3>
              <p className="text-[10px] normal-case mb-8 italic text-blue-50 leading-tight">{TOUR_CONTENT[tourStep-1].desc}</p>
              <button onClick={() => tourStep === 5 ? setTourStep(0) : setTourStep(s => s + 1)} className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase transition-all duration-300 hover:tracking-[0.2em] active:scale-95 ${tourStep === 5 ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 'bg-white text-blue-700 shadow-xl'}`}>
                {tourStep === 5 ? 'Finalizar' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER INSTALAÇÃO PWA */}
      {showInstallPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-10">
          <div className="bg-blue-600 p-5 rounded-[2.5rem] border-2 border-white shadow-2xl flex flex-col gap-3 relative hover:scale-[1.01] transition-transform duration-300">
            <button onClick={() => {localStorage.setItem('wolf_install_prompt_v1', 'true'); setShowInstallPrompt(false);}} className="absolute top-4 right-4 bg-white/20 p-1 rounded-full"><X size={16}/></button>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg"><img src="/logo.png" className="w-8 h-8 object-contain" /></div>
              <div className="leading-tight"><h3 className="text-[11px] font-black italic">INSTALAR WOLF FINANCE</h3><p className="text-[8px] normal-case opacity-90 italic">Adicione o ícone na sua tela de início.</p></div>
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
      <header className="mb-6 bg-[#111827] p-4 md:p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-10 h-10 object-contain" />
            <div className="leading-none">
              <h1 className="text-lg md:text-xl tracking-tighter italic font-black">WOLF FINANCE</h1>
              <div className="flex items-center gap-2 mt-1 text-[9px] font-black italic">
                <span className={theme.text}>OLÁ, {user?.user_metadata?.full_name?.split(' ')[0]}</span>
                <span className="px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-500"><Clock size={8} className="inline mr-1"/>{diasRestantes} DIAS</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/tutorial')} className="bg-slate-800 text-blue-400 p-2.5 rounded-full border border-blue-500/30 shadow-lg hover:bg-blue-600 hover:text-white transition-all active:scale-90"><HelpCircle size={20}/></button>
            <button onClick={() => router.push('/perfil')} className="bg-slate-800 text-slate-300 p-2.5 rounded-full border border-slate-700 shadow-lg hover:bg-slate-700 hover:text-white transition-all active:scale-90"><UserCircle size={20}/></button>
          </div>
        </div>
        <div className="flex gap-2">
           <ActionButton icon={<Coins size={14}/>} label="Saldo" active={tourStep === 2} onClick={() => setIsSaldoModalOpen(true)} color="emerald" />
           <ActionButton icon={<CreditCard size={14}/>} label="Cartão" active={tourStep === 3} onClick={() => router.push('/cartoes')} color="slate" />
           <ActionButton icon={<Plus size={18}/>} label="Novo" active={tourStep === 4} onClick={() => router.push('/lancamento')} color="theme" themeColor={theme.primary} />
        </div>
      </header>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <Card title="Saldo Pago" value={`R$ ${formatarMoeda(saldoCalculado)}`} icon={<Banknote size={20}/>} border={theme.border} />
        <Card title="Gasto Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter(t=>t.valor<0).reduce((a,b)=>a+b.valor,0))}`} icon={<CreditCard size={20}/>} border="border-rose-600" onClick={() => router.push('/detalhes-gastos')} />
        <Card title="Entrada Mês" value={`R$ ${formatarMoeda(transacoesFiltradas.filter(t=>t.valor>0).reduce((a,b)=>a+b.valor,0))}`} icon={<TrendingUp size={20}/>} border="border-emerald-600" />
        <div className="bg-[#111827] p-4 rounded-[1.5rem] border-b-8 border-amber-500 h-32 flex flex-col justify-between shadow-2xl relative">
           <div className="flex justify-between items-center text-[9px] border-b border-white/10 pb-2 font-black italic">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="hover:text-amber-500 transition-colors"><ChevronLeft size={16}/></button>
              <span>{selectedDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="hover:text-amber-500 transition-colors"><ChevronRight size={16}/></button>
           </div>
           <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="w-full flex items-center justify-between text-[9px] bg-slate-800/50 p-2 rounded-lg border border-slate-700 mt-2 truncate italic font-black hover:bg-slate-700 transition-colors">
             <span className="truncate">{filtroCartao}</span><ChevronDown size={12}/>
           </button>
           {isFilterMenuOpen && (
             <div className="absolute bottom-1/4 left-4 right-4 bg-[#111827] border-2 border-slate-800 rounded-xl shadow-2xl z-[500] max-h-40 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2">
               <button onClick={() => { setFiltroCartao('Todos'); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] hover:bg-slate-800 font-black italic">Todos</button>
               {cartoes.map(c => <button key={c.id} onClick={() => { setFiltroCartao(`${c.banco} - ${c.nome_cartao}`); setIsFilterMenuOpen(false); }} className="w-full text-left p-3 border-b border-slate-800 text-[9px] hover:bg-slate-800 font-black italic">{c.banco} - {c.nome_cartao}</button>)}
             </div>
           )}
        </div>
      </div>

      {/* CHART */}
      <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl h-80 mb-6 hover:border-slate-700 transition-colors duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[...transacoesFiltradas].reverse().map(t => ({ data: t.data_ordenacao.split('-').reverse().slice(0,2).join('/'), valor: Math.abs(t.valor) }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="data" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontWeight: '900'}} itemStyle={{color: '#fff'}} />
            <Area type="monotone" dataKey="valor" stroke={theme.chart} fill={theme.chart} fillOpacity={0.1} strokeWidth={4} animationDuration={2000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl font-black italic">
          <h2 className="mb-6 text-[10px] tracking-[0.3em] uppercase opacity-40">Meus Cartões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartoes.map(c => (
              <div key={c.id} className="p-4 border-2 border-slate-800 rounded-2xl flex justify-between bg-slate-950/50 hover:border-blue-500 hover:scale-[1.02] transition-all duration-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden shadow-inner">
                    <img src={c.logo_url} className="w-full h-full object-contain p-1" />
                  </div>
                  <div><p className="text-[8px] text-slate-500 uppercase">{c.banco}</p><p className="text-xs uppercase italic font-black">{c.nome_cartao}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push('/cartoes')} className="text-slate-600 hover:text-white transition-colors"><Pencil size={18}/></button>
                  <button onClick={async () => { if(confirm("Apagar?")) { await supabase.from('cartoes').delete().eq('id', c.id); fetchDados(user.id); showAlert("Cartão removido!"); } }} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl min-h-[500px] flex flex-col font-black italic">
          <h2 className="mb-4 text-[10px] tracking-[0.3em] uppercase opacity-40">Atividade</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-[9px] outline-none font-black italic focus:border-blue-500 transition-colors" />
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
            {transacoesFiltradas.map((t) => (
              <div key={t.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${t.pago ? 'bg-slate-800/40 border-slate-800' : 'bg-rose-900/10 border-rose-900/30'} ${tourStep === 5 ? 'relative z-[10001] ring-4 ring-white shadow-[0_0_0_9999px_rgba(10,15,29,0.7)]' : 'hover:scale-[1.02] hover:bg-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <button onClick={async () => { await supabase.from('transacoes').update({ pago: !t.pago }).eq('id', t.id); fetchDados(user.id); }} className={`p-1.5 rounded-full transition-all active:scale-90 ${t.pago ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-800 hover:text-white'}`}>{t.pago ? <CheckCircle size={18}/> : <Circle size={18}/>}</button>
                  <div className="leading-tight truncate max-w-[120px]"><p className="text-[10px] uppercase font-black">{t.descricao}</p><p className={`text-[7px] uppercase font-black ${theme.text}`}>{t.forma_pagamento}</p></div>
                </div>
                <p className={`text-[10px] font-black ${t.valor > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {formatarMoeda(t.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER - NÃO FIXO */}
      <footer className="relative mt-12 pb-8 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 font-black italic pointer-events-none">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>

      {/* MODAL SALDO */}
      {isSaldoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[6000]">
          <div className="bg-[#111827] w-full max-w-sm rounded-[3rem] p-10 border-4 border-slate-800 shadow-2xl relative text-center italic font-black animate-in zoom-in duration-300">
            <button onClick={() => setIsSaldoModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"><X size={20}/></button>
            <h2 className="text-xl mb-8 text-emerald-500 uppercase italic">Saldo Bancário</h2>
            <div className="relative mb-6">
              <label className="absolute -top-2 left-3 bg-[#111827] px-1 text-[7px] text-emerald-500 uppercase font-black">Valor em conta</label>
              <input type="text" value={saldoDisplay} onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                v = (Number(v) / 100).toFixed(2).replace('.', ',');
                v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                setSaldoDisplay(v);
              }} placeholder="R$ 0,00" className="w-full p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 text-emerald-500 text-xl font-black text-center outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <button onClick={async () => { 
                const v = Number(saldoDisplay.replace(/\./g, '').replace(',', '.')); 
                await supabase.from('profiles').update({ saldo_inicial: v }).eq('id', user.id); 
                setSaldoInicial(v); setIsSaldoModalOpen(false); setSaldoDisplay(''); fetchDados(user.id); showAlert("Saldo ajustado!"); 
              }} className="w-full bg-emerald-600 py-5 rounded-[2rem] text-[10px] uppercase font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:tracking-widest active:scale-95 transition-all">Confirmar Novo Saldo</button>
          </div>
        </div>
      )}

      <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; } `}</style>
    </div>
  );
}

// COMPONENTES AUXILIARES OTIMIZADOS
function ActionButton({ icon, label, active, onClick, color, themeColor }: any) {
  const base = "flex-1 p-3 rounded-2xl border text-[10px] flex items-center justify-center gap-2 transition-all duration-300 font-black active:scale-95 ease-out italic uppercase";
  const colors: any = {
    emerald: "border-emerald-800/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-800/30 hover:border-emerald-500",
    slate: "border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500",
    theme: `${themeColor} text-white shadow-xl hover:brightness-110`
  };
  const highlight = active ? "relative z-[10001] bg-opacity-100 ring-4 ring-white animate-pulse shadow-[0_0_0_9999px_rgba(10,15,29,0.7)]" : "";
  return <button onClick={onClick} className={`${base} ${colors[color]} ${highlight} hover:-translate-y-1 hover:shadow-2xl`}>{icon} {label}</button>;
}

function Card({ title, value, icon, border, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`bg-[#111827] p-4 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] border-b-8 ${border} h-32 md:h-36 flex flex-col justify-between shadow-2xl transition-all duration-500 italic font-black
      ${onClick ? 'cursor-pointer hover:scale-[1.05] hover:bg-[#161e2e] hover:border-b-[12px] active:scale-95' : ''}`}
    >
      <div className="flex justify-between items-start opacity-30 tracking-widest"><span className="text-[7px] md:text-[10px] uppercase">{title}</span>{icon}</div>
      <div className="text-sm md:text-2xl truncate tracking-tighter uppercase">{value}</div>
    </div>
  );
}