import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      company, 
      origin, 
      destination, 
      equipmentType, 
      weight, 
      pickupDate, 
      notes,
      source = "website"
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create lead in Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          company: company || null,
          origin: origin || null,
          destination: destination || null,
          equipment_type: equipmentType || null,
          weight: weight || null,
          pickup_date: pickupDate || null,
          notes: notes || null,
          source,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Here you could also send an email notification to your sales team
    // or add the lead to a CRM

    return NextResponse.json(
      { 
        success: true, 
        message: "Lead captured successfully",
        leadId: data.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve leads (for admin dashboard)
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}