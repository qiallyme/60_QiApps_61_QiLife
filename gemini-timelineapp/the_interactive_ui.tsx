import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Play, Mic, FileText, Image as ImageIcon, X, Search, Download } from 'lucide-react';

const icons = {
  video: <Play size={24} fill="currentColor" />,
  audio: <Mic size={24} />,
  infographic: <ImageIcon size={24} />,
  document: <FileText size={24} />,
  article: <FileText size={24} />
};

const Node = ({ item, index, scrollX }) => {
  const [open, setOpen] = useState(false);
  const isUp = index % 2 === 0;
  
  // Focal Scaling: Shrinks nodes that aren't near the center
  const scale = useTransform(scrollX, [index - 1, index, index + 1], [0.6, 1.4, 0.6]);
  const opacity = useTransform(scrollX, [index - 1.5, index, index + 1.5], [0.2, 1, 0.2]);

  const downloadBundle = (e) => {
    e.stopPropagation();
    const blob = new Blob([`ENTRY: ${item.title}\nDATE: ${item.date}\nCATEGORY: ${item.category}\nTYPE: ${item.type}\n\n${item.raw_md || ''}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.date}_${item.title.replace(/\s+/g, '_')}_manifest.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsset = (e) => {
    e.stopPropagation();
    if (!item.asset_path) return;
    const a = document.createElement('a');
    a.href = item.asset_path;
    const fileName = item.asset_path.split('/').pop() || `${item.date}_asset`;
    a.download = fileName;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-w-[350px] h-full">
      {/* Date/Title Hover Label */}
      <motion.div style={{ opacity }} className={`absolute whitespace-nowrap font-mono text-[10px] tracking-[0.3em] uppercase text-blue-400/60 ${isUp ? 'bottom-[60%]' : 'top-[60%]'}`}>
        {item.date} — {item.title}
      </motion.div>

      {/* Connection Stem */}
      <motion.div 
        style={{ scaleY: scale, opacity }}
        className={`absolute w-px bg-gradient-to-b from-blue-500/50 to-transparent ${isUp ? 'bottom-1/2 h-32' : 'top-1/2 h-32 rotate-180'}`} 
      />

      {/* Interactive Node */}
      <motion.button
        style={{ scale, opacity }}
        onClick={() => setOpen(true)}
        className={`z-20 w-16 h-16 rounded-full border-2 flex items-center justify-center backdrop-blur-2xl bg-slate-900/90 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-colors
          ${isUp ? '-translate-y-32' : 'translate-y-32'} 
          ${item.category === 'finance' ? 'border-emerald-500 text-emerald-400' : 'border-blue-500 text-blue-400 hover:border-white'}`}
      >
        {icons[item.type]}
      </motion.button>

      {/* Overlay Modal */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: isUp ? -100 : 100 }}
            animate={{ opacity: 1, scale: 1, y: isUp ? -180 : 180 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-[100] w-96 p-6 rounded-[2.5rem] bg-slate-900/95 border border-white/10 backdrop-blur-3xl shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold leading-tight">{item.title}</h4>
              <button onClick={() => setOpen(false)} className="p-1 hover:text-red-400"><X size={20} /></button>
            </div>
            
            <div className="text-sm text-slate-400 mb-4 max-h-32 overflow-y-auto pr-2 scrollbar-hide" dangerouslySetInnerHTML={{ __html: item.description }} />
            
            <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/5 aspect-video mb-4">
               {item.type === 'video' && <video src={item.asset_path} controls className="w-full h-full object-cover" />}
               {item.type === 'infographic' && <img src={item.asset_path} className="w-full h-full object-contain" alt={item.title} />}
               {item.type === 'audio' && <div className="h-full flex items-center p-4"><audio src={item.asset_path} controls className="w-full" /></div>}
               {item.type === 'document' && (
                 <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                   <FileText size={36} />
                   <span className="text-xs font-mono">{item.asset_path ? item.asset_path.split('/').pop() : 'Document file'}</span>
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-2">
              {item.asset_path && (
                <button onClick={downloadAsset} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600/80 hover:bg-blue-500 border border-blue-400/30 text-[10px] uppercase font-bold tracking-widest text-white transition-all shadow-lg shadow-blue-500/20">
                  <Download size={14} /> Download Media File ({item.type})
                </button>
              )}

              <button onClick={downloadBundle} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all">
                <FileText size={14} /> Download Text Manifest
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scrollX = useTransform(scrollYProgress, [0, 1], [0, data.length - 1]);
  const xTranslate = useTransform(scrollYProgress, [0, 1], ["0%", `-${(data.length - 1) * 15}%`]);
  const x = useSpring(xTranslate, { stiffness: 40, damping: 15 });

  useEffect(() => {
    fetch('/timeline.json').then(res => res.json()).then(json => {
      setData(json);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500);
    });
  }, []);

  const filtered = data.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.date.includes(search));

  return (
    <div ref={containerRef} className="h-[1200vh] bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* HUD UI */}
        <header className="fixed top-8 left-10 z-[100] flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tighter">QI<span className="text-blue-500">TIMELINE</span></h1>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/60 border border-white/10 rounded-full px-4 py-1 flex items-center gap-2">
              <Search size={14} className="text-slate-500" />
              <input 
                className="bg-transparent border-none outline-none text-[11px] w-32 font-mono uppercase tracking-widest"
                placeholder="SEARCH..."
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Backdrop Visuals */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)] opacity-30" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        {/* The Track */}
        <motion.div style={{ x }} className="flex h-full items-center px-[45vw]">
          {filtered.map((item, i) => (
            <Node key={i} item={item} index={i} scrollX={scrollX} />
          ))}
        </motion.div>

        {/* Progress HUD */}
        <div className="fixed bottom-10 right-10 flex flex-col items-end opacity-20 group hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono tracking-[0.5em] mb-2 uppercase">Temporal Sequence</span>
          <div className="h-[2px] w-48 bg-slate-800 relative overflow-hidden">
             <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-0 bg-blue-500 origin-left" />
          </div>
        </div>
      </div>
    </div>
  );
}