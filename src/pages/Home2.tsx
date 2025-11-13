import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Gavel,
  Heart,
  LogIn,
  LogOut,
  Search,
  Star,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

/**
 * AUCTION HOMEPAGE (ONE-FILE DEMO)
 * — Tech: React + Tailwind + framer-motion + shadcn/ui
 * — Purpose: A visually-rich, animated homepage for a live-auction platform
 *
 * STRUCTURE OVERVIEW
 * 1) TopBar/Nav: logo, search, filters, user actions (sign in/out, notifications, wallet)
 * 2) Hero Section: animated gradient, floating shapes, CTA buttons
 * 3) Live Bid Ticker: marquee of recent bids (pause on hover)
 * 4) Featured Carousel: large spotlight items with countdown + navigation arrows
 * 5) Categories: filter chips
 * 6) Trending / Ending Soon: tabbed product grids with watchlist + bid interactions
 * 7) How It Works: 3-step animated info
 * 8) Partners strip: subtle brand row
 * 9) Newsletter CTA: subscribe form
 * 10) Footer
 *
 * KEY UI EVENTS (ids and handlers)
 * onSearch(query), onSelectCategory(cat), onSort(sortKey)
 * onCarouselChange(idx), onHeroCTA(action), onSubscribe(email)
 * onPlaceBid(auctionId), onToggleWatch(auctionId)
 * onSignInOut(), onOpenNotifications()
 *
 * Notes: All events are stubbed with console.log + light UI feedback.
 */

// ---------- Utilities ----------
const currency = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const inFuture = (ms) => Date.now() + ms;

function useTicker(items, speed = 30) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let x = 0;
    let raf;
    const step = () => {
      if (!paused) {
        x -= 1;
        if (x <= -el.scrollWidth / 2) x = 0;
        el.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
  return { ref, paused, setPaused };
}

function useCountdown(targetTs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const ms = Math.max(0, targetTs - now);
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return { d, h, m, s: ss, done: s <= 0 };
}

// ---------- Sample Data ----------
const categories = [
  "Art",
  "Collectibles",
  "Digital",
  "Fashion",
  "Luxury",
  "Motors",
  "Real Estate",
  "Tech",
];

const featured = [
  {
    id: "f1",
    title: "Vintage Omega Speedmaster ‘Moonwatch’",
    image:
      "https://images.unsplash.com/photo-1526403225435-6f2a18d5d914?q=80&w=1600&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 60 * 5 + 1000 * 23),
    currentBid: 14250,
    bids: 38,
    badges: ["Live", "Hot"],
  },
  {
    id: "f2",
    title: "1/1 Digital Sculpture by Nova",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 60 * 12 + 1000 * 5),
    currentBid: 5200,
    bids: 19,
    badges: ["Featured"],
  },
  {
    id: "f3",
    title: "1967 Ford Mustang Fastback (Restomod)",
    image:
      "https://images.unsplash.com/photo-1511910849309-0dffb6f160f1?q=80&w=1600&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 30),
    currentBid: 73500,
    bids: 64,
    badges: ["Ending Soon"],
  },
];

const trending = [
  {
    id: "t1",
    title: "Signed NBA Jersey – 2009 Finals",
    image:
      "https://images.unsplash.com/photo-1599435485671-6d48d65fd0a9?q=80&w=1200&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 50),
    currentBid: 870,
    bids: 21,
    category: "Collectibles",
  },
  {
    id: "t2",
    title: "Hermès Birkin 30 (Gold/Togo)",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 60 * 4),
    currentBid: 11800,
    bids: 12,
    category: "Luxury",
  },
  {
    id: "t3",
    title: "Abstract Oil on Canvas – 1983",
    image:
      "https://images.unsplash.com/photo-1526312426976-593c1a1b7a47?q=80&w=1200&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 60 * 24),
    currentBid: 4400,
    bids: 33,
    category: "Art",
  },
  {
    id: "t4",
    title: "PS5 Dev Kit Prototype",
    image:
      "https://images.unsplash.com/photo-1636487654743-9d13a29290dc?q=80&w=1200&auto=format&fit=crop",
    endsAt: inFuture(1000 * 60 * 75),
    currentBid: 950,
    bids: 15,
    category: "Tech",
  },
];

const recentBids = [
  { user: "@minhng", item: "Omega Moonwatch", amount: 14250 },
  { user: "@artio", item: "Nova Sculpture", amount: 5200 },
  { user: "@collecta", item: "NBA Jersey", amount: 880 },
  { user: "@luxgal", item: "Birkin 30", amount: 11800 },
  { user: "@gearbox", item: "Mustang '67", amount: 73600 },
  { user: "@devbox", item: "PS5 Dev Prototype", amount: 970 },
];

// ---------- UI Chunks ----------
function FloatingOrb({ className = "", delay = 0, duration = 10 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
      initial={{ y: -10, rotate: 0, scale: 1 }}
      animate={{ y: [0, -20, 0], rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, repeatType: "mirror", duration, delay, ease: "easeInOut" }}
    />
  );
}

function Countdown({ endsAt }) {
  const { d, h, m, s, done } = useCountdown(endsAt);
  return (
    <div className="flex items-center gap-2 text-xs font-medium">
      <Clock className="h-4 w-4" />
      {done ? (
        <span className="text-red-600">Ended</span>
      ) : (
        <span>
          {d > 0 && `${d}d `}
          {String(h).padStart(2, "0")}:
          {String(m).padStart(2, "0")}:
          {String(s).padStart(2, "0")} left
        </span>
      )}
    </div>
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
          <Countdown endsAt={a.endsAt} />
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

// ---------- Main Page ----------
export default function AuctionHome() {
  // state
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sortKey, setSortKey] = useState("ending");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [watched, setWatched] = useState(() => new Set());
  const [signedIn, setSignedIn] = useState(true);

  // filtered grid
  const grid = useMemo(() => {
    const base = trending.filter((i) => (cat === "All" ? true : i.category === cat));
    if (sortKey === "ending") return [...base].sort((a, b) => a.endsAt - b.endsAt);
    if (sortKey === "price") return [...base].sort((a, b) => b.currentBid - a.currentBid);
    return base;
  }, [cat, sortKey]);

  // hero carousel auto-advance
  useEffect(() => {
    const t = setInterval(() => setCarouselIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, []);

  // ticker
  const { ref: tickerRef, paused, setPaused } = useTicker(recentBids);

  // events
  const onSearch = (q) => {
    console.log("onSearch", q);
    alert(`Search: ${q}`);
  };
  const onSelectCategory = (c) => {
    setCat(c);
    console.log("onSelectCategory", c);
  };
  const onSort = (s) => {
    setSortKey(s);
    console.log("onSort", s);
  };
  const onCarouselChange = (idx) => {
    setCarouselIdx((idx + featured.length) % featured.length);
    console.log("onCarouselChange", idx);
  };
  const onHeroCTA = (action) => {
    console.log("onHeroCTA", action);
    alert(action === "start" ? "Let’s start bidding!" : "Explore live auctions ✨");
  };
  const onSubscribe = (email) => {
    console.log("onSubscribe", email);
    alert("Subscribed: " + email);
  };
  const onPlaceBid = (id) => {
    console.log("onPlaceBid", id);
    // optimistic increment
    const inc = (list) => list.map((x) => (x.id === id ? { ...x, currentBid: x.currentBid + Math.ceil(x.currentBid * 0.05), bids: x.bids + 1 } : x));
    // apply to local datasets (demo only)
    const tIdx = trending.findIndex((x) => x.id === id);
    if (tIdx >= 0) {
      trending[tIdx].currentBid += Math.ceil(trending[tIdx].currentBid * 0.05);
      trending[tIdx].bids += 1;
    }
    const fIdx = featured.findIndex((x) => x.id === id);
    if (fIdx >= 0) {
      featured[fIdx].currentBid += Math.ceil(featured[fIdx].currentBid * 0.05);
      featured[fIdx].bids += 1;
    }
    // trigger a re-render
    setSortKey((k) => (k === "ending" ? "price" : "ending"));
    setSortKey((k) => (k === "ending" ? "price" : "ending"));
    alert("Bid placed ✅ (demo)");
  };
  const onToggleWatch = (id) => {
    const next = new Set(watched);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setWatched(next);
    console.log("onToggleWatch", id);
  };
  const onSignInOut = () => {
    setSignedIn((s) => !s);
    console.log("onSignInOut", !signedIn);
  };
  const onOpenNotifications = () => alert("Notifications (demo)");

  const active = featured[carouselIdx];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(70%_70%_at_50%_0%,rgba(56,189,248,0.15),transparent_60%),linear-gradient(to_bottom_right,rgba(124,58,237,0.08),transparent)] text-slate-900">
        {/* --- Page Styles (marquee) --- */}
        <style>{`
          .marquee { will-change: transform; white-space: nowrap; }
          .marquee:hover { filter: saturate(1.05); }
        `}</style>

        {/* 1) NAVBAR */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Gavel className="h-5 w-5" /> AuctioNow
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                <a className="hover:text-slate-900" href="#featured">Featured</a>
                <a className="hover:text-slate-900" href="#trending">Trending</a>
                <a className="hover:text-slate-900" href="#how">How it works</a>
              </nav>
            </div>

            <form
              className="hidden md:flex items-center gap-2 flex-1 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch(query);
              }}
            >
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search items, creators, collections…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={sortKey} onValueChange={onSort}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending">Ending soon</SelectItem>
                  <SelectItem value="price">Highest price</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onOpenNotifications}><Bell className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"><Wallet className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Wallet</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={onSignInOut}>
                    {signedIn ? <><LogOut className="h-4 w-4"/>Sign out</> : <><LogIn className="h-4 w-4"/>Sign in</>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{signedIn ? "Sign out" : "Sign in"}</TooltipContent>
              </Tooltip>
              <Avatar className="hidden md:inline-flex">
                <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* 2) HERO */}
        <section className="relative overflow-hidden">
          {/* Floating Orbs */}
          <FloatingOrb className="w-64 h-64 bg-fuchsia-300 -left-16 top-10" delay={0.2} />
          <FloatingOrb className="w-72 h-72 bg-sky-300 right-10 -top-10" delay={0.6} />
          <FloatingOrb className="w-56 h-56 bg-violet-300 left-1/3 -bottom-16" delay={0.1} />

          <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
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
                <Button className="gap-2" onClick={() => onHeroCTA("start")}>
                  <Gavel className="h-4 w-4"/> Start Bidding
                </Button>
                <Button variant="outline" onClick={() => onHeroCTA("explore")} className="gap-2">
                  <TrendingUp className="h-4 w-4"/> Explore Live
                </Button>
              </div>

              {/* Live Bid Ticker */}
              <div className="mt-8 rounded-xl border bg-white/70 backdrop-blur p-3 overflow-hidden">
                <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-2"><Flame className="h-3 w-3"/> Live bids</div>
                <div
                  className="marquee cursor-pointer"
                  ref={tickerRef}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <div className="inline-flex gap-6 pr-6">
                    {[...recentBids, ...recentBids].map((b, i) => (
                      <span key={i} className="text-sm text-slate-700">{b.user} raised on <b>{b.item}</b> to <b>{currency(b.amount)}</b></span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">{paused ? "Paused" : "Hover to pause"}</div>
              </div>
            </div>

            {/* Featured Carousel */}
            <div id="featured">
              <Card className="overflow-hidden border-none bg-white/60 backdrop-blur-2xl shadow-xl">
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={active.id}
                      src={active.image}
                      alt={active.title}
                      className="aspect-video w-full object-cover"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>

                  <div className="absolute left-3 top-3 flex gap-2">
                    {active.badges?.map((b) => (
                      <Badge key={b} variant="secondary" className="uppercase">{b}</Badge>
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"/>

                  <div className="absolute bottom-0 w-full p-4 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm text-white/80">Current bid</div>
                        <div className="text-2xl font-extrabold">{currency(active.currentBid)}</div>
                      </div>
                      <div className="rounded-full bg-white/20 px-3 py-1 text-sm"><Countdown endsAt={active.endsAt} /></div>
                    </div>
                    <div className="mt-2 text-lg font-semibold leading-tight">{active.title}</div>
                  </div>

                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-2">
                    <Button variant="secondary" size="icon" className="opacity-80" onClick={() => onCarouselChange(carouselIdx - 1)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="opacity-80" onClick={() => onCarouselChange(carouselIdx + 1)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="grid grid-cols-3 gap-3 p-3">
                  {featured.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => setCarouselIdx(i)}
                      className={`group relative aspect-video overflow-hidden rounded-lg ring-1 ring-black/5 ${i===carouselIdx?"ring-2 ring-fuchsia-400":""}`}
                    >
                      <img src={f.image} alt={f.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                      <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white line-clamp-1">{f.title}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5) CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 mt-10">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl md:text-2xl font-bold">Browse by category</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <Badge className={`cursor-pointer ${cat === "All" ? "bg-slate-900" : ""}`} onClick={() => onSelectCategory("All")}>All</Badge>
              {categories.map((c) => (
                <Badge key={c} variant="secondary" className={`cursor-pointer ${cat === c ? "ring-2 ring-fuchsia-400" : ""}`} onClick={() => onSelectCategory(c)}>
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* 6) GRID: Trending / Ending Soon */}
        <section id="trending" className="mx-auto max-w-7xl px-4 mt-6">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList>
              <TabsTrigger value="trending" className="gap-2"><TrendingUp className="h-4 w-4"/>Trending</TabsTrigger>
              <TabsTrigger value="ending" className="gap-2"><Clock className="h-4 w-4"/>Ending Soon</TabsTrigger>
            </TabsList>
            <TabsContent value="trending">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {grid.map((a) => (
                  <AuctionCard
                    key={a.id}
                    a={a}
                    onPlaceBid={onPlaceBid}
                    onToggleWatch={onToggleWatch}
                    watched={watched.has(a.id)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="ending">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {[...grid].sort((a,b)=>a.endsAt-b.endsAt).slice(0,8).map((a) => (
                  <AuctionCard
                    key={a.id}
                    a={a}
                    onPlaceBid={onPlaceBid}
                    onToggleWatch={onToggleWatch}
                    watched={watched.has(a.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* 7) HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-7xl px-4 mt-16 mb-12">
          <h2 className="text-xl md:text-2xl font-bold">How it works</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[{icon:Gavel,title:"Bid in seconds",desc:"Create an account, verify, and start bidding instantly."},{icon:Star,title:"Curated drops",desc:"We hand-pick authentic items from top creators and partners."},{icon:Clock,title:"Transparent timers",desc:"Real-time countdowns and instant bid confirmations."}].map((s, i)=> (
              <motion.div
                key={i}
                className="rounded-2xl border bg-white/70 backdrop-blur p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i*0.05 }}
              >
                <s.icon className="h-6 w-6"/>
                <div className="mt-2 font-semibold">{s.title}</div>
                <div className="text-sm text-slate-600">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 8) PARTNERS */}
        <section className="mx-auto max-w-7xl px-4 mb-16">
          <div className="rounded-2xl border bg-white/60 backdrop-blur p-6">
            <div className="text-sm text-slate-500 mb-3">Trusted by brands</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 opacity-70">
              {Array.from({length:6}).map((_,i)=> (
                <img key={i} className="mx-auto h-8 object-contain" src={`https://dummyimage.com/160x40/000/fff&text=Brand+${i+1}`} alt={`Brand ${i+1}`} />
              ))}
            </div>
          </div>
        </section>

        {/* 9) NEWSLETTER */}
        <section className="mx-auto max-w-3xl px-4 mb-20">
          <Card className="border-none bg-gradient-to-r from-fuchsia-50 to-sky-50">
            <CardHeader>
              <CardTitle>Don’t miss new drops</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col sm:flex-row gap-3"
                onSubmit={(e)=>{e.preventDefault(); const email=(e.currentTarget.elements.namedItem("email") as HTMLInputElement).value; onSubscribe(email);}}
              >
                <Input name="email" type="email" placeholder="you@example.com" required />
                <Button type="submit">Subscribe</Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* 10) FOOTER */}
        <footer className="border-t bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Gavel className="h-4 w-4"/> © {new Date().getFullYear()} AuctioNow</div>
            <div className="flex items-center gap-4">
              <a href="#">About</a>
              <a href="#">Help</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
