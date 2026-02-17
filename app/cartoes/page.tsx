'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, CreditCard, Plus, Trash2, ShieldCheck, 
  Save, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CartoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartoes, setCartoes] = useState<any[]>([]);
  
  // Estados do formulário
  const [banco, setBanco] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        fetchCartoes(session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchCartoes = async (userId: string) => {
    const { data } = await supabase.from('cartoes').select('*').eq('user_id', userId);
    if (data) setCartoes(data);
    setLoading(false);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBanco = banco.toUpperCase();
    const logoUrl = `/logos/${cleanBanco.toLowerCase().trim().replace(/\s+/g, '')}.svg`;

    const { error } = await supabase.from('cartoes').insert([{
      banco: cleanBanco,
      nome_cartao: nomeCartao.toUpperCase(),
      vencimento: Number(vencimento),
      logo_url: logoUrl,
      user_id: user.id
    }]);

    if (!error) {
      setBanco(''); setNomeCartao(''); setVencimento('');
      fetchCartoes(user.id);
    }
  };

  const handleDeletar = async (id: string) => {
    if (!confirm("REMOVER ESTE CARTÃO DA ALCATEIA?")) return;
    await supabase.from('cartoes').delete().eq('id', id);
    fetchCartoes(user.id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black antialiased uppercase italic leading-none relative pb-32">
      
      <header className="flex items-center gap-4 mb-8 max-w-4xl mx-auto">
        <button onClick={() => router.push('/')} className="bg-slate-800 p-2.5 rounded-full border border-slate-700 active:scale-90 transition-all">
          <ChevronLeft size={24}/>
        </button>
        <h1 className="text-xl md:text-2xl tracking-tighter">GESTÃO DE CARTÕES</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl h-fit">
          <div className="flex items-center gap-3 mb-6 text-blue-400">
            <Plus size={24} />
            <h2 className="text-sm">NOVO CARTÃO</h2>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="bg-amber-900/20 p-4 rounded-2xl border border-amber-500/30 mb-2">
              <p className="text-[9px] text-amber-200 normal-case leading-tight font-black italic flex gap-2">
                <ShieldCheck size={14} className="shrink-0" />
                SEGURANÇA: USE APENAS NOMES (EX: "NUBANK LOJA"). NÃO INSIRA NÚMEROS REAIS OU CVV.
              </p>
            </div>

            <input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="NOME DO BANCO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none font-black uppercase text-xs" required />
            <input value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value)} placeholder="APELIDO (EX: PRINCIPAL)" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none font-black uppercase text-xs" required />
            <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="DIA DO VENCIMENTO" className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none font-black text-xs" required />
            
            <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl shadow-xl text-[11px] font-black active:scale-95 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> CONFIRMAR CADASTRO
            </button>
          </form>
        </section>

        {/* LISTA DE CARTÕES ATIVOS */}
        <section className="space-y-4">
          <h2 className="text-slate-500 text-[10px] tracking-widest ml-4 font-black">CARTÕES NA ALCATEIA</h2>
          {cartoes.length === 0 && (
            <div className="p-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-[2.5rem] italic text-[10px]">
              NENHUM CARTÃO DETECTADO
            </div>
          )}
          <div className="grid gap-3">
            {cartoes.map(c => (
              <div key={c.id} className="bg-[#111827] p-5 rounded-3xl border-2 border-slate-800 flex justify-between items-center group hover:border-blue-500 transition-all shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
                    <img src={c.logo_url} className="w-full h-full object-contain p-2" onError={(e:any) => e.target.src = "/logo.png"} />
                  </div>
                  <div>
                    <p className="text-xs font-black italic">{c.banco}</p>
                    <p className="text-[9px] text-slate-500">{c.nome_cartao}</p>
                    <div className="flex items-center gap-1 text-emerald-500 text-[8px] mt-1">
                       <Plus size={8}/> VENCE DIA {c.vencimento}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDeletar(c.id)} className="text-slate-600 hover:text-rose-500 p-2 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CRÉDITOS FIXOS */}
      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none z-[10]">
        <p className="text-[7px] tracking-[0.4em] uppercase font-black mb-1">Engineered by</p>
        <p className="text-[10px] tracking-tighter font-black italic uppercase text-blue-500">
          Jhonatha <span className="text-white">| Wolf Finance © 2026</span>
        </p>
      </div>
    </div>
  );
}