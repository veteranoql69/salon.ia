'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token',
  options: { timeout: 5000, idempotencyKey: 'abc' }
});

export async function createPaymentPreference(appointmentId: string, amount: number) {
  try {
    const supabase = await createClient()

    // 1. Create the preference in MercadoPago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: appointmentId,
            title: 'Seña de Reserva - Barber.IA',
            quantity: 1,
            unit_price: amount,
            currency_id: 'CLP',
          }
        ],
        // The webhook URL that MP will call when payment status changes
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/reservar/success?appt_id=${appointmentId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/reservar/failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/reservar/pending`
        },
        auto_return: 'approved',
        external_reference: appointmentId, // Key to link webhook back to appointment
      }
    });

    if (!result.id || !result.init_point) {
      throw new Error('No se pudo generar la preferencia de MercadoPago');
    }

    // 2. Insert into our brb_payments table
    const { error: insertError } = await supabase
      .from('brb_payments')
      .insert({
        appointment_id: appointmentId,
        amount: amount,
        currency: 'CLP',
        status: 'pending',
        mp_preference_id: result.id
      });

    if (insertError) {
      console.error('Error insertando brb_payments:', insertError);
      throw new Error('Error al registrar pago en base de datos');
    }

    // 3. Return the checkout URL
    return { checkoutUrl: result.init_point };

  } catch (error: any) {
    console.error('Error en createPaymentPreference:', error);
    return { error: error.message || 'Error al generar cobro' };
  }
}
