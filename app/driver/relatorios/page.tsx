'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, PieChart, BarChart3, 
  ChevronLeft, ChevronRight, Fuel, Utensils, 
  Wrench, Car, Zap, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart as RePie, Pie 
} from 'recharts';
import { supabase } from '@/lib/supabase';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RelatoriosDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estados de Dados
  const [dadosGanhos, setDadosGanhos] = useState<any[]>([]);
  const [dadosGastos, setDadosGastos] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelatorios = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      // Busca Ganhos e Gastos do mês selecionado
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString();

      const { data: ganhos } = await supabase
        .from('driver_ganhos')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('data_trabalho', startOfMonth)
        .lte('data_trabalho', endOfMonth);

      const { data: gastos } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('eh_driver', true)
        .gte('data_ordenacao', startOfMonth.split('T')[0])
        .lte('data_ordenacao', endOfMonth.split('T')[0]);

      setDadosGanhos(ganhos || []);
      setDadosGastos(gastos || []);
      setLoading(false);
    };
    fetchRelatorios();
  }, [selectedDate, router]);

  // Lógica para o Gráfico de Barras (Semanas)
  const chartDataSemanal = useMemo(() => {
    const semanas: any = { 'Semana 1': 0, 'Semana 2': 0, 'Semana 3': 0, 'Semana 4': 0 };
    dadosGanhos.forEach(g => {
      const dia = new Date(g.data_trabalho).getDate();
      const numSemana = Math.min(Math.ceil(dia / 7), 4);
      semanas[`Semana ${numSemana}`] += (Number(g.valor_especie) + Number(g.valor_cartao));
    });
    return Object.keys(semanas).map(name => ({ name, valor: semanas[name] }));
  }, [dadosGanhos]);

  // Lógica para o Gráfico de Pizza (Categorias)
  const pizzaData = useMemo(() => {
    const cats: any = {};
    dadosGastos.forEach(g => {
      const nome = g.descricao.includes('COMBUSTIVEL') ? 'Combustível' : 
                   g.descricao.includes('ALIMENTAÇÃO') ? 'Alimentação' : 'Outros';
      cats[nome] = (cats[nome] || 0) + Math.abs(Number(g.valor));
    });
    return Object.keys(cats).map(name => ({ name, value: cats[name] }));
  }, [dadosGastos]);

  const totalGanhos = dadosGanhos.reduce((acc, g) => acc + Number(g.valor_especie) + Number(g.valor_cartao), 0);
  const totalGastos = dadosGastos.reduce((acc, g) => acc + Math.abs(Number(g.valor)), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-20">
      
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border-2 border-slate-700 active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl tracking-tighter italic">RELATÓRIOS</h1>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}><ChevronLeft size={14} className="text-amber-500"/></button>
              <span className="text-[10px] text-slate-400 tracking-widest">
                {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}><ChevronRight size={14} className="text-amber-500"/></button>
            </div>
          </div>
        </div>
        <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20">
          <BarChart3 size={24} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO DE RENDIMENTO SEMANAL */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl">
          <h2 className="text-[10px] tracking-widest opacity-40 mb-8 font-black">RENDIMENTO LÍQUIDO / SEMANA</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataSemanal}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#475569'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
                  {chartDataSemanal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* DISTRIBUIÇÃO DE CUSTOS */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl">
          <h2 className="text-[10px] tracking-widest opacity-40 mb-8 font-black">DISTRIBUIÇÃO DE CUSTOS</h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie data={pizzaData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pizzaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePie>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[8px] text-slate-500">TOTAL GASTO</p>
              <p className="text-sm font-black text-rose-500">R$ {totalGastos.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* RESUMO DE PERFORMANCE (Inspirado no final do seu print) */}
        <section className="lg:col-span-2 bg-[#111827] p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl">
          <h2 className="text-[10px] tracking-widest opacity-40 mb-6 font-black text-center">RESUMO DE PERFORMANCE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsBox label="DIAS TRABALHADOS" value={new Set(dadosGanhos.map(g => g.data_trabalho)).size.toString()} icon={<Zap className="text-amber-500"/>} />
            <StatsBox label="MÉDIA RECEBIMENTO" value={`R$ ${(totalGanhos / (dadosGanhos.length || 1)).toFixed(2)}`} icon={<TrendingUp className="text-emerald-500"/>} />
            <StatsBox label="LUCRO LÍQUIDO MÊS" value={`R$ ${(totalGanhos - totalGastos).toFixed(2)}`} icon={<Car className="text-blue-500"/>} />
          </div>
        </section>

      </div>

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}

function StatsBox({ label, value, icon }: any) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner mb-2">{icon}</div>
      <p className="text-[8px] text-slate-500 tracking-[0.2em] font-black">{label}</p>
      <p className="text-xl font-black italic">{value}</p>
    </div>
  );
}