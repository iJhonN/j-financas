'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, Plus, Trash2, Edit3, ArrowLeft, Loader2, X, Save, Search, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Lista mapeada baseada nos arquivos PNG fornecidos
const MARCAS = [
  { nome: '9ff', slug: '9ff' }, { nome: 'Abadal', slug: 'abadal' }, { nome: 'Abarth', slug: 'abarth' },
  { nome: 'Abbott-Detroit', slug: 'abbott-detroit' }, { nome: 'ABT', slug: 'abt' }, { nome: 'AC', slug: 'ac' },
  { nome: 'Acura', slug: 'acura' }, { nome: 'Aiways', slug: 'aiways' }, { nome: 'Aixam', slug: 'aixam' },
  { nome: 'Alfa Romeo', slug: 'alfa-romeo' }, { nome: 'Alpina', slug: 'alpina' }, { nome: 'Alpine', slug: 'alpine' },
  { nome: 'Alta', slug: 'alta' }, { nome: 'Alvis', slug: 'alvis' }, { nome: 'AMC', slug: 'amc' },
  { nome: 'Apollo', slug: 'apollo' }, { nome: 'Arash', slug: 'arash' }, { nome: 'Arcfox', slug: 'arcfox' },
  { nome: 'Ariel', slug: 'ariel' }, { nome: 'Aro', slug: 'aro' }, { nome: 'Arrinera', slug: 'arrinera' },
  { nome: 'Arrival', slug: 'arrival' }, { nome: 'Artega', slug: 'artega' }, { nome: 'Ascari', slug: 'ascari' },
  { nome: 'Askam', slug: 'askam' }, { nome: 'Aspark', slug: 'aspark' }, { nome: 'Aston Martin', slug: 'aston-martin' },
  { nome: 'Atalanta', slug: 'atalanta' }, { nome: 'Auburn', slug: 'auburn' }, { nome: 'Audi Sport', slug: 'audi-sport' },
  { nome: 'Audi', slug: 'audi' }, { nome: 'Austin', slug: 'austin' }, { nome: 'Autobacs', slug: 'autobacs' },
  { nome: 'Autobianchi', slug: 'autobianchi' }, { nome: 'Axon', slug: 'axon' }, { nome: 'BAC', slug: 'bac' },
  { nome: 'BAIC Motor', slug: 'baic-motor' }, { nome: 'Baojun', slug: 'baojun' }, { nome: 'Beiben', slug: 'beiben' },
  { nome: 'Bentley', slug: 'bentley' }, { nome: 'Berkeley', slug: 'berkeley' }, { nome: 'Berliet', slug: 'berliet' },
  { nome: 'Bertone', slug: 'bertone' }, { nome: 'Bestune', slug: 'bestune' }, { nome: 'BharatBenz', slug: 'bharatbenz' },
  { nome: 'Bitter', slug: 'bitter' }, { nome: 'Bizzarrini', slug: 'bizzarrini' }, { nome: 'BMW M', slug: 'bmw-m' },
  { nome: 'BMW', slug: 'bmw' }, { nome: 'Borgward', slug: 'borgward' }, { nome: 'Bowler', slug: 'bowler' },
  { nome: 'Brabus', slug: 'brabus' }, { nome: 'Brammo', slug: 'brammo' }, { nome: 'Brilliance', slug: 'brilliance' },
  { nome: 'Bristol', slug: 'bristol' }, { nome: 'Brooke', slug: 'brooke' }, { nome: 'Bufori', slug: 'bufori' },
  { nome: 'Bugatti', slug: 'bugatti' }, { nome: 'Buick', slug: 'buick' }, { nome: 'BYD', slug: 'byd' },
  { nome: 'Byton', slug: 'byton' }, { nome: 'Cadillac', slug: 'cadillac' }, { nome: 'CAMC', slug: 'camc' },
  { nome: 'Canoo', slug: 'canoo' }, { nome: 'Caparo', slug: 'caparo' }, { nome: 'Carlsson', slug: 'carlsson' },
  { nome: 'Caterham', slug: 'caterham' }, { nome: 'Changan', slug: 'changan' }, { nome: 'Changfeng', slug: 'changfeng' },
  { nome: 'Chery', slug: 'chery' }, { nome: 'Chevrolet Corvette', slug: 'chevrolet-corvette' }, { nome: 'Chevrolet', slug: 'chevrolet' },
  { nome: 'Chrysler', slug: 'chrysler' }, { nome: 'Cisitalia', slug: 'cisitalia' }, { nome: 'Citroën', slug: 'citroen' },
  { nome: 'Cizeta', slug: 'cizeta' }, { nome: 'Cole', slug: 'cole' }, { nome: 'Corre La Licorne', slug: 'corre-la-licorne' },
  { nome: 'Cupra', slug: 'cupra' }, { nome: 'Dacia', slug: 'dacia' }, { nome: 'Daewoo', slug: 'daewoo' },
  { nome: 'DAF', slug: 'daf' }, { nome: 'Daihatsu', slug: 'daihatsu' }, { nome: 'Daimler', slug: 'daimler' },
  { nome: 'Dartz', slug: 'dartz' }, { nome: 'Datsun', slug: 'datsun' }, { nome: 'David Brown', slug: 'david-brown' },
  { nome: 'Dayun', slug: 'dayun' }, { nome: 'De Tomaso', slug: 'de-tomaso' }, { nome: 'Delage', slug: 'delage' },
  { nome: 'DeSoto', slug: 'desoto' }, { nome: 'Detroit Electric', slug: 'detroit-electric' }, { nome: 'Devel Sixteen', slug: 'devel-sixteen' },
  { nome: 'Diatto', slug: 'diatto' }, { nome: 'Dina', slug: 'dina' }, { nome: 'DKW', slug: 'dkw' },
  { nome: 'DMC', slug: 'dmc' }, { nome: 'Dodge Viper', slug: 'dodge-viper' }, { nome: 'Dodge', slug: 'dodge' },
  { nome: 'Dongfeng', slug: 'dongfeng' }, { nome: 'Donkervoort', slug: 'donkervoort' }, { nome: 'Drako', slug: 'drako' },
  { nome: 'DS', slug: 'ds' }, { nome: 'Duesenberg', slug: 'duesenberg' }, { nome: 'Eagle', slug: 'eagle' },
  { nome: 'EDAG', slug: 'edag' }, { nome: 'Edsel', slug: 'edsel' }, { nome: 'Eicher', slug: 'eicher' },
  { nome: 'Elemental', slug: 'elemental' }, { nome: 'Elfin', slug: 'elfin' }, { nome: 'Elva', slug: 'elva' },
  { nome: 'Englon', slug: 'englon' }, { nome: 'ERF', slug: 'erf' }, { nome: 'Eterniti', slug: 'eterniti' },
  { nome: 'Exeed', slug: 'exeed' }, { nome: 'Facel Vega', slug: 'facel-vega' }, { nome: 'Faraday Future', slug: 'faraday-future' },
  { nome: 'FAW Jiefang', slug: 'faw-jiefang' }, { nome: 'FAW', slug: 'faw' }, { nome: 'Ferrari', slug: 'ferrari' },
  { nome: 'Fiat', slug: 'fiat' }, { nome: 'Fioravanti', slug: 'fioravanti' }, { nome: 'Fisker', slug: 'fisker' },
  { nome: 'Foden', slug: 'foden' }, { nome: 'Force Motors', slug: 'force-motors' }, { nome: 'Ford Mustang', slug: 'ford-mustang' },
  { nome: 'Ford', slug: 'ford' }, { nome: 'Foton', slug: 'foton' }, { nome: 'FPV', slug: 'fpv' },
  { nome: 'Franklin', slug: 'franklin' }, { nome: 'Freightliner', slug: 'freightliner' }, { nome: 'FSO', slug: 'fso' },
  { nome: 'GAC Group', slug: 'gac-group' }, { nome: 'Gardner Douglas', slug: 'gardner-douglas' }, { nome: 'GAZ', slug: 'gaz' },
  { nome: 'Geely', slug: 'geely' }, { nome: 'General Motors', slug: 'general-motors' }, { nome: 'Genesis', slug: 'genesis' },
  { nome: 'Geo', slug: 'geo' }, { nome: 'Geometry', slug: 'geometry' }, { nome: 'Gilbern', slug: 'gilbern' },
  { nome: 'Gillet', slug: 'gillet' }, { nome: 'Ginetta', slug: 'ginetta' }, { nome: 'GMC', slug: 'gmc' },
  { nome: 'Golden Dragon', slug: 'golden-dragon' }, { nome: 'Gonow', slug: 'gonow' }, { nome: 'Great Wall', slug: 'great-wall' },
  { nome: 'Grinnall', slug: 'grinnall' }, { nome: 'Gumpert', slug: 'gumpert' }, { nome: 'Hafei', slug: 'hafei' },
  { nome: 'Haima', slug: 'haima' }, { nome: 'Haval', slug: 'haval' }, { nome: 'Hawtai', slug: 'hawtai' },
  { nome: 'Hennessey', slug: 'hennessey' }, { nome: 'Higer', slug: 'higer' }, { nome: 'Hillman', slug: 'hillman' },
  { nome: 'Hindustan Motors', slug: 'hindustan-motors' }, { nome: 'Hino', slug: 'hino' }, { nome: 'HiPhi', slug: 'hiphi' },
  { nome: 'Hispano-Suiza', slug: 'hispano-suiza' }, { nome: 'Holden', slug: 'holden' }, { nome: 'Hommell', slug: 'hommell' },
  { nome: 'Honda', slug: 'honda' }, { nome: 'Hongqi', slug: 'hongqi' }, { nome: 'Hongyan', slug: 'hongyan' },
  { nome: 'Horch', slug: 'horch' }, { nome: 'HSV', slug: 'hsv' }, { nome: 'Hudson', slug: 'hudson' },
  { nome: 'Hummer', slug: 'hummer' }, { nome: 'Hupmobile', slug: 'hupmobile' }, { nome: 'Hyundai', slug: 'hyundai' },
  { nome: 'IC Bus', slug: 'ic-bus' }, { nome: 'IH', slug: 'ih' }, { nome: 'IKCO', slug: 'ikco' },
  { nome: 'Infiniti', slug: 'infiniti' }, { nome: 'Innocenti', slug: 'innocenti' }, { nome: 'Intermeccanica', slug: 'intermeccanica' },
  { nome: 'International', slug: 'international' }, { nome: 'Irizar', slug: 'irizar' }, { nome: 'Isdera', slug: 'isdera' },
  { nome: 'Iso', slug: 'iso' }, { nome: 'Isuzu', slug: 'isuzu' }, { nome: 'Iveco', slug: 'iveco' },
  { nome: 'JAC', slug: 'jac' }, { nome: 'Jaguar', slug: 'jaguar' }, { nome: 'Jawa', slug: 'jawa' },
  { nome: 'JBA Motors', slug: 'jba-motors' }, { nome: 'Jeep', slug: 'jeep' }, { nome: 'Jensen', slug: 'jensen' },
  { nome: 'Jetour', slug: 'jetour' }, { nome: 'Jetta', slug: 'jetta' }, { nome: 'JMC', slug: 'jmc' },
  { nome: 'Kaiser', slug: 'kaiser' }, { nome: 'Kamaz', slug: 'kamaz' }, { nome: 'Karlmann King', slug: 'karlmann-king' },
  { nome: 'Karma', slug: 'karma' }, { nome: 'Keating', slug: 'keating' }, { nome: 'Kenworth', slug: 'kenworth' },
  { nome: 'Kia', slug: 'kia' }, { nome: 'King Long', slug: 'king-long' }, { nome: 'Koenigsegg', slug: 'koenigsegg' },
  { nome: 'KTM', slug: 'ktm' }, { nome: 'Lada', slug: 'lada' }, { nome: 'Lagonda', slug: 'lagonda' },
  { nome: 'Lamborghini', slug: 'lamborghini' }, { nome: 'Lancia', slug: 'lancia' }, { nome: 'Land Rover', slug: 'land-rover' },
  { nome: 'Landwind', slug: 'landwind' }, { nome: 'Laraki', slug: 'laraki' }, { nome: 'Leapmotor', slug: 'leapmotor' },
  { nome: 'LEVC', slug: 'levc' }, { nome: 'Lexus', slug: 'lexus' }, { nome: 'Leyland', slug: 'leyland' },
  { nome: 'Li Auto', slug: 'li-auto' }, { nome: 'Lifan', slug: 'lifan' }, { nome: 'Ligier', slug: 'ligier' },
  { nome: 'Lincoln', slug: 'lincoln' }, { nome: 'Lister', slug: 'lister' }, { nome: 'Lloyd', slug: 'lloyd' },
  { nome: 'Lobini', slug: 'lobini' }, { nome: 'Lordstown', slug: 'lordstown' }, { nome: 'Lotus', slug: 'lotus' },
  { nome: 'Lucid', slug: 'lucid' }, { nome: 'Luxgen', slug: 'luxgen' }, { nome: 'Lynk & Co', slug: 'lynk-and-co' },
  { nome: 'Mack', slug: 'mack' }, { nome: 'Mahindra', slug: 'mahindra' }, { nome: 'MAN', slug: 'man' },
  { nome: 'Mansory', slug: 'mansory' }, { nome: 'Marcos', slug: 'marcos' }, { nome: 'Marlin', slug: 'marlin' },
  { nome: 'Maserati', slug: 'maserati' }, { nome: 'Mastretta', slug: 'mastretta' }, { nome: 'Maxus', slug: 'maxus' },
  { nome: 'Maybach', slug: 'maybach' }, { nome: 'MAZ', slug: 'maz' }, { nome: 'Mazda', slug: 'mazda' },
  { nome: 'Mazzanti', slug: 'mazzanti' }, { nome: 'McLaren', slug: 'mclaren' }, { nome: 'Melkus', slug: 'melkus' },
  { nome: 'Mercedes-AMG', slug: 'mercedes-amg' }, { nome: 'Mercedes-Benz', slug: 'mercedes-benz' }, { nome: 'Mercury', slug: 'mercury' },
  { nome: 'Merkur', slug: 'merkur' }, { nome: 'MEV', slug: 'mev' }, { nome: 'MG', slug: 'mg' },
  { nome: 'Microcar', slug: 'microcar' }, { nome: 'Mini', slug: 'mini' }, { nome: 'Mitsubishi', slug: 'mitsubishi' },
  { nome: 'Mitsuoka', slug: 'mitsuoka' }, { nome: 'MK', slug: 'mk' }, { nome: 'Morgan', slug: 'morgan' },
  { nome: 'Morris', slug: 'morris' }, { nome: 'Mosler', slug: 'mosler' }, { nome: 'Navistar', slug: 'navistar' },
  { nome: 'NEVS', slug: 'nevs' }, { nome: 'Nikola', slug: 'nikola' }, { nome: 'Nio', slug: 'nio' },
  { nome: 'Nissan GT-R', slug: 'nissan-gt-r' }, { nome: 'Nissan Nismo', slug: 'nissan-nismo' }, { nome: 'Nissan', slug: 'nissan' },
  { nome: 'Noble', slug: 'noble' }, { nome: 'Oldsmobile', slug: 'oldsmobile' }, { nome: 'Oltcit', slug: 'oltcit' },
  { nome: 'Omoda', slug: 'omoda' }, { nome: 'Opel', slug: 'opel' }, { nome: 'Osca', slug: 'osca' },
  { nome: 'Paccar', slug: 'paccar' }, { nome: 'Packard', slug: 'packard' }, { nome: 'Pagani', slug: 'pagani' },
  { nome: 'Panhard', slug: 'panhard' }, { nome: 'Panoz', slug: 'panoz' }, { nome: 'Pegaso', slug: 'pegaso' },
  { nome: 'Perodua', slug: 'perodua' }, { nome: 'Peterbilt', slug: 'peterbilt' }, { nome: 'Peugeot', slug: 'peugeot' },
  { nome: 'PGO', slug: 'pgo' }, { nome: 'Pierce-Arrow', slug: 'pierce-arrow' }, { nome: 'Pininfarina', slug: 'pininfarina' },
  { nome: 'Plymouth', slug: 'plymouth' }, { nome: 'Polestar', slug: 'polestar' }, { nome: 'Pontiac', slug: 'pontiac' },
  { nome: 'Porsche', slug: 'porsche' }, { nome: 'Praga', slug: 'praga' }, { nome: 'Premier', slug: 'premier' },
  { nome: 'Prodrive', slug: 'prodrive' }, { nome: 'Proton', slug: 'proton' }, { nome: 'Qoros', slug: 'qoros' },
  { nome: 'Radical', slug: 'radical' }, { nome: 'RAM', slug: 'ram' }, { nome: 'Rambler', slug: 'rambler' },
  { nome: 'Ranz', slug: 'ranz' }, { nome: 'Renault Samsung', slug: 'renault-samsung' }, { nome: 'Renault', slug: 'renault' },
  { nome: 'Rezvani', slug: 'rezvani' }, { nome: 'Riley', slug: 'riley' }, { nome: 'Rimac', slug: 'rimac' },
  { nome: 'Rinspeed', slug: 'rinspeed' }, { nome: 'Rivian', slug: 'rivian' }, { nome: 'Roewe', slug: 'roewe' },
  { nome: 'Rolls-Royce', slug: 'rolls-royce' }, { nome: 'Ronart', slug: 'ronart' }, { nome: 'Rossion', slug: 'rossion' },
  { nome: 'Rover', slug: 'rover' }, { nome: 'RUF', slug: 'ruf' }, { nome: 'Saab', slug: 'saab' },
  { nome: 'SAIC Motor', slug: 'saic-motor' }, { nome: 'Saipa', slug: 'saipa' }, { nome: 'Saleen', slug: 'saleen' },
  { nome: 'Saturn', slug: 'saturn' }, { nome: 'Scania', slug: 'scania' }, { nome: 'Scion', slug: 'scion' },
  { nome: 'SEAT', slug: 'seat' }, { nome: 'Setra', slug: 'setra' }, { nome: 'SEV', slug: 'sev' },
  { nome: 'Shacman', slug: 'shacman' }, { nome: 'Simca', slug: 'simca' }, { nome: 'Singer', slug: 'singer' },
  { nome: 'Singulato', slug: 'singulato' }, { nome: 'Sinotruk', slug: 'sinotruk' }, { nome: 'Sisu', slug: 'sisu' },
  { nome: 'Skoda', slug: 'skoda' }, { nome: 'Smart', slug: 'smart' }, { nome: 'Soueast', slug: 'soueast' },
  { nome: 'Spania GTA', slug: 'spania-gta' }, { nome: 'Spirra', slug: 'spirra' }, { nome: 'Spyker', slug: 'spyker' },
  { nome: 'SsangYong', slug: 'ssangyong' }, { nome: 'SSC', slug: 'ssc' }, { nome: 'Sterling', slug: 'sterling' },
  { nome: 'Studebaker', slug: 'studebaker' }, { nome: 'Stutz', slug: 'stutz' }, { nome: 'Subaru', slug: 'subaru' },
  { nome: 'Suffolk', slug: 'suffolk' }, { nome: 'Suzuki', slug: 'suzuki' }, { nome: 'Talbot', slug: 'talbot' },
  { nome: 'Tata', slug: 'tata' }, { nome: 'Tatra', slug: 'tatra' }, { nome: 'Tauro', slug: 'tauro' },
  { nome: 'Techart', slug: 'techart' }, { nome: 'Tesla', slug: 'tesla' }, { nome: 'Toyota Alphard', slug: 'toyota-alphard' },
  { nome: 'Toyota Century', slug: 'toyota-century' }, { nome: 'Toyota Crown', slug: 'toyota-crown' }, { nome: 'Toyota', slug: 'toyota' },
  { nome: 'Tramontana', slug: 'tramontana' }, { nome: 'Trion', slug: 'trion' }, { nome: 'Triumph', slug: 'triumph' },
  { nome: 'Troller', slug: 'troller' }, { nome: 'Tucker', slug: 'tucker' }, { nome: 'TVR', slug: 'tvr' },
  { nome: 'UAZ', slug: 'uaz' }, { nome: 'UD', slug: 'ud' }, { nome: 'Ultima', slug: 'ultima' },
  { nome: 'Vandenbrink', slug: 'vandenbrink' }, { nome: 'Vauxhall', slug: 'vauxhall' }, { nome: 'Vector', slug: 'vector' },
  { nome: 'Vencer', slug: 'vencer' }, { nome: 'Venturi', slug: 'venturi' }, { nome: 'Venucia', slug: 'venucia' },
  { nome: 'VinFast', slug: 'vinfast' }, { nome: 'VLF', slug: 'vlf' }, { nome: 'Volkswagen', slug: 'volkswagen' },
  { nome: 'Volvo', slug: 'volvo' }, { nome: 'W Motors', slug: 'w-motors' }, { nome: 'Wanderer', slug: 'wanderer' },
  { nome: 'Wartburg', slug: 'wartburg' }, { nome: 'Weltmeister', slug: 'weltmeister' }, { nome: 'Western Star', slug: 'western-star' },
  { nome: 'Westfield', slug: 'westfield' }, { nome: 'Wey', slug: 'wey' }, { nome: 'Wiesmann', slug: 'wiesmann' },
  { nome: 'Willys-Overland', slug: 'willys-overland' }, { nome: 'Workhorse', slug: 'workhorse' }, { nome: 'Wuling', slug: 'wuling' },
  { nome: 'Xpeng', slug: 'xpeng' }, { nome: 'Yulon', slug: 'yulon' }, { nome: 'Yutong', slug: 'yutong' },
  { nome: 'Zarooq Motors', slug: 'zarooq-motors' }, { nome: 'Zastava', slug: 'zastava' }, { nome: 'ZAZ', slug: 'zaz' },
  { nome: 'Zeekr', slug: 'zeekr' }, { nome: 'Zenos', slug: 'zenos' }, { nome: 'Zenvo', slug: 'zenvo' },
  { nome: 'Zhongtong', slug: 'zhongtong' }, { nome: 'Zinoro', slug: 'zinoro' }, { nome: 'Harley-Davidson', slug: 'harley' }, { nome: 'Honda Motos', slug: 'hondamoto' },
  { nome: 'Mottu', slug: 'mottu' }, { nome: 'Shineray', slug: 'shineray' }, { nome: 'Yamaha', slug: 'yamaha' },
  
].sort((a, b) => a.nome.localeCompare(b.nome));

export default function VeiculosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para o formulário
  const [marcaSelecionada, setMarcaSelecionada] = useState<{nome: string, slug: string} | null>(null);
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
    if (form.placa.length < 7) return alert("PLACA INVÁLIDA (MÍN. 7 DÍGITOS)");
    
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
          <h1 className="text-xl tracking-tighter">FROTA WOLF</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all">
          <Plus size={26} />
        </button>
      </header>

      <div className="space-y-4 max-w-2xl mx-auto">
        {veiculos.map((v) => {
          // Lógica para detectar o slug correto a partir do nome salvo
          const modeloArray = v.modelo.split(' ');
          let slugImg = 'default';
          
          // Tenta encontrar a marca correspondente pelo início do nome do modelo
          const marcaEncontrada = MARCAS.find(m => v.modelo.startsWith(m.nome.toUpperCase()));
          if (marcaEncontrada) slugImg = marcaEncontrada.slug;

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
                    <p className="text-[11px] text-amber-500 mt-1 font-black tracking-widest bg-amber-500/10 px-2 py-1 rounded-md inline-block">
                      {v.placa.slice(0,3)}-{v.placa.slice(3)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase">KM: {Number(v.km_atual).toLocaleString()} • ANO {v.ano}</p>
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic tracking-tighter">ADICIONAR À FROTA</h2>
              <button onClick={() => setShowModal(false)} className="bg-slate-800 p-2 rounded-full text-slate-500 hover:text-white transition-all"><X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="PESQUISAR FABRICANTE..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0f1d] border-2 border-slate-800 rounded-3xl p-5 pl-14 text-xs focus:border-amber-500 outline-none font-black italic transition-all uppercase"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-3 bg-[#0a0f1d] rounded-[2rem] border-4 border-slate-800 custom-scrollbar">
                  {marcasFiltradas.map((m) => (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => setMarcaSelecionada(m)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${marcaSelecionada?.slug === m.slug ? 'border-amber-500 bg-amber-500/10 scale-95' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
                    >
                      <img src={`/carlogos/${m.slug}.png`} alt={m.nome} className="w-10 h-10 object-contain mb-1" />
                      <span className="text-[8px] font-black truncate w-full text-center leading-none">{m.nome}</span>
                      {marcaSelecionada?.slug === m.slug && <Check className="absolute top-1 right-1 text-amber-500" size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {marcaSelecionada && (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <img src={`/carlogos/${marcaSelecionada.slug}.png`} className="w-8 h-8 object-contain" />
                    <span className="text-xs font-black italic uppercase">MARCA: {marcaSelecionada.nome}</span>
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