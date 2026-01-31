"use client";

import { CONTACT, waLink } from "@/lib/siteConfig";

export default function WhatsCTA({
  title,
  slug,
}: {
  title: string;
  slug?: string | null;
}) {
  const href =
    typeof window === "undefined"
      ? "#"
      : waLink(
          CONTACT.whatsapp.primary,
          `Hola! Me interesa el ${title}${
            slug ? ` (${location.origin}/catalogo/${slug})` : ""
          }`,
        );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10"
    >
      <svg width="14" height="14" viewBox="0 0 32 32" className="opacity-80">
        <path
          fill="currentColor"
          d="M19.11 17.08c-.3-.15-1.76-.86-2.03-.95c-.27-.1-.47-.15-.67.15s-.77.95-.95 1.14c-.17.2-.35.22-.65.07c-.3-.15-1.27-.47-2.42-1.5c-.89-.8-1.49-1.77-1.66-2.07c-.17-.3 0-.46.13-.61c.14-.15.3-.35.44-.52c.15-.17.2-.3.3-.5c.1-.2.05-.37-.02-.52c-.07-.15-.67-1.62-.92-2.22c-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37c-.27.3-1.04 1.02-1.04 2.5c0 1.47 1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.49c.71.31 1.27.5 1.7.64c.71.22 1.37.19 1.88.11c.57-.09 1.76-.72 2.01-1.42c.25-.7.25-1.31.17-1.43c-.07-.12-.27-.2-.57-.35zM16 3C8.83 3 3 8.83 3 16c0 2.3.61 4.46 1.68 6.34L3 29l6.83-1.79C11.65 28.39 13.75 29 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3z"
        />
      </svg>
      Consultar por WhatsApp
    </a>
  );
}
