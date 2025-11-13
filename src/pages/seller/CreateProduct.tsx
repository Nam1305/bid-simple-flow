import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // Giả sử đã có component Progress
import { Separator } from '@/components/ui/separator'; // Giả sử đã có component Separator
import { Product } from '@/contexts/DataContext'; // Lấy kiểu Product từ DataContext

// Định nghĩa các yêu cầu ảnh xác thực
const AUTH_REQUIREMENTS = [
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
];

// Giả lập Link và QR Code chứng nhận
const MOCK_CERT_URL = "https://snapbid.com/cert/PRD123456789";
const TOTAL_STEPS = 6; // Đã tăng từ 4 lên 6

// Định nghĩa kiểu dữ liệu payload (Sử dụng Product['status'] từ DataContext)
interface ProductSubmitPayload {
    title: string; description: string; category: string; images: string[];
    evidenceImages: string[]; startPrice: number; bidStep: number;
    buyNowPrice: number; duration: number; sellerId: string;
    isAuthentic: boolean; certificationUrl?: string; status: Product['status'];
    era?: string; brand?: string; numberOfItems?: string; colour?: string;
    material?: string; condition?: string; size?: string; height?: string; // Giữ là string
    width?: string; depth?: string; shoeEra?: string; shoeBrand?: string;
    shoeSize?: string; shoeNewInBox?: string; shoeColour?: string;
    shoeGender?: string; shoeMaterial?: string; shoeVintage?: string;
    shoeCondition?: string; shoeMadeIn?: string;
}

// Định nghĩa kiểu cuối cùng mà addProduct chấp nhận
type AddProductPayload = Omit<Product, 'id' | 'status' | 'currentPrice' | 'createdAt'>;

// Định nghĩa kiểu cơ sở (chỉ lấy các trường chung)
type BasePayload = Pick<AddProductPayload,
    'title' | 'description' | 'category' | 'images' | 'evidenceImages' |
    'startPrice' | 'bidStep' | 'buyNowPrice' | 'duration' | 'sellerId' |
    'isAuthentic' | 'certificationUrl'> & { status: Product['status'] };


export default function CreateProduct() {
    const navigate = useNavigate();
    const { addProduct } = useData();
    const { user } = useAuth();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '', // Will be either 'Handbag' or 'Shoe'
        images: [] as string[],
        evidenceImages: {} as Record<string, string[]>,
        startPrice: 0,
        bidStep: 0,
        buyNowPrice: 0,
        duration: 60,
        // Handbag-specific fields (STRING)
        era: '', brand: '', numberOfItems: '', colour: '', material: '',
        condition: '', size: '', height: '', width: '', depth: '',
        // Shoe-specific fields (STRING)
        shoeEra: '', shoeBrand: '', shoeSize: '', shoeNewInBox: '', shoeColour: '',
        shoeGender: '', shoeMaterial: '', shoeVintage: '', shoeCondition: '', shoeMadeIn: '',
    });

    // State cho AI Check
    const [aiCheckStatus, setAiCheckStatus] = useState<'idle' | 'checking' | 'authentic' | 'failed'>('idle');
    const [aiProgress, setAiProgress] = useState(0);

    // Kiểm tra xem tất cả ảnh bắt buộc đã được tải lên chưa
    const requiredImagesUploaded = useMemo(() => {
        const requiredKeys = AUTH_REQUIREMENTS.filter(r => r.required).map(r => r.id);
        return requiredKeys.every(key => formData.evidenceImages[key] && formData.evidenceImages[key].length > 0);
    }, [formData.evidenceImages]);


    // Cập nhật handleImageUpload để nhận thêm key (cho evidenceImages)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'evidenceImages', key?: string) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => {
                    if (type === 'images') {
                        return { ...prev, images: [...prev.images, reader.result as string] };
                    } else if (type === 'evidenceImages' && key) {
                        const currentImages = prev.evidenceImages[key] || [];
                        return {
                            ...prev,
                            evidenceImages: {
                                ...prev.evidenceImages,
                                [key]: [...currentImages, reader.result as string],
                            },
                        };
                    }
                    return prev;
                });
            };
            reader.readAsDataURL(file);
        });
    };

    // Cập nhật removeImage để nhận thêm key (cho evidenceImages)
    const removeImage = (index: number, type: 'images' | 'evidenceImages', key?: string) => {
        setFormData((prev) => {
            if (type === 'images') {
                return { ...prev, images: prev.images.filter((_, i) => i !== index) };
            } else if (type === 'evidenceImages' && key) {
                return {
                    ...prev,
                    evidenceImages: {
                        ...prev.evidenceImages,
                        [key]: prev.evidenceImages[key].filter((_, i) => i !== index),
                    },
                };
            }
            return prev;
        });
    };

    // Logic mô phỏng AI Check
    const startAICheck = () => {
        setAiCheckStatus('checking');
        setAiProgress(0);

        const interval = setInterval(() => {
            setAiProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setAiCheckStatus('authentic');
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 500);
    };

    // Hàm xử lý chuyển bước
    const handleNextStep = () => {
        if (step === 2) {
            if (!requiredImagesUploaded) {
                toast({ title: "Thiếu ảnh xác thực", description: "Vui lòng tải lên tất cả các ảnh bắt buộc (*)", variant: "destructive", });
                return;
            }
            setStep(3); // -> AI Check
        } else if (step === 3 && aiCheckStatus === 'authentic') {
            setStep(4); // -> Certificate Display
        } else if (step === 4) {
            setStep(5); // -> Pricing (Step 3 cũ)
        } else if (step === 5) {
            setStep(6); // -> Review (Step 4 cũ)
        } else {
            setStep(step + 1);
        }
    };


    // Hàm handleSubmit (SỬA LỖI TYPESCRIPT VÀ RUNTIME)
    // Hàm handleSubmit (ĐÃ FIX: Thêm validation đầy đủ)
    const handleSubmit = () => {
        if (!user) {
            toast({ title: 'Lỗi', description: 'Bạn cần đăng nhập để tạo sản phẩm', variant: 'destructive' });
            return;
        }

        // --- VALIDATION: Kiểm tra các trường bắt buộc ---
        const errors: string[] = [];

        if (!formData.title.trim()) errors.push('Title');
        if (!formData.description.trim()) errors.push('Description');
        if (!formData.category) errors.push('Category');
        if (formData.images.length === 0) errors.push('Product Images');
        if (Number(formData.startPrice) <= 0) errors.push('Starting Price (phải > 0)');
        if (Number(formData.bidStep) <= 0) errors.push('Bid Step (phải > 0)');
        if (Number(formData.duration) <= 0) errors.push('Duration (phải > 0)');

        if (errors.length > 0) {
            toast({
                title: '❌ Thiếu thông tin bắt buộc',
                description: `Vui lòng điền đầy đủ: ${errors.join(', ')}`,
                variant: 'destructive',
            });
            return;
        }

        // --- 1. Chuẩn bị các trường dữ liệu chung ---
        const commonFields: BasePayload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            images: formData.images,
            evidenceImages: Object.values(formData.evidenceImages).flat() as string[],
            startPrice: Number(formData.startPrice),
            bidStep: Number(formData.bidStep),
            buyNowPrice: formData.buyNowPrice > 0 ? Number(formData.buyNowPrice) : undefined,
            duration: Number(formData.duration),
            sellerId: user.id,
            isAuthentic: aiCheckStatus === 'authentic',
            certificationUrl: aiCheckStatus === 'authentic' ? MOCK_CERT_URL : undefined,
            status: 'pending',
        };

        let finalPayload: Partial<AddProductPayload> = {};

        // --- 2. Chọn các trường chi tiết theo Category (Chuyển đổi H/W/D sang STRING) ---
        if (formData.category === 'Handbag') {
            finalPayload = {
                ...commonFields,
                era: formData.era || undefined,
                brand: formData.brand || undefined,
                numberOfItems: formData.numberOfItems || undefined,
                colour: formData.colour || undefined,
                material: formData.material || undefined,
                condition: formData.condition || undefined,
                size: formData.size || undefined,
                height: formData.height ? String(formData.height) : undefined,
                width: formData.width ? String(formData.width) : undefined,
                depth: formData.depth ? String(formData.depth) : undefined,
            };
        } else if (formData.category === 'Shoe') {
            finalPayload = {
                ...commonFields,
                shoeEra: formData.shoeEra || undefined,
                shoeBrand: formData.shoeBrand || undefined,
                shoeSize: formData.shoeSize || undefined,
                shoeNewInBox: formData.shoeNewInBox || undefined,
                shoeColour: formData.shoeColour || undefined,
                shoeGender: formData.shoeGender || undefined,
                shoeMaterial: formData.shoeMaterial || undefined,
                shoeVintage: formData.shoeVintage || undefined,
                shoeCondition: formData.shoeCondition || undefined,
                shoeMadeIn: formData.shoeMadeIn || undefined,
            };
        } else {
            finalPayload = commonFields;
        }

        try {
            // --- 3. Gửi payload đã được làm sạch và ép kiểu an toàn cho addProduct ---
            addProduct(finalPayload as AddProductPayload);

            toast({
                title: '✅ Thành công!',
                description: 'Sản phẩm đã được gửi để chờ duyệt.',
            });
            navigate('/');
        } catch (error) {
            console.error("Lỗi khi gửi sản phẩm:", error);
            toast({
                title: '❌ Lỗi gửi sản phẩm',
                description: 'Đã xảy ra lỗi khi gửi dữ liệu. Vui lòng thử lại.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 ">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Product - Step {step} of {TOTAL_STEPS}</CardTitle>
                        <div className="flex gap-2 mt-4">
                            {Array.from({ length: TOTAL_STEPS }).map((_, s) => (
                                <div
                                    key={s}
                                    className={`h-2 flex-1 rounded-full ${
                                        s + 1 <= step ? 'bg-primary' : 'bg-muted'
                                    }`}
                                />
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Basic Info and Product Images */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div><Label htmlFor="title">Product Title</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter product title" /></div>
                                <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your product" rows={4} /></div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <Button variant={formData.category === 'Handbag' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, category: 'Handbag' })} className="py-6">Handbag</Button>
                                        <Button variant={formData.category === 'Shoe' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, category: 'Shoe' })} className="py-6">Shoe</Button>
                                    </div>
                                </div>

                                {formData.category === 'Handbag' && (
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="font-medium">Handbag Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label htmlFor="era">Era</Label><Input id="era" value={formData.era} onChange={(e) => setFormData({ ...formData, era: e.target.value })} placeholder="e.g., Vintage, Modern" /></div>
                                            <div><Label htmlFor="brand">Brand</Label><Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g., Gucci, Louis Vuitton" /></div>
                                            <div><Label htmlFor="numberOfItems">Number of Items</Label><Input id="numberOfItems" value={formData.numberOfItems} onChange={(e) => setFormData({ ...formData, numberOfItems: e.target.value })} placeholder="e.g., 1, 2, Set" /></div>
                                            <div><Label htmlFor="colour">Colour</Label><Input id="colour" value={formData.colour} onChange={(e) => setFormData({ ...formData, colour: e.target.value })} placeholder="e.g., Black, Brown" /></div>
                                            <div><Label htmlFor="material">Material</Label><Input id="material" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} placeholder="e.g., Leather, Canvas" /></div>
                                            <div><Label htmlFor="condition">Condition</Label><Input id="condition" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} placeholder="e.g., Excellent, Good" /></div>
                                            <div><Label htmlFor="size">Size</Label><Input id="size" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g., Small, Medium" /></div>
                                            <div><Label htmlFor="height">Height (cm)</Label><Input id="height" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="e.g., 25" /></div>
                                            <div><Label htmlFor="width">Width (cm)</Label><Input id="width" type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder="e.g., 30" /></div>
                                            <div><Label htmlFor="depth">Depth (cm)</Label><Input id="depth" type="number" value={formData.depth} onChange={(e) => setFormData({ ...formData, depth: e.target.value })} placeholder="e.g., 15" /></div>
                                        </div>
                                    </div>
                                )}

                                {formData.category === 'Shoe' && (
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="font-medium">Shoe Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label htmlFor="shoeEra">Era</Label><Input id="shoeEra" value={formData.shoeEra} onChange={(e) => setFormData({ ...formData, shoeEra: e.target.value })} placeholder="e.g., Vintage, Modern" /></div>
                                            <div><Label htmlFor="shoeBrand">Brand</Label><Input id="shoeBrand" value={formData.shoeBrand} onChange={(e) => setFormData({ ...formData, shoeBrand: e.target.value })} placeholder="e.g., Nike, Adidas" /></div>
                                            <div><Label htmlFor="shoeSize">Size</Label><Input id="shoeSize" value={formData.shoeSize} onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })} placeholder="e.g., US 8, EU 42" /></div>
                                            <div><Label htmlFor="shoeNewInBox">New in Box</Label><Input id="shoeNewInBox" value={formData.shoeNewInBox} onChange={(e) => setFormData({ ...formData, shoeNewInBox: e.target.value })} placeholder="Yes/No" /></div>
                                            <div><Label htmlFor="shoeColour">Colour</Label><Input id="shoeColour" value={formData.shoeColour} onChange={(e) => setFormData({ ...formData, shoeColour: e.target.value })} placeholder="e.g., Black, White" /></div>
                                            <div><Label htmlFor="shoeGender">Gender</Label><Input id="shoeGender" value={formData.shoeGender} onChange={(e) => setFormData({ ...formData, shoeGender: e.target.value })} placeholder="e.g., Men, Women, Unisex" /></div>
                                            <div><Label htmlFor="shoeMaterial">Material</Label><Input id="shoeMaterial" value={formData.shoeMaterial} onChange={(e) => setFormData({ ...formData, shoeMaterial: e.target.value })} placeholder="e.g., Leather, Canvas" /></div>
                                            <div><Label htmlFor="shoeVintage">Vintage</Label><Input id="shoeVintage" value={formData.shoeVintage} onChange={(e) => setFormData({ ...formData, shoeVintage: e.target.value })} placeholder="Yes/No" /></div>
                                            <div><Label htmlFor="shoeCondition">Condition</Label><Input id="shoeCondition" value={formData.shoeCondition} onChange={(e) => setFormData({ ...formData, shoeCondition: e.target.value })} placeholder="e.g., Excellent, Good" /></div>
                                            <div><Label htmlFor="shoeMadeIn">Made In</Label><Input id="shoeMadeIn" value={formData.shoeMadeIn} onChange={(e) => setFormData({ ...formData, shoeMadeIn: e.target.value })} placeholder="e.g., Italy, USA" /></div>
                                        </div>
                                    </div>
                                )}

                                {/* Product Images */}
                                <div>
                                    <Label>Product Images</Label>
                                    <div className="mt-2">
                                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                                            <div className="text-center">
                                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Click to upload images</span>
                                            </div>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'images')} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                                                <button onClick={() => removeImage(idx, 'images')} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Required Authentication Images */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-semibold mb-4 block">📸 Required Authentication Images</Label>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Vui lòng tải lên ảnh rõ ràng cho từng yêu cầu. Ảnh này được sử dụng cho quá trình kiểm tra hàng thật bằng AI.
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {AUTH_REQUIREMENTS.map((requirement) => (
                                            <div key={requirement.id} className="border rounded-lg p-4 bg-card shadow-sm">
                                                <div className="flex items-center justify-between mb-3 min-h-[40px]">
                                                    <Label className="flex items-center gap-1 text-sm font-medium leading-tight">
                                                        {requirement.label}
                                                        {requirement.required && <span className="text-red-500 text-lg">*</span>}
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
                                                        onChange={(e) => handleImageUpload(e, 'evidenceImages', requirement.id)}
                                                    />
                                                </label>

                                                <div className="grid grid-cols-2 gap-2 mt-3 max-h-40 overflow-y-auto">
                                                    {(formData.evidenceImages[requirement.id] || []).map((img, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                                                            <button
                                                                onClick={() => removeImage(idx, 'evidenceImages', requirement.id)}
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

                        {/* Step 3: AI Check Authentic */}
                        {step === 3 && (
                            <div className="space-y-6 text-center py-10">
                                <h3 className="font-semibold text-xl">🔍 AI Authentic Check in Progress...</h3>
                                <p className="text-muted-foreground">
                                    Hệ thống AI của Snapbid đang phân tích hình ảnh xác thực của bạn để đảm bảo tính chính hãng.
                                </p>

                                {aiCheckStatus === 'idle' && (
                                    <Button onClick={startAICheck} className="mt-4" disabled={!requiredImagesUploaded}>
                                        Start AI Check
                                    </Button>
                                )}

                                {aiCheckStatus === 'checking' && (
                                    <div className="max-w-md mx-auto space-y-4">
                                        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                                        <Progress value={aiProgress} className="w-full" />
                                        <p className="text-sm">{aiProgress.toFixed(0)}% Complete - Analyzing unique features...</p>
                                    </div>
                                )}

                                {aiCheckStatus === 'authentic' && (
                                    <div className="max-w-md mx-auto space-y-4 p-6 border border-green-500 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                                        <h4 className="text-2xl font-bold text-green-700">AUTHENTICATED!</h4>
                                        <p className="text-md">
                                            Sản phẩm của bạn đã được hệ thống AI của Snapbid xác nhận là **Hàng Thật**.
                                        </p>
                                        <Button onClick={() => setStep(4)} className="w-full">
                                            Tiếp tục
                                        </Button>
                                    </div>
                                )}

                                {aiCheckStatus === 'failed' && (
                                    <div className="max-w-md mx-auto space-y-4 p-6 border border-red-500 bg-red-50 rounded-lg">
                                        <X className="h-12 w-12 text-red-600 mx-auto" />
                                        <h4 className="text-2xl font-bold text-red-700">AUTHENTIC CHECK FAILED</h4>
                                        <p className="text-md">
                                            Vui lòng kiểm tra lại ảnh xác thực hoặc liên hệ hỗ trợ.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: AI Certificate Display */}
                        {step === 4 && aiCheckStatus === 'authentic' && (
                            <div className="space-y-6 py-4">
                                <h3 className="font-semibold text-xl text-center">✅ Chứng Nhận Hàng Thật Snapbid</h3>
                                <Separator />
                                <div className="grid md:grid-cols-2 gap-6 items-center">
                                    <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                                        <p className="text-lg font-bold flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-6 w-6" />
                                            Sản Phẩm Đã Được Xác Thực
                                        </p>

                                        <p>
                                            <strong>Link Chứng Nhận:</strong> <a href={MOCK_CERT_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block truncate">{MOCK_CERT_URL}</a>
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white">
                                        <Label className="mb-2">Mã QR Chứng Nhận</Label>
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(MOCK_CERT_URL)}`}
                                             alt="QR Code"
                                             className="w-32 h-32 border p-1"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => setStep(5)} className="w-full mt-4">
                                    Tiếp tục đặt giá
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}


                        {/* Step 5: Pricing (Step 3 cũ) */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">💰 Đặt Giá Khởi Điểm & Quy Tắc Đấu Giá</h3>
                                <div><Label htmlFor="startPrice">Starting Price ($)</Label><Input id="startPrice" type="number" value={formData.startPrice} onChange={(e) => setFormData({ ...formData, startPrice: Number(e.target.value) })} /></div>
                                <div><Label htmlFor="bidStep">Bid Step ($)</Label><Input id="bidStep" type="number" value={formData.bidStep} onChange={(e) => setFormData({ ...formData, bidStep: Number(e.target.value) })} /></div>
                                <div><Label htmlFor="buyNowPrice">Buy Now Price (Optional, $)</Label><Input id="buyNowPrice" type="number" value={formData.buyNowPrice} onChange={(e) => setFormData({ ...formData, buyNowPrice: Number(e.target.value) })} /></div>
                                <div><Label htmlFor="duration">Auction Duration (minutes)</Label><Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} /></div>
                            </div>
                        )}

                        {/* Step 6: Review (Step 4 cũ) */}
                        {step === 6 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">📝 Review Your Product</h3>
                                <Separator />
                                <div className="space-y-2 p-4 border rounded-lg bg-card/50">
                                    <p><strong>Title:</strong> {formData.title}</p>
                                    <p><strong>Category:</strong> {formData.category}</p>
                                    <p><strong>Authenticity:</strong> <span className={`font-bold ${aiCheckStatus === 'authentic' ? 'text-green-600' : 'text-muted-foreground'}`}>{aiCheckStatus === 'authentic' ? 'AUTHENTICATED (Snapbid)' : 'Pending Check'}</span></p>
                                    <p><strong>Starting Price:</strong> ${formData.startPrice}</p>
                                    <p><strong>Bid Step:</strong> ${formData.bidStep}</p>
                                    {formData.buyNowPrice > 0 && (<p><strong>Buy Now:</strong> ${formData.buyNowPrice}</p>)}
                                    <p><strong>Duration:</strong> {formData.duration} minutes</p>
                                    <p><strong>Product Images:</strong> {formData.images.length} uploaded</p>
                                    <p><strong>Evidence Images:</strong> {Object.values(formData.evidenceImages).flat().length} uploaded</p>
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
                            {step < TOTAL_STEPS ? (
                                <Button
                                    onClick={handleNextStep}
                                    className="ml-auto"
                                    disabled={
                                        (step === 2 && !requiredImagesUploaded) || // Chặn ở Step 2
                                        (step === 3 && aiCheckStatus !== 'authentic') // Chặn ở Step 3
                                    }
                                >
                                    {step === 2 && !requiredImagesUploaded ? 'Upload required images' : 'Next'}
                                    {step === 3 && aiCheckStatus === 'checking' && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                                    {(step !== 3 || aiCheckStatus === 'authentic') && <ChevronRight className="h-4 w-4 ml-2" />}
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