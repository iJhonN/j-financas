'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, UserCircle, ChevronLeft, HelpCircle, 
  CreditCard, Banknote, Coins, TrendingUp, Search, Info
} from 'lucide-react';

export default function TutorialWolf() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-2 md:p-8 text-white font-black antialiased uppercase italic leading-none">
      
      {/* HEADER DO TUTORIAL */}
      <header className="flex flex-col gap-4 mb-8 bg-[#111827] p-6 rounded-[2rem] border-2 border-blue-500 shadow-2xl relative">
        <div className="absolute -top-3 left-6 bg-blue-600 px-3 py-1 rounded-full text-[8px] animate-pulse">
          MODO INSTRUTIVO
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-all">
              <ChevronLeft size={20}/>
            </button>
            <h1 className="text-xl tracking-tighter">MANUAL WOLF FINANCE</h1>
          </div>
          <HelpCircle size={24} className="text-blue-400" />
        </div>
        <p className="text-[10px] text-slate-400">APRENDA A DOMINAR SUA GESTÃO DE ELITE</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EXPLICAÇÃO DOS CARDS */}
        <div className="space-y-6">
          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Coins size={20} />
              <h2 className="text-sm">SALDO CALCULADO</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 normal-case italic">
              O sistema soma seu <span className="text-white font-black">SALDO INICIAL</span> (definido no botão verde) com todas as transações marcadas como <span className="text-emerald-500 font-black">PAGAS</span>. 
              Lançamentos pendentes não afetam este valor até que você confirme o pagamento.
            </p>
          </section>

          <section className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <Plus size={20} />
              <h2 className="text-sm">LANÇAMENTOS WOLF</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1 rounded">1</div>
                <p className="text-[9px] text-slate-300">⚡ PIX: É lançado como "Dinheiro" e marcado como PAGO automaticamente.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1 rounded">2</div>
                <p className="text-[9px] text-slate-300">💳 CRÉDITO: O sistema calcula a data de vencimento com base no dia que você configurou no cartão.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-blue-600 p-1 rounded">3</div>
                <p className="text-[9px] text-slate-300">🔄 PARCELAS: Ao definir parcelas, o Wolf cria automaticamente os lançamentos para os meses seguintes.</p>
              </div>
            </div>
          </section>
        </div>

        {/* EXPLICAÇÃO DE INTERFACE */}
        <div className="space-y-6">
          <div className="bg-[#111827] p-6 rounded-[2.5rem] border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-sm">STATUS DE PAGAMENTO</h2>
               <div className="flex gap-2">
                 <CheckCircle size={18} className="text-emerald-500" />
                 <Circle size={18} className="text-slate-600" />
               </div>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 normal-case italic mb-4">
              Clique no círculo ao lado da transação na sua lista de atividade para alternar entre:
            </p>
            <ul className="space-y-2 text-[9px]">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"/> EFETUADO: O valor já saiu ou entrou na conta.</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full"/> PENDENTE: Gasto planejado, mas ainda não liquidado.</li>
            </ul>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center">
             <UserCircle size={40} className="mb-4" />
             <h2 className="text-lg mb-2">CUSTOMIZAÇÃO</h2>
             <p className="text-[10px] mb-6">NO SEU PERFIL, VOCÊ PODE ALTERAR O TEMA DO SISTEMA PARA COMBINAR COM A IDENTIDADE DA SUA ALCATEIA.</p>
             <button 
              onClick={() => router.push('/')}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-xs font-black shadow-xl active:scale-95 transition-all"
             >
               VOLTAR AO TRABALHO
             </button>
          </div>
        </div>

      </div>

      <footer className="mt-12 text-center text-[8px] text-slate-600 tracking-[0.3em]">
        WOLF FINANCE - SISTEMA DE GESTÃO DE ELITE - VERSÃO 2026
      </footer>
    </div>
  );
}