
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const R2_ACCESS_KEY_ID = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const R2_SECRET_ACCESS_KEY = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    const R2_BUCKET_NAME = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME');
    const R2_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID');

    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ACCOUNT_ID) {
      throw new Error('Missing R2 configuration');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomString}.webp`;

    // Create AWS signature for R2
    const region = 'auto';
    const service = 's3';
    const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `https://${host}/${R2_BUCKET_NAME}/${fileName}`;

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');

    // Create canonical request
    const canonicalUri = `/${R2_BUCKET_NAME}/${fileName}`;
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

    // Calculate signature
    const signingKey = await getSignatureKey(R2_SECRET_ACCESS_KEY, dateStamp, region, service);
    const signature = await hmacSha256(signingKey, stringToSign);

    // Create authorization header
    const authorization = `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Upload to R2
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'Content-Type': 'image/webp',
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    // Return the public URL
    const publicUrl = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${fileName}`;

    return new Response(
      JSON.stringify({ 
        url: publicUrl,
        message: 'Image uploaded successfully to Cloudflare R2'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error uploading to R2:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: ArrayBuffer, message: string): Promise<string> {
  const keyObject = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyObject, new TextEncoder().encode(message));
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  const kSecret = new TextEncoder().encode('AWS4' + key);
  const kDate = await hmacSha256Buffer(kSecret, dateStamp);
  const kRegion = await hmacSha256Buffer(kDate, regionName);
  const kService = await hmacSha256Buffer(kRegion, serviceName);
  const kSigning = await hmacSha256Buffer(kService, 'aws4_request');
  return kSigning;
}

async function hmacSha256Buffer(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const keyObject = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', keyObject, new TextEncoder().encode(message));
}
