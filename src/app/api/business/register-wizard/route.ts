import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth/session';
import {
  getOrCreateUserBusiness,
  saveStep1Identity,
  saveStep2Tax,
  saveStep3Contacts,
  saveStep4Role,
  saveStep5Buyer,
  saveStep5Supplier,
  submitBusinessForVerification,
} from '@/lib/business/service';
import {
  step1IdentitySchema,
  step2TaxSchema,
  step3ContactsSchema,
  step4RoleSchema,
  step5BuyerSchema,
  step5SupplierSchema,
} from '@/lib/business/validators';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const business = await getOrCreateUserBusiness(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        business,
        onboardingStep: business.onboardingStep || 1,
        onboardingComplete: business.onboardingComplete,
        verificationStatus: business.verificationStatus,
      },
    });
  } catch (error: any) {
    console.error('[register-wizard GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve wizard data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Please sign in or create an account to register your business.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { step, businessId, data } = body;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;

    switch (step) {
      case 1: {
        const parsed = step1IdentitySchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
            { status: 422 }
          );
        }
        const updated = await saveStep1Identity({
          userId,
          businessId,
          data: parsed.data,
          ipAddress,
        });
        return NextResponse.json({ success: true, data: updated, nextStep: 2 });
      }

      case 2: {
        const parsed = step2TaxSchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
            { status: 422 }
          );
        }
        const updated = await saveStep2Tax({
          userId,
          businessId,
          data: parsed.data,
          ipAddress,
        });
        return NextResponse.json({ success: true, data: updated, nextStep: 3 });
      }

      case 3: {
        const parsed = step3ContactsSchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
            { status: 422 }
          );
        }
        const updated = await saveStep3Contacts({
          userId,
          businessId,
          data: parsed.data,
          ipAddress,
        });
        return NextResponse.json({ success: true, data: updated, nextStep: 4 });
      }

      case 4: {
        const parsed = step4RoleSchema.safeParse(data);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
            { status: 422 }
          );
        }
        const updated = await saveStep4Role({
          userId,
          businessId,
          data: parsed.data,
          ipAddress,
        });
        return NextResponse.json({ success: true, data: updated, nextStep: 5 });
      }

      case 5: {
        // Step 5 can be Buyer, Supplier, or Both
        const role = data.role || 'BUYER';
        let buyerResult = null;
        let supplierResult = null;

        if (role === 'BUYER' || role === 'BOTH') {
          if (data.buyer) {
            const parsedBuyer = step5BuyerSchema.safeParse(data.buyer);
            if (!parsedBuyer.success) {
              return NextResponse.json(
                { success: false, error: 'Buyer validation failed', fields: parsedBuyer.error.flatten().fieldErrors },
                { status: 422 }
              );
            }
            buyerResult = await saveStep5Buyer({
              userId,
              businessId,
              data: parsedBuyer.data,
              ipAddress,
            });
          }
        }

        if (role === 'SUPPLIER' || role === 'BOTH') {
          if (data.supplier) {
            const parsedSupplier = step5SupplierSchema.safeParse(data.supplier);
            if (!parsedSupplier.success) {
              return NextResponse.json(
                { success: false, error: 'Supplier validation failed', fields: parsedSupplier.error.flatten().fieldErrors },
                { status: 422 }
              );
            }
            supplierResult = await saveStep5Supplier({
              userId,
              businessId,
              data: parsedSupplier.data,
              ipAddress,
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: { buyer: buyerResult, supplier: supplierResult },
          nextStep: 6,
        });
      }

      case 'submit': {
        const submitted = await submitBusinessForVerification({
          userId,
          businessId,
          ipAddress,
        });
        return NextResponse.json({
          success: true,
          data: submitted,
          message: 'Business submitted for verification successfully.',
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid wizard step.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[register-wizard POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 400 }
    );
  }
}
