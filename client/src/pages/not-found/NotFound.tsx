import { defaultErrorOneAction, ErrorOne } from "@/components/error-state";
import { ROUTES } from "@/lib/constants";

/* Catch-all route: ErrorOne layout (single accent element, tokens only). */

export function NotFoundPage({
  code = "404",
  title = "Page not found",
  description = "The address doesn't match any route in this console.",
}: {
  code?: string;
  title?: string;
  description?: string;
}) {
  return (
    <ErrorOne
      code={code}
      title={title}
      description={description}
      action={defaultErrorOneAction(ROUTES.home)}
    />
  );
}
