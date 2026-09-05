import { wave1RegisterSchema } from '../src/lib/validation/schemas';
import { sendWave1AdminNotificationEmail } from '../src/lib/email/sender';

async function test() {
  const payload = {
    name: 'Deepam Gaurang Upadhyay',
    email: 'deepamupadhyay368@gmail.com',
    phone: '7046849570',
    city: 'Ahmedabad',
    intendedUse: 'Lifestyle management',
    consentGiven: true,
  };

  const parsed = wave1RegisterSchema.safeParse(payload);
  console.log('Parsed success:', parsed.success);
  if (!parsed.success) {
    console.error('Errors:', parsed.error.flatten().fieldErrors);
    return;
  }

  try {
    console.log('Sending email...');
    await sendWave1AdminNotificationEmail(parsed.data);
    console.log('Email sent or logged successfully');
  } catch (err) {
    console.error('Email error:', err);
  }
}

test();
