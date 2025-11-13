import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product, useData } from '@/contexts/DataContext';

import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Mail, Github, Instagram, Twitter, Linkedin, Globe, CreditCard, ShieldCheck, Lock } from 'lucide-react'

import { Sparkles, BellRing, BadgeCheck, Percent, Gift, ArrowRight } from 'lucide-react'


import {
  Search,
  Clock,
  TrendingUp,
  Gavel,
  Flame,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

/**
 * HOME (Integrated):
 * - Reuses your DataContext products
 * - Adds animated Hero (floating orbs), Live Bid Ticker, Featured Carousel,
 *   Category filter chips, Sort (Ending/Highest), realtime countdown, and card hover animations.
 * - Minimal dependencies: framer-motion + your existing shadcn/ui components
 */

// type Product = {
//   id: string;
//   title: string;
//   category: string;
//   description?: string;
//   images: string[];
//   status: 'active' | string;
//   endTime?: number; // epoch ms
//   currentPrice: number;
//   buyNowPrice?: number;
// };

// đặt trên cùng file (ngoài component) hoặc tách ra constants.ts
type Brand = { name: string; logo: string; url?: string };

const BRANDS: Brand[] = [
  
  { name: 'Levis', logo: '/logos/brand_01.png', url: 'https://levi.com' },
  { name: 'Adidas', logo: '/logos/brand_02.png', url: 'https://adidas.com' },
  { name: 'Nike', logo: '/logos/brand_03.png', url: 'https://nike.com' },
  { name: 'H&M', logo: '/logos/brand_04.png', url: 'https://hm.com' },
];

// logo có fallback text nếu ảnh lỗi
function BrandLogo({ brand }: { brand: Brand }) {
  const [error, setError] = React.useState(false);
  const content = error ? (
    <div className="px-4 py-3 text-sm font-medium text-slate-600 rounded-md border bg-white/70">
      {brand.name}
    </div>
  ) : (
    <img
      src={brand.logo}
      alt={brand.name}
      loading="lazy"
      onError={() => setError(true)}
      className="h-20 w-auto object-contain grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition"
    />
  );
  return brand.url ? (
    <a href={brand.url} target="_blank" rel="noreferrer" aria-label={brand.name} className="shrink-0">
      {content}
    </a>
  ) : (
    <div className="shrink-0">{content}</div>
  );
}



function AuctionCard({ a, onPlaceBid, onToggleWatch, watched }) {
  return (
    <Card className="group overflow-hidden border-none bg-gradient-to-b from-white/60 to-white/20 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={a.image}
          alt={a.title}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        />
        <div className="absolute left-2 top-2 flex gap-2">
          {a.category && <Badge variant="secondary">{a.category}</Badge>}
          <Badge className="gap-1"><Flame className="h-3 w-3"/> Hot</Badge>
        </div>
        <Button
          variant={watched ? "secondary" : "ghost"}
          size="icon"
          className="absolute right-2 top-2 bg-white/70 hover:bg-white"
          onClick={() => onToggleWatch(a.id)}
          aria-label="Toggle watch"
        >
          <Heart className={`h-5 w-5 ${watched ? "fill-pink-500 text-pink-500" : ""}`} />
        </Button>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 flex items-center justify-between gap-2 text-base">
          {a.title}
          <span className="text-xs font-normal text-muted-foreground">
            <Countdown endTime={a.endTime} />
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Current bid</div>
          <div className="text-lg font-semibold">{currency(a.currentBid)}</div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{a.bids} bids</div>
          <Button size="sm" className="gap-2" onClick={() => onPlaceBid(a.id)}>
            <Gavel className="h-4 w-4" /> Place bid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -------- utilities --------
const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function useCountdown(endTime?: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endTime) return { d: 0, h: 0, m: 0, s: 0, done: true };
  const diff = Math.max(0, endTime - now);
  const totalS = Math.floor(diff / 1000);
  const d = Math.floor(totalS / 86400);
  const h = Math.floor((totalS % 86400) / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  return { d, h, m, s, done: totalS <= 0 };
}

function useMarquee() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    let raf = 0;
    const step = () => {
      if (!paused) {
        x -= 1; // speed
        const w = el.scrollWidth / 2;
        if (x <= -w) x = 0;
        el.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
  return { ref, paused, setPaused };
}

function FloatingOrb({ className = '', delay = 0, duration = 10 }: { className?: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
      initial={{ y: -10, rotate: 0, scale: 1 }}
      animate={{ y: [0, -20, 0], rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, repeatType: 'mirror', duration, delay, ease: 'easeInOut' }}
    />
  );
}

function Countdown({ endTime }: { endTime?: number }) {
  const { d, h, m, s, done } = useCountdown(endTime);
  if (done) return <span className="text-red-600">Ended</span>;
  return (
    <span>
      {d > 0 && `${d}d `}
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')} left
    </span>
  );
}



// export function Navbar() {
//   const { user, logout, isAuthenticated } = useAuth() as any;
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout?.();
//     navigate('/auth');
//   };

//   return (
//     <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between gap-4">
//           <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
//             <Gavel className="h-6 w-6" />
//             SnapBid
//           </Link>

//           <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
//             <a href="#how" className="hover:text-slate-900">How it works</a>
//             <a href="#partners" className="hover:text-slate-900">Partners</a>
//             <a href="#newsletter" className="hover:text-slate-900">New drops</a>
//           </div>

//           <div className="flex items-center gap-2">
//             {isAuthenticated ? (
//               <>
//                 <Link to="/">
//                   <Button variant="ghost" size="sm">Home</Button>
//                 </Link>
//                 {user?.role === 'seller' && (
//                   <Link to="/seller/create">
//                     <Button variant="ghost" size="sm">Create Product</Button>
//                   </Link>
//                 )}
//                 {user?.role === 'admin' && (
//                   <Link to="/admin/review">
//                     <Button variant="ghost" size="sm">Review Panel</Button>
//                   </Link>
//                 )}
//                 {user?.role === 'buyer' && (
//                   <Link to="/orders">
//                     <Button variant="ghost" size="sm">My Orders</Button>
//                   </Link>
//                 )}
//                 <div className="flex items-center gap-2 pl-3 ml-1 border-l">
//                   <User className="h-4 w-4" />
//                   <span className="text-sm font-medium">{user?.name}</span>
//                   <span className="text-xs text-muted-foreground">({user?.role})</span>
//                   <Button variant="ghost" size="sm" onClick={handleLogout}>
//                     <LogOut className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <Link to="/auth">
//                 <Button>Login</Button>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

export default function Home() {

   const navigate = useNavigate();
   const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

   const onToggleWatch = (id: string) => {
   setWatchedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
   });
   };

// demo: đưa user sang trang chi tiết để đặt bid
const onPlaceBid = (id: string) => {
  navigate(`/product/${id}?action=bid`);
};

  const { products } = useData() as { products: Product[] };

  // base dataset
  const active = useMemo(
    () => products.filter((p) => p.status === 'active'),
    [products]
  );

  // search + category + sort
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortKey, setSortKey] = useState<'ending' | 'price'>('ending');

  const categories = useMemo(() => {
    const set = new Set<string>(active.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = active.filter((p) =>
      !q
        ? true
        : p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
    if (category !== 'All') list = list.filter((p) => p.category === category);
    if (sortKey === 'ending') {
      list = [...list].sort((a, b) => (a.endTime ?? Infinity) - (b.endTime ?? Infinity));
    } else if (sortKey === 'price') {
      list = [...list].sort((a, b) => b.currentPrice - a.currentPrice);
    }
    return list;
  }, [active, search, category, sortKey]);

  // featured carousel = top 3 by soonest ending
  const featured = useMemo(() => {
    return [...active]
      .sort((a, b) => (a.endTime ?? Infinity) - (b.endTime ?? Infinity))
      .slice(0, 3);
  }, [active]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const activeSlide = featured[carouselIdx];

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => setCarouselIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  // marquee
  const { ref: marqueeRef, paused, setPaused } = useMarquee();
  const marqueeItems = useMemo(() => {
    const base = active.slice(0, 10).map((p) => ({
      text: `${p.category} · ${p.title} · ${currency(p.currentPrice)}`,
    }));
    return [...base, ...base];
  }, [active]);

  return (
    <div className="min-h-screen text-slate-900 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(56,189,248,0.12),transparent_60%),linear-gradient(to_bottom_right,rgba(124,58,237,0.06),transparent)]">
      <style>{`.marquee{will-change:transform;white-space:nowrap;}`}</style>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <FloatingOrb className="w-64 h-64 bg-fuchsia-300 -left-16 top-10" delay={0.2} />
        <FloatingOrb className="w-72 h-72 bg-sky-300 right-10 -top-10" delay={0.6} />
        <FloatingOrb className="w-56 h-56 bg-violet-300 left-1/3 -bottom-16" delay={0.1} />

        <div className="container mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              className="text-4xl md:text-6xl font-black tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Discover & Win Rare <span className="bg-gradient-to-r from-fuchsia-500 to-sky-500 bg-clip-text text-transparent">Auctions</span>
            </motion.h1>
            <motion.p
              className="mt-4 text-slate-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Real-time bidding, curated drops, and exclusive collectibles from creators and brands you love.
            </motion.p>

            <div className="mt-6 flex gap-3">
              <Button className="gap-2">
                <Gavel className="h-4 w-4"/> Start Bidding
              </Button>
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4"/> Explore Live
              </Button>
            </div>

            {/* Live ticker */}
            <div className="mt-8 rounded-xl border bg-white/70 backdrop-blur p-3 overflow-hidden">
              <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-2"><Flame className="h-3 w-3"/> Live bids</div>
              <div
                className="marquee cursor-pointer"
                ref={marqueeRef}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="inline-flex gap-6 pr-6">
                  {marqueeItems.map((m, i) => (
                    <span key={i} className="text-sm text-slate-700">{m.text}</span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">{paused ? 'Paused' : 'Hover to pause'}</div>
            </div>
          </div>

          {/* Featured Carousel */}
          <div>
            <Card className="overflow-hidden border-none bg-white/60 backdrop-blur-2xl shadow-xl">
              <div className="relative">
                <AnimatePresence mode="wait">
                  {activeSlide ? (
                    <motion.img
                      key={activeSlide.id}
                      src={activeSlide.images?.[0] || ''}
                      alt={activeSlide.title}
                      className="aspect-video w-full object-cover"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <motion.div key="placeholder" className="aspect-video w-full grid place-items-center bg-muted" initial={{opacity:0}} animate={{opacity:1}}>
                      No featured items
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeSlide && (
                  <>
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge variant="secondary" className="uppercase">Featured</Badge>
                      {(activeSlide.endTime && activeSlide.endTime - Date.now() < 60*60*1000) && (
                        <Badge className="uppercase">Ending Soon</Badge>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"/>
                    <div className="absolute bottom-0 w-full p-4 text-white">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm text-white/80">Current bid</div>
                          <div className="text-2xl font-extrabold">{currency(activeSlide.currentPrice)}</div>
                        </div>
                        <div className="rounded-full bg-white/20 px-3 py-1 text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4"/>
                          <Countdown endTime={activeSlide.endTime} />
                        </div>
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-tight line-clamp-2">{activeSlide.title}</div>
                    </div>
                  </>
                )}

                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-2">
                  <Button variant="secondary" size="icon" className="opacity-80" onClick={() => setCarouselIdx((i)=> (i - 1 + featured.length) % Math.max(1, featured.length))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="opacity-80" onClick={() => setCarouselIdx((i)=> (i + 1) % Math.max(1, featured.length))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="grid grid-cols-3 gap-3 p-3">
                {featured.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setCarouselIdx(i)}
                    className={`group relative aspect-video overflow-hidden rounded-lg ring-1 ring-black/5 ${i===carouselIdx? 'ring-2 ring-fuchsia-400' : ''}`}
                  >
                    {f.images?.[0] ? (
                      <img src={f.images[0]} alt={f.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-muted text-sm">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                    <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white line-clamp-1">{f.title}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-bold">Browse by category</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <Badge
                key={c}
                className={`cursor-pointer ${category === c ? 'bg-slate-900' : ''}`}
                variant={category === c ? 'default' : 'secondary'}
                onClick={() => setCategory(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto px-4 mt-6 pb-16">
  {filtered.length === 0 ? (
    <div className="text-center py-16">
      <p className="text-muted-foreground text-lg">No active auctions at the moment</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((product) => (
        <AuctionCard
          key={product.id}
          a={{
            id: product.id,
            title: product.title,
            category: product.category,
            image: product.images?.[0] ?? '',
            endTime: product.endTime,
            currentBid: product.currentPrice,
            bids: product.bidsCount ?? product.bids ?? 0,
          }}
          watched={watchedIds.has(product.id)}
          onToggleWatch={onToggleWatch}
          onPlaceBid={onPlaceBid}
        />
      ))}
    </div>
  )}
</section>


      {/* HOW IT WORKS */}
      <section id="how" aria-labelledby="how-heading" className="container mx-auto px-4 mt-16 mb-16">
        <h2 id="how-heading" className="text-xl md:text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[{icon:Gavel,title:'Bid in seconds',desc:'Create an account, verify, and start bidding instantly.'},
            {icon:TrendingUp,title:'Curated drops',desc:'We hand-pick authentic items from top creators and partners.'},
            {icon:Clock,title:'Transparent timers',desc:'Real-time countdowns and instant bid confirmations.'}
          ].map((s, i)=> (
            <motion.div
              key={i}
              className="relative rounded-2xl border bg-white/70 backdrop-blur p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i*0.05 }}
            >
              {/* số bước cho rõ ràng */}
              <span className="absolute -top-3 -left-3 h-8 w-8 grid place-items-center rounded-full bg-black/70 text-white text-sm font-bold ">
                {i+1}
              </span>
              <s.icon className="h-6 w-6"/>
              <div className="mt-2 font-semibold">{s.title}</div>
              <div className="text-sm text-slate-600">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section id="partners" aria-labelledby="partners-heading" className="container mx-auto px-4 mb-16">
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="partners-heading" className="text-sm font-semibold text-slate-600">Trusted by brands</h2>
            <span className="text-xs text-slate-400">Updated weekly</span>
          </div>

          {/* Mobile: horizontal strip with snap */}
          <div className="-mx-2 md:hidden overflow-x-auto no-scrollbar px-2">
            <div className="flex items-center gap-6 snap-x snap-mandatory">
              {BRANDS.map((b) => (
                <div key={b.name} className="snap-start">
                  <BrandLogo brand={b} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: neat grid */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-8 place-items-center">
            {BRANDS.map((b) => (
              <BrandLogo key={b.name} brand={b} />
            ))}
          </div>
        </div>

        {/* hide scrollbar helper */}
        <style>
          {`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}
        </style>
      </section>


      {/* DROP PASS – CTA nổi bật (giữ id="newsletter" để anchor cũ chạy đúng) */}
      <section id="newsletter" aria-labelledby="drop-pass-heading" className="container mx-auto px-4 mb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-xl">
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />
          <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-sky-300/40 blur-3xl" />

          <div className="grid gap-8 p-6 md:p-10 md:grid-cols-2">
            {/* Left: copy + perks + CTA */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">New</Badge>
                <Badge className="bg-gradient-to-r from-fuchsia-500 to-sky-500">Limited</Badge>
              </div>
              <h3 id="drop-pass-heading" className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Unlock <span className="bg-gradient-to-r from-fuchsia-600 to-sky-600 bg-clip-text text-transparent">Drop Pass</span>
              </h3>
              <p className="mt-2 text-sm md:text-base text-slate-600">
                Early access, fee discounts, and priority alerts for the hottest auctions.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><BellRing className="h-4 w-4" /> Priority alerts on live drops</li>
                <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Verified creator access</li>
                <li className="flex items-center gap-2"><Percent className="h-4 w-4" /> Lower buyer fees</li>
                <li className="flex items-center gap-2"><Gift className="h-4 w-4" /> Member-only giveaways</li>
              </ul>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Get Drop Pass
                </Button>
                <Button variant="outline" className="gap-2">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right: next drop + stats */}
            <div className="relative z-10">
              <div className="rounded-2xl border bg-white/70 backdrop-blur p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Next live drop</div>
                  <Badge variant="secondary">Today</Badge>
                </div>
                <div className="mt-2 text-2xl font-bold">
                  <Countdown endTime={Date.now() + 2 * 60 * 60 * 1000} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-white/60 p-3 text-center">
                    <div className="text-xs text-slate-500">Active</div>
                    <div className="text-lg font-bold">
                      {Array.isArray(products) ? products.filter(p => p.status === 'active').length : 0}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white/60 p-3 text-center">
                    <div className="text-xs text-slate-500">Bids today</div>
                    <div className="text-lg font-bold">
                      {Array.isArray(products) ? products.reduce((s,p)=> s + (p.bidsCount ?? (Array.isArray(p.bids) ? p.bids.length : p.bids ?? 0)), 0) : 0}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white/60 p-3 text-center">
                    <div className="text-xs text-slate-500">Creators</div>
                    <div className="text-lg font-bold">+24</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border bg-gradient-to-r from-fuchsia-50 to-sky-50 p-3">
                  <div className="text-sm font-medium">Member perk</div>
                  <div className="text-xs text-slate-600">Get 5% fee discount on your next 3 wins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer className="relative border-t supports-[backdrop-filter]:bg-white/50 bg-white/70 backdrop-blur-xl">
      {/* hairline gradient */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />

      <div className="container mx-auto px-4 py-12 text-slate-700">
         <div className="grid gap-10 md:grid-cols-12">
            {/* Newsletter */}
            <div className="md:col-span-5">
            <div className="max-w-md">
               <div className="flex items-center gap-2 font-bold text-xl">
                  <Gavel className="h-5 w-5" /> SnapBid
               </div>
               <h3 className="mt-3 text-lg font-semibold">Don’t miss new drops</h3>
               <p className="text-sm text-slate-500">
                  Get alerts for curated auctions, exclusive releases, and price drops.
               </p>
               <form
                  className="mt-4 flex items-center gap-2"
                  onSubmit={(e) => e.preventDefault()}
               >
                  <div className="relative w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                     type="email"
                     placeholder="you@example.com"
                     className="pl-9 h-10"
                     required
                  />
                  </div>
                  <Button type="submit" className="h-10">Subscribe</Button>
               </form>
               <p className="mt-2 text-xs text-slate-400">
                  By subscribing, you agree to our Terms & Privacy.
               </p>
            </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
               <h4 className="text-sm font-semibold">Marketplace</h4>
               <ul className="mt-3 space-y-2 text-sm">
                  <li><a href="#featured" className="hover:text-slate-900">Featured</a></li>
                  <li><a href="#trending" className="hover:text-slate-900">Trending</a></li>
                  <li><a href="#how" className="hover:text-slate-900">How it works</a></li>
                  <li><a href="#" className="hover:text-slate-900">Categories</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-semibold">Resources</h4>
               <ul className="mt-3 space-y-2 text-sm">
                  <li><a href="#" className="hover:text-slate-900">Help Center</a></li>
                  <li><a href="#" className="hover:text-slate-900">Guides</a></li>
                  <li><a href="#" className="hover:text-slate-900">Buyer Protection</a></li>
                  <li><a href="#" className="hover:text-slate-900">Seller Handbook</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-semibold">Company</h4>
               <ul className="mt-3 space-y-2 text-sm">
                  <li><a href="#" className="hover:text-slate-900">About</a></li>
                  <li><a href="#" className="hover:text-slate-900">Careers</a></li>
                  <li><a href="#" className="hover:text-slate-900">Press</a></li>
                  <li><a href="#" className="hover:text-slate-900">Contact</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-sm font-semibold">Legal</h4>
               <ul className="mt-3 space-y-2 text-sm">
                  <li><a href="#" className="hover:text-slate-900">Terms</a></li>
                  <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
                  <li><a href="#" className="hover:text-slate-900">Cookies</a></li>
                  <li><a href="#" className="hover:text-slate-900">Licenses</a></li>
               </ul>
            </div>
            </div>
         </div>

         <Separator className="my-8" />

         {/* Bottom bar */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: copyright */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
            <Gavel className="h-4 w-4" /> © {new Date().getFullYear()} SnapBid. All rights reserved.
            </div>

            {/* Middle: language / currency */}
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               <Globe className="h-4 w-4 text-slate-500" />
               <Select defaultValue="en">
                  <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <Select defaultValue="usd">
               <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="vnd">VND</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
               </SelectContent>
            </Select>
            </div>

            {/* Right: socials */}
            <div className="flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="p-2 rounded-full hover:bg-slate-100"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="p-2 rounded-full hover:bg-slate-100"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="p-2 rounded-full hover:bg-slate-100"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="p-2 rounded-full hover:bg-slate-100"><Github className="h-4 w-4" /></a>
            </div>
         </div>

         {/* Trust row */}
         <div className="mt-4 text-xs text-slate-500 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Secure checkout (TLS)</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Buyer protection</span>
            <span className="inline-flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> We accept major cards</span>
         </div>
      </div>
      </footer>

    </div>
  );
}