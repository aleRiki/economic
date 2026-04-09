import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
    const backendUrl = `${baseUrl}/pago/create-checkout`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("[v0] Backend devolvió HTML:", text);
      return NextResponse.json(
        {
          error: "Respuesta inesperada del backend",
          details: "Se recibió HTML en lugar de JSON. Verifica la ruta o el servidor.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Error del servicio de pago",
          details: data?.message || data?.error || "Error desconocido en el backend",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[v0] Internal Checkout API error:", errorMessage);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}