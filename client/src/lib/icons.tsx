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
 *
 * Audited 2026-10-09 (change `icons-audit`): zero direct library imports
 * outside this file (custom-ui checked), 11 dead re-exports removed
 * (BadgeCheck, Bell, ChartColumn, ChevronsLeft/Right, Clock, Database,
 * Globe, Inbox, Send, Tag) — keep it that way.
 */

export {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Bold,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  CircleDot,
  CircleX,
  Copy,
  Crown,
  Download,
  File,
  FileCode,
  FileText,
  FlaskConical,
  Folder,
  FolderOpen,
  House,
  Info,
  Italic,
  KeyRound,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Minus,
  Moon,
  MoreHorizontal,
  MoreVertical,
  PanelLeft,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sun,
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
export { TbClockHour12Filled, TbCube } from "react-icons/tb";

export type { IconType } from "react-icons";

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
