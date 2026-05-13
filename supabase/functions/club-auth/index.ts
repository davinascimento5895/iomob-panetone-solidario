
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { create, Header, Payload } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, club_id, password, new_password } = body;

    console.log(`Action: ${action}, Club ID: ${club_id}`);

    if (action === "login") {
      const { data: club, error } = await supabaseClient
        .from("clubs")
        .select("*")
        .eq("id", club_id)
        .single();

      if (error || !club) {
        return new Response(JSON.stringify({ error: "Clube não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanPassword = password.trim();
      const cleanHash = club.password_hash.trim();
      const isValid = bcrypt.compareSync(cleanPassword, cleanHash);
      
      if (!isValid) {
        console.log(`Invalid password attempt for club: ${club.name}`);
        return new Response(JSON.stringify({ 
          error: `Senha incorreta para o clube ${club.name}.`
        }), {
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate custom JWT
      let jwtSecret = Deno.env.get("JWT_SECRET") || Deno.env.get("SUPABASE_AUTH_JWT_SECRET");
      
      if (!jwtSecret) {
        console.warn("JWT_SECRET not found, using temporary fallback.");
        jwtSecret = "iomob-panetone-temp-secret-2026-fallback";
      }

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const header: Header = { alg: "HS256", typ: "JWT" };
      const payload: Payload = {
        role: "club",
        club_id: club.id,
        club_name: club.name,
        sub: club.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 1 week
        iss: "supabase",
        aud: "authenticated",
      };

      const token = await create(header, payload, key);

      // Update last login
      await supabaseClient
        .from("clubs")
        .update({ last_login: new Date().toISOString() })
        .eq("id", club.id);

      return new Response(
        JSON.stringify({
          token,
          requiresPasswordChange: !club.temp_password_used,
          club: { id: club.id, name: club.name },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "change-password") {
      const { data: club, error } = await supabaseClient
        .from("clubs")
        .select("*")
        .eq("id", club_id)
        .single();

      if (error || !club) {
        return new Response(JSON.stringify({ error: "Clube não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanPassword = password.trim();
      const isValid = bcrypt.compareSync(cleanPassword, club.password_hash.trim());
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Senha atual incorreta" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const newHash = bcrypt.hashSync(new_password.trim(), salt);
      
      const { error: updateError } = await supabaseClient
        .from("clubs")
        .update({ password_hash: newHash, temp_password_used: true })
        .eq("id", club_id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset-password") {
      const { data: club, error } = await supabaseClient
        .from("clubs")
        .select("*")
        .eq("id", club_id)
        .single();

      if (error || !club) {
        return new Response(JSON.stringify({ error: "Clube não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!club.initial_password) {
        console.error("Club record is missing initial_password:", club.id);
        return new Response(JSON.stringify({ error: "Este clube não possui uma senha inicial registrada para resetar." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Re-hash the initial password
      let newHash;
      try {
        const cleanInitialPassword = club.initial_password.trim();
        console.log(`Hashing initial password (${cleanInitialPassword.length} chars) with bcryptjs...`);
        const salt = bcrypt.genSaltSync(10);
        newHash = bcrypt.hashSync(cleanInitialPassword, salt);
        console.log("Hash generated successfully.");
      } catch (hashError: any) {
        console.error("Bcrypt Error:", hashError.message);
        return new Response(JSON.stringify({ error: "Erro ao gerar criptografia da senha: " + hashError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const { error: updateError } = await supabaseClient
        .from("clubs")
        .update({ 
          password_hash: newHash, 
          temp_password_used: false,
          last_login: null 
        })
        .eq("id", club_id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Internal Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
