// import React from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Gavel } from "lucide-react";

// interface SnapBidPreloaderProps {
//   show: boolean;
// }

// export const SnapBidPreloader: React.FC<SnapBidPreloaderProps> = ({ show }) => {
//   return (
//     <AnimatePresence mode="wait">
//       {show && (
//         <motion.div
//           // NỀN TỰ ĐỘNG CỦA PRELOADER – CỐ ĐỊNH, KHÔNG PHỤ THUỘC DARK/LIGHT MODE
//           className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]"
//           initial={{ opacity: 1 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.5, ease: "easeInOut" }}
//         >
//           {/* Glow gradient hồng + xanh (cũng cố định luôn) */}
//           <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.35),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.28),_transparent_55%)]" />

//           <div className="relative flex flex-col items-center gap-8 px-6">
//             {/* Orb + gavel animation */}
//             <div className="relative w-40 h-40 md:w-48 md:h-48">
//               {/* Outer rotating ring – hồng */}
//               <motion.div
//                 className="absolute inset-0 rounded-full border border-pink-400/70 shadow-[0_0_60px_rgba(236,72,153,0.8)]"
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
//               />

//               {/* Inner counter-rotating ring – xanh */}
//               <motion.div
//                 className="absolute inset-4 rounded-full border border-cyan-300/80"
//                 animate={{ rotate: -360 }}
//                 transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
//               />

//               {/* Orbiting bid chip */}
//               <motion.div
//                 className="absolute -top-2 left-1/2 -translate-x-1/2"
//                 animate={{
//                   rotate: 360,
//                   translateY: [0, 6, 0],
//                 }}
//                 transition={{
//                   rotate: { duration: 5, repeat: Infinity, ease: "linear" },
//                   translateY: { duration: 1.4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
//                 }}
//               >
//                 <div className="rounded-full bg-[#050816] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.8)] border border-pink-400/80">
//                   LIVE BID
//                 </div>
//               </motion.div>

//               {/* Core orb – nền tự tô, không blur theo background app */}
//               <motion.div
//                 className="absolute inset-0 rounded-full bg-[#050816] flex items-center justify-center"
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 0.6, ease: "easeOut" }}
//               >
//                 <motion.div
//                   className="flex flex-col items-center gap-2"
//                   animate={{ scale: [1, 1.08, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
//                   transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
//                 >
//                   <Gavel className="w-10 h-10 md:w-12 md:h-12 text-cyan-200 drop-shadow-[0_0_24px_rgba(56,189,248,0.9)]" />

//                   <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
//                     Securing your bid
//                   </span>
//                 </motion.div>
//               </motion.div>
//             </div>

//             {/* SNAPBID wordmark */}
//             <div className="flex flex-col items-center gap-3">
//               <motion.div
//                 className="flex gap-1 text-3xl md:text-4xl font-black tracking-[0.4em] text-white"
//                 initial="hidden"
//                 animate="visible"
//               >
//                 {Array.from("SNAPBID").map((letter, index) => (
//                   <motion.span
//                     key={index}
//                     className="inline-block"
//                     variants={{
//                       hidden: { y: 16, opacity: 0 },
//                       visible: { y: 0, opacity: 1 },
//                     }}
//                     transition={{
//                       delay: 0.1 * index,
//                       duration: 0.45,
//                       ease: "easeOut",
//                     }}
//                   >
//                     {letter}
//                   </motion.span>
//                 ))}
//               </motion.div>

//               {/* Tagline + dot loading */}
//               <div className="flex flex-col items-center gap-1">
//                 <span className="text-xs md:text-sm text-slate-300">
//                   Matching collectors, curating bids
//                 </span>
//                 <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.35em] text-slate-400">
//                   <span>LOADING</span>
//                   {[0, 1, 2].map((i) => (
//                     <motion.span
//                       key={i}
//                       className="inline-block"
//                       animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
//                       transition={{
//                         duration: 0.8,
//                         repeat: Infinity,
//                         delay: i * 0.18,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       ·
//                     </motion.span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default SnapBidPreloader;
