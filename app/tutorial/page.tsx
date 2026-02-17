'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, UserCircle, ChevronLeft, HelpCircle, 
  CreditCard, Banknote, Coins, TrendingUp, 
  CheckCircle, Circle, Zap, Info, Clock,
  RefreshCcw, ShieldCheck as ShieldCheckIcon
} from 'lucide-react';

export default function ManualWolf() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black antialiased uppercase italic leading-none">
      
      {/* CABEÇALHO DO MANUAL */}
      <header className="flex flex-col gap-4 mb-8 bg-[#111827] p-6 rounded-[2rem] border-2 border-blue-600 shadow-2xl relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')} 
              className="bg-slate-800 p-2.5 rounded-full border border-slate-700 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              <ChevronLeft size={24}/>
            </button>
            <h1 className="text-xl md:text-2xl tracking-tighter">MANUAL DE OPERAÇÃO</h1>
          </div>
          <HelpCircle size={32} className="text-blue-500 animate-pulse" />
        </div>
        <p className="text-[10px] text-blue-400 tracking-[0.2em]">DOMINE A GESTÃO WOLF</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA 1: LÓGICA FINANCEIRA E CARTÕES */}
        <div className="space-y-6">
          {/* SEÇÃO CARTÕES - SEGURANÇA */}
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl border-t-amber-500/50">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <CreditCard size={24} />
              <h2 className="text-sm">GESTÃO DE CARTÕES</h2>
            </div>
            <div className="bg-rose-900/20 p-4 rounded-2xl border border-rose-500/30 mb-4">
              <p className="text-[9px] text-rose-200 normal-case leading-tight font-black italic">
                ⚠️ <span className="uppercase">Aviso de Segurança:</span> Não é necessário (nem recomendado) colocar dados reais do seu cartão como número ou código.
              </p>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 normal-case italic">
              Coloque apenas o <span className="text-white font-black uppercase">Essencial</span>: O nome do banco para você se organizar e o <span className="text-white font-black uppercase">Dia de Vencimento</span>. O Wolf usa esse dia apenas para calcular quando as parcelas aparecerão no gráfico.
            </p>
          </section>

          {/* SEÇÃO RECORRÊNCIA */}
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl border-t-purple-500/50">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <RefreshCcw size={24} />
              <h2 className="text-sm">CONTAS FIXAS (RECORRÊNCIA)</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 normal-case italic">
              Tem gastos que se repetem todo mês (Aluguel, Luz, Software)? Ative o botão de <span className="text-purple-400 font-black uppercase tracking-tighter">Recorrência</span>. O sistema irá projetar automaticamente os próximos 12 meses, poupando seu tempo.
            </p>
          </section>

          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Coins size={24} />
              <h2 className="text-sm">FÓRMULA DO SALDO</h2>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 text-center mb-4">
              <span className="text-xs text-white">SALDO INICIAL + RECEITAS PAGAS - DESPESAS PAGAS</span>
            </div>
            <p className="text-[9px] text-slate-500 normal-case italic">
              * Lançamentos pendentes (círculo vazio) não alteram seu saldo até que o pagamento seja confirmado.
            </p>
          </section>
        </div>

        {/* COLUNA 2: INTERFACE E AÇÕES */}
        <div className="space-y-6">
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6 text-blue-400">
              <CheckCircle size={24} />
              <h2 className="text-sm">STATUS DE PAGAMENTO</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <CheckCircle className="text-emerald-500" size={24} />
                <p className="text-[9px] text-slate-300 italic normal-case font-black uppercase">PAGO: O dinheiro já saiu ou entrou na sua conta real.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <Circle className="text-slate-600" size={24} />
                <p className="text-[9px] text-slate-300 italic normal-case font-black uppercase">PENDENTE: Uma previsão de gasto ou ganho futuro.</p>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center group active:scale-[0.98] transition-all cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheckIcon size={40} />
            </div>
            <h2 className="text-lg mb-2 tracking-tighter">VOLTAR AO SISTEMA</h2>
            <p className="text-[10px] mb-6 normal-case italic text-blue-100">
              DADOS CRIPTOGRAFADOS E PROTEÇÃO WOLF ATIVA.
            </p>
            <div className="w-full bg-white text-blue-600 py-5 rounded-2xl text-[11px] font-black shadow-xl">
              RETORNAR À HOME
            </div>
          </section>
        </div>

      </div>

      <footer className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
           <Clock size={12} className="text-amber-500" />
           <span className="text-[8px] text-slate-500 tracking-[0.2em]">WOLF FINANCE v2.1 - SEGURANÇA MÁXIMA</span>
        </div>
      </footer>
    </div>
  );
}