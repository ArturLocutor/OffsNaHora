// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Criando usuário administrador no Supabase")

Deno.serve(async (req) => {
  // Verificar se a requisição tem a chave secreta correta
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Autorização necessária' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Criar cliente Supabase com a chave de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://byeolalksmsutxrohvqa.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Obter dados do usuário admin da requisição
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Criar o usuário admin
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ 
        message: 'Usuário administrador criado com sucesso',
        user: data.user
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-admin-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
