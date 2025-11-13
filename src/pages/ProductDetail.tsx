import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, TrendingUp, ShoppingCart, Eye,Hourglass } from 'lucide-react';
import { Gavel, ChevronUp, ChevronDown,  } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Add these custom icon components


const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
    />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="12" height="12" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, bids, addBid } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ended: false,
  });
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAllBids, setShowAllBids] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = products.find((p) => p.id === id);
  const productBids = bids
    .filter((b) => b.productId === id)
    .sort((a, b) => b.timestamp - a.timestamp);
  const latestBids = showAllBids ? productBids : productBids.slice(0, 3);

const [showFees, setShowFees] = useState(false);

const handleBidInput = (e: any) => {
  const raw = String(e.target.value || '').replace(/[^0-9]/g, '');
  const val = raw ? Number(raw) : 0;
  setBidAmount(val);
};

const handleQuickAdd = (delta: number) => {
  setBidAmount((prev) => {
    const base = prev || minNextBid;
    return base + delta;
  });
};

// dùng user để check đăng nhập
const signedIn = !!user;

// bọc handleBid vào form submit
const handlePlaceBid = (e: any) => {
  e.preventDefault();
  handleBid();
};




  useEffect(() => {
    if (product?.endTime) {
      const interval = setInterval(() => {
        const diff = product.endTime! - Date.now();
        if (diff <= 0) {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            ended: true,
          });
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeLeft({
            days,
            hours,
            minutes,
            seconds,
            ended: false,
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      setBidAmount(product.currentPrice + product.bidStep);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          Product not found
        </div>
      </div>
    );
  }

  // Cast product to any to access dynamic properties
  const productData: any = product;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBid = () => {
    if (!user || user.role !== 'buyer') {
      toast({ title: 'Only buyers can bid', variant: 'destructive' });
      return;
    }

    if (product.status === 'ended') {
      toast({ title: 'This auction has ended', variant: 'destructive' });
      return;
    }

    const minBid = product.currentPrice + product.bidStep;

    if (bidAmount < minBid) {
      toast({
        title: 'Invalid bid amount',
        description: `Minimum bid: $${minBid}`,
        variant: 'destructive',
      });
      return;
    }

    addBid({
      productId: product.id,
      buyerId: user.id,
      buyerName: user.name,
      amount: bidAmount,
    });

    toast({ title: 'Bid placed successfully!' });

    // suggest next bid
    setBidAmount(bidAmount + product.bidStep);
  };

  const handleBuyNow = () => {
    if (!user || user.role !== 'buyer') {
      toast({ title: 'Only buyers can purchase', variant: 'destructive' });
      return;
    }

    if (product.status === 'ended') {
      toast({ title: 'This product has been sold', variant: 'destructive' });
      return;
    }

    navigate(`/checkout/${product.id}?type=buynow`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasEndTime = !!product.endTime;
  const bidsCount = product.bidsCount ?? productBids.length;
  const basePrice = product.currentPrice;
  const minNextBid = product.currentPrice + product.bidStep;

  const buyersPremium = Math.round((bidAmount || minNextBid) * 0.12);
  const estimatedTotal = (bidAmount || minNextBid) + buyersPremium;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header line: breadcrumb + actions */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
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
            <span className="text-foreground line-clamp-1">
              {product.title}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <HeartIcon filled={isFavorite} className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <CopyIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 2-column layout giống vibe ProductDetail2 */}
        <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6 items-start">
          {/* LEFT: hero image, description, details */}
          <div className="space-y-4">
            {/* Hero image card với overlay */}
            <Card className="overflow-hidden border-none bg-card shadow-xl">
              <div className="relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full max-h-[460px] object-cover"
                  />
                ) : (
                  <div className="w-full max-h-[460px] flex items-center justify-center bg-muted text-muted-foreground">
                    No Image
                  </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.status === 'active' && (
                    <Badge className="bg-emerald-500 text-white">Live</Badge>
                  )}
                  {product.status === 'ended' && (
                    <Badge variant="secondary">Ended</Badge>
                  )}
                  <Badge variant="secondary">{product.category}</Badge>
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
                      {hasEndTime ? (
                        timeLeft.ended ? (
                          <span className="text-red-300">
                            Auction ended
                          </span>
                        ) : (
                          <span>
                            <Clock className="inline h-3 w-3 mr-1" />
                            {timeLeft.days > 0 && `${timeLeft.days}d `}
                            {String(timeLeft.hours).padStart(2, '0')}:
                            {String(timeLeft.minutes).padStart(2, '0')}:
                            {String(timeLeft.seconds).padStart(2, '0')} left
                          </span>
                        )
                      ) : (
                        <span>Flexible ending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50">
                  {product.images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="w-full h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </Card>

            <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => setShowEvidence(true)}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Authentication Evidence
      </Button>

            {/* Description + Details (gộp lại, style giống info card) */}
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
      {/* OVERVIEW = mô tả từ seller */}
      <TabsContent value="overview" className="space-y-2">
        <p className="text-sm text-slate-700 whitespace-pre-line">
          {product.description}
        </p>
        {/* Nếu muốn có vài bullet cơ bản thì thêm ở đây */}
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>Category: {product.category}</li>
          {product.category === "Handbag" && productData.brand && (
            <li>Brand: {productData.brand}</li>
          )}
          {product.category === "Shoe" && productData.shoeBrand && (
            <li>Brand: {productData.shoeBrand}</li>
          )}
          {productData.condition && <li>Condition: {productData.condition}</li>}
        </ul>
      </TabsContent>

      {/* DETAILS = thông số handbag / shoe như trước */}
      <TabsContent value="details" className="space-y-1">
        {product.category === "Handbag" && (
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Era</dt>
              <dd>{productData.era || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Brand</dt>
              <dd>{productData.brand || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Number of Items</dt>
              <dd>{productData.numberOfItems || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Colour</dt>
              <dd>{productData.colour || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Material</dt>
              <dd>{productData.material || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Condition</dt>
              <dd>{productData.condition || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Size</dt>
              <dd>{productData.size || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Height (cm)</dt>
              <dd>{productData.height || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Width (cm)</dt>
              <dd>{productData.width || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Depth (cm)</dt>
              <dd>{productData.depth || "-"}</dd>
            </div>
          </dl>
        )}

        {product.category === "Shoe" && (
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Era</dt>
              <dd>{productData.shoeEra || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Brand</dt>
              <dd>{productData.shoeBrand || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Size</dt>
              <dd>{productData.shoeSize || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">New in Box</dt>
              <dd>{productData.shoeNewInBox || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Colour</dt>
              <dd>{productData.shoeColour || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Gender</dt>
              <dd>{productData.shoeGender || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Material</dt>
              <dd>{productData.shoeMaterial || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Vintage</dt>
              <dd>{productData.shoeVintage || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Condition</dt>
              <dd>{productData.shoeCondition || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Made In</dt>
              <dd>{productData.shoeMadeIn || "-"}</dd>
            </div>
          </dl>
        )}

        {product.category !== "Handbag" && product.category !== "Shoe" && (
          <p className="text-sm text-slate-500">
            No additional details for this category.
          </p>
        )}
      </TabsContent>

      {/* SHIPPING = text cố định */}
      <TabsContent value="shipping" className="space-y-2">
        <p className="text-sm text-slate-700">
          Ships worldwide via insured express courier. All shipments include
          tracking and require signature upon delivery.
        </p>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>Handling time: 2–3 business days</li>
          <li>EU: 2–4 business days</li>
          <li>US / Asia: 4–7 business days</li>
          <li>Buyer is responsible for import duties &amp; taxes</li>
        </ul>
      </TabsContent>

      {/* Evidence button – luôn hiển thị dưới Tabs */}
      
    </CardContent>
  </Tabs>
            </Card>

          </div>

          {/* RIGHT: countdown card + place bid + bid history */}
          <div className="space-y-6">
            {/* End time + countdown card (giống block ở trên nhưng clean hơn) */}
            {product.endTime && (
              <Card className="border-none bg-white/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="pt-5 pb-5">
                  {/* Top row: label + date, có animation vào */}
                  <motion.div
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center text-sm text-slate-600">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full mr-2">
                        <Hourglass className="h-4 w-4" />
                      </span>
                      End time
                    </span>
                    <span className="font-semibold text-sm">
                      {formatDate(product.endTime)}
                    </span>
                  </motion.div>

                  {/* Countdown boxes */}
                  <div className="mt-4 relative">
                    {/* Vòng glow nhẹ phía sau */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-200/30 via-sky-200/30 to-emerald-200/30 blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    />

                    <motion.div
                      className="relative grid grid-cols-4 gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 }}
                    >
                      {[
                        { label: "Days", value: timeLeft.days },
                        { label: "Hours", value: timeLeft.hours },
                        { label: "Minutes", value: timeLeft.minutes },
                        { label: "Seconds", value: timeLeft.seconds },
                      ].map((item) => (
                        <motion.div
                          key={item.label}
                          className="text-center p-2 rounded-xl bg-white/80 border border-slate-100 shadow-sm"
                          whileHover={{ y: -2, scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 200, damping: 16 }}
                        >
                          <motion.div
                            key={item.value} // để mỗi lần đổi số có hiệu ứng nhẹ
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg font-bold tabular-nums"
                          >
                            {item.value}
                          </motion.div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            {item.label}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Trạng thái nếu đã hết giờ */}
                  {timeLeft.ended && (
                    <motion.p
                      className="mt-3 text-xs text-red-500 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Auction has ended.
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            )}


            {/* Place bid card kiểu ProductDetail2 vibe */}
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
    {product.status === 'ended' || timeLeft.ended ? (
      <div className="p-4 bg-destructive/10 rounded text-center">
        <p className="font-semibold text-destructive">
          This auction has ended
        </p>
      </div>
    ) : (
      <>
        {/* Current & minimum */}
        <div className="rounded-xl border bg-slate-50/80 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current bid</span>
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

        {/* Bid input (form) */}
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
                  value={bidAmount ? bidAmount.toString() : ''}
                  onChange={handleBidInput}
                  className="pl-6 text-right font-semibold"
                />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Your bid must be at least{' '}
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
                setBidAmount(Math.max(bidAmount || 0, minNextBid))
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
                  <span>{currency(bidAmount || minNextBid)}</span>
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
            {signedIn ? 'Place bid' : 'Sign in to bid'}
          </Button>
        </form>

        {/* Buy now vẫn nằm ngoài form, nhưng trong cùng block */}
        {product.buyNowPrice && (
          <Button
            onClick={handleBuyNow}
            variant="default"
            className="w-full mt-2"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now – ${product.buyNowPrice}
          </Button>
        )}
      </>
    )}
  </CardContent>
            </Card>

            {/* Bid history card */}
            <Card>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
                <CardDescription>
                    Latest bids for this lot.
                  </CardDescription>
              </CardHeader>
              
              <CardContent>
                {productBids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No bids yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Always show the first 3 bids */}
                    {productBids.slice(0, 3).map((bid) => (
                      <div
                        key={bid.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span className="text-sm font-medium">
                          {bid.buyerName}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          ${bid.amount}
                        </span>
                      </div>
                    ))}

                    {/* Toggle additional bids */}
                    {productBids.length > 3 && (
                      <Button
                        variant="link"
                        className="w-full mt-2 text-left"
                        onClick={() => setShowAllBids(!showAllBids)}
                      >
                        <span className="text-sm">
                          {showAllBids
                            ? 'Hide additional bids'
                            : `See all bids (${productBids.length} total)`}
                        </span>
                        <span className="ml-1">
                          {showAllBids ? '↑' : '↓'}
                        </span>
                      </Button>
                    )}

                    {showAllBids &&
                      productBids.slice(3).map((bid) => (
                        <div
                          key={bid.id}
                          className="flex justify-between items-center p-2 bg-muted rounded"
                        >
                          <span className="text-sm font-medium">
                            {bid.buyerName}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            ${bid.amount}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Evidence dialog giữ nguyên */}
      <Dialog open={showEvidence} onOpenChange={setShowEvidence}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Authentication Evidence</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {product.evidenceImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-full h-64 object-cover rounded"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
