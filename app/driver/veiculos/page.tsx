'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, Plus, Trash2, Edit3, ArrowLeft, Loader2, X, Save, Search, Check, Bike 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Lista Brasileira Otimizada (Carros e Motos) baseada nos seus arquivos locais
const MARCAS = [
  // --- CARROS ---
  { nome: 'Audi', slug: 'audi', tipo: 'carro' },
  { nome: 'BMW', slug: 'bmw', tipo: 'carro' },
  { nome: 'BYD', slug: 'byd', tipo: 'carro' },
  { nome: 'Caoa Chery', slug: 'caoa-chery', tipo: 'carro' },
  { nome: 'Chevrolet', slug: 'chevrolet', tipo: 'carro' },
  { nome: 'Citroën', slug: 'citroen', tipo: 'carro' },
  { nome: 'Dodge', slug: 'dodge', tipo: 'carro' },
  { nome: 'Ferrari', slug: 'ferrari', tipo: 'carro' },
  { nome: 'Fiat', slug: 'fiat', tipo: 'carro' },
  { nome: 'Ford', slug: 'ford', tipo: 'carro' },
  { nome: 'GWM / Haval', slug: 'haval', tipo: 'carro' },
  { nome: 'Honda', slug: 'honda', tipo: 'carro' },
  { nome: 'Hyundai', slug: 'hyundai', tipo: 'carro' },
  { nome: 'Iveco', slug: 'iveco', tipo: 'carro' },
  { nome: 'JAC', slug: 'jac', tipo: 'carro' },
  { nome: 'Jaguar', slug: 'jaguar', tipo: 'carro' },
  { nome: 'Jeep', slug: 'jeep', tipo: 'carro' },
  { nome: 'Kia', slug: 'kia', tipo: 'carro' },
  { nome: 'Land Rover', slug: 'land-rover', tipo: 'carro' },
  { nome: 'Lexus', slug: 'lexus', tipo: 'carro' },
  { nome: 'Mercedes-Benz', slug: 'mercedes-benz', tipo: 'carro' },
  { nome: 'Mitsubishi', slug: 'mitsubishi', tipo: 'carro' },
  { nome: 'Nissan', slug: 'nissan', tipo: 'carro' },
  { nome: 'Peugeot', slug: 'peugeot', tipo: 'carro' },
  { nome: 'Porsche', slug: 'porsche', tipo: 'carro' },
  { nome: 'RAM', slug: 'ram', tipo: 'carro' },
  { nome: 'Renault', slug: 'renault', tipo: 'carro' },
  { nome: 'Subaru', slug: 'subaru', tipo: 'carro' },
  { nome: 'Suzuki', slug: 'suzuki', tipo: 'carro' },
  { nome: 'Toyota', slug: 'toyota', tipo: 'carro' },
  { nome: 'Troller', slug: 'troller', tipo: 'carro' },
  { nome: 'Volkswagen', slug: 'volkswagen', tipo: 'carro' },
  { nome: 'Volvo', slug: 'volvo', tipo: 'carro' },

  // --- MOTOS ---
  { nome: 'Harley-Davidson', slug: 'harley', tipo: 'moto' },
  { nome: 'Honda Motos', slug: 'hondamoto', tipo: 'moto' },
  { nome: 'Mottu', slug: 'mottu', tipo: 'moto' },
  { nome: 'Shineray', slug: 'shineray', tipo: 'moto' },
  { nome: 'Yamaha', slug: 'yamaha', tipo: 'moto' },
  { nome: 'Suzuki Motos', slug: 'suzuki', tipo: 'moto' },
  { nome: 'Triumph', slug: 'triumph', tipo: 'moto' },
  { nome: 'BMW Motos', slug: 'bmw', tipo: 'moto' },
].sort((a, b) => a.nome.localeCompare(b.nome));

export default function VeiculosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para o formulário
  const [tipoSelecionado, setTipoSelecionado] = useState<'carro' | 'moto'>('carro');
  const [marcaSelecionada, setMarcaSelecionada] = useState<{nome: string, slug: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ modelo: '', placa: '', ano: '', km_atual: '' });
  const [saving, setSaving] = useState(false);

  const marcasFiltradas = useMemo(() => 
    MARCAS.filter(m => 
      m.tipo === tipoSelecionado && 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm, tipoSelecionado]
  );

  const fetchVeiculos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');

    const { data } = await supabase
      .from('veiculos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setVeiculos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVeiculos(); }, []);

  const formatarPlaca = (valor: string) => {
    return valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaSelecionada) return;
    if (form.placa.length < 7) return alert("A PLACA DEVE TER 7 DÍGITOS!");
    
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('veiculos').insert([{
      modelo: `${marcaSelecionada.nome} ${form.modelo}`.toUpperCase(),
      tipo: tipoSelecionado,
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

  const handleDelete = async (id: string) => {
    if (confirm('DESATIVAR VEÍCULO?')) {
      await supabase.from('veiculos').delete().eq('id', id);
      fetchVeiculos();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-amber-500"><Loader2 className="animate-spin" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none pb-10">
      
      <header className="flex justify-between items-center mb-10 bg-[#111827] p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 border border-slate-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl tracking-tighter">GARAGEM WOLF</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all">
          <Plus size={26} />
        </button>
      </header>

      <div className="space-y-4 max-w-2xl mx-auto">
        {veiculos.map((v) => {
          const marcaMatch = MARCAS.find(m => v.modelo.startsWith(m.nome.toUpperCase()));
          const slugImg = marcaMatch ? marcaMatch.slug : 'default';

          return (
            <div key={v.id} className="bg-[#111827] p-6 rounded-[3rem] border-4 border-slate-800 shadow-xl group hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-3 shadow-inner border-4 border-slate-700">
                    <img 
                      src={`/carlogos/${slugImg}.png`} 
                      alt="Brand" 
                      className="w-full h-full object-contain"
                      onError={(e: any) => e.target.src = "/logo.png"} 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl tracking-tight italic">{v.modelo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {v.tipo === 'moto' ? <Bike size={14} className="text-slate-500" /> : <Car size={14} className="text-slate-500" />}
                      <p className="text-[11px] text-amber-500 font-black tracking-widest bg-amber-500/10 px-2 py-1 rounded-md">
                        {v.placa.slice(0,3)}-{v.placa.slice(3)}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-black">
                      KM: {Number(v.km_atual).toLocaleString()} • ANO {v.ano}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(v.id)} className="p-3 text-rose-600 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90">
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111827] w-full max-w-lg rounded-[3.5rem] border-4 border-slate-800 shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black italic mb-8 tracking-tighter">ADICIONAR À FROTA</h2>

            <form onSubmit={handleSave} className="space-y-8">
              {/* SELETOR DE TIPO (CARRO OU MOTO) */}
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => {setTipoSelecionado('carro'); setMarcaSelecionada(null);}}
                  className={`flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${tipoSelecionado === 'carro' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 opacity-40'}`}
                >
                  <Car size={32} /> <span className="text-[10px] font-black italic">CARRO</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {setTipoSelecionado('moto'); setMarcaSelecionada(null);}}
                  className={`flex-1 p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${tipoSelecionado === 'moto' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 opacity-40'}`}
                >
                  <Bike size={32} /> <span className="text-[10px] font-black italic">MOTO</span>
                </button>
              </div>

              {/* BUSCA DE MARCA */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="PESQUISAR MARCA..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-3xl p-5 pl-14 text-xs focus:border-amber-500 outline-none font-black italic transition-all uppercase"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-3 bg-[#0a0f1d] rounded-[2rem] border-4 border-slate-800 custom-scrollbar">
                  {marcasFiltradas.map((m) => (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => setMarcaSelecionada(m)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${marcaSelecionada?.slug === m.slug ? 'border-amber-500 bg-amber-500/10 scale-95' : 'border-slate-800 bg-slate-900/50'}`}
                    >
                      <img src={`/carlogos/${m.slug}.png`} alt={m.nome} className="w-10 h-10 object-contain mb-1" />
                      <span className="text-[8px] font-black truncate w-full text-center leading-none uppercase">{m.nome}</span>
                      {marcaSelecionada?.slug === m.slug && <Check className="absolute top-1 right-1 text-amber-500" size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {marcaSelecionada && (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <img src={`/carlogos/${marcaSelecionada.slug}.png`} className="w-8 h-8 object-contain" />
                    <span className="text-xs font-black italic uppercase text-amber-500">MARCA: {marcaSelecionada.nome}</span>
                  </div>

                  <Input 
                    label="Modelo E VERSÃO" 
                    placeholder="EX: SIENA ATTRACTIVE 1.4" 
                    value={form.modelo} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, modelo: e.target.value})} 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-black tracking-widest ml-2 italic">PLACA (7 DÍGITOS)</label>
                      <input 
                        placeholder="AAA0A00"
                        maxLength={7}
                        value={form.placa}
                        onChange={(e) => setForm({...form, placa: formatarPlaca(e.target.value)})}
                        className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 text-xs focus:border-amber-500 outline-none transition-all font-black italic tracking-[0.3em]"
                        required
                      />
                    </div>
                    <Input label="ANO" placeholder="2013" type="number" value={form.ano} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, ano: e.target.value})} required />
                  </div>
                  <Input label="KM ATUAL" placeholder="0" type="number" value={form.km_atual} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, km_atual: e.target.value})} required />

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[2.5rem] font-black italic flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> FINALIZAR CADASTRO</>}
                  </button>
                </div>
              )}
            </form>
            <button onClick={() => setShowModal(false)} className="w-full text-center mt-6 text-[10px] text-slate-600 font-black hover:text-white transition-colors">CANCELAR OPERAÇÃO</button>
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
        className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 text-xs focus:border-amber-500 outline-none transition-all placeholder:text-slate-700 font-black italic uppercase"
      />
    </div>
  );
}