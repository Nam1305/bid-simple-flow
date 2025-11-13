import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Gavel,
  ShieldCheck,
  Truck,
  Info,
  User,
  Heart,
  Share2,
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

// 🔹 context (đúng path của em, chị dùng như em nói):
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// ================== Helpers ==================
const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

// tính endTime: ưu tiên endTime, nếu không có thì startTime + duration
const getEndTime = (product: any | undefined): number | null => {
  if (!product) return null;
  if (product.endTime) return product.endTime;
  if (product.startTime && product.duration) {
    return product.startTime + product.duration;
  }
  return null;
};

const formatBidTime = (ts: number) => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
};

const initialTimeLeft: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ended: false,
};

function CountdownBadge({
  timeLeft,
  hasEndTime,
}: {
  timeLeft: TimeLeft;
  hasEndTime: boolean;
}) {
  if (!hasEndTime) {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-medium">
        <Clock className="h-4 w-4" />
        <span>Flexible ending</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium">
      <Clock className="h-4 w-4" />
      {timeLeft.ended ? (
        <span className="text-red-600">Auction ended</span>
      ) : (
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")} left
        </span>
      )}
    </div>
  );
}

// ================== PAGE ==================
const ProductDetail2 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, bids, addBid } = useData();
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(initialTimeLeft);
  const [showAllBids, setShowAllBids] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFees, setShowFees] = useState(false);

  // 🔹 lấy product & bids từ DataContext (localStorage)
  const product = products.find((p: any) => p.id === id);

  const productBids = useMemo(
    () =>
      bids
        .filter((b: any) => b.productId === id)
        .sort((a: any, b: any) => b.timestamp - a.timestamp),
    [bids, id]
  );
  const latestBids = showAllBids ? productBids : productBids.slice(0, 3);

  // nếu không có product -> toast + quay về home (optional)
  useEffect(() => {
    if (!id) return;
    if (!product) {
      toast({
        title: "Product not found",
        description: "The auction you’re looking for does not exist.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [id, product, navigate, toast]);

  // set bid mặc định = currentPrice/bid cao nhất + bidStep
  useEffect(() => {
    if (!product) return;
    const highestBidAmount = productBids[0]?.amount ?? product.currentPrice ?? product.startPrice ?? 0;
    const step = product.bidStep ?? 0;
    setBidAmount(highestBidAmount + step);
  }, [product, productBids]);

  // countdown
  useEffect(() => {
    if (!product) return;

    const endTs = getEndTime(product);
    if (!endTs) return;

    const calc = () => {
      const now = Date.now();
      const diff = endTs - now;
      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          ended: true,
        });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ days, hours, minutes, seconds, ended: false });
    };

    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [product]);

  if (!product) {
    // navigate đã chạy ở useEffect, nên return null
    return null;
  }

  const hasEndTime = !!getEndTime(product);
  const isEnded = product.status === "ended";

  // base price luôn lấy từ bid cao nhất trước, fallback currentPrice/startPrice
  const highestBidAmount =
    productBids[0]?.amount ??
    product.currentPrice ??
    product.startPrice ??
    0;
  const basePrice = highestBidAmount;
  const minNextBid = basePrice + (product.bidStep ?? 0);
  const effectiveBid = bidAmount ?? minNextBid;
  const bidsCount = product.bidsCount ?? productBids.length;

  const buyersPremium = Math.round(effectiveBid * 0.12); // demo 12%
  const estimatedTotal = effectiveBid + buyersPremium;

  // map fields chi tiết
  const details = [
    { label: "Era", value: product.era ?? product.shoeEra },
    { label: "Brand", value: product.brand ?? product.shoeBrand },
    { label: "Color", value: product.colour ?? product.shoeColour },
    { label: "Material", value: product.material ?? product.shoeMaterial },
    { label: "Condition", value: product.condition ?? product.shoeCondition },
    { label: "Size", value: product.size ?? product.shoeSize },
    { label: "Number of items", value: product.numberOfItems },
    { label: "Made in", value: product.shoeMadeIn },
    { label: "Gender", value: product.shoeGender },
    { label: "Vintage", value: product.shoeVintage },
    { label: "New in box", value: product.shoeNewInBox },
    { label: "Height", value: product.height },
    { label: "Width", value: product.width },
    { label: "Depth", value: product.depth },
  ].filter((d) => d.value);

  // ================== handlers ==================
  const handleBidInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) {
      setBidAmount(null);
      return;
    }
    const val = Number(raw);
    if (Number.isNaN(val)) return;
    setBidAmount(val);
  };

  const handleQuickAdd = (delta: number) => {
    setBidAmount((prev) => {
      const base = prev ?? minNextBid;
      return Math.max(minNextBid, base + delta);
    });
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to place a bid.",
        variant: "destructive",
      });
      return;
    }

    const amount = bidAmount ?? minNextBid;
    if (amount < minNextBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be at least ${currency(
          minNextBid
        )}. You entered ${currency(amount)}.`,
        variant: "destructive",
      });
      return;
    }

    const newBid = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      productId: product.id,
      buyerId: user.id ?? "guest",
      buyerName:
        user.username || user.name || user.displayName || user.email || "You",
      amount,
      timestamp: Date.now(),
    };

    addBid(newBid); // ✅ ghi vào DataContext (localStorage)

    toast({
      title: "Bid placed",
      description: `You placed a bid of ${currency(amount)}.`,
    });

    // tăng gợi ý bid tiếp theo
    setBidAmount(amount + (product.bidStep ?? 0));
  };

  const handleBuyNow = () => {
    if (!product.buyNowPrice) return;

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need an account to buy now.",
        variant: "destructive",
      });
      return;
    }

    // chỗ này em nối với createOrder trong DataContext nếu có
    toast({
      title: "Buy now (demo)",
      description: `You chose Buy Now at ${currency(
        product.buyNowPrice
      )}. Implement createOrder in DataContext here.`,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Auction link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Your browser blocked clipboard access.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Breadcrumb + actions (nav tổng đã có ở ngoài rồi) */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hover:underline"
            >
              Back
            </button>
            <span>/</span>
            <span>Auctions</span>
            <span>/</span>
            <span className="text-slate-700 line-clamp-1">
              {product.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setIsFavorite((v) => !v)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? "fill-pink-500 text-pink-500" : ""
                }`}
              />
              {isFavorite ? "Watching" : "Watch"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4" />
              {copied ? "Copied" : "Share"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6 items-start">
          {/* LEFT: images + info */}
          <motion.section
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="overflow-hidden border-none bg-white/70 backdrop-blur-xl shadow-xl">
              <div className="relative">
                <motion.img
                  src={product.images?.[0]}
                  alt={product.title}
                  className="w-full max-h-[460px] object-cover"
                  initial={{ scale: 1.02, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.status === "active" && (
                    <Badge className="bg-emerald-500 text-white">Live</Badge>
                  )}
                  {product.status === "ended" && (
                    <Badge variant="secondary">Ended</Badge>
                  )}
                  <Badge variant="secondary">{product.category}</Badge>
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                </div>

                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-white/70">
                        Current bid
                      </div>
                      <div className="text-2xl font-extrabold">
                        {currency(basePrice)}
                      </div>
                      <div className="text-xs text-white/80">
                        {bidsCount} bids
                      </div>
                    </div>
                    <div className="rounded-full bg-black/40 px-4 py-2 text-xs">
                      <CountdownBadge
                        timeLeft={timeLeft}
                        hasEndTime={hasEndTime}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50/60">
                  {product.images.slice(0, 4).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt="thumb"
                      className="h-16 w-full object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Title + seller meta */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <User className="h-4 w-4" /> Seller ID:{" "}
                  <span className="font-medium">{product.sellerId}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-4 w-4" /> Category:{" "}
                  <span>{product.category}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Info className="h-4 w-4" /> Status:{" "}
                  <span className="capitalize">{product.status}</span>
                </span>
              </div>
            </div>

            {/* Tabs: Overview / Details / Evidence */}
            <Card className="border-none bg-white/70 backdrop-blur-xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="overview" className="space-y-2">
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {product.description}
                    </p>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-1">
                    {details.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No extra details provided.
                      </p>
                    ) : (
                      <dl className="text-sm grid grid-cols-2 gap-y-1">
                        {details.map((d) => (
                          <div
                            key={d.label}
                            className="flex justify-between gap-4"
                          >
                            <dt className="text-slate-500">{d.label}</dt>
                            <dd>{d.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-2">
                    {product.evidenceImages?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {product.evidenceImages.map(
                          (img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt="evidence"
                              className="h-28 w-full object-cover rounded-lg border"
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No evidence images uploaded.
                      </p>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </motion.section>

          {/* RIGHT: Place bid card + bid history */}
          <motion.aside
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            {/* Place bid */}
            <Card className="border-none bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Place your bid</span>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Gavel className="h-3 w-3" /> Live auction
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Enter your maximum bid. The system can auto-bid up to this
                  amount.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* current & min */}
                <div className="rounded-xl border bg-slate-50/80 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current price</span>
                    <span className="font-semibold">
                      {currency(basePrice)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-slate-500">Minimum next bid</span>
                    <span className="font-semibold">
                      {currency(minNextBid)}
                    </span>
                  </div>
                </div>

                {/* form */}
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
                          value={bidAmount ?? ""}
                          onChange={handleBidInput}
                          className="pl-6 text-right font-semibold"
                          disabled={isEnded}
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

                  {/* quick buttons */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBidAmount(minNextBid)}
                      disabled={isEnded}
                    >
                      Match minimum
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(250)}
                      disabled={isEnded}
                    >
                      + 250
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(500)}
                      disabled={isEnded}
                    >
                      + 500
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(1000)}
                      disabled={isEnded}
                    >
                      + 1,000
                    </Button>
                  </div>

                  {/* fees */}
                  <div className="rounded-xl border bg-slate-50/80 p-3 text-xs space-y-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between"
                      onClick={() => setShowFees((s) => !s)}
                    >
                      <span className="font-medium">Estimate summary</span>
                      {showFees ? (
                        <span className="text-xs">Hide</span>
                      ) : (
                        <span className="text-xs">Show</span>
                      )}
                    </button>

                    {showFees && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span>Bid amount</span>
                          <span>{currency(effectiveBid)}</span>
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
                    disabled={isEnded}
                  >
                    <Gavel className="h-4 w-4" />
                    {isEnded ? "Auction ended" : "Place bid"}
                  </Button>

                  {product.buyNowPrice && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-1"
                      size="lg"
                      onClick={handleBuyNow}
                      disabled={isEnded}
                    >
                      Buy now for {currency(product.buyNowPrice)}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Bid history */}
            <Card className="border-none bg-white/70 backdrop-blur-xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Bid history</CardTitle>
                  <CardDescription>
                    Latest bids for this product.
                  </CardDescription>
                </div>
                {productBids.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAllBids((s) => !s)}
                  >
                    {showAllBids ? "Show less" : "Show all"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {latestBids.length === 0 ? (
                  <p className="text-slate-500 text-sm">No bids yet.</p>
                ) : (
                  latestBids.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src="" alt="" />
                          <AvatarFallback>
                            {b.buyerName
                              ?.replace("@", "")
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{b.buyerName}</div>
                          <div className="text-[10px] text-slate-500">
                            {formatBidTime(b.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {currency(b.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProductDetail2;
