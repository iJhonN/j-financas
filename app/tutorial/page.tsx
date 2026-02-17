'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, UserCircle, ChevronLeft, Info, HelpCircle, 
  ArrowDownCircle, CreditCard, Banknote
} from 'lucide-react';

// Reutilizamos as constantes de estilo para manter o visual idêntico
const STYLES = {
  card: "bg-[#111827] border-4 border-slate-800 rounded-[2.5rem] relative overflow-hidden transition-all duration-300",
  btnIcon: "flex items-center justify-center p-2.5 rounded-full border-2 border-slate-700 bg-slate-800 text-slate-300 shadow-md"
};

export default function TutorialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-2 md:p-8 font-black italic uppercase relative">
      
      {/* OVERLAY DE INSTRUÇÃO (O que aparece por cima) */}
      <div className="fixed inset-0 bg-blue-600/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl border-4 border-white max-w-md animate-in zoom-in duration-300">
          <HelpCircle size={48} className="mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl mb-4">Modo Tutorial</h2>
          <p className="text-[10px] leading-relaxed mb-6">
            ESTA É UMA CÓPIA DA SUA HOME. AQUI VOCÊ PODE ENTENDER ONDE FICA CADA FUNÇÃO SEM MEDO DE ALTERAR SEUS DADOS REAIS.
          </p>
          <button 
            onClick={() => router.push('/')} 
            className="w-full bg-white text-blue-600 py-4 rounded-2xl text-[12px]"
          >
            ENTENDI, VOLTAR PARA O SISTEMA
          </button>
        </div>
      </div>

      {/* --- O "CLONE" VISUAL ABAIXO DO OVERLAY --- */}
      <header className={`${STYLES.card} p-4 md:p-6 mb-6 opacity-50`}>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-10 h-10" alt="Logo" />
            <h1 className="text-xl tracking-tighter">WOLF FINANCE</h1>
          </div>
          <div className={STYLES.btnIcon}><UserCircle size={20} /></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 opacity-50">
        <div className={`${STYLES.card} p-6 border-b-8 border-emerald-600`}>
          <span className="text-[9px] text-slate-500">EXEMPLO DE SALDO</span>
          <div className="flex items-center justify-between">
            <span className="text-xl italic">R$ 5.000,00</span>
            <Info size={14} className="text-emerald-500" />
          </div>
        </div>
        <div className={`${STYLES.card} p-6 border-b-8 border-rose-600`}>
          <span className="text-[9px] text-slate-500">EXEMPLO DE GASTO</span>
          <span className="text-xl italic">R$ 1.200,00</span>
        </div>
      </div>

      {/* BOTÃO DE ADICIONAR COM DESTAQUE */}
      <div className="relative z-[60]">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-2 rounded-full text-[10px] whitespace-nowrap animate-pulse">
          CLIQUE AQUI PARA NOVOS LANÇAMENTOS
        </div>
        <button className="w-full bg-blue-600 py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl">
          <Plus size={20} /> <span className="text-[12px]">NOVO LANÇAMENTO</span>
        </button>
      </div>

    </div>
  );
}