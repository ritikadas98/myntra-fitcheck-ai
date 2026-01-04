import { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  Ruler, 
  Wand2, 
  AlertCircle, 
  ThumbsUp,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

// --- DATA CONSTANTS ---

const PRODUCTS = [
  {
    id: 1,
    gender: 'female' as const,
    category: 'top' as const,
    brand: 'Anouk',
    title: 'Rustic Floral Printed V-Neck Straight Kurta',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    imageColor: '#FFCDD2',
    image: '/assets/woman-anouk-kurta.webp',
    sizes: ['S', 'M', 'L'],
    measurements: {
      'S': { bust: 35.5, length: 27 },
      'M': { bust: 37.5, length: 27.5 },
      'L': { bust: 40.0, length: 28 }
    }
  },
  {
    id: 2,
    gender: 'female' as const,
    category: 'bottom' as const,
    brand: 'H&M',
    title: 'Cotton Twill Trousers',
    price: 1299,
    originalPrice: 1499,
    discount: '15% OFF',
    imageColor: '#C5CAE9',
    image: '/assets/women-pants-formal.jpg',
    sizes: ['28', '30', '32', '34'],
    measurements: {
      '28': { waist: 28, inseam: 27 },
      '30': { waist: 30, inseam: 27 },
      '32': { waist: 32, inseam: 27 },
      '34': { waist: 34, inseam: 27 }
    }
  },
  {
    id: 3,
    gender: 'male' as const,
    category: 'top' as const,
    brand: 'Allen Solly',
    title: 'Slim Fit Casual Shirt',
    price: 649,
    originalPrice: 1299,
    discount: '50% OFF',
    imageColor: '#B2DFDB',
    image: '/assets/allen-mens-tshirt.webp',
    sizes: ['S', 'M', 'L'],
    measurements: {
      'S': { chest: 38, length: 26 },
      'M': { chest: 40, length: 27 },
      'L': { chest: 42, length: 28 }
    }
  },
  {
    id: 4,
    gender: 'male' as const,
    category: 'bottom' as const,
    brand: 'Levi\'s',
    title: '511 Slim Fit Jeans',
    price: 2199,
    originalPrice: 3299,
    discount: '33% OFF',
    imageColor: '#90CAF9',
    image: '/assets/levis-mens-jeans.webp',
    sizes: ['30', '32', '34', '36'],
    measurements: {
      '30': { waist: 30, inseam: 32 },
      '32': { waist: 32, inseam: 32 },
      '34': { waist: 34, inseam: 32 },
      '36': { waist: 36, inseam: 32 }
    }
  }
];

type Product = typeof PRODUCTS[number];
type Gender = 'male' | 'female';

interface Profile {
  name: string;
  heightLabel: string;
  heightInches: number;
  waist: number;
  gender: Gender;
  bust?: number;
  chest?: number;
}

// --- SILHOUETTES & VISUALIZER COMPONENTS ---

const BodySilhouette = ({ gender }: { gender: Gender }) => {
  if (gender === 'male') {
    return (
      <svg width={200} height={400} viewBox="0 0 200 400" className="fill-gray-200">
        <path d="M60,20 C80,20 120,20 140,20 C160,30 170,50 170,80 L160,180 L160,350 L140,350 L140,200 L60,200 L60,350 L40,350 L40,180 L30,80 C30,50 40,30 60,20 Z" />
        <circle cx="100" cy="20" r="18" className="fill-gray-300" />
      </svg>
    );
  } else {
    return (
      <svg width={200} height={400} viewBox="0 0 200 400" className="fill-gray-200">
        <path d="M70,25 C85,25 115,25 130,25 C145,35 150,55 145,80 C140,110 135,120 145,150 C155,170 155,190 150,230 L145,350 L125,350 L125,240 L75,240 L75,350 L55,350 L50,230 C45,190 45,170 55,150 C65,120 60,110 55,80 C50,55 55,35 70,25 Z" />
        <circle cx="100" cy="25" r="16" className="fill-gray-300" />
      </svg>
    );
  }
};

const GarmentOverlay = ({ 
  gender, 
  category, 
  fitFactor, 
  garmentLength, 
  userHeightInches 
}: { 
  gender: Gender; 
  category: 'top' | 'bottom'; 
  fitFactor: number; 
  garmentLength: number;
  userHeightInches: number;
}) => {
  const baseWidth = gender === 'male' ? 120 : 100;
  let scaleMultiplier = 1 + (fitFactor * 0.04); 
  if (scaleMultiplier < 0.95) scaleMultiplier = 0.95;
  
  const computedWidth = baseWidth * scaleMultiplier;
  const computedX = 100 - (computedWidth / 2);
  
  // The silhouette represents a body of ~350px height (from head to feet)
  // Scale garment length based on actual measurements relative to user height
  // SVG body height is ~350px (from y=20 head to y=370 feet)
  const svgBodyHeight = 350;
  
  // Calculate pixels per inch based on user's actual height
  const pixelsPerInch = svgBodyHeight / userHeightInches;
  
  // Calculate actual garment length in pixels based on real measurements
  const garmentLengthPx = garmentLength * pixelsPerInch;
  
  const startY = category === 'top' ? 40 : 190; // Adjusted start positions
  
  // Clamp garment length to reasonable display bounds
  const minLength = 30;
  const maxLength = category === 'top' ? 200 : 220;
  const computedLength = Math.max(minLength, Math.min(maxLength, garmentLengthPx));
  
  const color = category === 'top' ? '#EF5350' : '#42A5F5';
  const opacity = 0.65;

  if (category === 'top') {
    // Sleeve length scales with garment length
    const sleeveLength = Math.min(50, computedLength * 0.4);
    return (
      <svg width="200" height="400" viewBox="0 0 200 400" className="absolute top-0 left-0 pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
        <rect x={computedX} y={startY} width={computedWidth} height={computedLength} rx="10" fill={color} fillOpacity={opacity}/>
        <rect x={computedX - 15} y={startY + 10} width="20" height={sleeveLength} rx="5" fill={color} fillOpacity={opacity}/>
        <rect x={computedX + computedWidth - 5} y={startY + 10} width="20" height={sleeveLength} rx="5" fill={color} fillOpacity={opacity}/>
      </svg>
    );
  } else {
    return (
      <svg width="200" height="400" viewBox="0 0 200 400" className="absolute top-0 left-0 pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
        <rect x={computedX} y={startY} width={computedWidth} height={computedLength} rx="5" fill={color} fillOpacity={opacity}/>
        <rect x={100 - 2} y={startY + 60} width="4" height={Math.max(0, computedLength - 60)} fill="#ffffff" fillOpacity="0.5" />
      </svg>
    );
  }
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentView, setCurrentView] = useState<'listing' | 'detail'>('listing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  
  const [profiles, setProfiles] = useState<{ male: Profile | null; female: Profile | null }>({
    male: null,
    female: null
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    gender: '' as Gender | '',
    heightFt: '',
    heightIn: '',
    upperBody: '',
    waist: ''
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setCurrentView('detail');
    window.scrollTo(0,0);
  };

  const goBack = () => {
    setCurrentView('listing');
    setIsFitModalOpen(false);
    setIsOnboardingOpen(false);
  };

  const handleCheckFitClick = () => {
    if (!selectedProduct) return;
    const productGender = selectedProduct.gender;
    const existingProfile = profiles[productGender];

    if (existingProfile) {
      setIsFitModalOpen(true);
    } else {
      setOnboardingData({
        name: '',
        gender: productGender,
        heightFt: '',
        heightIn: '',
        upperBody: '',
        waist: ''
      });
      setOnboardingStep(0); 
      setIsOnboardingOpen(true);
    }
  };

  const finishOnboarding = () => {
    const heightInches = (parseInt(onboardingData.heightFt || '0') * 12) + parseInt(onboardingData.heightIn || '0');
    const genderKey = onboardingData.gender as Gender;
    
    const newProfile: Profile = {
      name: onboardingData.name || (genderKey === 'male' ? "Men's Fit" : "Women's Fit"),
      heightLabel: `${onboardingData.heightFt}'${onboardingData.heightIn}"`,
      heightInches: heightInches,
      waist: parseInt(onboardingData.waist),
      gender: genderKey,
      ...(genderKey === 'female' ? { bust: parseInt(onboardingData.upperBody) } : { chest: parseInt(onboardingData.upperBody) })
    };

    setProfiles(prev => ({
      ...prev,
      [genderKey]: newProfile
    }));
    
    setIsOnboardingOpen(false);
    setIsFitModalOpen(true);
  };

  const fitAnalysis = useMemo(() => {
    if (!selectedProduct || !selectedSize) return null;
    const profile = profiles[selectedProduct.gender];
    if (!profile) return null;

    const garmentData = (selectedProduct.measurements as unknown as Record<string, Record<string, number>>)[selectedSize];
    if (!garmentData) return null;
    let widthDiff = 0;
    let bodyPart = '';
    let garmentMeasurement = 0;
    let bodyMeasurement = 0;

    if (selectedProduct.category === 'top') {
      bodyPart = selectedProduct.gender === 'female' ? 'Bust' : 'Chest';
      bodyMeasurement = selectedProduct.gender === 'female' ? (profile.bust || 0) : (profile.chest || 0);
      garmentMeasurement = selectedProduct.gender === 'female' ? garmentData.bust : garmentData.chest;
    } else {
      bodyPart = 'Waist';
      bodyMeasurement = profile.waist;
      garmentMeasurement = garmentData.waist;
    }
    
    widthDiff = garmentMeasurement - bodyMeasurement;

    // Get garment length for display and analysis
    const garmentLength = garmentData.length || garmentData.inseam || 0;

    // Calculate expected garment length based on user's height
    // Baseline: 64" (5'4") female / 69" (5'9") male with standard garment lengths
    const baselineHeight = selectedProduct.gender === 'female' ? 64 : 69;
    const baselineTopLength = 27; // Standard top length for baseline height
    const baselineInseam = 30; // Standard inseam for baseline height
    
    // Calculate proportional expected length based on user height
    // For tops: torso scales roughly 0.3" per inch of height
    // For bottoms: legs scale roughly 0.45" per inch of height
    const heightDiff = profile.heightInches - baselineHeight;
    let expectedLength: number;
    let lengthScaleFactor: number;
    
    if (selectedProduct.category === 'top') {
      lengthScaleFactor = 0.3; // tops need ~0.3" more length per inch of height
      expectedLength = baselineTopLength + (heightDiff * lengthScaleFactor);
    } else {
      lengthScaleFactor = 0.45; // bottoms need ~0.45" more length per inch of height
      expectedLength = baselineInseam + (heightDiff * lengthScaleFactor);
    }
    
    // Calculate length difference (how short/long the garment is vs expected)
    const lengthDiff = garmentLength - expectedLength;
    
    // Determine length fit status
    let lengthStatus: 'perfect' | 'good' | 'short' | 'very_short' | 'long' | 'very_long' = 'perfect';
    let lengthNote = '';
    
    if (selectedProduct.category === 'top') {
      if (lengthDiff < -4) {
        lengthStatus = 'very_short';
        lengthNote = `This will be significantly short on you (~${Math.abs(Math.round(lengthDiff))}" shorter than ideal). Consider a longer style.`;
      } else if (lengthDiff < -2) {
        lengthStatus = 'short';
        lengthNote = `May run ${Math.abs(Math.round(lengthDiff))}" short on you. Could show midriff.`;
      } else if (lengthDiff > 4) {
        lengthStatus = 'very_long';
        lengthNote = `This will run ~${Math.round(lengthDiff)}" longer than typical for your height.`;
      } else if (lengthDiff > 2) {
        lengthStatus = 'long';
        lengthNote = `May run ${Math.round(lengthDiff)}" long on you.`;
      } else {
        lengthStatus = 'perfect';
        lengthNote = 'Good length for your height.';
      }
    } else {
      // Bottoms - inseam analysis
      if (lengthDiff < -4) {
        lengthStatus = 'very_short';
        lengthNote = `Inseam is ~${Math.abs(Math.round(lengthDiff))}" shorter than ideal for your height. Will look cropped.`;
      } else if (lengthDiff < -2) {
        lengthStatus = 'short';
        lengthNote = `Inseam may be ${Math.abs(Math.round(lengthDiff))}" short for your leg length.`;
      } else if (lengthDiff > 4) {
        lengthStatus = 'very_long';
        lengthNote = `Inseam is ~${Math.round(lengthDiff)}" longer than needed. May need hemming.`;
      } else if (lengthDiff > 2) {
        lengthStatus = 'long';
        lengthNote = `Inseam may be ${Math.round(lengthDiff)}" long for you.`;
      } else {
        lengthStatus = 'perfect';
        lengthNote = 'Good inseam length for your height.';
      }
    }

    // Width fit analysis
    let widthFitLabel = '';
    let widthRecommendationText = '';
    let widthFitStatus: 'perfect' | 'good' | 'okay' | 'poor' = 'okay';

    if (selectedProduct.category === 'top') {
      if (widthDiff < -2) {
        widthFitLabel = 'Too Tight';
        widthRecommendationText = 'This is significantly smaller than your measurements. We strongly recommend sizing up for comfort.';
        widthFitStatus = 'poor';
      } else if (widthDiff < 0) {
        widthFitLabel = 'Snug Fit';
        widthRecommendationText = 'This will fit close to your body with minimal ease. Great if you prefer a body-hugging look.';
        widthFitStatus = 'okay';
      } else if (widthDiff <= 1) {
        widthFitLabel = 'Perfect Width';
        widthRecommendationText = 'Width is ideal! This size offers just the right amount of ease for all-day comfort.';
        widthFitStatus = 'perfect';
      } else if (widthDiff <= 2.5) {
        widthFitLabel = 'Comfort Fit';
        widthRecommendationText = 'Slightly relaxed with room to breathe. Perfect for a casual, easy-going style.';
        widthFitStatus = 'good';
      } else if (widthDiff <= 4) {
        widthFitLabel = 'Relaxed Fit';
        widthRecommendationText = 'Roomy and comfortable. Consider sizing down if you prefer a more fitted silhouette.';
        widthFitStatus = 'okay';
      } else {
        widthFitLabel = 'Oversized';
        widthRecommendationText = 'This will be quite loose on you. Size down unless you want an oversized look.';
        widthFitStatus = 'poor';
      }
    } else {
      // Bottoms - waist measurements
      if (widthDiff < -2) {
        widthFitLabel = 'Too Tight';
        widthRecommendationText = 'The waist will be uncomfortably tight. Please size up for a better fit.';
        widthFitStatus = 'poor';
      } else if (widthDiff < -0.5) {
        widthFitLabel = 'Snug Fit';
        widthRecommendationText = 'The waist will sit close with minimal room. Good for a fitted, streamlined look.';
        widthFitStatus = 'okay';
      } else if (widthDiff <= 1) {
        widthFitLabel = 'Perfect Width';
        widthRecommendationText = 'The waist measurement is spot on. Comfortable without being too tight or loose.';
        widthFitStatus = 'perfect';
      } else if (widthDiff <= 2) {
        widthFitLabel = 'Comfort Fit';
        widthRecommendationText = 'Slightly relaxed at the waist. Comfortable for all-day wear.';
        widthFitStatus = 'good';
      } else {
        widthFitLabel = 'Loose Fit';
        widthRecommendationText = 'The waist will be loose. You may need a belt or consider sizing down.';
        widthFitStatus = 'poor';
      }
    }

    // Combined fit analysis - both width AND length must be good for overall "Perfect Fit"
    let fitLabel = '';
    let fitStatus: 'perfect' | 'good' | 'okay' | 'poor' = 'okay';
    let recommendationText = widthRecommendationText;
    
    const isLengthProblematic = lengthStatus === 'very_short' || lengthStatus === 'very_long';
    const isLengthNotIdeal = lengthStatus === 'short' || lengthStatus === 'long';
    
    // Determine overall fit combining width and length
    if (widthFitStatus === 'perfect' && lengthStatus === 'perfect') {
      fitLabel = 'Perfect Fit';
      fitStatus = 'perfect';
    } else if (widthFitStatus === 'perfect' && isLengthNotIdeal) {
      fitLabel = 'Good Width, Length Issue';
      fitStatus = 'okay';
    } else if (widthFitStatus === 'perfect' && isLengthProblematic) {
      fitLabel = 'Too Short/Long';
      fitStatus = 'poor';
      recommendationText = lengthNote;
    } else if ((widthFitStatus === 'good' || widthFitStatus === 'perfect') && !isLengthProblematic) {
      fitLabel = widthFitLabel;
      fitStatus = isLengthNotIdeal ? 'okay' : widthFitStatus;
    } else if (widthFitStatus === 'poor' || isLengthProblematic) {
      fitLabel = widthFitStatus === 'poor' ? widthFitLabel : 'Length Issue';
      fitStatus = 'poor';
    } else {
      fitLabel = widthFitLabel;
      fitStatus = widthFitStatus;
    }

    const isGood = fitStatus === 'perfect' || fitStatus === 'good';

    return { 
      fitLabel, 
      recommendationText, 
      isGood,
      fitStatus,
      diff: widthDiff,
      widthDiff,
      lengthDiff,
      lengthNote, 
      lengthStatus,
      expectedLength,
      heightDiff,
      bodyPart,
      garmentMeasurement,
      bodyMeasurement,
      garmentLength
    };
  }, [selectedProduct, selectedSize, profiles]);

  const Header = () => (
    <header className="sticky top-0 z-50 bg-white shadow-sm h-20 flex items-center px-4 md:px-12 justify-between">
      <div className="flex items-center gap-12">
        <div onClick={goBack} className="cursor-pointer">
          <div className="flex items-center gap-1 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-400 via-red-500 to-pink-600 flex items-center justify-center text-white text-xs">M</div>
            <span className="text-gray-800">Myntra</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 font-bold text-sm text-gray-700 uppercase">
          <span className="hover:text-pink-600 cursor-pointer">Men</span>
          <span className="hover:text-pink-600 cursor-pointer">Women</span>
          <span className="hover:text-pink-600 cursor-pointer">Kids</span>
          <span className="hover:text-pink-600 cursor-pointer">Home & Living</span>
          <span className="hover:text-pink-600 cursor-pointer">Beauty</span>
        </nav>
      </div>
      <div className="flex gap-6 items-center">
        <div className="hidden md:flex items-center bg-gray-100 rounded px-3 py-2 text-gray-500 gap-2 mr-4">
          <Search className="w-4 h-4" />
          <input type="text" placeholder="Search for products" className="bg-transparent border-none outline-none text-xs w-64" />
        </div>
        <div className="flex flex-col items-center cursor-pointer group">
          <User className="w-5 h-5 text-gray-700 group-hover:text-black" />
          <span className="text-[10px] font-semibold text-gray-700 mt-1">Profile</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer group">
          <Heart className="w-5 h-5 text-gray-700 group-hover:text-black" />
          <span className="text-[10px] font-semibold text-gray-700 mt-1">Wishlist</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer group">
          <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-black" />
          <span className="text-[10px] font-semibold text-gray-700 mt-1">Bag</span>
        </div>
      </div>
    </header>
  );

  const OnboardingModal = () => {
    if (!isOnboardingOpen) return null;
    const updateData = (field: string, value: string) => setOnboardingData(prev => ({ ...prev, [field]: value }));
    const canProceed = () => {
      if (onboardingStep === 0) return true;
      if (onboardingStep === 1) return !!onboardingData.heightFt && !!onboardingData.heightIn;
      if (onboardingStep === 2) return !!onboardingData.upperBody;
      if (onboardingStep === 3) return !!onboardingData.waist;
      return false;
    };
    const nextStep = () => onboardingStep < 3 ? setOnboardingStep(prev => prev + 1) : finishOnboarding();
    const prevStep = () => onboardingStep > 0 && setOnboardingStep(prev => prev - 1);

    const label = onboardingData.gender === 'female' ? 'Bust' : 'Chest';

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm"></div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative z-10 flex flex-col overflow-hidden h-[500px] border border-gray-100">
          <div className="h-2 bg-gray-100 w-full">
            <div className="h-full bg-[#ff3f6c] transition-all duration-300" style={{width: `${(onboardingStep + 1) * 25}%`}}></div>
          </div>
          <button onClick={() => setIsOnboardingOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-6 h-6" /></button>
          <div className="flex-1 p-8 flex flex-col justify-center">
            {onboardingStep === 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-2">Create {onboardingData.gender === 'male' ? 'Men\'s' : 'Women\'s'} Profile</h3>
                <p className="text-gray-500 mb-6">How should we label this profile?</p>
                <input type="text" placeholder="e.g. My Profile" value={onboardingData.name} onChange={(e) => updateData('name', e.target.value)} className="w-full text-2xl border-b-2 border-gray-300 focus:border-black outline-none py-2 bg-transparent" autoFocus />
              </div>
            )}
            {onboardingStep === 1 && (
              <div>
                <h3 className="text-2xl font-bold mb-2">How tall are you?</h3>
                <div className="flex gap-4">
                  <div className="flex-1"><input type="number" placeholder="5" value={onboardingData.heightFt} onChange={(e) => updateData('heightFt', e.target.value)} className="w-full text-center text-4xl font-bold border-b-2 outline-none py-2 bg-transparent" autoFocus /><label className="block text-center text-xs font-bold text-gray-400 mt-2">Feet</label></div>
                  <div className="flex-1"><input type="number" placeholder="8" value={onboardingData.heightIn} onChange={(e) => updateData('heightIn', e.target.value)} className="w-full text-center text-4xl font-bold border-b-2 outline-none py-2 bg-transparent" /><label className="block text-center text-xs font-bold text-gray-400 mt-2">Inches</label></div>
                </div>
              </div>
            )}
            {onboardingStep === 2 && (
              <div>
                <h3 className="text-2xl font-bold mb-2">Your {label} size?</h3>
                <div className="flex justify-center"><div className="w-1/2"><input type="number" placeholder="36" value={onboardingData.upperBody} onChange={(e) => updateData('upperBody', e.target.value)} className="w-full text-center text-4xl font-bold border-b-2 outline-none py-2 bg-transparent" autoFocus /><label className="block text-center text-xs font-bold text-gray-400 mt-2">Inches</label></div></div>
              </div>
            )}
            {onboardingStep === 3 && (
              <div>
                <h3 className="text-2xl font-bold mb-2">Your waist size?</h3>
                <div className="flex justify-center"><div className="w-1/2"><input type="number" placeholder="30" value={onboardingData.waist} onChange={(e) => updateData('waist', e.target.value)} className="w-full text-center text-4xl font-bold border-b-2 outline-none py-2 bg-transparent" autoFocus /><label className="block text-center text-xs font-bold text-gray-400 mt-2">Inches</label></div></div>
              </div>
            )}
          </div>
          <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            {onboardingStep > 0 ? <button onClick={prevStep} className="font-bold text-gray-500 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button> : <div></div>}
            <button onClick={nextStep} disabled={!canProceed()} className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${canProceed() ? 'bg-[#ff3f6c] text-white shadow-lg transform active:scale-95' : 'bg-gray-200 text-gray-400'}`}>
              {onboardingStep === 3 ? 'Complete' : 'Next'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProductListing = () => (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-xl font-bold mb-6 uppercase tracking-widest text-gray-800">Shop All</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {PRODUCTS.map(product => (
          <div key={product.id} onClick={() => handleProductClick(product)} className="group cursor-pointer">
            <div className="aspect-[3/4] bg-gray-100 relative mb-3 overflow-hidden rounded-sm">
              <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{backgroundColor: product.imageColor + '33'}}>
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
              {product.discount && (
                <div className="absolute bottom-2 left-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {product.discount}
                </div>
              )}
            </div>
            <h3 className="font-bold text-sm text-gray-900">{product.brand}</h3>
            <p className="text-gray-500 text-xs truncate mb-1 font-normal">{product.title}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-gray-900">₹{product.price}</span>
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-12">
        <div className="flex-1 aspect-[3/4] bg-gray-50 flex items-center justify-center rounded border border-gray-100 overflow-hidden" style={{backgroundColor: selectedProduct.imageColor + '10'}}>
          <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{selectedProduct.brand}</h1>
          <p className="text-xl text-gray-500 mb-6 font-light">{selectedProduct.title}</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-bold text-gray-900">₹{selectedProduct.price}</span>
            <span className="text-xl text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
            <span className="text-orange-500 font-bold text-lg">{selectedProduct.discount}</span>
          </div>
          
          <div className="mb-8">
            <span className="font-bold text-sm uppercase block mb-3 text-gray-800">Select Size</span>
            <div className="flex gap-3">
              {selectedProduct.sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'border-[#ff3f6c] text-[#ff3f6c] ring-1 ring-[#ff3f6c]' : 'border-gray-300 hover:border-gray-800'}`}>{size}</button>
              ))}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between mb-8 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 flex items-center gap-2"><Ruler className="w-5 h-5 text-[#ff3f6c]" /> Find your perfect fit</h4>
              <p className="text-xs text-gray-500 mt-1">Personalized recommendation based on your measurements.</p>
            </div>
            <button onClick={handleCheckFitClick} className="bg-black text-white px-5 py-2.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform active:scale-95">
              {profiles[selectedProduct.gender] ? 'CHECK MY FIT' : 'CREATE PROFILE'} <Wand2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-[#ff3f6c] text-white font-bold py-4 rounded text-sm uppercase tracking-wider hover:shadow-lg transition-all">Add to Bag</button>
            <button className="flex-1 border border-gray-300 font-bold py-4 rounded text-sm uppercase tracking-wider hover:border-black transition-all flex items-center justify-center gap-2"><Heart className="w-4 h-4" /> Wishlist</button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Free delivery</div>
            <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4" /> 30 days return</div>
          </div>
        </div>
      </div>
    );
  };

  const FitModal = () => {
    const productGender = selectedProduct?.gender;
    const profile = productGender ? profiles[productGender] : null;
    if (!isFitModalOpen || !profile || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFitModalOpen(false)}></div>
        <div className="bg-white w-full max-w-4xl h-[90vh] md:h-[600px] rounded-lg shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col border-r border-gray-200">
            <h3 className="text-xl font-black italic tracking-tighter mb-6">FIT ANALYSIS <span className="bg-[#ff3f6c] text-white text-[10px] px-1 py-0.5 rounded not-italic font-sans">BETA</span></h3>
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Active Profile</label>
              <div className="p-4 rounded-md border bg-white border-[#ff3f6c] shadow-sm relative">
                <div className="font-bold text-sm mb-2 text-gray-800">{profile.name}</div>
                <div className="text-[11px] text-gray-500 grid grid-cols-2 gap-y-2">
                  <span>HT: {profile.heightLabel}</span>
                  <span>WAIST: {profile.waist}"</span>
                  <span className="col-span-2 uppercase">{productGender === 'female' ? 'Bust' : 'Chest'}: {profile.bust || profile.chest}"</span>
                </div>
                <button onClick={() => { setIsFitModalOpen(false); setIsOnboardingOpen(true); }} className="text-[10px] font-bold text-[#ff3f6c] mt-4 underline hover:text-pink-700">RE-TAKE MEASUREMENTS</button>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Switch Size</label>
              <div className="flex gap-2">
                {selectedProduct.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-2 rounded border text-xs font-bold transition-colors ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:border-black'}`}>{size}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsFitModalOpen(false)} className="mt-auto w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded text-sm transition-colors">CLOSE</button>
          </div>
          <div className="w-full md:w-1/3 bg-white p-6 flex flex-col items-center justify-center relative border-r">
            <div className="text-[10px] font-bold text-gray-300 absolute top-4 left-4 uppercase tracking-widest">Body Silhouette</div>
            <div className="relative w-[180px] h-[360px]">
              <BodySilhouette gender={productGender!} />
              {fitAnalysis && (
                <GarmentOverlay 
                  gender={productGender!} 
                  category={selectedProduct.category} 
                  fitFactor={fitAnalysis.diff} 
                  garmentLength={fitAnalysis.garmentLength}
                  userHeightInches={profile.heightInches}
                />
              )}
            </div>
            <div className="absolute bottom-4 text-[10px] text-gray-400 font-medium">Visual representation based on your measurements</div>
          </div>
          <div className="w-full md:w-1/3 bg-gray-900 text-white p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3f6c] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
            <h4 className="text-[#ff3f6c] font-bold text-sm uppercase mb-4 relative z-10">Results</h4>
            {fitAnalysis && (
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-6">{fitAnalysis.fitLabel}</div>
                <div className="space-y-4 text-sm text-gray-400 mb-6">
                  <p><strong className="text-white block mb-1">Width Analysis</strong> {fitAnalysis.recommendationText}</p>
                  <p><strong className="text-white block mb-1">Length Analysis</strong> {fitAnalysis.lengthNote}</p>
                </div>
                {/* Garment measurements - subtle comparison */}
                <div className="mb-6 py-3 px-4 bg-white/5 rounded border border-white/10">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Size {selectedSize} Measurements</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{fitAnalysis.bodyPart}</span>
                    <span className="text-white font-medium">{fitAnalysis.garmentMeasurement}"</span>
                  </div>
                  {fitAnalysis.garmentLength > 0 && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">{selectedProduct.category === 'top' ? 'Length' : 'Inseam'}</span>
                      <span className="text-white font-medium">{fitAnalysis.garmentLength}"</span>
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded border flex items-center gap-3 ${
                  fitAnalysis.fitStatus === 'perfect' ? 'bg-green-900/30 border-green-800' :
                  fitAnalysis.fitStatus === 'good' ? 'bg-emerald-900/20 border-emerald-800' :
                  fitAnalysis.fitStatus === 'okay' ? 'bg-yellow-900/20 border-yellow-700' :
                  'bg-orange-900/30 border-orange-800'
                }`}>
                  {fitAnalysis.fitStatus === 'perfect' ? <ThumbsUp className="text-green-500 w-5 h-5" /> :
                   fitAnalysis.fitStatus === 'good' ? <ThumbsUp className="text-emerald-400 w-5 h-5" /> :
                   <AlertCircle className={fitAnalysis.fitStatus === 'okay' ? 'text-yellow-500 w-5 h-5' : 'text-orange-500 w-5 h-5'} />}
                  <span className="font-bold text-sm">
                    {fitAnalysis.fitStatus === 'perfect' ? 'Highly recommended' :
                     fitAnalysis.fitStatus === 'good' ? 'Recommended for you' :
                     fitAnalysis.fitStatus === 'okay' ? 'May work for you' :
                     'Consider a different size'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white selection:bg-pink-100 pb-12">
      <Header />
      {currentView === 'listing' ? <ProductListing /> : <ProductDetail />}
      <FitModal />
      <OnboardingModal />
    </div>
  );
}

