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
      <div className="container mx-auto px-4 ">
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
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Button
                      variant={formData.category === 'Handbag' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, category: 'Handbag' })}
                      className="py-6"
                    >
                      Handbag
                    </Button>
                    <Button
                      variant={formData.category === 'Shoe' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, category: 'Shoe' })}
                      className="py-6"
                    >
                      Shoe
                    </Button>
                  </div>
                </div>
                
                {formData.category === 'Handbag' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-medium">Handbag Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="era">Era</Label>
                        <Input
                          id="era"
                          value={formData.era}
                          onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                          placeholder="e.g., Vintage, Modern"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="e.g., Gucci, Louis Vuitton"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numberOfItems">Number of Items</Label>
                        <Input
                          id="numberOfItems"
                          value={formData.numberOfItems}
                          onChange={(e) => setFormData({ ...formData, numberOfItems: e.target.value })}
                          placeholder="e.g., 1, 2, Set"
                        />
                      </div>
                      <div>
                        <Label htmlFor="colour">Colour</Label>
                        <Input
                          id="colour"
                          value={formData.colour}
                          onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                          placeholder="e.g., Black, Brown"
                        />
                      </div>
                      <div>
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          placeholder="e.g., Leather, Canvas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Input
                          id="condition"
                          value={formData.condition}
                          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                          placeholder="e.g., Excellent, Good"
                        />
                      </div>
                      <div>
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="e.g., Small, Medium"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          placeholder="e.g., 25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width (cm)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={formData.width}
                          onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="depth">Depth (cm)</Label>
                        <Input
                          id="depth"
                          type="number"
                          value={formData.depth}
                          onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                          placeholder="e.g., 15"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.category === 'Shoe' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-medium">Shoe Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shoeEra">Era</Label>
                        <Input
                          id="shoeEra"
                          value={formData.shoeEra}
                          onChange={(e) => setFormData({ ...formData, shoeEra: e.target.value })}
                          placeholder="e.g., Vintage, Modern"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeBrand">Brand</Label>
                        <Input
                          id="shoeBrand"
                          value={formData.shoeBrand}
                          onChange={(e) => setFormData({ ...formData, shoeBrand: e.target.value })}
                          placeholder="e.g., Nike, Adidas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeSize">Size</Label>
                        <Input
                          id="shoeSize"
                          value={formData.shoeSize}
                          onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                          placeholder="e.g., US 8, EU 42"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeNewInBox">New in Box</Label>
                        <Input
                          id="shoeNewInBox"
                          value={formData.shoeNewInBox}
                          onChange={(e) => setFormData({ ...formData, shoeNewInBox: e.target.value })}
                          placeholder="Yes/No"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeColour">Colour</Label>
                        <Input
                          id="shoeColour"
                          value={formData.shoeColour}
                          onChange={(e) => setFormData({ ...formData, shoeColour: e.target.value })}
                          placeholder="e.g., Black, White"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeGender">Gender</Label>
                        <Input
                          id="shoeGender"
                          value={formData.shoeGender}
                          onChange={(e) => setFormData({ ...formData, shoeGender: e.target.value })}
                          placeholder="e.g., Men, Women, Unisex"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeMaterial">Material</Label>
                        <Input
                          id="shoeMaterial"
                          value={formData.shoeMaterial}
                          onChange={(e) => setFormData({ ...formData, shoeMaterial: e.target.value })}
                          placeholder="e.g., Leather, Canvas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeVintage">Vintage</Label>
                        <Input
                          id="shoeVintage"
                          value={formData.shoeVintage}
                          onChange={(e) => setFormData({ ...formData, shoeVintage: e.target.value })}
                          placeholder="Yes/No"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeCondition">Condition</Label>
                        <Input
                          id="shoeCondition"
                          value={formData.shoeCondition}
                          onChange={(e) => setFormData({ ...formData, shoeCondition: e.target.value })}
                          placeholder="e.g., Excellent, Good"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoeMadeIn">Made In</Label>
                        <Input
                          id="shoeMadeIn"
                          value={formData.shoeMadeIn}
                          onChange={(e) => setFormData({ ...formData, shoeMadeIn: e.target.value })}
                          placeholder="e.g., Italy, USA"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Required Authentication Images</Label>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please upload clear images for each requirement below:
                  </p>
                  
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { id: 'front', label: 'Front (Required)', required: true },
                      { id: 'face', label: 'Face', required: false },
                      { id: 'caseEngravings', label: 'Case Engravings', required: false },
                      { id: 'styleSerialDate', label: 'Style / Serial / Date Code', required: false },
                      { id: 'crown', label: 'Crown', required: false },
                      { id: 'clasp', label: 'Clasp', required: false },
                      { id: 'ovalEngraving', label: 'Clear Close Up of the Oval Engraving', required: false },
                      { id: 'paperTags', label: 'Front & Back of All Paper Tags / Booklets', required: false },
                      { id: 'thirdPartyOpinion', label: 'Already Received One Opinion? Upload Your 3rd Party Documentation(s) for Review', required: false },
                      { id: 'additionalImages', label: 'Add Additional Images', required: false },
                    ].map((requirement) => (
                      <div key={requirement.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            {requirement.label}
                            {requirement.required && <span className="text-red-500 font-bold text-lg">*</span>}
                          </Label>
                        </div>
                        
                        <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                          <div className="text-center">
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload</span>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'evidenceImages')}
                          />
                        </label>
                        
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {formData.evidenceImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                              <button
                                onClick={() => removeImage(idx, 'evidenceImages')}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
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
