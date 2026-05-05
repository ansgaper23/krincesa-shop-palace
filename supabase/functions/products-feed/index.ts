// Public products feed — consumed by external POS systems
// No auth required, returns JSON with all active products
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        brand,
        price,
        wholesale_price,
        min_wholesale_quantity,
        stock,
        image_url,
        additional_images,
        is_active,
        updated_at,
        categories ( id, name )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    const products = (data || []).map((p: any) => ({
      id: p.id,
      sku: p.slug,
      name: p.name,
      description: p.description,
      brand: p.brand,
      category: p.categories?.name || null,
      category_id: p.categories?.id || null,
      price_unit: Number(p.price),
      price_wholesale: Number(p.wholesale_price),
      min_wholesale_quantity: Number(p.min_wholesale_quantity),
      stock: Number(p.stock),
      image_url: p.image_url,
      images: p.additional_images || [],
      updated_at: p.updated_at,
    }));

    const body = {
      generated_at: new Date().toISOString(),
      count: products.length,
      products,
    };

    return new Response(JSON.stringify(body, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
      status: 200,
    });
  } catch (e) {
    console.error('products-feed error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
