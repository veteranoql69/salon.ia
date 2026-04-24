import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Force this route to be dynamic (never statically analyzed at build time)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Instantiate clients INSIDE the handler so build-time evaluation never runs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token',
  });

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ success: true, message: 'Not a payment event' }, { status: 200 });
    }

    // 1. Fetch the actual payment data from MercadoPago to verify it's legitimate
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    if (!paymentData || !paymentData.external_reference) {
      return NextResponse.json({ success: false, message: 'Invalid payment data' }, { status: 400 });
    }

    const appointmentId = paymentData.external_reference;
    const paymentStatus = paymentData.status; // 'approved', 'pending', 'rejected', etc.

    // 2. Map MP status to our DB status
    let mappedStatus = 'pending';
    if (paymentStatus === 'approved') mappedStatus = 'approved';
    else if (paymentStatus === 'rejected') mappedStatus = 'rejected';
    else if (paymentStatus === 'refunded') mappedStatus = 'refunded';

    // 3. Update the `brb_payments` table
    const { error: paymentError } = await supabaseAdmin
      .from('brb_payments')
      .update({
        status: mappedStatus,
        mp_payment_id: paymentData.id?.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointmentId);

    if (paymentError) {
      console.error('Error updating payment in DB:', paymentError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // 4. If approved, update the `brb_appointments` table status to 'confirmed'
    if (mappedStatus === 'approved') {
      const { error: apptError } = await supabaseAdmin
        .from('brb_appointments')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (apptError) {
        console.error('Error updating appointment status in DB:', apptError);
        return NextResponse.json({ success: false }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
