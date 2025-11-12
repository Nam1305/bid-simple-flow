import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, TrendingUp, ShoppingCart, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, bids, addBid } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);

  const product = products.find(p => p.id === id);
  const productBids = bids.filter(b => b.productId === id).sort((a, b) => b.timestamp - a.timestamp);

  useEffect(() => {
    if (product?.endTime) {
      const interval = setInterval(() => {
        const diff = product.endTime! - Date.now();
        if (diff <= 0) {
          setTimeLeft('Ended');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
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
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Price</span>
                  <span className="text-primary text-3xl">${product.currentPrice}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.endTime && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Left
                    </span>
                    <span className="font-semibold">{timeLeft}</span>
                  </div>
                )}

                {product.status === 'ended' ? (
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
                    {productBids.map((bid) => (
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
