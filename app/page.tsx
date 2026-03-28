'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Siren, Shield, Zap, Navigation, Activity, ArrowRight, Ambulance, Heart, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-2 rounded-lg shadow-lg">
            <Siren className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter italic">LifeLine AI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#impact" className="hover:text-white transition-colors">Impact</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Cities</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="mb-8"
        >
          <Badge variant="emergency" className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
            Every Second Counts. Let AI Clear the Way.
          </Badge>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 max-w-4xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          A <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500">Living Neural Grid</span> for Emergency Response.
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          LifeLine AI uses real-time intelligence to not just guide ambulances—but to 
          <strong> control the entire road ahead</strong>, ensuring every second counts 
          when saving a life.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/dashboard">
            <Button size="lg" variant="emergency" className="px-10 h-14 text-md font-bold rounded-2xl group">
              Start Emergency Demo <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            {
              icon: Navigation,
              title: "A* Neural Routing",
              desc: "Dynamically calculates fastest paths based on real-time traffic density using A* heuristic algorithms.",
              color: "border-blue-500/30 bg-blue-500/5",
              iconColor: "text-blue-500"
            },
            {
              icon: Zap,
              title: "Smart Signal Control",
              desc: "Direct IoT integration clears traffic signals 300m ahead of the ambulance to minimize braking.",
              color: "border-purple-500/30 bg-purple-500/5",
              iconColor: "text-purple-500"
            },
            {
              icon: Shield,
              title: "Predictive AI Safety",
              desc: "Anticipates traffic peaks and preemptively clears intersections using historical congestion data.",
              color: "border-green-500/30 bg-green-500/5",
              iconColor: "text-green-500"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-8 rounded-3xl border ${feature.color} backdrop-blur-sm text-left hover:scale-[1.02] transition-transform cursor-default group`}
            >
              <div className={`p-4 rounded-2xl ${feature.color.replace('500/30', '500/10')} border ${feature.color} inline-block mb-6`}>
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Impact Stat Counter (Abstract) */}
        <motion.div 
          className="mt-32 w-full max-w-5xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-12 overflow-hidden relative"
          whileInView={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
           <div className="absolute top-0 right-0 p-8 opacity-20">
              <Ambulance className="h-64 w-64 text-red-600 rotate-12" />
           </div>
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <div>
                 <h2 className="text-3xl font-extrabold mb-6 flex items-center">
                    <Heart className="mr-3 text-red-500 fill-red-500 animate-pulse" /> Saving Precious Minutes
                 </h2>
                 <p className="text-slate-400 text-lg leading-relaxed mb-6">
                    In medical emergencies, every 60 seconds saved increases the survival rate by up to 10%.
                    LifeLine AI targets a <strong>40% reduction in ETA</strong> across dense urban centers.
                 </p>
                 <div className="flex space-x-12 pt-4">
                    <div className="flex flex-col">
                       <span className="text-4xl font-black text-red-500">40%</span>
                       <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Faster Arrival</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-4xl font-black text-blue-500">300m+</span>
                       <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Signal Clearance</span>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-center bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                 <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                 </div>
                 <p className="text-white font-medium italic mb-4">
                    "This system transformed how our dispatchers handle peak-hour traffic. The automated signal clearing is a game-changer."
                 </p>
                 <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 mr-3 flex items-center justify-center text-xs font-bold">JD</div>
                    <div className="flex flex-col text-xs">
                       <span className="font-bold">John Doe</span>
                       <span className="text-slate-500">City Emergency Director</span>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-slate-900 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0 space-y-2">
           <div className="flex items-center space-x-2">
              <Siren className="h-4 w-4 text-red-600" />
              <span className="text-white font-bold tracking-tight italic">LifeLine AI</span>
           </div>
           <p className="text-xs">Next-Gen Emergency Infrastructure.</p>
        </div>
        <div className="flex space-x-12">
           <div className="flex flex-col space-y-3">
              <span className="text-white font-bold text-xs uppercase tracking-widest">Platform</span>
              <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Live Demo</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">API Docs</Link>
           </div>
           <div className="flex flex-col space-y-3">
              <span className="text-white font-bold text-xs uppercase tracking-widest">Legal</span>
              <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link>
           </div>
        </div>
        <div className="mt-12 md:mt-0 text-[10px] font-bold uppercase tracking-widest opacity-25">
          © 2026 LifeLine AI Systems. Built for Smart Cities.
        </div>
      </footer>
    </div>
  );
}
