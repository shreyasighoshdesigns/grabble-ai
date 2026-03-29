import { useState, useEffect } from 'react';
import { signInWithGoogle } from '../firebase';
import { MousePointer2, Image as ImageIcon, Search, Tag, Copy, Sparkles, Wand2, ArrowRight, Download } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError(`Domain not authorized. Add to Firebase Auth: ${window.location.hostname}`);
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError("Popup blocked. Please allow popups.");
      } else {
        setLoginError(error.message || "Failed to sign in. Please try again.");
      }
    }
  };

  const features = [
    { title: "Upload & Save", desc: "Drag, drop, or upload screenshots" },
    { title: "Auto Tags", desc: "Automatically detects colors, components, and layouts" },
    { title: "Semantic Search", desc: "Find exactly what you need instantly" },
    { title: "Visual Similarity", desc: "Upload a wireframe and find matching designs" },
    { title: "Auto-Detect Palettes", desc: "Instantly detect hex codes from uploads and download the full palette" },
    { title: "Moodboarding", desc: "Curate and organize UI into moodboards" },
  ];

  /* ── Shared carousel content (used in both mobile + desktop) ── */
  const CarouselContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Inline Styles for Instagram animation */}
      <style>{`
        @keyframes instaprogress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-insta {
          animation: instaprogress 4000ms linear forwards;
        }
      `}</style>

      {/* Instagram Story Progress Bars */}
      <div className={`flex gap-1.5 ${mobile ? 'gap-1.5' : 'gap-2.5'} w-full ${mobile ? 'max-w-sm' : 'max-w-2xl'} mb-3 ${mobile ? 'mb-3' : 'mb-4'} px-4`}>
        {features.map((_, idx) => (
          <div key={idx} className={`${mobile ? 'h-1.5' : 'h-2'} flex-1 bg-zinc-900/15 rounded-full overflow-hidden cursor-pointer shadow-inner`} onClick={() => setActiveFeature(idx)}>
            <div
              className={`h-full bg-zinc-900 shadow-md ${
                activeFeature === idx ? 'animate-insta' :
                idx < activeFeature ? 'w-full' : 'w-0'
              }`}
              key={activeFeature === idx ? `active-${idx}` : `inactive-${idx}`}
            />
          </div>
        ))}
      </div>

      {/* Feature Text */}
      <div className={`text-center w-full ${mobile ? 'max-w-sm px-4' : 'max-w-2xl px-6'} ${mobile ? 'h-14' : 'h-24'} flex flex-col items-center justify-center transition-all ${mobile ? 'mb-2' : 'mb-4'}`}>
        <h2 className={`${mobile ? 'text-base' : 'text-2xl xl:text-3xl'} font-bold text-zinc-800 ${mobile ? 'mb-0.5' : 'mb-2'} tracking-tight leading-tight`}>
          {features[activeFeature].title}
        </h2>
        <p className={`${mobile ? 'text-xs' : 'text-base xl:text-lg'} font-medium text-zinc-600 leading-snug`}>
          {features[activeFeature].desc}
        </p>
      </div>

      {/* Doodle Style App Window */}
      <div className={`w-full ${mobile ? 'max-w-[280px] aspect-[16/11]' : 'max-w-2xl xl:max-w-3xl aspect-[16/10]'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${mobile ? 'rounded-xl' : 'rounded-2xl'} ${mobile ? 'shadow-[8px_8px_0px_#27272a]' : 'shadow-[16px_16px_0px_#27272a]'} overflow-hidden flex flex-col transition-all duration-500 relative shrink`}>

        {/* App Topbar */}
        <div className={`${mobile ? 'h-8' : 'h-14'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900 bg-zinc-50 flex items-center ${mobile ? 'px-2.5 gap-3' : 'px-5 gap-6'}`}>
          <div className={`flex ${mobile ? 'gap-1.5' : 'gap-2.5'}`}>
            <div className={`${mobile ? 'w-2 h-2' : 'w-3.5 h-3.5'} rounded-full ${mobile ? 'border-[1.5px]' : 'border-2'} border-zinc-900 bg-[#ff5f56]`}></div>
            <div className={`${mobile ? 'w-2 h-2' : 'w-3.5 h-3.5'} rounded-full ${mobile ? 'border-[1.5px]' : 'border-2'} border-zinc-900 bg-[#ffbd2e]`}></div>
            <div className={`${mobile ? 'w-2 h-2' : 'w-3.5 h-3.5'} rounded-full ${mobile ? 'border-[1.5px]' : 'border-2'} border-zinc-900 bg-[#27c93f]`}></div>
          </div>
          {/* Mock Search Bar */}
          <div className={`flex-1 max-w-sm ${mobile ? 'h-5' : 'h-9'} ${mobile ? 'border-[1.5px]' : 'border-2'} border-zinc-900 rounded-full flex items-center ${mobile ? 'px-2' : 'px-4'} transition-colors shadow-sm ${activeFeature === 2 ? 'bg-blue-100' : 'bg-white'}`}>
            <Search className={`${mobile ? 'w-2.5 h-2.5 mr-1' : 'w-4 h-4 mr-2'} ${activeFeature === 2 ? 'text-blue-600' : 'text-zinc-400'}`} />
            <span className={`${mobile ? 'text-[8px]' : 'text-sm'} font-mono font-bold ${activeFeature === 2 ? 'text-zinc-800' : 'text-zinc-300'}`}>
               {activeFeature === 2 ? "dark fintech dashboard" : "Search anything..."}
            </span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - hidden on mobile doodle */}
          {!mobile && (
            <div className="w-1/4 border-r-4 border-zinc-900 bg-[#fafafa] p-5 hidden md:block">
              <div className="h-3 w-1/2 bg-zinc-200 rounded-full mb-8"></div>
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-zinc-400"><ImageIcon className="w-5 h-5"/> <div className="h-2.5 w-16 bg-zinc-200 rounded-full"></div></div>
                <div className="flex items-center gap-3 text-zinc-400"><Tag className="w-5 h-5"/> <div className="h-2.5 w-12 bg-zinc-200 rounded-full"></div></div>
                <div className="flex items-center gap-3 text-zinc-400"><Copy className="w-5 h-5"/> <div className="h-2.5 w-20 bg-zinc-200 rounded-full"></div></div>
              </div>
            </div>
          )}

          {/* Main Area */}
          <div className={`flex-1 ${mobile ? 'p-3' : 'p-8'} relative flex items-center justify-center`}>

            {/* 0. Upload & Save */}
            {activeFeature === 0 && (
              <div className={`w-full h-full ${mobile ? 'border-[3px]' : 'border-4'} border-dashed border-[#4ade80] bg-[#4ade80]/10 rounded-2xl flex flex-col items-center justify-center animate-pulse relative overflow-visible`}>
                 <ImageIcon className={`${mobile ? 'w-6 h-6 mb-1.5' : 'w-12 h-12 mb-4'} text-[#4ade80]`} />
                 <div className={`${mobile ? 'text-xs' : 'text-xl'} font-bold text-[#4ade80] font-mono`}>DROP FILES</div>

                 <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 ${mobile ? 'w-20 h-14' : 'w-40 h-28'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${mobile ? 'rounded-lg' : 'rounded-xl'} ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} -rotate-6 flex flex-col overflow-hidden`}>
                   <div className={`${mobile ? 'h-3' : 'h-6'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900 bg-blue-200`}></div>
                   <div className={`flex-1 ${mobile ? 'p-1' : 'p-2'} flex flex-col gap-1 bg-yellow-50`}>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full"></div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full"></div>
                      <div className="w-2/3 h-1.5 bg-zinc-200 rounded-full"></div>
                   </div>
                 </div>
              </div>
            )}

            {/* 1. Auto Tags */}
            {activeFeature === 1 && (
              <div className="w-full h-full relative flex items-center justify-center">
                <div className={`${mobile ? 'w-28 h-32' : 'w-56 h-64'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[6px_6px_0px_#27272a]' : 'shadow-[12px_12px_0px_#27272a]'} relative z-10 flex flex-col overflow-hidden rotate-2`}>
                   <div className={`${mobile ? 'h-4' : 'h-8'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900 bg-indigo-300`}></div>
                   <div className={`flex-1 ${mobile ? 'p-1.5' : 'p-3'} flex ${mobile ? 'gap-1.5' : 'gap-3'} bg-zinc-50`}>
                     <div className={`${mobile ? 'w-4' : 'w-8'} h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-amber-300 rounded-md`}></div>
                     <div className={`flex-1 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-rose-300 rounded-md`}></div>
                   </div>
                </div>
                {/* Floating Hand-drawn Tags */}
                <div className={`absolute ${mobile ? 'top-2 left-2' : 'top-8 left-16'} bg-yellow-200 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${mobile ? 'px-1.5 py-0.5' : 'px-3 py-1.5'} rounded-xl ${mobile ? 'text-[8px]' : 'text-xs'} font-black font-mono -rotate-12 z-20 ${mobile ? 'shadow-[3px_3px_0px_#27272a]' : 'shadow-[6px_6px_0px_#27272a]'}`}>
                  #dashboard
                </div>
                <div className={`absolute ${mobile ? 'bottom-4 right-2' : 'bottom-16 right-16'} bg-pink-200 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${mobile ? 'px-1.5 py-0.5' : 'px-3 py-1.5'} rounded-xl ${mobile ? 'text-[8px]' : 'text-xs'} font-black font-mono rotate-6 z-20 ${mobile ? 'shadow-[3px_3px_0px_#27272a]' : 'shadow-[6px_6px_0px_#27272a]'}`}>
                  #sidebar
                </div>
                <div className={`absolute ${mobile ? 'top-10 right-1' : 'top-24 right-10'} bg-emerald-200 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${mobile ? 'px-1.5 py-0.5' : 'px-3 py-1.5'} rounded-xl ${mobile ? 'text-[8px]' : 'text-xs'} font-black font-mono rotate-12 z-20 ${mobile ? 'shadow-[3px_3px_0px_#27272a]' : 'shadow-[6px_6px_0px_#27272a]'}`}>
                  #purple
                </div>
              </div>
            )}

            {/* 2. Semantic Search */}
            {activeFeature === 2 && (
              <div className={`w-full h-full grid grid-cols-2 ${mobile ? '' : 'lg:grid-cols-3'} ${mobile ? 'gap-2' : 'gap-6'}`}>
                 <div className={`bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} aspect-square flex flex-col items-center justify-center ${mobile ? 'p-1.5' : 'p-3'} scale-105 -rotate-2 z-10`}>
                   <div className={`w-full h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-zinc-800 rounded-md flex items-center justify-center`}><Search className={`${mobile ? 'w-4 h-4' : 'w-8 h-8'} text-white`}/></div>
                 </div>
                 <div className={`bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} aspect-square flex flex-col items-center justify-center ${mobile ? 'p-1.5' : 'p-3'} rotate-3 z-10`}>
                   <div className={`w-full h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-blue-300 rounded-md`}></div>
                 </div>
                 <div className={`bg-zinc-50 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-300 rounded-xl border-dashed aspect-square opacity-60`}></div>
                 <div className={`bg-zinc-50 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-300 rounded-xl border-dashed aspect-square opacity-60`}></div>
                 {!mobile && <div className="bg-zinc-50 border-4 border-zinc-300 rounded-xl border-dashed aspect-square opacity-60"></div>}
                 {!mobile && (
                   <div className="bg-white border-4 border-zinc-900 rounded-xl shadow-[8px_8px_0px_#27272a] aspect-square flex flex-col items-center justify-center p-3 -rotate-1 z-10 transition-transform">
                     <div className="w-full h-full border-4 border-zinc-900 bg-rose-300 rounded-md"></div>
                   </div>
                 )}
              </div>
            )}

            {/* 3. Visual Similarity */}
            {activeFeature === 3 && (
              <div className={`w-full h-full flex items-center justify-center ${mobile ? 'gap-2' : 'gap-6'}`}>
                <div className={`${mobile ? 'w-16 h-24' : 'w-36 h-52'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 border-dashed rounded-xl flex flex-col ${mobile ? 'p-1.5 gap-1' : 'p-3 gap-3'} opacity-90 rotate-2`}>
                   <div className={`w-full ${mobile ? 'h-5' : 'h-10'} ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-md`}></div>
                   <div className={`flex ${mobile ? 'gap-1' : 'gap-2'} flex-1`}>
                     <div className={`${mobile ? 'w-4' : 'w-8'} h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-md`}></div>
                     <div className={`flex-1 h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-md`}></div>
                   </div>
                </div>

                <ArrowRight className={`${mobile ? 'w-5 h-5' : 'w-12 h-12'} text-zinc-900 stroke-[4px]`} />

                <div className={`${mobile ? 'w-16 h-24' : 'w-36 h-52'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl flex flex-col ${mobile ? 'p-1.5 gap-1' : 'p-3 gap-3'} ${mobile ? 'shadow-[6px_6px_0px_#27272a]' : 'shadow-[12px_12px_0px_#27272a]'} -rotate-3 overflow-hidden`}>
                   <div className={`w-full ${mobile ? 'h-5' : 'h-10'} ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-emerald-400 rounded-md`}></div>
                   <div className={`flex ${mobile ? 'gap-1' : 'gap-2'} flex-1`}>
                     <div className={`${mobile ? 'w-4' : 'w-8'} h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-blue-400 rounded-md`}></div>
                     <div className={`flex-1 h-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-amber-400 rounded-md`}></div>
                   </div>
                </div>
              </div>
            )}

            {/* 4. Color Palette */}
            {activeFeature === 4 && (
              <div className={`w-full h-full flex flex-col items-center justify-center relative ${mobile ? '' : '-mt-4'}`}>
                {/* UI Image */}
                <div className={`${mobile ? 'w-36 h-16' : 'w-64 h-32'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} flex overflow-hidden -rotate-2 relative z-10`}>
                   <div className="flex-1 bg-[#a3e635]"></div>
                   <div className={`${mobile ? 'w-8 border-x-[3px]' : 'w-16 border-x-4'} border-zinc-900 bg-pink-400`}></div>
                   <div className="flex-1 bg-emerald-400"></div>
                </div>

                {/* Generated Palette Box */}
                <div className={`${mobile ? 'w-44' : 'w-72'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[6px_6px_0px_#27272a]' : 'shadow-[12px_12px_0px_#27272a]'} ${mobile ? 'p-2' : 'p-4'} flex flex-col ${mobile ? 'gap-1.5' : 'gap-3'} rotate-2 relative z-20 ${mobile ? '-mt-3' : '-mt-6'}`}>
                  <div className="flex justify-between items-center mb-0.5">
                    <div className={`${mobile ? 'text-[7px]' : 'text-xs'} font-black uppercase text-zinc-900 tracking-wider`}>Detected Palette</div>
                    <div className={`${mobile ? 'w-4 h-4' : 'w-7 h-7'} rounded ${mobile ? 'border-[1.5px]' : 'border-2'} border-zinc-900 bg-blue-100 flex items-center justify-center`}>
                      <Download className={`${mobile ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-zinc-900 stroke-[3px]`} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {[
                      { color: 'bg-[#a3e635]', hex: '#6366F1' },
                      { color: 'bg-pink-400', hex: '#F472B6' },
                      { color: 'bg-emerald-400', hex: '#34D399' },
                      { color: 'bg-amber-300', hex: '#FCD34D' },
                    ].map(({ color, hex }) => (
                      <div key={hex} className="flex flex-col items-center gap-1">
                        <div className={`${mobile ? 'w-6 h-6' : 'w-10 h-10'} rounded-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 ${color}`}></div>
                        {!mobile && <div className="text-[10px] font-bold font-mono text-zinc-600 bg-zinc-100 px-1 rounded border border-zinc-200">{hex}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Magic hint */}
                {!mobile && (
                  <div className="absolute top-[15%] right-[5%] bg-yellow-200 border-4 border-zinc-900 px-3 py-1.5 rounded-xl text-xs font-black font-sans -rotate-12 shadow-[6px_6px_0px_#27272a] z-30 tracking-tight">
                    ✨ Auto-Detected!
                  </div>
                )}
              </div>
            )}

            {/* 5. Moodboarding */}
            {activeFeature === 5 && (
              <div className="w-full h-full relative flex items-center justify-center">
                 {/* Sticky Note */}
                 <div className={`absolute ${mobile ? 'top-1 left-1 w-14 h-16' : 'top-6 left-12 w-32 h-36'} bg-yellow-200 ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} -rotate-12 ${mobile ? 'p-1.5' : 'p-4'} flex flex-col items-center`}>
                   <div className={`w-full ${mobile ? 'h-1.5' : 'h-3'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900 ${mobile ? 'mb-1' : 'mb-3'}`}></div>
                   <div className={`w-2/3 ${mobile ? 'h-1.5' : 'h-3'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900`}></div>
                 </div>
                 {/* Card 1 */}
                 <div className={`absolute ${mobile ? 'bottom-2 left-4 w-20 h-24' : 'bottom-10 left-20 w-44 h-48'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[4px_4px_0px_#27272a]' : 'shadow-[8px_8px_0px_#27272a]'} rotate-3 overflow-hidden flex flex-col`}>
                   <div className={`${mobile ? 'h-12' : 'h-24'} bg-blue-300 ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900`}></div>
                   <div className={`flex-1 bg-zinc-50 ${mobile ? 'p-1' : 'p-2'}`}><div className={`w-1/2 ${mobile ? 'h-1' : 'h-2'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900`}></div></div>
                 </div>
                 {/* Card 2 */}
                 <div className={`absolute ${mobile ? 'top-3 right-2 w-22 h-18' : 'top-12 right-16 w-48 h-40'} bg-white ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 rounded-xl ${mobile ? 'shadow-[6px_6px_0px_#27272a]' : 'shadow-[12px_12px_0px_#27272a]'} rotate-12 overflow-hidden flex`}>
                   <div className={`${mobile ? 'w-8' : 'w-20'} h-full bg-emerald-300 ${mobile ? 'border-r-[3px]' : 'border-r-4'} border-zinc-900`}></div>
                   <div className={`flex-1 bg-zinc-50 ${mobile ? 'p-1' : 'p-2'}`}>
                     <div className={`w-full ${mobile ? 'h-1' : 'h-2'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900 ${mobile ? 'mb-1' : 'mb-2'}`}></div>
                     <div className={`w-3/4 ${mobile ? 'h-1' : 'h-2'} ${mobile ? 'border-b-[3px]' : 'border-b-4'} border-zinc-900`}></div>
                   </div>
                 </div>
                 {/* Color swatches overlapping */}
                 <div className={`absolute ${mobile ? 'bottom-4 right-2' : 'bottom-16 right-16'} flex -space-x-2 -rotate-6`}>
                   <div className={`${mobile ? 'w-6 h-6' : 'w-12 h-12'} rounded-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-rose-400 ${mobile ? 'shadow-[2px_2px_0px_#27272a]' : 'shadow-[4px_4px_0px_#27272a]'}`}></div>
                   <div className={`${mobile ? 'w-6 h-6' : 'w-12 h-12'} rounded-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-amber-400 ${mobile ? 'shadow-[2px_2px_0px_#27272a]' : 'shadow-[4px_4px_0px_#27272a]'}`}></div>
                   <div className={`${mobile ? 'w-6 h-6' : 'w-12 h-12'} rounded-full ${mobile ? 'border-[3px]' : 'border-4'} border-zinc-900 bg-purple-400 ${mobile ? 'shadow-[2px_2px_0px_#27272a]' : 'shadow-[4px_4px_0px_#27272a]'}`}></div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full overflow-hidden bg-white font-sans text-zinc-900 selection:bg-[#4ade80]/30 selection:text-zinc-900">

      {/* ══════════ MOBILE LAYOUT (< lg) ══════════ */}
      <div className="lg:hidden flex flex-col h-full w-full relative">

        {/* Top: Carousel area (~55% of screen) */}
        <div className="relative bg-[#d7ff64] flex-[55] flex items-center justify-center overflow-hidden">
          {/* Subtle dot pattern background */}
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8bb81e 1.5px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full py-4 px-4">
            <CarouselContent mobile />
          </div>

          {/* Curved divider */}
          <div className="absolute -bottom-[1px] left-0 right-0 z-20">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-14">
              <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Bottom: Login area (~45% of screen) */}
        <div className="relative bg-white flex-[45] flex flex-col items-center justify-center px-8 overflow-y-auto">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Logo */}
            <img src="/grabble-logo.png" alt="Grabble AI Logo" className="h-[2.25rem] mb-4 object-contain" />

            <h1 className="text-2xl font-extrabold tracking-tight mb-2 leading-[1.1] text-zinc-900 text-center">
              Never lose a design idea again.
            </h1>

            <p className="text-sm text-zinc-500 mb-6 leading-relaxed font-medium text-center">
              Save screenshots, auto-organize them, and turn them into moodboards — instantly.
            </p>

            <button
              onClick={handleLogin}
              className="w-full bg-zinc-900 hover:bg-[#84cc16] text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/20 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ background: 'white', borderRadius: '50%', padding: '2px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400 mt-3">
              <Sparkles className="w-3 h-3" />
              No clutter. Just your inspo.
            </div>

            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100 mt-3">{loginError}</p>
            )}
          </div>

          {/* Designer Signature */}
          <div className="mt-auto pb-4 text-center" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="text-[10px] font-medium text-zinc-400">
              Designed and built by Shreyasi Ghosh
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ DESKTOP LAYOUT (>= lg) — unchanged ══════════ */}

      {/* LEFT SIDE (minimal, clean, white background) */}
      <div className="hidden lg:flex w-[45%] xl:w-[40%] h-full overflow-y-auto flex-col relative px-16 xl:px-20 z-20 shrink-0">

        {/* Logo at top */}
        <div className="pt-12 pb-8">
          <div className="flex items-center cursor-default select-none group relative">
            <img src="/grabble-logo.png" alt="Grabble AI Logo" className="h-[3.5rem] transition-transform group-hover:scale-105 z-10 object-contain" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg w-full pb-10">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-zinc-900">
            Never lose a design idea again.
          </h1>

          <p className="text-xl text-zinc-500 mb-10 leading-relaxed font-medium">
            Save screenshots, auto-organize them, and turn them into moodboards — instantly.
          </p>

          <div className="space-y-4 max-w-sm">
            <button
              onClick={handleLogin}
              className="w-full bg-zinc-900 hover:bg-[#84cc16] text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-zinc-900/20 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ background: 'white', borderRadius: '50%', padding: '2px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-400 mt-4">
              <Sparkles className="w-3.5 h-3.5" />
              No clutter. Just your inspo.
            </div>

            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100 mt-4">{loginError}</p>
            )}
          </div>
        </div>

        {/* Designer Signature */}
        <div className="mt-auto pb-6">
          <div className="text-xs font-medium text-zinc-400">
            Designed and built by Shreyasi Ghosh
          </div>
          <div className="text-[11px] text-zinc-400/80 mt-0.5">
            For designers, by a designer
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Solid green, dotted pattern, doodle carousel) — desktop only */}
      <div className="hidden lg:flex h-full w-[55%] xl:w-[60%] bg-[#d7ff64] relative overflow-hidden items-center justify-center flex-col px-8 xl:px-16">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8bb81e 2px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        {/* Carousel Content */}
        <div className="relative z-10 w-full max-w-2xl xl:max-w-3xl flex flex-col items-center justify-center h-full py-6">
          <CarouselContent />

          {/* Bottom spacing for balance */}
          <div className="h-4 w-full shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
