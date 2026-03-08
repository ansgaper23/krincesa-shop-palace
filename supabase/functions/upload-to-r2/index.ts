// @ts-nocheck
/* eslint-disable */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting R2 upload process...');
    
    // Log environment variables (without revealing the actual values)
    const R2_ACCESS_KEY_ID = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const R2_SECRET_ACCESS_KEY = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    const R2_BUCKET_NAME = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME');
    const R2_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID');

    console.log('📋 Environment check:', {
      hasAccessKey: !!R2_ACCESS_KEY_ID,
      hasSecretKey: !!R2_SECRET_ACCESS_KEY,
      hasBucketName: !!R2_BUCKET_NAME,
      hasAccountId: !!R2_ACCOUNT_ID,
      bucketName: R2_BUCKET_NAME,
      accountId: R2_ACCOUNT_ID
    });

    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ACCOUNT_ID) {
      console.error('❌ Missing R2 configuration');
      throw new Error('Missing R2 configuration');
    }

    console.log('📝 Request method:', req.method);
    console.log('📝 Request headers:', Object.fromEntries(req.headers.entries()));

    const formData = await req.formData();
    console.log('📦 FormData keys:', Array.from(formData.keys()));
    
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file provided');
      throw new Error('No file provided');
    }

    console.log('📁 File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomString}.webp`;
    console.log('🏷️ Generated filename:', fileName);

    // Create AWS signature for R2
    const region = 'auto';
    const service = 's3';
    const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `https://${host}/${R2_BUCKET_NAME}/${fileName}`;
    console.log('🌐 Upload URL:', url);

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');

    console.log('🕐 Date info:', { dateStamp, amzDate });

    // Create canonical request
    const canonicalUri = `/${R2_BUCKET_NAME}/${fileName}`;
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;

    console.log('📋 Canonical request created');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

    console.log('🔐 String to sign created');

    // Calculate signature
    const signingKey = await getSignatureKey(R2_SECRET_ACCESS_KEY, dateStamp, region, service);
    const signature = await hmacSha256(signingKey, stringToSign);

    console.log('✍️ Signature calculated');

    // Create authorization header
    const authorization = `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log('🔑 Authorization header created');

    // Upload to R2
    console.log('📤 Starting upload to R2...');
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

    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const responseText = await uploadResponse.text();
      console.error('❌ Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        responseText
      });
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${responseText}`);
    }

    // Return the public URL
    const publicUrl = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${fileName}`;
    console.log('✅ Upload successful! Public URL:', publicUrl);

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
    console.error('💥 Error uploading to R2:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Check the function logs for more information'
      }),
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
  const kSecret = new TextEncoder().encode('AWS4' + key).buffer;
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
