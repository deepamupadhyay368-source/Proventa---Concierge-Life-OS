import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Wrench, 
  IndianRupee, 
  CalendarCheck, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const customers = homeDataStore.getAllCustomers();
  const technicians = homeDataStore.getAllTechnicians();
  const requests = homeDataStore.getAllRequests();
  const societies = homeDataStore.getAllSocieties();

  const unassignedCount = requests.filter(r => r.status === 'SUBMITTED').length;
  const inProgressCount = requests.filter(r => r.status === 'WORK_STARTED' || r.status === 'TECHNICIAN_ASSIGNED' || r.status === 'AWAITING_CUSTOMER_APPROVAL').length;
  const completedCount = requests.filter(r => r.status === 'WORK_COMPLETED' || r.status === 'CLOSED').length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Operations Control Centre</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">PROVENTA Home Operations</h1>
          <p className="text-xs text-stone-500 mt-1">Ahmedabad Urban Cluster • Real-time dispatch, network health & unit economics</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dispatch"
            className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <span>Live Dispatch Queue ({unassignedCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/finance"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Unit Economics</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Members</span>
          <div className="text-3xl font-bold text-[#171A17]">{customers.length}</div>
          <div className="text-xs text-stone-500">Ahmedabad households</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Verified Technicians</span>
          <div className="text-3xl font-bold text-[#171A17]">{technicians.length}</div>
          <div className="text-xs text-emerald-700 font-medium">100% Aadhaar KYC checked</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Unassigned Queue</span>
          <div className={`text-3xl font-bold ${unassignedCount > 0 ? 'text-amber-600' : 'text-stone-800'}`}>
            {unassignedCount}
          </div>
          <div className="text-xs text-stone-500">Requires technician allocation</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Partner Societies</span>
          <div className="text-3xl font-bold text-[#171A17]">{societies.length}</div>
          <div className="text-xs text-stone-500">1,170 residential units enrolled</div>
        </div>
      </div>

      {/* Operations Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#53634A]/10 text-[#53634A] flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#171A17]">Technician Dispatch Engine</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Match unassigned domestic maintenance requests to nearby certified technicians based on trade compatibility, locality distance, and workload.
            </p>
          </div>
          <Link
            href="/admin/dispatch"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#53634A] hover:underline pt-2"
          >
            <span>Open Dispatch Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#171A17]">Unit Economics Simulator</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Stress-test the business model across 3 utilization profiles (Low, Expected Baseline, High Stress) with live contribution margin forecasting.
            </p>
          </div>
          <Link
            href="/admin/finance"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline pt-2"
          >
            <span>Open Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#171A17]">Technician Network & KYC</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Review partner credentials, police background check certifications, trade test scores, and real-time dispatch availability.
            </p>
          </div>
          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline pt-2"
          >
            <span>Manage Network</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Historical Industrial Procurement Archive Notice */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
          <span>
            <strong>Historical Industrial Records Protected:</strong> All previous construction procurement RFQs, supplier quotes, purchase orders, and payment records remain intact in the database.
          </span>
        </div>
        <Link
          href="/admin/procurement"
          className="text-stone-800 font-bold hover:underline shrink-0"
        >
          View Procurement Audit Archive →
        </Link>
      </div>

    </div>
  );
}
