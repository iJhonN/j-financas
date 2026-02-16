'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDebug() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testFetch() {
      try {
        // Teste 1: Buscar apenas 1 linha para ver se a conexão funciona
        const { data: res, error: err } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (err) {
          setError(err.message);
        } else {
          setData(res);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    testFetch();
  }, []);

  if (loading) return <div className="p-10 text-white">Conectando ao banco...</div>;

  return (
    <div className="p-10 bg-black min-h-screen text-white font-mono">
      <h1 className="text-2xl mb-4 text-amber-500">Diagnóstico Wolf Finance</h1>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded mb-4">
          <p className="font-bold">ERRO DO SUPABASE:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-slate-900 p-4 rounded border border-slate-700">
        <p className="mb-2 text-emerald-400">Resultado da busca:</p>
        <pre className="text-xs overflow-auto max-h-[400px]">
          {JSON.stringify(data, null, 2)}
        </pre>
        {data && data.length === 0 && (
          <p className="text-red-400 mt-4 underline italic">
            A tabela 'profiles' retornou ZERO linhas. O banco está vazio ou o RLS ainda está bloqueando.
          </p>
        )}
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 bg-white text-black px-4 py-2 rounded font-bold"
      >
        Tentar Novamente
      </button>
    </div>
  );
}