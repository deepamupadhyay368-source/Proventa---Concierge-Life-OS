import { NextRequest, NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const locality = searchParams.get('locality') || undefined;
  const approvedOnly = searchParams.get('approvedOnly') === 'true';

  const technicians = homeDataStore.getAllTechnicians({ category, locality, approvedOnly });
  return NextResponse.json({
    success: true,
    count: technicians.length,
    technicians
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      mobile,
      email,
      operatingLocality,
      serviceRadiusKm,
      serviceCategories,
      primarySkills,
      experienceYears,
      bankDetails
    } = body;

    if (!fullName || !mobile || !operatingLocality || !serviceCategories?.length) {
      return NextResponse.json({ success: false, error: 'Missing mandatory registration fields.' }, { status: 400 });
    }

    const tech = homeDataStore.registerTechnician({
      userId: `usr-tech-${Date.now().toString(36)}`,
      fullName,
      mobile,
      email: email || '',
      operatingLocality,
      serviceRadiusKm: Number(serviceRadiusKm || 5),
      serviceCategories,
      primarySkills: primarySkills || [],
      experienceYears: Number(experienceYears || 1),
      bankDetails: bankDetails || {
        accountNumber: 'PENDING',
        ifscCode: 'PENDING',
        beneficiaryName: fullName,
        bankName: 'Pending verification'
      },
      documents: []
    });

    return NextResponse.json({
      success: true,
      message: 'Technician partner registered. Application is under review.',
      technician: tech
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
