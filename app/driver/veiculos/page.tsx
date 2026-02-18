'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, Plus, Trash2, Edit3, ArrowLeft, Loader2, X, Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VeiculosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para o formulário
  const [form, setForm] = useState({ modelo: '', placa: '', ano: '', km_atual: '' });
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from('veiculos').insert([{
      ...form,
      user_id: session?.user.id,
      km_atual: parseFloat(form.km_atual) || 0
    }]);

    if (!error) {
      setShowModal(false);
      setForm({ modelo: '', placa: '', ano: '', km_atual: '' });
      fetchVeiculos();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('DESEJA EXCLUIR ESTE VEÍCULO?')) {
      await supabase.from('veiculos').delete().eq('id', id);
      fetchVeiculos();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]"><Loader2 className="animate-spin text-amber-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-4 md:p-8 text-white font-black italic uppercase antialiased leading-none">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 bg-[#111827] p-4 md:p-6 rounded-[2rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/driver')} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border border-slate-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl tracking-tighter italic">MEUS VEÍCULOS</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl shadow-lg shadow-amber-900/20 transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* LISTA DE VEÍCULOS (Inspirado no seu Print) */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {veiculos.length > 0 ? veiculos.map((v) => (
          <div key={v.id} className="bg-[#111827] p-6 rounded-[2.5rem] border-4 border-slate-800 shadow-xl group hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700">
                  <Car className="text-amber-500" size={28} />
                </div>
                <div>
                  <h3 className="text-lg tracking-tight italic">{v.modelo} {v.placa && `- ${v.placa}`}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-black">ANO {v.ano} • {Number(v.km_atual).toLocaleString()} KM</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(v.id)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 opacity-20 italic">
            <Car size={64} className="mx-auto mb-4" />
            <p className="text-xs tracking-[0.3em]">NENHUM CARRO NA GARAGEM</p>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#111827] w-full max-w-lg rounded-[3rem] border-4 border-slate-800 shadow-2xl p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl italic font-black">NOVO VEÍCULO</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input 
                label="Modelo / Versão" 
                placeholder="Ex: FIAT SIENA" 
                value={form.modelo} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, modelo: e.target.value})} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Placa" 
                  placeholder="ABC-1234" 
                  value={form.placa} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, placa: e.target.value.toUpperCase()})} 
                />
                <Input 
                  label="Ano" 
                  placeholder="2013" 
                  type="number" 
                  value={form.ano} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, ano: e.target.value})} 
                />
              </div>
              <Input 
                label="KM Atual" 
                placeholder="145200" 
                type="number" 
                value={form.km_atual} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, km_atual: e.target.value})} 
              />

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[2rem] font-black italic mt-6 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> SALVAR NA GARAGEM</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-12 flex flex-col items-center opacity-30 font-black italic">
        <p className="text-[7px] tracking-[0.4em] mb-1 uppercase font-black">Engineered by</p>
        <p className="text-[10px] text-blue-500 font-black italic">Jhonatha <span className="text-white">| Wolf Finance © 2026</span></p>
      </footer>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-500 font-black tracking-widest ml-2 uppercase italic">{label}</label>
      <input 
        {...props}
        className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-2xl p-4 text-sm focus:border-amber-500 outline-none transition-all placeholder:text-slate-700 font-black italic"
      />
    </div>
  );
}