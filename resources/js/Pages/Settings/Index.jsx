import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/Card';
import { 
    Gear, 
    Globe, 
    Buildings, 
    MapPin, 
    Check, 
    Sparkle, 
    ArrowSquareOut 
} from '@phosphor-icons/react';

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        company_name: settings?.company_name || 'PT Solusi Mitra Mandiri',
        company_website: settings?.company_website || 'https://solusimitramandiri.com',
        system_website: settings?.system_website || 'https://loyalfitness.id',
        instagram_url: settings?.instagram_url || 'https://www.instagram.com/loyalfitnessindonesia?igsh=MWs2NzR6NGUwNGRpMg%3D%3D&utm_source=qr',
        gym_name: settings?.gym_name || 'Loyal Fitness',
        gym_address: settings?.gym_address || 'International Plaza Mall Palembang Lantai 2',
        features_list: settings?.features_list || '',
        trainers_list: settings?.trainers_list || '',
    });

    const [alertMessage, setAlertMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('crm.settings.update'), {
            onSuccess: () => {
                setAlertMessage('Konfigurasi asisten AI berhasil disimpan!');
                setTimeout(() => setAlertMessage(''), 4000);
            }
        });
    };

    return (
        <AdminLayout activeTab="settings" title="Konfigurasi Asisten AI">
            <Head title="Konfigurasi AI" />

            <div className="flex flex-col gap-6 relative z-10">
                {/* Page Title Header */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[#e98425]">
                        <Gear className="w-4 h-4" weight="bold" />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest">System Settings</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        Pengaturan Pengetahuan AI
                    </h1>
                    <p className="text-xs text-[#f5efe4]/50 font-medium max-w-2xl">
                        Atur profil entitas bisnis dan tautan website resmi di bawah ini. Data ini akan langsung disuntikkan ke dalam basis pengetahuan (Knowledge Base) asisten AI Anda untuk menjawab pertanyaan pelanggan secara otomatis.
                    </p>
                </div>

                {/* Success alert message toast */}
                {(recentlySuccessful || alertMessage) && (
                    <div className="flex items-center gap-2.5 bg-[#d2eecb]/10 border border-[#d2eecb]/20 px-4 py-3 rounded-xl text-[#6cba5b] text-xs font-medium animate-fadeIn">
                        <Check className="w-4 h-4" weight="bold" />
                        <span>{alertMessage || 'Konfigurasi berhasil disimpan!'}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT PANEL: Settings Form (Col 8) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-6 sm:p-8 flex flex-col gap-6">
                            
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
                                Profil Entitas Bisnis & Gym
                            </h3>

                            {/* Gym Name Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Sparkle className="text-[#e98425] w-3 h-3" /> Nama Studio / Gym
                                </label>
                                <input 
                                    type="text" 
                                    value={data.gym_name} 
                                    onChange={e => setData('gym_name', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none transition-colors"
                                    placeholder="Contoh: Loyal Fitness"
                                    required
                                />
                                {errors.gym_name && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.gym_name}</span>}
                            </div>

                            {/* Gym Location Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <MapPin className="text-[#e98425] w-3 h-3" /> Lokasi & Alamat Gym
                                </label>
                                <textarea 
                                    value={data.gym_address} 
                                    onChange={e => setData('gym_address', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none min-h-[70px] resize-y transition-colors"
                                    placeholder="Alamat lengkap lokasi studio"
                                    required
                                />
                                {errors.gym_address && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.gym_address}</span>}
                            </div>

                            {/* Gym Features Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Sparkle className="text-[#e98425] w-3 h-3" /> Daftar Fitur & Fasilitas Gym (Satu per baris)
                                </label>
                                <textarea 
                                    value={data.features_list} 
                                    onChange={e => setData('features_list', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none min-h-[100px] resize-y transition-colors"
                                    placeholder="- *Face ID Access*: Penjelasan..."
                                />
                                {errors.features_list && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.features_list}</span>}
                            </div>

                            {/* Trainers List Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Sparkle className="text-[#e98425] w-3 h-3" /> Daftar Personal Trainer (PT) (Satu per baris)
                                </label>
                                <textarea 
                                    value={data.trainers_list} 
                                    onChange={e => setData('trainers_list', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none min-h-[100px] resize-y transition-colors"
                                    placeholder="- *Coach Ayu* (Yoga & Pilates)..."
                                />
                                {errors.trainers_list && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.trainers_list}</span>}
                            </div>

                            {/* Company Name Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Buildings className="text-[#e98425] w-3 h-3" /> Nama Perusahaan (PT)
                                </label>
                                <input 
                                    type="text" 
                                    value={data.company_name} 
                                    onChange={e => setData('company_name', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none transition-colors"
                                    placeholder="Contoh: PT Solusi Mitra Mandiri"
                                    required
                                />
                                {errors.company_name && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.company_name}</span>}
                            </div>

                            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mt-4">
                                Tautan Website Resmi (Knowledge Links)
                            </h3>

                            {/* Company Website URL Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Globe className="text-[#e98425] w-3 h-3" /> Website Utama Perusahaan
                                </label>
                                <input 
                                    type="url" 
                                    value={data.company_website} 
                                    onChange={e => setData('company_website', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white font-mono focus:border-[#e98425] outline-none transition-colors"
                                    placeholder="https://example.com"
                                    required
                                />
                                {errors.company_website && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.company_website}</span>}
                            </div>

                            {/* System / ERP Website URL Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Globe className="text-[#e98425] w-3 h-3" /> Website Aplikasi & Sistem ERP
                                </label>
                                <input 
                                    type="url" 
                                    value={data.system_website} 
                                    onChange={e => setData('system_website', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white font-mono focus:border-[#e98425] outline-none transition-colors"
                                    placeholder="https://system.example.com"
                                    required
                                />
                                {errors.system_website && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.system_website}</span>}
                            </div>

                            {/* Instagram Profile URL Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 flex items-center gap-1.5">
                                    <Globe className="text-[#e98425] w-3 h-3" /> URL Profil Instagram Gym
                                </label>
                                <input 
                                    type="url" 
                                    value={data.instagram_url} 
                                    onChange={e => setData('instagram_url', e.target.value)} 
                                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white font-mono focus:border-[#e98425] outline-none transition-colors"
                                    placeholder="https://instagram.com/yourgym"
                                    required
                                />
                                {errors.instagram_url && <span className="text-red-400 text-[10px] font-mono mt-0.5">{errors.instagram_url}</span>}
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full sm:w-auto self-start mt-4 px-6 py-3 bg-[#e98425] hover:scale-[1.02] active:scale-[0.98] text-[#1a1714] font-extrabold text-xs rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                            </button>
                        </div>
                    </form>

                    {/* RIGHT PANEL: Live Preview / Explanation (Col 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-5">
                        
                        {/* Live Knowledge Links Card */}
                        <Card title="Live Knowledge Links" color="dark">
                            <div className="flex flex-col gap-3.5 mt-2">
                                <p className="text-[11px] text-[#f5efe4]/50 leading-relaxed">
                                    Calon pelanggan dapat diarahkan ke situs resmi berikut saat menanyakan alamat website atau profil perusahaan PT:
                                </p>
                                
                                <div className="flex flex-col gap-2 mt-1">
                                    {/* Company Website Link */}
                                    <a 
                                        href={data.company_website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Buildings className="w-4 h-4 text-[#e98425]" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-bold text-white tracking-wide">Website Utama Perusahaan</span>
                                                <span className="text-[9px] font-mono text-[#f5efe4]/40 truncate mt-0.5">{data.company_website}</span>
                                            </div>
                                        </div>
                                        <ArrowSquareOut className="w-4 h-4 text-[#f5efe4]/20 group-hover:text-[#e98425] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </a>

                                    {/* System ERP Website Link */}
                                    <a 
                                        href={data.system_website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Globe className="w-4 h-4 text-[#e98425]" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-bold text-white tracking-wide">Aplikasi & Sistem ERP</span>
                                                <span className="text-[9px] font-mono text-[#f5efe4]/40 truncate mt-0.5">{data.system_website}</span>
                                            </div>
                                        </div>
                                        <ArrowSquareOut className="w-4 h-4 text-[#f5efe4]/20 group-hover:text-[#e98425] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </a>

                                    {/* Instagram Profile Link */}
                                    <a 
                                        href={data.instagram_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl group transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Globe className="w-4 h-4 text-[#e98425]" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-bold text-white tracking-wide">Instagram Resmi</span>
                                                <span className="text-[9px] font-mono text-[#f5efe4]/40 truncate mt-0.5">{data.instagram_url}</span>
                                            </div>
                                        </div>
                                        <ArrowSquareOut className="w-4 h-4 text-[#f5efe4]/20 group-hover:text-[#e98425] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </a>
                                </div>
                            </div>
                        </Card>

                        {/* AI Prompt Injection Card */}
                        <Card title="Bagaimana AI Menggunakannya?" color="yellow">
                            <div className="flex flex-col gap-3 text-[11px] text-[#1a1714]/80 leading-relaxed">
                                <p className="font-semibold">
                                    Asisten AI akan mendeteksi keyword seputar profil dan situs web. Contoh interaksi otomatis:
                                </p>
                                
                                <div className="bg-[#1a1714]/5 p-3 rounded-lg border border-[#1a1714]/10 font-mono text-[10px] flex flex-col gap-2">
                                    <div>
                                        <span className="font-bold text-[#e98425]/90">User:</span> "Gym ini punyanya perusahaan apa ya?"
                                    </div>
                                    <div>
                                        <span className="font-bold text-blue-800">AI Bot:</span> "{data.gym_name} berada di bawah naungan resmi perusahaan {data.company_name}. Info lengkap profil perusahaan kami bisa dicek di {data.company_website.replace('https://', '')} ya kak."
                                    </div>
                                </div>

                                <div className="bg-[#1a1714]/5 p-3 rounded-lg border border-[#1a1714]/10 font-mono text-[10px] flex flex-col gap-2">
                                    <div>
                                        <span className="font-bold text-[#e98425]/90">User:</span> "Ada link daftar online / portal member?"
                                    </div>
                                    <div>
                                        <span className="font-bold text-blue-800">AI Bot:</span> "Ada kak! Untuk registrasi mandiri, melihat jadwal latihan, dan mengelola membership, kakak bisa langsung mengunjungi portal aplikasi ERP kami di {data.system_website.replace('https://', '')}."
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
