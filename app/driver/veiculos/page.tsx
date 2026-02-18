'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, Plus, Trash2, Edit3, ArrowLeft, Loader2, X, Save, Search, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MARCAS = [
  { nome: 'Fiat', domain: 'fiat.com.br' },
  { nome: 'Volkswagen', domain: 'vw.com.br' },
  { nome: 'Chevrolet', domain: 'chevrolet.com.br' },
  { nome: 'Ford', domain: 'ford.com.br' },
  { nome: 'Toyota', domain: 'toyota.com.br' },
  { nome: 'Hyundai', domain: 'hyundai.com.br' },
  { nome: 'Honda', domain: 'honda.com.br' },
  { nome: 'Renault', domain: 'renault.com.br' },
  { nome: 'Nissan', domain: 'nissan.com.br' },
  { nome: 'Jeep', domain: 'jeep.com.br' },
  { nome: 'Caoa Chery', domain: 'caoachery.com.br' },
  { nome: 'BMW', domain: 'bmw.com.br' },
  { nome: 'Mercedes-Benz', domain: 'mercedes-benz.com.br' },
  { nome: 'Audi', domain: 'audi.com.br' },
  { nome: 'Mitsubishi', domain: 'mitsubishi-motors.com.br' },
  { nome: 'Peugeot', domain: 'peugeot.com.br' },
  { nome: 'Citroën', domain: 'citroen.com.br' },
  { nome: 'Kia', domain: 'kia.com.br' },
  { nome: 'RAM', domain: 'ram.com.br' },
  { nome: 'BYD', domain: 'byd.com' },
].sort((a, b) => a.nome.localeCompare(b.nome));

export default function VeiculosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [marcaSelecionada, setMarcaSelecionada] = useState<{nome: string, domain: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ modelo: '', placa: '', ano: '', km_atual: '' });
  const [saving, setSaving] = useState(false);

  const marcasFiltradas = useMemo(() => 
    MARCAS.filter(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const fetchVeiculos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');
    const { data } = await supabase.from('veiculos').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setVeiculos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVeiculos(); }, []);

  // Máscara para Placa Brasileira (Antiga e Mercosul)
  const formatarPlaca = (valor: string) => {
    // Remove tudo que não é letra ou número e limita a 7 caracteres
    const v = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
    return v;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaSelecionada) return alert("SELECIONE UMA MARCA!");
    if (form.placa.length < 7) return alert("A PLACA DEVE TER 7 DÍGITOS!");
    
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('veiculos').insert([{
      modelo: `${marcaSelecionada.nome} ${form.modelo}`.toUpperCase(),
      placa: form.placa,
      ano: form.ano,
      km_atual: parseFloat(form.km_atual) || 0,
      user_id: session?.user.id
    }]);

    if (!error) {
      setShowModal(false);
      setForm({ modelo: '', placa: '', ano: '', km_atual: '' });
      setMarcaSelecionada(null);
      setSearchTerm('');
      fetchVeiculos();
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-amber-500"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none">
      
      <header className="flex justify-between items-center mb-8 bg-[#111827] p-4 md:p-6 rounded-[2rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 border border-slate-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl tracking-tighter italic">MINHA GARAGEM</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4 max-w-2xl mx-auto">
        {veiculos.map((v) => {
          const fabricanteNome = v.modelo.split(' ')[0].toLowerCase();
          const marcaEncontrada = MARCAS.find(m => m.nome.toLowerCase() === fabricanteNome);
          const logoUrl = marcaEncontrada ? `https://logo.clearbit.com/${marcaEncontrada.domain}` : null;

          return (
            <div key={v.id} className="bg-[#111827] p-6 rounded-[2.5rem] border-4 border-slate-800 shadow-xl group hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner border-2 border-slate-700">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display = 'none'} />
                    ) : <Car className="text-slate-900" size={28} />}
                  </div>
                  <div>
                    <h3 className="text-lg tracking-tight italic">{v.modelo}</h3>
                    {/* Exibe a placa com o hífen visual para facilitar a leitura */}
                    <p className="text-[10px] text-amber-500 mt-1 font-black">
                      {v.placa.slice(0,3)}-{v.placa.slice(3)} • {Number(v.km_atual).toLocaleString()} KM
                    </p>
                  </div>
                </div>
                <button onClick={async () => { if(confirm("EXCLUIR?")) { await supabase.from('veiculos').delete().eq('id', v.id); fetchVeiculos(); } }} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] w-full max-w-lg rounded-[3rem] border-4 border-slate-800 shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic tracking-tighter">NOVO VEÍCULO</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 font-black tracking-widest ml-2 italic uppercase">1. ESCOLHA A MARCA</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="PESQUISAR MARCA..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 pl-12 text-xs focus:border-amber-500 outline-none font-black italic transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-[#0a0f1d] rounded-2xl border-2 border-slate-800 custom-scrollbar">
                  {marcasFiltradas.map((m) => (
                    <button
                      key={m.nome}
                      type="button"
                      onClick={() => setMarcaSelecionada(m)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${marcaSelecionada?.nome === m.nome ? 'border-amber-500 bg-amber-500/10 scale-95' : 'border-slate-800 hover:border-slate-600'}`}
                    >
                      <img src={`https://logo.clearbit.com/${m.domain}`} alt={m.nome} className="w-8 h-8 object-contain mb-1" />
                      <span className="text-[7px] font-black truncate w-full text-center">{m.nome}</span>
                      {marcaSelecionada?.nome === m.nome && <Check className="absolute top-1 right-1 text-amber-500" size={10} />}
                    </button>
                  ))}
                </div>
              </div>

              {marcaSelecionada && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    label={`2. MODELO ${marcaSelecionada.nome.toUpperCase()}`} 
                    placeholder="EX: SIENA 1.4" 
                    value={form.modelo} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, modelo: e.target.value})} 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black tracking-widest ml-2 italic">PLACA (7 DÍGITOS)</label>
                      <input 
                        placeholder="AAA0A00"
                        value={form.placa}
                        onChange={(e) => setForm({...form, placa: formatarPlaca(e.target.value)})}
                        className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 text-xs focus:border-amber-500 outline-none transition-all font-black italic tracking-[0.3em]"
                        required
                      />
                    </div>
                    <Input label="ANO" placeholder="2013" type="number" value={form.ano} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, ano: e.target.value})} />
                  </div>
                  <Input label="KM ATUAL" placeholder="145000" type="number" value={form.km_atual} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, km_atual: e.target.value})} />

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[2rem] font-black italic flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> FINALIZAR CADASTRO</>}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1 uppercase font-black">Engineered by</p>
        <p className="text-[10px] text-blue-500 font-black italic">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] text-slate-500 font-black tracking-widest ml-2 uppercase italic">{label}</label>
      <input 
        {...props}
        className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 text-xs focus:border-amber-500 outline-none transition-all placeholder:text-slate-700 font-black italic"
      />
    </div>
  );
}