import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const long = searchParams.get("long");

  if (!lat || !long) {
    return new Response("Missing lat or long parameters", { status: 400 });
  }

  try {
    const url = `https://www.yr.no/en/content/${lat},${long}/meteogram.svg`;
    const res = await fetch(url, {
      cache: "no-store", // We probably don't want to cache this on our server
    });

    if (!res.ok) {
      return new Response(`Failed to fetch meteogram: ${res.statusText}`, {
        status: res.status,
      });
    }

    const svg = await res.text();

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (e: any) {
    return new Response(`Internal server error: ${e.message}`, {
      status: 500,
    });
  }
}
