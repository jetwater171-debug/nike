"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initTrackingForPage } from "@/lib/site-tracking";

const PAGE_BY_PATH: Record<string, string> = {
  "/": "home",
  "/mines": "promo",
  "/dados": "dados",
  "/carrinho": "carrinho",
  "/checkout": "checkout",
  "/checkout/pagamento": "pagamento",
  "/pagamento": "pagamento",
  "/pix": "pix",
};

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = pathname || "";
    const page = PAGE_BY_PATH[currentPath] || "";
    void initTrackingForPage(page);
  }, [pathname]);

  return null;
}
