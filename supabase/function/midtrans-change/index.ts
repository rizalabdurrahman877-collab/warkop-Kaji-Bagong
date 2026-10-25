import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id, gross_amount } = await req.json()

    // Ganti dengan Server Key Sandbox Midtrans Anda
    const serverKey = "SB-Mid-server-XXXXXXXXXXXXXXXXX"; 
    
    // Encode Server Key ke Base64 (wajib untuk Basic Auth Midtrans)
    const base64Key = btoa(serverKey + ":");

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Key}`
      },
      body: JSON.stringify({
        payment_type: "qris",
        transaction_details: {
          order_id: order_id,
          gross_amount: gross_amount
        },
        qris: {
          acquirer: "gopay"
        }
      })
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})