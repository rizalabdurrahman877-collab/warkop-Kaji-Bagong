import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { searchParams } = new URL(req.url)
  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY') || "";
  const base64Key = btoa(serverKey + ":");

  try {
    if (req.method === 'POST') {
      // Aksi: Membuat QRIS Baru (Charge)
      const { order_id, gross_amount } = await req.json()
      const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Key}`
        },
        body: JSON.stringify({
          payment_type: "qris",
          transaction_details: { order_id: order_id, gross_amount: gross_amount },
          qris: { acquirer: "gopay" }
        })
      })
      const data = await response.json()
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

    } else if (req.method === 'GET') {
      // Aksi: Cek Status Pembayaran
      const order_id = searchParams.get('order_id')
      const response = await fetch(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${base64Key}`
        }
      })
      const data = await response.json()
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})