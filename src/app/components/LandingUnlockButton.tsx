"use client";

import Link from "next/link";
import { trackLeadEvent } from "@/lib/site-tracking";

type LandingUnlockButtonProps = {
  className?: string;
};

export default function LandingUnlockButton({
  className = "",
}: LandingUnlockButtonProps) {
  return (
    <Link
      href="/mines"
      onClick={() => {
        void trackLeadEvent({
          event: "landing_cta_click",
          stage: "home",
          page: "home",
          amount: 139.19,
          extra: {
            destination: "/mines",
          },
        });
      }}
      className={className}
    >
      <span className="liquid-cta-label relative z-10">
        Desbloquear a oferta
      </span>
    </Link>
  );
}
