import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEMO_COMPANY_ID = "demo-company";

export async function GET() {
  try {
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("company_id", DEMO_COMPANY_ID)
      .maybeSingle();

    if (accountError) {
      return NextResponse.json(
        { ok: false, error: accountError.message },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("account_id", account.id)
      .eq("company_id", DEMO_COMPANY_ID)
      .maybeSingle();

    if (brandError) {
      return NextResponse.json(
        { ok: false, error: brandError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: brand,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
