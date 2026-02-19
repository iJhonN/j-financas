'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, CreditCard, Plus, Trash2, ShieldCheck, 
  Save, Loader2, Check, ChevronDown, Search, AlertTriangle, XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BANCOS_SUPORTADOS = [
  { id: 'nubank', nome: 'NUBANK', logo: '/logos/nubank.svg' },
  { id: 'itau', nome: 'ITAÚ', logo: '/logos/itau.svg' },
  { id: 'bradesco', nome: 'BRADESCO', logo: '/logos/bradesco.svg' },
  { id: 'santander', nome: 'SANTANDER', logo: '/logos/santander.svg' },
  { id: 'inter', nome: 'INTER', logo: '/logos/inter.svg' },
  { id: 'caixa', nome: 'CAIXA ECONÔMICA', logo: '/logos/caixaeconomicafederal.svg' },
  { id: 'bb', nome: 'BANCO DO BRASIL', logo: '/logos/bancodobrasil.svg' },
  { id: 'mercadopago', nome: 'MERCADO PAGO', logo: '/logos/mercadopago.svg' },
  { id: 'pagbank', nome: 'PAGBANK', logo: '/logos/pagbank.svg' },
  { id: 'picpay', nome: 'PICPAY', logo: '/logos/picpay.svg' },
  { id: 'c6', nome: 'C6 BANK', logo: '/logos/c6bank.svg' },
  { id: 'btg', nome: 'BTG PACTUAL', logo: '/logos/btg.svg' },
  { id: 'safra', nome: 'SAFRA', logo: '/logos/safra.svg' },
  { id: 'xp', nome: 'XP INVESTIMENTOS', logo: '/logos/xp.svg' },
  { id: 'sicoob', nome: 'SICOOB', logo: '/logos/sicoob.svg' },
  { id: 'sicredi', nome: 'SICREDI', logo: '/logos/sicredi.svg' },
  { id: 'stone', nome: 'STONE', logo: '/logos/stone.svg' },
  { id: 'infinitepay', nome: 'INFINITEPAY', logo: '/logos/infinitepay.svg' },
  { id: 'ifoodpago', nome: 'IFOOD PAGO', logo: '/logos/ifoodpago.svg' },
  { id: 'riachuelo', nome: 'RIACHUELO', logo: '/logos/riachuelo.svg' },
  { id: 'asaas', nome: 'ASAAS', logo: '/logos/asaas.svg' },
  { id: 'bne', nome: 'BANCO DO NORDESTE', logo: '/logos/bancodonordeste.svg' },
  { id: 'cea', nome: 'C&A', logo: '/logos/cea.svg' },
  { id: 'outros', nome: 'OUTRO BANCO', logo: '/logo.png' },
];

export default function CartoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartoes, setCartoes] = useState<any[]>([]);
  
  // Estados do formulário
  const [bancoSelecionado, setBancoSelecionado] = useState(BANCOS_SUPORTADOS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [showNumberAlert, setShowNumberAlert] = useState(false);

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

  // LOGICA DE BLOQUEIO E AVISO
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Verifica se o usuário tentou digitar um número
    if (/\d/.test(value)) {
      setShowNumberAlert(true);
      setTimeout(() => setShowNumberAlert(false), 3000);
    }

    const apenasLetras = value.replace(/[0-9]/g, '');
    setNomeCartao(apenasLetras);
  };

  const handleVencimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setVencimento(value);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(vencimento) < 1 || Number(vencimento) > 31) {
      alert("DIA DE VENCIMENTO INVÁLIDO!");
      return;
    }

    const { error } = await supabase.from('cartoes').insert([{
      banco: bancoSelecionado.nome,
      nome_cartao: nomeCartao.toUpperCase().trim(),
      vencimento: Number(vencimento),
      logo_url: bancoSelecionado.logo,
      user_id: user.id
    }]);

    if (!error) {
      setNomeCartao(''); 
      setVencimento('');
      setSearchTerm('');
      fetchCartoes(user.id);
    }
  };

  const handleDeletar = async (id: string) => {
    if (!confirm("REMOVER CARTÃO DA ALCATEIA?")) return;
    await supabase.from('cartoes').delete().eq('id', id);
    fetchCartoes(user.id);
  };

  const bancosFiltrados = BANCOS_SUPORTADOS.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black antialiased uppercase italic leading-none relative pb-32">
      
      <header className="flex items-center gap-4 mb-8 max-w-5xl mx-auto">
        <button onClick={() => router.push('/')} className="bg-slate-800 p-2.5 rounded-full border border-slate-700 active:scale-90 transition-all shadow-lg">
          <ChevronLeft size={24}/>
        </button>
        <h1 className="text-xl md:text-2xl tracking-tighter font-black italic">GESTÃO DE CARTÕES</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* FORMULÁRIO */}
        <section className="bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl h-fit relative">
          <div className="flex items-center gap-3 mb-6 text-blue-500">
            <Plus size={24} />
            <h2 className="text-sm font-black italic">ADICIONAR NOVO</h2>
          </div>

          <form onSubmit={handleSalvar} className="space-y-4">
            
            <div className="space-y-1 relative">
              <label className="text-[7px] opacity-40 ml-1 uppercase">Instituição Financeira</label>
              <button 
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                    <img src={bancoSelecionado.logo} className="w-full h-full object-contain p-1.5" onError={(e:any) => e.target.src = "/logo.png"} />
                  </div>
                  <span className="text-xs font-black">{bancoSelecionado.nome}</span>
                </div>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border-2 border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                    <Search size={14} className="text-slate-500" />
                    <input 
                      autoFocus
                      placeholder="BUSCAR BANCO..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-[10px] font-black w-full uppercase"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {bancosFiltrados.map((banco) => (
                      <button
                        key={banco.id}
                        type="button"
                        onClick={() => { setBancoSelecionado(banco); setIsDropdownOpen(false); setSearchTerm(''); }}
                        className="w-full p-4 hover:bg-blue-600/20 flex items-center justify-between border-b border-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                            <img src={banco.logo} className="w-full h-full object-contain p-1" onError={(e:any) => e.target.src = "/logo.png"} />
                          </div>
                          <span className="text-[10px] font-black">{banco.nome}</span>
                        </div>
                        {bancoSelecionado.id === banco.id && <Check size={14} className="text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="text-[7px] opacity-40 ml-1 uppercase font-black">Apelido do Cartão</label>
              
              {/* AVISO DE SOMENTE LETRAS */}
              {showNumberAlert && (
                <div className="absolute -top-6 right-0 animate-bounce flex items-center gap-1 text-rose-500 font-black text-[8px] bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                  <XCircle size={10} /> PROIBIDO NÚMEROS! DIGITE APENAS UM NOME.
                </div>
              )}

              <input 
                value={nomeCartao} 
                onChange={handleNomeChange}
                placeholder="EX: NUBANK PESSOAL" 
                className={`w-full p-4 bg-slate-800 rounded-xl border-2 outline-none font-black uppercase text-xs transition-all ${showNumberAlert ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-700 focus:border-blue-500'}`} 
                required 
              />
            </div>
            
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-[#111827] px-2 text-[7px] text-slate-500 font-black italic">DIA DE VENCIMENTO</label>
              <input 
                type="text" 
                value={vencimento} 
                onChange={handleVencimentoChange}
                placeholder="00" 
                className="w-full p-4 bg-slate-800 rounded-xl border-2 border-slate-700 outline-none font-black text-xl text-center focus:border-emerald-500 transition-all text-emerald-500" 
                required 
              />
            </div>

            <div className="bg-amber-900/20 p-4 rounded-2xl border border-amber-500/30 flex gap-3 items-center">
               <ShieldCheck size={20} className="text-amber-500 shrink-0" />
               <p className="text-[8px] text-amber-200 leading-tight font-black italic uppercase">
                 NÃO DIGITE O NÚMERO REAL. O SISTEMA É APENAS PARA ORGANIZAÇÃO DA OFICINA.
               </p>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl shadow-xl text-[11px] font-black active:scale-95 transition-all flex items-center justify-center gap-2 uppercase italic">
              <Save size={18} /> Cadastrar Cartão na Alcateia
            </button>
          </form>
        </section>

        {/* LISTAGEM */}
        <section className="space-y-4">
          <h2 className="text-slate-500 text-[10px] tracking-widest ml-4 font-black uppercase italic">Cartões Ativos</h2>
          <div className="grid gap-3 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
            {cartoes.map(c => (
              <div key={c.id} className="bg-[#111827] p-5 rounded-3xl border-2 border-slate-800 flex justify-between items-center group hover:border-blue-600 transition-all shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-slate-700 overflow-hidden shadow-inner group-hover:bg-white/10 transition-colors">
                    <img src={c.logo_url} className="w-full h-full object-contain p-2.5" onError={(e:any) => e.target.src = "/logo.png"} />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] font-black italic tracking-tight uppercase text-white">{c.banco}</p>
                    <p className="text-[9px] text-slate-500 italic uppercase font-black">{c.nome_cartao}</p>
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[8px] mt-1.5 font-black bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                       <Check size={10}/> VENCE DIA {c.vencimento}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeletar(c.id)} 
                  className="text-slate-600 hover:text-rose-500 p-3 bg-slate-800/50 rounded-full transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="relative mt-12 pb-8 flex flex-col items-center opacity-30 hover:opacity-100 transition-all duration-700 pointer-events-none z-[10] font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1">Engineered by</p>
        <p className="text-[10px] text-blue-500 font-black italic">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </div>

      <style jsx global>{` 
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; } 
      `}</style>
    </div>
  );
}