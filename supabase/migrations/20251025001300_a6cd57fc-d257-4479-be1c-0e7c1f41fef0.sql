-- Add whatsapp_message_template column to store_config table
ALTER TABLE store_config 
ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT DEFAULT 'NUEVO PEDIDO

Cliente: {{customer_name}}
Telefono: {{customer_phone}}
Email: {{customer_email}}

Productos:
{{products_list}}

Total: S/ {{total_amount}}

Notas: {{notes}}

Gracias por tu preferencia!';