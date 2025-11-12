import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';

export default function CreateProduct() {
  const navigate = useNavigate();
  const { addProduct } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // Will be either 'handbag' or 'shoe'
    images: [] as string[],
    evidenceImages: [] as string[],
    startPrice: 0,
    bidStep: 0,
    buyNowPrice: 0,
    duration: 60,
    // Handbag-specific fields
    era: '',
    brand: '',
    numberOfItems: '',
    colour: '',
    material: '',
    condition: '',
    size: '',
    height: '',
    width: '',
    depth: '',
    // Shoe-specific fields
    shoeEra: '',
    shoeBrand: '',
    shoeSize: '',
    shoeNewInBox: '',
    shoeColour: '',
    shoeGender: '',
    shoeMaterial: '',
    shoeVintage: '',
    shoeCondition: '',
    shoeMadeIn: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'evidenceImages') => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [type]: [...prev[type], reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, type: 'images' | 'evidenceImages') => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!user) return;
    
    addProduct({
      ...formData,
      sellerId: user.id,
    });

    toast({ title: 'Product submitted for review!' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Product - Step {step} of 4</CardTitle>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Electronics, Fashion"
                  />
                </div>
                <div>
                  <Label>Product Images</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload images</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'images')}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removeImage(idx, 'images')}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Evidence Images (Authentication Proof)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload images that prove the authenticity of your product
                  </p>
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload evidence</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'evidenceImages')}
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.evidenceImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                        <button
                          onClick={() => removeImage(idx, 'evidenceImages')}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startPrice">Starting Price ($)</Label>
                  <Input
                    id="startPrice"
                    type="number"
                    value={formData.startPrice}
                    onChange={(e) => setFormData({ ...formData, startPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="bidStep">Bid Step ($)</Label>
                  <Input
                    id="bidStep"
                    type="number"
                    value={formData.bidStep}
                    onChange={(e) => setFormData({ ...formData, bidStep: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="buyNowPrice">Buy Now Price (Optional, $)</Label>
                  <Input
                    id="buyNowPrice"
                    type="number"
                    value={formData.buyNowPrice}
                    onChange={(e) => setFormData({ ...formData, buyNowPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Auction Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Review Your Product</h3>
                <div className="space-y-2">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Starting Price:</strong> ${formData.startPrice}</p>
                  <p><strong>Bid Step:</strong> ${formData.bidStep}</p>
                  {formData.buyNowPrice > 0 && (
                    <p><strong>Buy Now:</strong> ${formData.buyNowPrice}</p>
                  )}
                  <p><strong>Duration:</strong> {formData.duration} minutes</p>
                  <p><strong>Product Images:</strong> {formData.images.length} uploaded</p>
                  <p><strong>Evidence Images:</strong> {formData.evidenceImages.length} uploaded</p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} className="ml-auto">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="ml-auto">
                  Submit for Review
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
