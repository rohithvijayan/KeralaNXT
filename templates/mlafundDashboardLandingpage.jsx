import React, { useState } from 'react';
import {
    ArrowLeft,
    MapPin,
    Grid,
    TrendingUp,
    Car,
    Building2,
    HeartPulse,
    GraduationCap,
    Zap,
    Droplet,
    Trophy,
    MoreHorizontal,
    ArrowRight,
    ChevronRight,
    Home,
    BarChart3,
    Search,
    User,
    ExternalLink,
    PieChart
} from 'lucide-react';

const App = () => {
    // Mock Data
    const stats = {
        totalExpenditure: "₹2,450 Cr",
        mlas: 140,
        districts: 14,
        categories: 8
    };

    const topDistricts = [
        { name: "Thiruvananthapuram", amount: "₹180 Cr", percentage: 87, color: "from-emerald-400 to-emerald-600" },
        { name: "Kollam", amount: "₹165 Cr", percentage: 82, color: "from-blue-400 to-blue-600" },
        { name: "Ernakulam", amount: "₹210 Cr", percentage: 79, color: "from-indigo-400 to-indigo-600" }
    ];

    const topMLAs = [
        { name: "V. Joy", amount: "₹23.2 Cr", initials: "VJ", party: "CPI(M)" },
        { name: "K.N. Balagopal", amount: "₹21.8 Cr", initials: "KN", party: "CPI(M)" },
        { name: "C.R. Mahesh", amount: "₹19.5 Cr", initials: "CR", party: "INC" }
    ];

    const sectors = [
        { name: "Road", amount: "₹1.0k", icon: <Car className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Infra", amount: "₹687", icon: <Building2 className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "Health", amount: "₹196", icon: <HeartPulse className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-50" },
        { name: "Education", amount: "₹147", icon: <GraduationCap className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "Electricity", amount: "₹157", icon: <Zap className="w-5 h-5" />, color: "text-yellow-600", bg: "bg-yellow-50" },
        { name: "Irrigation", amount: "₹133", icon: <Droplet className="w-5 h-5" />, color: "text-cyan-600", bg: "bg-cyan-50" },
        { name: "Sports", amount: "₹74", icon: <Trophy className="text-emerald-600" />, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Others", amount: "₹1.1k", icon: <MoreHorizontal className="w-5 h-5" />, color: "text-slate-600", bg: "bg-slate-50" }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-24 md:pb-12 selection:bg-emerald-100 selection:text-emerald-900">
            {/* Decorative Background Mesh */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-100/40 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full" />
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-800">Kerala<span className="text-emerald-600">XT</span></span>
                        </div>
                        <div className="hidden md:h-4 md:w-px md:bg-slate-200 md:block" />
                        <nav className="hidden md:flex items-center gap-2 text-[13px] font-medium text-slate-500">
                            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Dashboard</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-slate-800">MLA Fund Insights</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold text-slate-600 transition-all">
                            <Search className="w-3.5 h-3.5" />
                            <span>Search Database</span>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ring-1 ring-slate-200">
                            AD
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">

                {/* Page Title Section */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        MLA Fund <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Insights</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
                        Real-time analytics and distribution tracking of the Kerala State Member of Legislative Assembly (MLA) Development Funds.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* PRIMARY HERO CARD - Col Span 8 */}
                    <section className="col-span-1 md:col-span-8 group relative bg-emerald-950 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-emerald-900/20">
                        {/* Visual Flair */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-emerald-400 blur-[100px] rounded-full animate-pulse" />
                            <Grid className="absolute bottom-10 right-10 w-64 h-64 text-emerald-400 opacity-10" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                                    Fiscal Year 2024-25
                                </div>
                            </div>

                            <div className="mb-auto">
                                <p className="text-emerald-400/80 font-medium mb-1">Cumulative State-wide Expenditure</p>
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
                                        {stats.totalExpenditure}
                                    </h2>
                                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md text-sm font-bold">
                                        <TrendingUp className="w-4 h-4" />
                                        +12%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-emerald-800/50 pt-8">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.mlas}</div>
                                    <div className="text-[11px] text-emerald-400/60 uppercase font-bold tracking-widest">Active MLAs</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.districts}</div>
                                    <div className="text-[11px] text-emerald-400/60 uppercase font-bold tracking-widest">Districts</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.categories}</div>
                                    <div className="text-[11px] text-emerald-400/60 uppercase font-bold tracking-widest">Fund Sectors</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TOP MLAs - Col Span 4 */}
                    <section className="col-span-1 md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 tracking-tight">Top Perfomers</h3>
                            </div>
                            <button className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest">All</button>
                        </div>

                        <div className="space-y-6 flex-1">
                            {topMLAs.map((mla, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                                            {mla.initials}
                                        </div>
                                        {idx === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-slate-800 leading-tight">{mla.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{mla.party}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900 leading-none">{mla.amount}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-8 w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            View Detailed Leaderboard <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </section>

                    {/* SECTOR GRID - Col Span 8 */}
                    <section className="col-span-1 md:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <PieChart className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 tracking-tight">Sectoral Distribution</h3>
                                    <p className="text-xs text-slate-400 font-medium">Breakdown by project category</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {sectors.map((sector, idx) => (
                                <div key={idx} className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500">
                                    <div className={`w-12 h-12 ${sector.bg} ${sector.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        {sector.icon}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{sector.name}</p>
                                    <p className="text-xl font-black text-slate-900 tabular-nums">{sector.amount}</p>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-3 h-3 text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* DISTRICTS - Col Span 4 */}
                    <section className="col-span-1 md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm overflow-hidden relative">
                        <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                            <MapPin className="w-48 h-48 text-slate-900" />
                        </div>

                        <h3 className="font-bold text-slate-800 tracking-tight mb-8">Regional Performance</h3>

                        <div className="space-y-8">
                            {topDistricts.map((district, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Rank #0{idx + 1}</span>
                                            <p className="font-bold text-slate-800 text-lg">{district.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-slate-900">{district.amount}</span>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase">{district.percentage}% Utilization</p>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${district.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${district.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-4 bg-slate-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compare Districts</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </section>

                    {/* FULL DASHBOARD CTA */}
                    <section className="col-span-1 md:col-span-12 group">
                        <div className="bg-white rounded-[2.5rem] p-1 border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="bg-slate-900 m-1 rounded-[2.2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group-hover:bg-black transition-colors duration-500">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Grid className="w-64 h-64 -rotate-12" />
                                </div>

                                <div className="relative z-10 text-center md:text-left">
                                    <h4 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Access Granular Project Data</h4>
                                    <p className="text-slate-400 text-sm md:text-base max-w-xl">
                                        View individual project photos, completion certificates, and contractor details for every constituency in the state.
                                    </p>
                                </div>

                                <div className="relative z-10">
                                    <button className="px-8 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center gap-3 font-bold text-lg shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-1 active:scale-95">
                                        Enter Full Dashboard <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Aesthetic Mobile Navigation (Dock Style) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                <nav className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl">
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                        <Home className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <BarChart3 className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <MapPin className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                </nav>
            </div>

            <footer className="max-w-7xl mx-auto px-8 py-12 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em] opacity-50">
                &copy; 2024 KeralaXT Data Engine • Transparency Protocol v4.2
            </footer>
        </div>
    );
};

export default App;