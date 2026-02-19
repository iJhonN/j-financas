'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, TrendingUp, Fuel, Wrench, Navigation, 
  Plus, History, PieChart, ArrowLeft, Loader2,
  RefreshCcw, Bike, Zap, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Mapeamento para garantir que a logo correta seja encontrada
const MARCAS_MAPPING = [
  { nome: 'Fiat', slug: 'fiat' }, { nome: 'Volkswagen', slug: 'volkswagen' },
  { nome: 'Chevrolet', slug: 'chevrolet' }, { nome: 'Ford', slug: 'ford' },
  { nome: 'Toyota', slug: 'toyota' }, { nome: 'Hyundai', slug: 'hyundai' },
  { nome: 'Honda', slug: 'honda' }, { nome: 'Renault', slug: 'renault' },
  { nome: 'Mottu', slug: 'mottu' }, { nome: 'Yamaha', slug: 'yamaha' },
  { nome: 'Shineray', slug: 'shineray' }, { nome: 'Harley', slug: 'harley' },
  { nome: 'Honda Motos', slug: 'hondamoto' }
];

export default function DriverDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [resumo, setResumo] = useState({ rendimento: 0, ganhos: 0, despesas: 0 });
  const [veiculoAtivo, setVeiculoAtivo] = useState<any>(null);

  const fetchDadosDriver = useCallback(async (userId: string) => {
    try {
      // 1. Busca o último veículo cadastrado (ou ativo)
      const { data: vData } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (vData) setVeiculoAtivo(vData);

      // 2. Busca Ganhos (Soma Espécie + Cartão)
      const { data: ganhos } = await supabase
        .from('driver_ganhos')
        .select('valor_especie, valor_cartao')
        .eq('user_id', userId);

      // 3. Busca Despesas (Agora na tabela exclusiva driver_despesas)
      const { data: despesas } = await supabase
        .from('driver_despesas')
        .select('valor')
        .eq('user_id', userId);

      const totalGanhos = ganhos?.reduce((acc, g) => acc + Number(g.valor_especie) + Number(g.valor_cartao), 0) || 0;
      const totalDespesas = despesas?.reduce((acc, d) => acc + Number(d.valor), 0) || 0;

      setResumo({
        ganhos: totalGanhos,
        despesas: totalDespesas,
        rendimento: totalGanhos - totalDespesas
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUser(session.user);
      await fetchDadosDriver(session.user.id);
    };
    init();
  }, [router, fetchDadosDriver]);

  const getLogoSlug = (modelo: string) => {
    if (!modelo) return 'default';
    const marcaEncontrada = MARCAS_MAPPING.find(m => modelo.toUpperCase().startsWith(m.nome.toUpperCase()));
    return marcaEncontrada ? marcaEncontrada.slug : 'default';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-amber-500"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-12">
      
      {/* HEADER OPERACIONAL */}
      <header className="flex justify-between items-center mb-8 bg-[#111827] p-6 rounded-[2rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 border border-slate-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl tracking-tighter italic font-black">WOLF DRIVER</h1>
            <p className="text-[9px] text-amber-500 tracking-widest font-black italic">SUA GARAGEM NA ALCATEIA</p>
          </div>
        </div>
        <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl border border-amber-500/20 shadow-lg">
          <Zap size={24} />
        </div>
      </header>

      {/* CARDS DE PERFORMANCE FINANCEIRA - AGORA COM REDIRECIONAMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ResumoCard 
          title="Lucro Operacional" 
          value={resumo.rendimento} 
          color="border-blue-600" 
          textColor="text-blue-400" 
          onClick={() => router.push('/driver/consultas')} 
        />
        <ResumoCard 
          title="Recebimentos" 
          value={resumo.ganhos} 
          color="border-emerald-600" 
          textColor="text-emerald-500" 
          onClick={() => router.push('/driver/ganhos/lista')} 
        />
        <ResumoCard 
          title="Custos Operacionais" 
          value={resumo.despesas} 
          color="border-rose-600" 
          textColor="text-rose-500" 
          onClick={() => router.push('/driver/despesas/lista')} 
        />
      </div>

      {/* BOTÕES DE AÇÃO RÁPIDA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MenuButton icon={<TrendingUp />} label="Lançar Ganho" color="bg-emerald-600" onClick={() => router.push('/driver/ganhos')} />
        <MenuButton icon={<Wrench />} label="Nova Despesa" color="bg-rose-600" onClick={() => router.push('/driver/despesas')} />
        <MenuButton icon={<Car />} label="Minha Garagem" color="bg-slate-800" onClick={() => router.push('/driver/veiculos')} />
        <MenuButton icon={<PieChart />} label="Relatórios" color="bg-slate-800" onClick={() => router.push('/driver/relatorios')} />
      </div>

      {/* STATUS DO VEÍCULO EM OPERAÇÃO */}
      <div className="bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Navigation size={120} />
        </div>
        
        <h2 className="text-[10px] tracking-[0.3em] opacity-40 mb-6 font-black italic">VEÍCULO EM USO</h2>
        
        {veiculoAtivo ? (
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-3 shadow-inner border-4 border-slate-700 overflow-hidden">
                <img 
                  src={`/carlogos/${getLogoSlug(veiculoAtivo.modelo)}.png`} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  onError={(e: any) => e.target.src = "/logo.png"} 
                />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight italic uppercase">{veiculoAtivo.modelo}</p>
                <div className="flex items-center gap-3 mt-1">
                   {veiculoAtivo.tipo === 'moto' ? <Bike size={14} className="text-slate-500" /> : <Car size={14} className="text-slate-500" />}
                   <span className="text-[11px] text-amber-500 font-black tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                    {veiculoAtivo.placa.slice(0,3)}-{veiculoAtivo.placa.slice(3)}
                   </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-black italic">KM ATUAL: {Number(veiculoAtivo.km_atual).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => router.push('/driver/veiculos')} className="bg-slate-800 hover:bg-amber-600 text-amber-500 hover:text-white p-4 rounded-2xl border border-amber-500/20 transition-all active:scale-95 shadow-lg group">
              <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        ) : (
          <div className="text-center py-6 relative z-10 border-2 border-dashed border-slate-800 rounded-[2rem]">
            <p className="text-xs text-slate-500 mb-4 font-black italic uppercase tracking-widest">NENHUM VEÍCULO VINCULADO</p>
            <button onClick={() => router.push('/driver/veiculos')} className="bg-amber-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black hover:bg-amber-500 transition-all shadow-lg active:scale-95 italic">ADICIONAR À GARAGEM</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic uppercase">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}

// Componentes Auxiliares Atualizados
function ResumoCard({ title, value, color, textColor, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#111827] p-6 rounded-[2.5rem] border-b-8 ${color} shadow-2xl transition-all hover:translate-y-[-4px] active:scale-95 cursor-pointer group`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[9px] tracking-widest opacity-40 mb-3 font-black uppercase italic">{title}</p>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
      </div>
      <p className={`text-2xl font-black italic ${textColor}`}>{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
    </div>
  );
}

function MenuButton({ icon, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`${color} p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 shadow-xl hover:scale-[1.03] hover:brightness-110 transition-all active:scale-95 border border-white/5 group`}>
      <div className="transition-transform duration-300 group-hover:scale-110 text-white">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <span className="text-[10px] font-black tracking-tighter uppercase italic">{label}</span>
    </button>
  );
}