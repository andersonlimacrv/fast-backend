/* Icons + decorative SVGs — THE single source of truth (regra de ouro).
 *
 * Every icon and every inline SVG in `client/src` MUST be imported from this
 * file. Direct imports from "lucide-react" or "react-icons/*" anywhere else
 * are banned (enforced by review + grep gate in the design-unification change).
 * Rationale: one place to audit the icon surface, trivial future library swap,
 * and no surprise `react-icons` weight in unrelated bundles.
 *
 * Conventions:
 * - Prefer lucide (tree-shakeable, DESIGN.md #9) for UI chrome.
 * - `react-icons` aliases below exist ONLY for ported reference components
 *   (file-uploader, run-action-button, gooey-menu, error-one) that were
 *   designed against them. New code uses lucide names.
 * - Re-export by name (never `export *`) so the surface stays auditable.
 */

export {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bold,
  Building2,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock,
  Copy,
  Database,
  Download,
  FileCode,
  FileText,
  FolderOpen,
  Globe,
  House,
  Inbox,
  Info,
  Italic,
  KeyRound,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  MoreVertical,
  PanelLeft,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sun,
  Tag,
  TriangleAlert,
  Underline,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

export {
  BsFileTextFill,
  BsSendFill,
  BsTagFill,
} from "react-icons/bs";
export {
  FaArrowRight,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaFileAlt,
  FaFileCode,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
  FaInbox,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
export { HiBadgeCheck } from "react-icons/hi";
export { IoCloseSharp, IoMoon, IoMoonOutline, IoSunny, IoSunnyOutline } from "react-icons/io5";
export { RiBubbleChartFill, RiHome5Fill } from "react-icons/ri";
export { TbClockHour12Filled } from "react-icons/tb";

export type { IconType } from "react-icons";

/* Gooey-menu trigger glyph (decorative SVG, previously inline in the reference).
 * Kept here so no page/component carries its own copy of the artwork. */
export function GooGlyph({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 180 180" fill="none" className={className} aria-hidden="true">
      <path
        d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.356L137.352 160.6Z"
        className="fill-foreground"
      />
      <path d="M115.352 54H127.466V125.97H115.352V54Z" className="fill-foreground" />
    </svg>
  );
}

/* Gradient 404 code (decorative SVG from the ErrorOne reference).
 * Single copy: pages import this instead of inlining the artwork. */
export function GradientCode({ code }: { code: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      className="w-full max-w-[20rem] select-none sm:max-w-md"
      aria-hidden="true"
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-primary/20 stroke-primary font-black tracking-tighter"
        style={{ fontSize: "20rem" }}
        strokeWidth="2"
        strokeDasharray="40 20"
      >
        {code}
      </text>
    </svg>
  );
}
