import type { Metadata } from "next";

export const locationMetadata: Metadata = {
  title: `Paragliding Vær - WindLord`,
  description: "Se værmelding og flyvær for paragliding starter. Oppdatert værmelding medvind, temperatur og atmosfæriske forhold.",
  keywords: "paragliding, værmelding, vind, flyvær, WindLord, Norge",
  openGraph: {
    title: "Paragliding Vær - WindLord",
    description: "Se værmelding og flyvær for paragliding starter.",
    type: "website",
    locale: "no_NO",
    images: [
      {
        url: "/windlord.png",
        width: 1200,
        height: 630,
        alt: "WindLord - Paragliding Vær App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paragliding Vær - WindLord",
    description: "Se værmelding og flyvær for paragliding starter.",
    images: ["/windlord.png"],
  },
};
