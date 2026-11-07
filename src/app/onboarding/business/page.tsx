'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Truck,
  ShoppingCart,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileCheck2,
  ChevronRight,
} from 'lucide-react';
import { PublicNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { validateGstin, validatePan } from '@/lib/business/validators';

interface AuthorizedContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  authorizedSignatory: boolean;
}

const ENTITY_TYPES = [
  { value: 'PRIVATE_LIMITED', label: 'Private Limited Company (Pvt Ltd)' },
  { value: 'LIMITED_LIABILITY_PARTNERSHIP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'PARTNERSHIP', label: 'Partnership Firm' },
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited Company (Ltd)' },
  { value: 'INDIVIDUAL', label: 'Individual / Proprietor' },
];

const PROCUREMENT_CATEGORIES = [
  'Structural Steel & TMT Rebars',
  'Cement & Ready Mix Concrete (RMC)',
  'Aggregates, Sand & Stone Spalls',
  'AAC Blocks, Bricks & Masonry',
  'Plumbing, Drainage & CPVC Pipes',
  'Electrical Cabling, Switchgears & DBs',
  'Paints, Waterproofing & Construction Chemicals',
  'Vitrified Tiles, Granite & Pavers',
  'Doors, Windows & Architectural Hardware',
  'Heavy Earthmoving & Construction Equipment',
];

const SUPPLIER_TYPES = [
  'Authorized Distributor / C&F Agent',
  'Manufacturer / Primary Producer',
  'Authorized Stockist / Dealer',
  'Wholesaler / Large Scale Trader',
  'Direct Importer',
];

const GUJARAT_DISTRICTS = [
  'Ahmedabad',
  'Gandhinagar',
  'Vadodara',
  'Surat',
  'Rajkot',
  'Bhavnagar',
  'Jamnagar',
  'Bharuch',
  'Kutch',
  'Mehsana',
  'Anand',
  'Valsad',
  'PAN-Gujarat',
  'PAN-India',
];

export default function BusinessOnboardingWizardPage() {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Identity
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [entityType, setEntityType] = useState('PRIVATE_LIMITED');
  const [yearEstablished, setYearEstablished] = useState<number>(2018);
  const [shortDescription, setShortDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [district, setDistrict] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  const [postalCode, setPostalCode] = useState('380015');

  // Step 2: Legal & Tax
  const [gstNumber, setGstNumber] = useState('');
  const [gstValidationState, setGstValidationState] = useState<{ valid: boolean; stateName?: string; error?: string } | null>(null);
  const [pan, setPan] = useState('');
  const [panValidationState, setPanValidationState] = useState<{ valid: boolean; entityChar?: string; error?: string } | null>(null);
  const [cin, setCin] = useState('');
  const [llpin, setLlpin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');

  // Step 3: Authorized Contacts
  const [contacts, setContacts] = useState<AuthorizedContact[]>([
    {
      name: '',
      designation: 'Director / Partner',
      email: '',
      phone: '',
      isPrimary: true,
      authorizedSignatory: true,
    },
  ]);

  // Step 4: Role Selection
  const [platformRole, setPlatformRole] = useState<'BUYER' | 'SUPPLIER' | 'BOTH'>('BUYER');

  // Step 5: Role-Specific Onboarding
  // Buyer specifics
  const [industrySegment, setIndustrySegment] = useState('Civil contractor');
  const [selectedBuyerCategories, setSelectedBuyerCategories] = useState<string[]>([
    'Structural Steel & TMT Rebars',
    'Cement & Ready Mix Concrete (RMC)',
  ]);
  const [annualBudget, setAnnualBudget] = useState('₹5 Crore – ₹25 Crore');
  const [siteName, setSiteName] = useState('Gift City Commercial Tower Phase 2');
  const [siteAddress, setSiteAddress] = useState('Block 12, GIFT SEZ, Gandhinagar');

  // Supplier specifics
  const [supplierType, setSupplierType] = useState('Authorized Distributor / C&F Agent');
  const [selectedSupplierCategories, setSelectedSupplierCategories] = useState<string[]>([
    'Structural Steel & TMT Rebars',
    'Cement & Ready Mix Concrete (RMC)',
  ]);
  const [brandsOffered, setBrandsOffered] = useState('UltraTech, Ambuja, Tata Tiscon, Jindal Panther');
  const [monthlyCapacity, setMonthlyCapacity] = useState('5,000 MT / Month');
  const [warehouseLocation, setWarehouseLocation] = useState('Changodar Industrial Estate, Ahmedabad');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['Ahmedabad', 'Gandhinagar', 'Sanand GIDC']);

  // Step 6: Documents
  const [documents, setDocuments] = useState<Array<{
    id: string;
    documentType: string;
    fileName: string;
    status: string;
  }>>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Load existing draft if available
  useEffect(() => {
    async function loadDraft() {
      // Check query parameter for initial role
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        const roleP = sp.get('role');
        if (roleP) {
          const u = roleP.toUpperCase();
          if (u === 'SUPPLIER' || u === 'BOTH' || u === 'BUYER') {
            setPlatformRole(u as 'BUYER' | 'SUPPLIER' | 'BOTH');
          }
        }
      }

      try {
        const res = await fetch('/api/business/register-wizard');
        if (res.status === 401) {
          // If not logged in, redirect to sign-up with preserved callback
          const redirectDest =
            typeof window !== 'undefined'
              ? `/sign-up?callbackUrl=${encodeURIComponent(
                  window.location.pathname + window.location.search,
                )}`
              : '/sign-up?callbackUrl=/onboarding/business';
          router.push(redirectDest);
          return;
        }
        const json = await res.json();
        if (json.success && json.data?.business) {
          const b = json.data.business;
          setBusinessId(b.id);
          if (b.name) setName(b.name);
          if (b.legalName) setLegalName(b.legalName);
          if (b.entityType) setEntityType(b.entityType);
          if (b.yearEstablished) setYearEstablished(b.yearEstablished);
          if (b.shortDescription) setShortDescription(b.shortDescription);
          if (b.website) setWebsite(b.website);
          if (b.addressLine1) setAddressLine1(b.addressLine1);
          if (b.city) setCity(b.city);
          if (b.state) setStateName(b.state);
          if (b.postalCode) setPostalCode(b.postalCode);
          if (b.gstNumber) setGstNumber(b.gstNumber);
          if (b.pan) setPan(b.pan);
          if (b.cin) setCin(b.cin);
          if (b.llpin) setLlpin(b.llpin);
          if (b.udyamNumber) setUdyamNumber(b.udyamNumber);
          if (b.platformRole) setPlatformRole(b.platformRole);
          if (b.authorizedContacts && Array.isArray(b.authorizedContacts) && b.authorizedContacts.length > 0) {
            setContacts(b.authorizedContacts);
          }
          if (b.documents && Array.isArray(b.documents)) {
            setDocuments(b.documents);
          }
          if (b.onboardingStep && b.onboardingStep > 1 && b.onboardingStep <= 6) {
            setCurrentStep(b.onboardingStep);
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding draft:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadDraft();
  }, [router]);

  // Live GSTIN validator
  const handleGstinChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setGstNumber(clean);
    if (clean.length === 15) {
      const result = validateGstin(clean);
      setGstValidationState(result);
      if (result.valid && !pan) {
        const autoPan = clean.substring(2, 12);
        setPan(autoPan);
        setPanValidationState(validatePan(autoPan));
      }
    } else {
      setGstValidationState(null);
    }
  };

  // Live PAN validator
  const handlePanChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setPan(clean);
    if (clean.length === 10) {
      setPanValidationState(validatePan(clean));
    } else {
      setPanValidationState(null);
    }
  };

  // Contact management
  const updateContact = (index: number, field: keyof AuthorizedContact, value: any) => {
    setContacts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      {
        name: '',
        designation: 'Procurement / Commercial Lead',
        email: '',
        phone: '',
        isPrimary: false,
        authorizedSignatory: false,
      },
    ]);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return;
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 1 Submission
  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          businessId,
          data: {
            name: name || legalName,
            legalName,
            entityType,
            yearEstablished: Number(yearEstablished),
            shortDescription,
            website,
            registeredOffice: {
              addressLine1,
              city,
              district,
              state: stateName,
              postalCode,
              country: 'India',
            },
          },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save identity');
      setBusinessId(json.data.id);
      setCurrentStep(2);
      setSuccessMessage('Business identity saved.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 2 Submission
  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          businessId,
          data: {
            gstNumber,
            pan,
            cin: cin || undefined,
            llpin: llpin || undefined,
            udyamNumber: udyamNumber || undefined,
          },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save tax information');
      setCurrentStep(3);
      setSuccessMessage('Legal and tax information verified.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 3 Submission
  const submitStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          businessId,
          data: { contacts },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save contacts');
      setCurrentStep(4);
      setSuccessMessage('Authorized business contacts saved.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 4 Submission
  const submitStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 4,
          businessId,
          data: { platformRole },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to set platform role');
      setCurrentStep(5);
      setSuccessMessage(`Platform role set to ${platformRole}.`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 5 Submission
  const submitStep5 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const payload: any = { step: 5, businessId, data: { role: platformRole } };
      if (platformRole === 'BUYER' || platformRole === 'BOTH') {
        payload.data.buyer = {
          industrySegment,
          procurementCategories: selectedBuyerCategories,
          annualBudget,
          projectLocations: [
            {
              name: siteName,
              address: siteAddress,
              district: city,
              state: stateName,
              pincode: postalCode,
              active: true,
            },
          ],
        };
      }
      if (platformRole === 'SUPPLIER' || platformRole === 'BOTH') {
        payload.data.supplier = {
          supplierType,
          operatingCategories: selectedSupplierCategories,
          brandsOffered: brandsOffered.split(',').map((b) => b.trim()).filter(Boolean),
          monthlySupplyCapacity: monthlyCapacity,
          serviceableDistricts: selectedDistricts,
          serviceableStates: [stateName],
          standardLeadTimeDays: 3,
          warehouseLocations: [
            {
              name: 'Primary Yard',
              address: warehouseLocation,
              district: city,
              state: stateName,
              pincode: postalCode,
            },
          ],
        };
      }

      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save role requirements');
      setCurrentStep(6);
      setSuccessMessage('Operational specifications recorded.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Step 6: Mock Document Upload Handler
  const handleDocumentUpload = async (docType: string) => {
    if (!businessId) return;
    setUploadingDoc(true);
    setErrorMessage(null);
    try {
      const fileName = `${legalName || name}_${docType}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
      const res = await fetch('/api/business/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          documentType: docType,
          documentNumber: docType === 'GST_CERTIFICATE' ? gstNumber : docType === 'PAN_DOCUMENT' ? pan : undefined,
          fileName,
          fileUrl: `/uploads/documents/${fileName}`,
          fileSizeBytes: 2450000,
          mimeType: 'application/pdf',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to upload document');
      setDocuments((prev) => [json.data, ...prev]);
      setSuccessMessage(`Document "${fileName}" attached successfully.`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Final Profile Verification Submission
  const submitFinalVerification = async () => {
    if (!businessId) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/business/register-wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'submit',
          businessId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to submit profile');

      // Navigate to destination dashboard based on chosen role
      const dest = platformRole === 'SUPPLIER' ? '/supplier/dashboard' : '/buyer/dashboard';
      router.push(`${dest}?onboardingComplete=true`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const stepsList = [
    { number: 1, title: 'Business Identity', icon: Building2 },
    { number: 2, title: 'Legal & Tax', icon: FileText },
    { number: 3, title: 'Authorized Contacts', icon: Users },
    { number: 4, title: 'Platform Role', icon: Layers },
    { number: 5, title: 'Operational Setup', icon: Sparkles },
    { number: 6, title: 'Verification Docs', icon: ShieldCheck },
  ];

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C66A42] border-t-transparent animate-spin rounded-full" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#A8ADB7]">
            Loading PROVENTA Business Onboarding...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans flex flex-col">
      <PublicNav />

      {/* Header Banner */}
      <div className="border-b border-[#414957] bg-[#191B20] py-6 sm:py-8 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#536B88] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-[#C66A42] rounded-full" />
              <span>ENTERPRISE REGISTRATION & VERIFICATION</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#FFFFFF] mt-1 font-heading">
              PROVENTA Industrial Business Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-[#A8ADB7] mt-1">
              Complete your certified enterprise profile to access Gujarat&apos;s direct construction procurement network.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#252B38] px-3.5 py-1.5 border border-[#414957] rounded-sm">
            <span className="font-mono text-xs text-[#A8ADB7]">Step {currentStep} of 6</span>
            <span className="text-[#414957]">|</span>
            <span className="font-mono text-xs text-[#C66A42] font-bold uppercase">
              {stepsList[currentStep - 1]?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 py-8 sm:py-12">
        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-8">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => isCompleted && setCurrentStep(s.number)}
                disabled={!isCompleted && !isCurrent}
                className={`flex items-center gap-2.5 p-3 rounded-sm text-left transition-all border ${
                  isCurrent
                    ? 'bg-[#303746] border-[#C66A42] text-[#FFFFFF]'
                    : isCompleted
                    ? 'bg-[#252B38] border-[#414957] text-[#A8ADB7] hover:border-[#536B88]'
                    : 'bg-[#191B20]/60 border-[#414957]/50 text-[#6B7280] cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-[#536B88] text-[#FFFFFF]'
                      : isCurrent
                      ? 'bg-[#C66A42] text-[#FFFFFF]'
                      : 'bg-[#292F3D] text-[#6B7280]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8ADB7]">
                    Step {s.number}
                  </div>
                  <div className="text-xs font-bold truncate">{s.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Notifications / Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/60 rounded-sm text-xs sm:text-sm text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider">Validation Error</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-sm text-xs sm:text-sm text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider">Success</div>
              <div>{successMessage}</div>
            </div>
          </div>
        )}

        {/* STEP 1: BUSINESS IDENTITY */}
        {currentStep === 1 && (
          <form onSubmit={submitStep1} className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C66A42]" />
                Step 1: Business Identity & Legal Establishment
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Provide your certified legal entity information as registered with the Ministry of Corporate Affairs or local registrar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Legal Entity Name (As per MCA / GST) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Ram Infratech Private Limited"
                  value={legalName}
                  onChange={(e) => {
                    setLegalName(e.target.value);
                    if (!name) setName(e.target.value);
                  }}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Trade / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ram Steel & Cement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Business Entity Type *
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                >
                  {ENTITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Year of Establishment *
                </label>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={yearEstablished}
                  onChange={(e) => setYearEstablished(parseInt(e.target.value, 10) || 2020)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Registered Office Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot / Survey No., Industrial Estate, Street Address"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict(e.target.value);
                  }}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  PIN Code (6 digits) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Company Website / Corporate URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.exampleinfra.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#414957]">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{saving ? 'Saving...' : 'Save & Continue to Step 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LEGAL & TAX INFORMATION */}
        {currentStep === 2 && (
          <form onSubmit={submitStep2} className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C66A42]" />
                Step 2: Legal & Tax Verification Identifiers
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Enter your valid Indian tax registration numbers. Real-time verification ensures seamless GST e-invoicing and compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Goods & Services Tax Identification Number (GSTIN) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="24AAACG1928K1Z5"
                    value={gstNumber}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono uppercase tracking-wider"
                  />
                  {gstValidationState && (
                    <div className="absolute right-3 top-2.5">
                      {gstValidationState.valid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {gstValidationState && (
                  <p className={`text-xs mt-1.5 font-mono ${gstValidationState.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gstValidationState.valid ? `✓ Valid GSTIN — Registered State: ${gstValidationState.stateName}` : gstValidationState.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Permanent Account Number (PAN) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="AAACG1928K"
                    value={pan}
                    onChange={(e) => handlePanChange(e.target.value)}
                    className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono uppercase tracking-wider"
                  />
                  {panValidationState && (
                    <div className="absolute right-3 top-2.5">
                      {panValidationState.valid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {panValidationState && (
                  <p className={`text-xs mt-1.5 font-mono ${panValidationState.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {panValidationState.valid ? `✓ Valid PAN (Entity identifier: ${panValidationState.entityChar})` : panValidationState.error}
                  </p>
                )}
              </div>

              {entityType === 'PRIVATE_LIMITED' || entityType === 'PUBLIC_LIMITED' ? (
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                    Corporate Identification Number (CIN)
                  </label>
                  <input
                    type="text"
                    maxLength={21}
                    placeholder="U45200GJ2018PTC104521"
                    value={cin}
                    onChange={(e) => setCin(e.target.value.toUpperCase())}
                    className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono uppercase"
                  />
                </div>
              ) : entityType === 'LIMITED_LIABILITY_PARTNERSHIP' ? (
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                    LLP Identification Number (LLPIN)
                  </label>
                  <input
                    type="text"
                    placeholder="AAB-1234"
                    value={llpin}
                    onChange={(e) => setLlpin(e.target.value.toUpperCase())}
                    className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono uppercase"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-mono uppercase text-[#A8ADB7] mb-1.5 font-bold">
                  Udyam Registration Number (MSME, Optional)
                </label>
                <input
                  type="text"
                  placeholder="UDYAM-GJ-01-0012345"
                  value={udyamNumber}
                  onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                  className="w-full bg-[#252B38] border border-[#414957] px-3.5 py-2.5 text-sm text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#414957]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs uppercase font-mono rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{saving ? 'Verifying...' : 'Save & Continue to Step 3'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: AUTHORIZED CONTACTS */}
        {currentStep === 3 && (
          <form onSubmit={submitStep3} className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C66A42]" />
                  Step 3: Authorized Business Contacts & Signatories
                </h2>
                <p className="text-xs text-[#A8ADB7] mt-1">
                  Designate authorized officers for procurement approval, PO execution, and billing coordination.
                </p>
              </div>
              <button
                type="button"
                onClick={addContact}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252B38] border border-[#414957] hover:border-[#536B88] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors self-start sm:self-auto"
              >
                <span>+ Add Another Contact</span>
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div key={idx} className="bg-[#252B38] border border-[#414957] p-4 sm:p-5 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#414957]/60 pb-2">
                    <span className="font-mono text-xs text-[#536B88] font-bold uppercase">
                      Contact #{idx + 1} {contact.isPrimary && '— Primary Officer'}
                    </span>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        className="text-xs text-red-400 hover:text-red-300 font-mono"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kiritbhai Patel"
                        value={contact.name}
                        onChange={(e) => updateContact(idx, 'name', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                        Designation / Role *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Director / Procurement Head"
                        value={contact.designation}
                        onChange={(e) => updateContact(idx, 'designation', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                        Official Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="kirit@company.in"
                        value={contact.email}
                        onChange={(e) => updateContact(idx, 'email', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                        Direct Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98250 14829"
                        value={contact.phone}
                        onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                        className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-[#A8ADB7] pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.isPrimary}
                        onChange={(e) => updateContact(idx, 'isPrimary', e.target.checked)}
                        className="rounded border-[#414957] bg-[#191B20] text-[#C66A42] focus:ring-0"
                      />
                      <span>Primary Point of Contact</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.authorizedSignatory}
                        onChange={(e) => updateContact(idx, 'authorizedSignatory', e.target.checked)}
                        className="rounded border-[#414957] bg-[#191B20] text-[#C66A42] focus:ring-0"
                      />
                      <span>Authorized Signatory for POs & Contracts</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#414957]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs uppercase font-mono rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{saving ? 'Saving...' : 'Save & Continue to Step 4'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: PLATFORM ROLE SELECTION */}
        {currentStep === 4 && (
          <form onSubmit={submitStep4} className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C66A42]" />
                Step 4: Select Platform Role on PROVENTA
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Choose how your business participates in the procurement exchange. Dual-role businesses operate through a single account with unified workspace switching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* BUYER CARD */}
              <div
                onClick={() => setPlatformRole('BUYER')}
                className={`p-5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                  platformRole === 'BUYER'
                    ? 'bg-[#252B38] border-[#C66A42] ring-1 ring-[#C66A42]'
                    : 'bg-[#252B38]/60 border-[#414957] hover:border-[#536B88]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm bg-[#536B88]/20 text-[#536B88] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wider text-[#FFFFFF]">Buyer</h3>
                    <p className="text-xs text-[#A8ADB7] mt-1">
                      For Contractors, Builders, Developers, EPC Firms, and Project Owners.
                    </p>
                  </div>
                  <ul className="text-xs text-[#D1D5DB] space-y-1.5 pt-2 border-t border-[#414957]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Post Multi-Item BOQs & RFQs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Compare Quotations side-by-side</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Issue POs & Live GPS Fleet Tracking</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-mono uppercase">
                  <span className={platformRole === 'BUYER' ? 'text-[#C66A42] font-bold' : 'text-[#6B7280]'}>
                    {platformRole === 'BUYER' ? '● Selected Role' : 'Select Buyer'}
                  </span>
                </div>
              </div>

              {/* SUPPLIER CARD */}
              <div
                onClick={() => setPlatformRole('SUPPLIER')}
                className={`p-5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                  platformRole === 'SUPPLIER'
                    ? 'bg-[#252B38] border-[#C66A42] ring-1 ring-[#C66A42]'
                    : 'bg-[#252B38]/60 border-[#414957] hover:border-[#536B88]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm bg-[#536B88]/20 text-[#536B88] flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wider text-[#FFFFFF]">Supplier</h3>
                    <p className="text-xs text-[#A8ADB7] mt-1">
                      For Manufacturers, Distributors, Authorized Dealers, and Stockists.
                    </p>
                  </div>
                  <ul className="text-xs text-[#D1D5DB] space-y-1.5 pt-2 border-t border-[#414957]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Receive Matched Industrial RFQs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Submit & Revise Itemized Quotes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Dispatch Orders & Upload Invoices</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-mono uppercase">
                  <span className={platformRole === 'SUPPLIER' ? 'text-[#C66A42] font-bold' : 'text-[#6B7280]'}>
                    {platformRole === 'SUPPLIER' ? '● Selected Role' : 'Select Supplier'}
                  </span>
                </div>
              </div>

              {/* BOTH DUAL-ROLE CARD */}
              <div
                onClick={() => setPlatformRole('BOTH')}
                className={`p-5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                  platformRole === 'BOTH'
                    ? 'bg-[#252B38] border-[#C66A42] ring-1 ring-[#C66A42]'
                    : 'bg-[#252B38]/60 border-[#414957] hover:border-[#536B88]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm bg-[#C66A42]/20 text-[#C66A42] flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#C66A42]/20 text-[#C66A42] text-[9px] font-mono font-bold uppercase rounded-sm mb-1">
                      Full Access
                    </div>
                    <h3 className="font-bold text-base uppercase tracking-wider text-[#FFFFFF]">Buyer & Supplier</h3>
                    <p className="text-xs text-[#A8ADB7] mt-1">
                      For EPCs & Trading Houses that both procure materials and supply project packages.
                    </p>
                  </div>
                  <ul className="text-xs text-[#D1D5DB] space-y-1.5 pt-2 border-t border-[#414957]/60">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Single Account & Unified Business Entity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>One-Click Workspace Switcher</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Both Buyer Desk & Supplier Portals</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-mono uppercase">
                  <span className={platformRole === 'BOTH' ? 'text-[#C66A42] font-bold' : 'text-[#6B7280]'}>
                    {platformRole === 'BOTH' ? '● Selected Role' : 'Select Both'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#414957]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs uppercase font-mono rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{saving ? 'Configuring...' : 'Save & Continue to Step 5'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: ROLE-SPECIFIC ONBOARDING */}
        {currentStep === 5 && (
          <form onSubmit={submitStep5} className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C66A42]" />
                Step 5: {platformRole === 'SUPPLIER' ? 'Supplier Capabilities & Catalogue' : platformRole === 'BUYER' ? 'Buyer Procurement Profile & Sites' : 'Enterprise Operational Setup (Buyer & Supplier)'}
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Customize your category coverage, serviceable districts, site delivery points, and brand authorizations.
              </p>
            </div>

            {/* Buyer section */}
            {(platformRole === 'BUYER' || platformRole === 'BOTH') && (
              <div className="space-y-4 bg-[#252B38] p-5 rounded-sm border border-[#414957]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2 border-b border-[#414957]/60 pb-2">
                  <ShoppingCart className="w-4 h-4 text-[#C66A42]" />
                  Buyer Procurement Requirements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Industry Segment *
                    </label>
                    <input
                      type="text"
                      required
                      value={industrySegment}
                      onChange={(e) => setIndustrySegment(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Estimated Annual Procurement Budget
                    </label>
                    <input
                      type="text"
                      value={annualBudget}
                      onChange={(e) => setAnnualBudget(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-2 font-bold">
                    Primary Materials of Interest (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PROCUREMENT_CATEGORIES.map((cat) => {
                      const selected = selectedBuyerCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 p-2.5 rounded-sm border text-xs cursor-pointer transition-colors ${
                            selected ? 'bg-[#303746] border-[#C66A42] text-[#FFFFFF]' : 'bg-[#191B20] border-[#414957] text-[#A8ADB7]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              setSelectedBuyerCategories((prev) =>
                                prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                              );
                            }}
                            className="rounded border-[#414957] bg-[#191B20] text-[#C66A42] focus:ring-0"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Primary Project / Site Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Site Delivery Address
                    </label>
                    <input
                      type="text"
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Supplier section */}
            {(platformRole === 'SUPPLIER' || platformRole === 'BOTH') && (
              <div className="space-y-4 bg-[#252B38] p-5 rounded-sm border border-[#414957]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2 border-b border-[#414957]/60 pb-2">
                  <Truck className="w-4 h-4 text-[#C66A42]" />
                  Supplier Capabilities & Warehouses
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Supplier Type *
                    </label>
                    <select
                      value={supplierType}
                      onChange={(e) => setSupplierType(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    >
                      {SUPPLIER_TYPES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Monthly Supply / Stockyard Capacity
                    </label>
                    <input
                      type="text"
                      value={monthlyCapacity}
                      onChange={(e) => setMonthlyCapacity(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Authorized Brands Offered (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={brandsOffered}
                      onChange={(e) => setBrandsOffered(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                      Primary Yard / Warehouse Location
                    </label>
                    <input
                      type="text"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      className="w-full bg-[#191B20] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] rounded-sm focus:outline-none focus:border-[#C66A42]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-2 font-bold">
                    Serviceable Operational Districts (Gujarat)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GUJARAT_DISTRICTS.map((dist) => {
                      const selected = selectedDistricts.includes(dist);
                      return (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => {
                            setSelectedDistricts((prev) =>
                              prev.includes(dist) ? prev.filter((d) => d !== dist) : [...prev, dist]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-sm border text-xs font-mono transition-colors ${
                            selected
                              ? 'bg-[#C66A42] border-[#C66A42] text-[#FFFFFF] font-bold'
                              : 'bg-[#191B20] border-[#414957] text-[#A8ADB7] hover:border-[#536B88]'
                          }`}
                        >
                          {selected ? `✓ ${dist}` : dist}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#414957]">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs uppercase font-mono rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{saving ? 'Saving...' : 'Save & Continue to Step 6'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 6: DOCUMENT MANAGEMENT & VERIFICATION SUBMISSION */}
        {currentStep === 6 && (
          <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
            <div className="border-b border-[#414957] pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C66A42]" />
                Step 6: Compliance Document Management & Submission
              </h2>
              <p className="text-xs text-[#A8ADB7] mt-1">
                Attach verification documents to earn the official PROVENTA Verified Enterprise badge and activate full RFQ execution privileges.
              </p>
            </div>

            {/* Document upload grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'GST_CERTIFICATE', label: 'GST Registration Certificate (REG-06)', required: true },
                { type: 'PAN_DOCUMENT', label: 'Company / Firm PAN Card', required: true },
                { type: 'CERTIFICATE_OF_INCORPORATION', label: 'Certificate of Incorporation (COI) / Deed', required: false },
                { type: 'ADDRESS_PROOF', label: 'Registered Office Address Proof (Utility / Tax)', required: false },
              ].map((docItem) => {
                const attached = documents.find((d) => d.documentType === docItem.type);
                return (
                  <div
                    key={docItem.type}
                    className={`p-4 rounded-sm border flex flex-col justify-between gap-3 ${
                      attached
                        ? 'bg-[#252B38] border-emerald-500/50'
                        : 'bg-[#252B38] border-[#414957]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FFFFFF]">
                          {docItem.label}
                        </span>
                        {docItem.required && (
                          <span className="text-[10px] font-mono text-[#C66A42] font-bold uppercase">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A8ADB7] mt-1">
                        Formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>

                    {attached ? (
                      <div className="flex items-center justify-between bg-[#191B20] p-2.5 rounded-sm border border-[#414957]">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs text-[#F1F2F4] font-mono truncate">{attached.fileName}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-sm border border-emerald-800">
                          Uploaded
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingDoc}
                        onClick={() => handleDocumentUpload(docItem.type)}
                        className="inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#191B20] hover:bg-[#303746] border border-[#414957] hover:border-[#536B88] text-xs font-mono uppercase text-[#FFFFFF] rounded-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#536B88]" />
                        <span>{uploadingDoc ? 'Uploading...' : 'Upload File'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checklist Overview */}
            <div className="p-4 bg-[#191B20] border border-[#414957] rounded-sm space-y-2">
              <span className="text-xs font-mono uppercase text-[#536B88] font-bold">
                Verification Readiness Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Legal Business Identity & Registered Office complete</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>GSTIN ({gstNumber || 'Provided'}) & PAN registered</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorized signatory & contact points recorded</span>
                </div>
                <div className={`flex items-center gap-2 ${documents.length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {documents.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{documents.length} Verification Document(s) Attached</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#414957]">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs uppercase font-mono rounded-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={saving || documents.length === 0}
                onClick={submitFinalVerification}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-lg disabled:opacity-50"
              >
                <span>{saving ? 'Submitting Application...' : 'Submit Profile for Verification'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
