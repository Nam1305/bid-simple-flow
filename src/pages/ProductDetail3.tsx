"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  Gavel,
  LogIn,
  LogOut,
  Search,
  Wallet,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Truck,
  Info,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// ========= Utilities =========
const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

const inFuture = (ms: number) => Date.now() + ms;

function useCountdown(targetTs: number) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const ms = Math.max(0, targetTs - now);
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return { d, h, m, s, done: totalSeconds <= 0 };
}

function Countdown({ endsAt }: { endsAt: number }) {
  const { d, h, m, s, done } = useCountdown(endsAt);
  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium">
      <Clock className="h-4 w-4" />
      {done ? (
        <span className="text-red-600">Auction ended</span>
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

// ========= Sample Auction Data (demo) =========
const auction = {
  id: "omega-moonwatch",
  title: "Vintage Omega Speedmaster 'Moonwatch' – 1969",
  image:
    "https://images.unsplash.com/photo-1526403225435-6f2a18d5d914?q=80&w=1600&auto=format&fit=crop",
  endsAt: inFuture(1000 * 60 * 60 * 2 + 1000 * 40),
  currentBid: 14250,
  bids: 38,
  bidIncrement: 250,
  reservePrice: 12000,
  category: "Luxury Watches",
  condition: "Excellent, full set",
  seller: "ChronoVault",
  location: "Geneva, Switzerland",
};

const bidHistory = [
  { user: "@minhng", amount: 14250, time: "Just now" },
  { user: "@watchgeek", amount: 14000, time: "3 min ago" },
  { user: "@collectorX", amount: 13500, time: "10 min ago" },
  { user: "@chronoqueen", amount: 13000, time: "20 min ago" },
];

// ========= Page Component =========
export default function PlaceBidPage() {
  const [signedIn, setSignedIn] = useState(true);
  const [query, setQuery] = useState("");
  const [bidAmount, setBidAmount] = useState(
    auction.currentBid + auction.bidIncrement
  );
  const [showFees, setShowFees] = useState(false);

  const minNextBid = auction.currentBid + auction.bidIncrement;
  const buyersPremium = Math.round(bidAmount * 0.12); // 12% demo
  const estimatedTotal = bidAmount + buyersPremium;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("place-bid search:", query);
    alert("Search: " + query);
  };

  const handleSignInOut = () => {
    setSignedIn((s) => !s);
  };

  const handleQuickAdd = (delta: number) => {
    setBidAmount((prev) => Math.max(minNextBid, prev + delta));
  };

  const handleBidInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/[^0-9]/g, ""));
    if (Number.isNaN(val)) return;
    setBidAmount(val);
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount < minNextBid) {
      alert(
        `Your bid must be at least ${currency(
          minNextBid
        )}. (You entered ${currency(bidAmount)}).`
      );
      return;
    }
    console.log("PLACE_BID", {
      auctionId: auction.id,
      bidAmount,
      estimatedTotal,
    });
    alert(
      `Bid placed ✅\nAmount: ${currency(
        bidAmount
      )}\nEstimated total (incl. premium): ${currency(estimatedTotal)}\n\n(Demo only)`
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(70%_70%_at_50%_0%,rgba(56,189,248,0.15),transparent_60%),linear-gradient(to_bottom_right,rgba(124,58,237,0.08),transparent)] text-slate-900">
        {/* ===== NAVBAR (giữ đúng thiết kế bé đang dùng) ===== */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/40">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-3 items-center gap-4">
              {/* Left: logo + nav */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Gavel className="h-5 w-5" /> AuctioNow
                </div>
                <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                  <a className="hover:text-slate-900" href="/#featured">
                    Featured
                  </a>
                  <a className="hover:text-slate-900" href="/#trending">
                    Trending
                  </a>
                  <a className="hover:text-slate-900" href="/#how">
                    How it works
                  </a>
                </nav>
              </div>

              {/* Center: search */}
              <form
                className="hidden md:flex items-center gap-2 w-full justify-center"
                onSubmit={handleSearch}
              >
                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search items, creators, collections…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {/* Ở trang này chị bỏ sort dropdown cho gọn, nếu cần bé có thể thêm lại */}
              </form>

              {/* Right: actions */}
              <div className="flex items-center justify-end gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => alert("Notifications (demo)")}
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => alert("Wallet (demo)")}
                    >
                      <Wallet className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Wallet</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleSignInOut}
                    >
                      {signedIn ? (
                        <>
                          <LogOut className="h-4 w-4" /> Sign out
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" /> Sign in
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {signedIn ? "Sign out" : "Sign in"}
                  </TooltipContent>
                </Tooltip>
                <Avatar className="hidden md:inline-flex">
                  <AvatarImage
                    src="https://i.pravatar.cc/100?img=12"
                    alt="user"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="mx-auto max-w-7xl px-4 py-10">
          {/* Breadcrumb */}
          <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
            <a href="/" className="hover:underline">
              Home
            </a>
            <span>/</span>
            <span>Auctions</span>
            <span>/</span>
            <span className="text-slate-700">{auction.title}</span>
          </div>

          <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6 items-start">
            {/* LEFT: Item preview & details */}
            <motion.section
              className="space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-xl shadow-xl">
                <div className="relative">
                  <motion.img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full max-h-[460px] object-cover"
                    initial={{ scale: 1.02, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge className="bg-emerald-500 text-white">Live</Badge>
                    <Badge variant="secondary">{auction.category}</Badge>
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified seller
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-white/70">
                          Current bid
                        </div>
                        <div className="text-2xl font-extrabold">
                          {currency(auction.currentBid)}
                        </div>
                        <div className="text-xs text-white/80">
                          {auction.bids} bids • Reserve price{" "}
                          {auction.currentBid >= auction.reservePrice
                            ? "met ✅"
                            : "not met"}
                        </div>
                      </div>
                      <div className="rounded-full bg-black/40 px-4 py-2 text-xs">
                        <Countdown endsAt={auction.endsAt} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Title + seller + meta */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  {auction.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-4 w-4" /> Seller:{" "}
                    <span className="font-medium">{auction.seller}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-4 w-4" /> Ships from:{" "}
                    <span>{auction.location}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-4 w-4" /> Condition:{" "}
                    <span>{auction.condition}</span>
                  </span>
                </div>
              </div>

              {/* Tabs: Overview / Details / Shipping */}
              <Card className="border-none bg-white/70 backdrop-blur-xl">
                <Tabs defaultValue="overview" className="w-full">
                  <CardHeader className="pb-3">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <TabsContent value="overview" className="space-y-2">
                      <p className="text-sm text-slate-700">
                        This vintage Omega Speedmaster “Moonwatch” is a
                        1969-era piece featuring the classic black step dial,
                        hesalite crystal and original bracelet. Recently
                        serviced by an independent watchmaker, keeping excellent
                        time.
                      </p>
                      <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                        <li>Caliber 861 manual-wind movement</li>
                        <li>42 mm stainless steel case</li>
                        <li>Original bezel with “DOT over 90”</li>
                        <li>Includes box & service papers</li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-1">
                      <dl className="text-sm grid grid-cols-2 gap-y-1">
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Year</dt>
                          <dd>1969</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Reference</dt>
                          <dd>145.022</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Case size</dt>
                          <dd>42 mm</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Movement</dt>
                          <dd>Cal. 861, manual</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Bracelet</dt>
                          <dd>Steel bracelet</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Serial</dt>
                          <dd>28xxxxxx</dd>
                        </div>
                      </dl>
                    </TabsContent>

                    <TabsContent value="shipping" className="space-y-2">
                      <p className="text-sm text-slate-700">
                        Ships worldwide via insured express courier. All
                        shipments include tracking and require signature upon
                        delivery.
                      </p>
                      <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                        <li>Handling time: 2–3 business days</li>
                        <li>EU: 2–4 business days</li>
                        <li>US / Asia: 4–7 business days</li>
                        <li>Buyer is responsible for import duties & taxes</li>
                      </ul>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.section>

            {/* RIGHT: Place bid card */}
            <motion.aside
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Card className="border-none bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Place your bid</span>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Gavel className="h-3 w-3" /> Live auction
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Enter your maximum bid. We’ll bid automatically for you up
                    to this amount.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current & minimum */}
                  <div className="rounded-xl border bg-slate-50/80 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Current bid</span>
                      <span className="font-semibold">
                        {currency(auction.currentBid)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-slate-500">Minimum next bid</span>
                      <span className="font-semibold">
                        {currency(minNextBid)}
                      </span>
                    </div>
                  </div>

                  {/* Bid input */}
                  <form className="space-y-4" onSubmit={handlePlaceBid}>
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Your maximum bid
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            $
                          </span>
                          <Input
                            type="text"
                            value={bidAmount.toString()}
                            onChange={handleBidInput}
                            className="pl-6 text-right font-semibold"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Your bid must be at least{" "}
                        <span className="font-semibold">
                          {currency(minNextBid)}
                        </span>
                        .
                      </p>
                    </div>

                    {/* Quick bid buttons */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setBidAmount(Math.max(bidAmount, minNextBid))
                        }
                      >
                        Match minimum
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(250)}
                      >
                        + 250
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(500)}
                      >
                        + 500
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(1000)}
                      >
                        + 1,000
                      </Button>
                    </div>

                    {/* Fees breakdown */}
                    <div className="rounded-xl border bg-slate-50/80 p-3 text-xs space-y-2">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between"
                        onClick={() => setShowFees((s) => !s)}
                      >
                        <span className="font-medium">Estimate summary</span>
                        {showFees ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {showFees && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Bid amount</span>
                            <span>{currency(bidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Buyer’s premium (12%)</span>
                            <span>{currency(buyersPremium)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                            <span>Estimated total</span>
                            <span>{currency(estimatedTotal)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Taxes, duties and shipping may apply based on your
                            location.
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      size="lg"
                      disabled={!signedIn}
                    >
                      <Gavel className="h-4 w-4" />
                      {signedIn ? "Place bid" : "Sign in to bid"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Bid history */}
              <Card className="border-none bg-white/70 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Bid history</CardTitle>
                  <CardDescription>
                    Latest bids for this lot (demo data).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {bidHistory.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>
                            {b.user.replace("@", "").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{b.user}</div>
                          <div className="text-[10px] text-slate-500">
                            {b.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {currency(b.amount)}
                        </div>
                        <div className="text-[10px] text-emerald-600">
                          + auto-bid
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
