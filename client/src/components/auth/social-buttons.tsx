import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getMeta, type SocialMeta } from "@/lib/api";
import { KeyRound } from "@/lib/icons";
import { socialAuthorizeUrl } from "@/services/social";

const DISABLED: SocialMeta = { enabled: false, provider: null, display_name: null };

/**
 * "Continue with <provider>" button, driven by `/meta.social` (never the
 * issuer/client id). Renders nothing when social login is off or unreachable.
 */
export function SocialButtons({ onStart }: { onStart?: (url: string) => void }) {
  const [social, setSocial] = useState<SocialMeta | null>(null);

  useEffect(() => {
    let alive = true;
    getMeta()
      .then((meta) => {
        if (alive) setSocial(meta.social ?? DISABLED);
      })
      .catch(() => {
        if (alive) setSocial(DISABLED);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!social?.enabled || !social.provider) return null;
  const provider = social.provider;
  const label = social.display_name?.trim() || "your identity provider";

  const start = () => {
    const url = socialAuthorizeUrl(provider);
    if (onStart) onStart(url);
    else window.location.assign(url);
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" className="w-full" onClick={start}>
        <KeyRound aria-hidden="true" />
        Sign in with {label}
      </Button>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">or use email</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
    </div>
  );
}
