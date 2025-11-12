import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, TrendingUp, ShoppingCart, Eye, ListOrdered } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Add these custom icon components
const HeartIcon = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="12" height="12" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

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
    ended: false
  });
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAllBids, setShowAllBids] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = products.find(p => p.id === id);
  const productBids = bids.filter(b => b.productId === id).sort((a, b) => b.timestamp - a.timestamp);
  const latestBids = showAllBids ? productBids : productBids.slice(0, 3);

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
            ended: true
          });
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimeLeft({
            days,
            hours,
            minutes,
            seconds,
            ended: false
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
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  // Cast product to any to access dynamic properties
  const productData: any = product;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

    if (bidAmount < product.currentPrice + product.bidStep) {
      toast({
        title: 'Invalid bid amount',
        description: `Minimum bid: $${product.currentPrice + product.bidStep}`,
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <div className="flex space-x-2">
                <Button 
                  variant={isFavorite ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <HeartIcon filled={isFavorite} className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                >
                  <CopyIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="aspect-square bg-muted rounded-lg mb-4">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, idx) => (
                <img key={idx} src={img} alt="" className="w-full h-20 object-cover rounded" />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowEvidence(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Authentication Evidence
            </Button>
            
            {/* Moved product information here */}
            <div className="mt-6">
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description From The Seller</h3>
                  <div className="max-w-lg">
                    <p className="text-muted-foreground mb-2 line-clamp-3">{product.description}</p>
                    {product.description.length > 100 && (
                      <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-800">
                        Show more
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.category === 'Handbag' && (
                      <>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Era</span>
                          <span>{productData.era}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Brand</span>
                          <span>{productData.brand}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Number of Items</span>
                          <span>{productData.numberOfItems}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Colour</span>
                          <span>{productData.colour}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Material</span>
                          <span>{productData.material}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Condition</span>
                          <span>{productData.condition}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Size</span>
                          <span>{productData.size}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Height (cm)</span>
                          <span>{productData.height}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Width (cm)</span>
                          <span>{productData.width}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Depth (cm)</span>
                          <span>{productData.depth}</span>
                        </div>
                      </>
                    )}
                    
                    {product.category === 'Shoe' && (
                      <>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Era</span>
                          <span>{productData.shoeEra}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Brand</span>
                          <span>{productData.shoeBrand}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Size</span>
                          <span>{productData.shoeSize}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">New in Box</span>
                          <span>{productData.shoeNewInBox}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Colour</span>
                          <span>{productData.shoeColour}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Gender</span>
                          <span>{productData.shoeGender}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Material</span>
                          <span>{productData.shoeMaterial}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Vintage</span>
                          <span>{productData.shoeVintage}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Condition</span>
                          <span>{productData.shoeCondition}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground uppercase">Made In</span>
                          <span>{productData.shoeMadeIn}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Moved time display to above the current price card */}
            {product.endTime && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between p-3 bg-muted rounded mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      End Time
                    </span>
                    <span className="font-semibold">{formatDate(product.endTime)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-bold">{timeLeft.days}</div>
                      <div className="text-xs text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-bold">{timeLeft.hours}</div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-bold">{timeLeft.minutes}</div>
                      <div className="text-xs text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-bold">{timeLeft.seconds}</div>
                      <div className="text-xs text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Price</span>
                  <span className="text-primary text-3xl">${product.currentPrice}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.status === 'ended' || timeLeft.ended ? (
                  <div className="p-4 bg-destructive/10 rounded text-center">
                    <p className="font-semibold text-destructive">This auction has ended</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={product.currentPrice + product.bidStep}
                        />
                        <Button onClick={handleBid} className="whitespace-nowrap">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Place Bid
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Minimum bid: ${product.currentPrice + product.bidStep} (step: ${product.bidStep})
                      </p>
                    </div>

                    {product.buyNowPrice && (
                      <Button
                        onClick={handleBuyNow}
                        variant="default"
                        className="w-full bg-accent hover:bg-accent/90"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now - ${product.buyNowPrice}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
              </CardHeader>
              <CardContent>
                {productBids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bids yet</p>
                ) : (
                  <div className="space-y-2">
                    {/* Always show the first 3 bids */}
                    {productBids.slice(0, 3).map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{bid.buyerName}</span>
                        <span className="text-sm font-bold text-primary">${bid.amount}</span>
                      </div>
                    ))}
                    
                    {/* Toggle additional bids with expand/collapse indicator */}
                    {productBids.length > 3 && (
                      <Button 
                        variant="link" 
                        className="w-full mt-2 text-left"
                        onClick={() => setShowAllBids(!showAllBids)}
                      >
                        <span className="text-sm">
                          {showAllBids ? 'Hide additional bids' : `See all bids (${productBids.length} total)`}
                        </span>
                        <span className="ml-1">
                          {showAllBids ? '↑' : '↓'}
                        </span>
                      </Button>
                    )}
                    
                    {/* Additional bids - only show when expanded */}
                    {showAllBids && productBids.slice(3).map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{bid.buyerName}</span>
                        <span className="text-sm font-bold text-primary">${bid.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showEvidence} onOpenChange={setShowEvidence}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Authentication Evidence</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {product.evidenceImages.map((img, idx) => (
              <img key={idx} src={img} alt="" className="w-full h-64 object-cover rounded" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
