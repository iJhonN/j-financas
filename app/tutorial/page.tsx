'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, UserCircle, ChevronLeft, HelpCircle, 
  CreditCard, Banknote, Coins, TrendingUp, 
  CheckCircle, Circle, Zap, Info, Clock
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
        <p className="text-[10px] text-blue-400 tracking-[0.2em]">DOMINE A GESTÃO</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA 1: LÓGICA FINANCEIRA */}
        <div className="space-y-6">
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Coins size={24} />
              <h2 className="text-sm">COMO O SALDO É CALCULADO?</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 normal-case italic mb-4">
              O sistema utiliza uma fórmula de fluxo de caixa real:
            </p>
            <div className="bg-black/40 p-4 rounded-2xl border border-slate-800 text-center mb-4">
              <span className="text-xs text-white">SALDO INICIAL + RECEITAS PAGAS - DESPESAS PAGAS</span>
            </div>
            <p className="text-[9px] text-slate-500 normal-case italic">
              * Lançamentos pendentes (círculo vazio) não alteram seu saldo até que você clique para confirmar o pagamento.
            </p>
          </section>

          

          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <Zap size={24} />
              <h2 className="text-sm">TIPOS DE LANÇAMENTO</h2>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-[11px] mb-1">⚡ PIX / DINHEIRO</h3>
                <p className="text-[9px] text-slate-400 normal-case italic">Entra no sistema como "PAGO" instantaneamente. Ideal para vendas rápidas no balcão da loja.</p>
              </div>
              <div className="border-l-4 border-rose-600 pl-4">
                <h3 className="text-[11px] mb-1">💳 CRÉDITO PARCELADO</h3>
                <p className="text-[9px] text-slate-400 normal-case italic">Ao escolher parcelas, o Wolf cria automaticamente os lançamentos para os próximos meses, respeitando o dia de vencimento do cartão.</p>
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA 2: INTERFACE E AÇÕES */}
        <div className="space-y-6">
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6 text-blue-400">
              <CheckCircle size={24} />
              <h2 className="text-sm">CONTROLE DE ATIVIDADE</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <CheckCircle className="text-emerald-500" size={24} />
                <p className="text-[9px] text-slate-300 italic normal-case">LANÇAMENTO CONCLUÍDO: VALOR JÁ FOI LIQUIDADO NA CONTA BANCÁRIA.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                <Circle className="text-slate-600" size={24} />
                <p className="text-[9px] text-slate-300 italic normal-case">LANÇAMENTO PENDENTE: PREVISÃO DE GASTO OU ENTRADA (AINDA NÃO LIQUIDADO).</p>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center group">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-lg mb-2">SISTEMA BLINDADO</h2>
            <p className="text-[10px] mb-6 normal-case italic text-blue-100">
              TODOS OS SEUS DADOS SÃO CRIPTOGRAFADOS E ARMAZENADOS COM SEGURANÇA MÁXIMA.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-white text-blue-600 py-5 rounded-2xl text-[11px] font-black shadow-xl active:scale-95 transition-all"
            >
              VOLTAR AO SISTEMA REAL
            </button>
          </section>
        </div>

      </div>

      <footer className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
           <Clock size={12} className="text-amber-500" />
           <span className="text-[8px] text-slate-500 tracking-[0.2em]">WOLF FINANCE v2.0 - SUPORTE TÉCNICO ATIVO</span>
        </div>
      </footer>
    </div>
  );
}

// Subcomponente ShieldCheck caso não esteja no import
function ShieldCheck({ size }: { size: number }) {
  return <ShieldCheckIcon size={size} />;
}
import { ShieldCheck as ShieldCheckIcon } from 'lucide-react';