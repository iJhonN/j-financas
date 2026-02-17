'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, User, Calendar, ShieldAlert, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleUpdateExp = async (id: string, days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const { error } = await supabase.from('profiles').update({ expires_at: newDate.toISOString() }).eq('id', id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, expires_at: newDate.toISOString() } : u));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-black">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => router.push('/')} className="btn-wolf-icon border-amber-500/50 text-amber-500"><ChevronLeft size={24} /></button>
        <div>
          <h1 className="text-2xl font-black italic text-amber-500 uppercase tracking-tighter">CENTRAL DE CONTROLO</h1>
          <p className="text-[8px] font-black italic text-slate-500 uppercase">Administrador do Sistema Wolf</p>
        </div>
      </header>

      <div className="card-wolf p-6 border-amber-500/20 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            placeholder="LOCALIZAR OPERADOR..." 
            className="input-wolf pl-12 border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
          <div key={user.id} className="card-wolf p-6 border-slate-800 hover:border-amber-500/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                  <User className="text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black italic uppercase">{user.full_name || 'Usuário Sem Nome'}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">{user.email}</p>
                </div>
              </div>
              <ShieldAlert size={20} className={new Date(user.expires_at) < new Date() ? 'text-rose-500' : 'text-emerald-500'} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-900">
                <span className="text-[8px] font-black italic text-slate-500 uppercase">Acesso Expira:</span>
                <span className="text-[9px] font-black italic">{new Date(user.expires_at).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleUpdateExp(user.id, 7)} className="py-2 bg-slate-900 rounded-lg text-[8px] font-black hover:bg-slate-800">+7 DIAS</button>
                <button onClick={() => handleUpdateExp(user.id, 30)} className="py-2 bg-slate-900 rounded-lg text-[8px] font-black hover:bg-slate-800">+30 DIAS</button>
                <button onClick={() => handleUpdateExp(user.id, 365)} className="py-2 bg-amber-600 rounded-lg text-[8px] font-black">+1 ANO</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}