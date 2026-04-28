export type Viewport = "desktop" | "tablet" | "mobile";

interface ViewportSwitcherProps {
  active: Viewport;
  onChange: (v: Viewport) => void;
}

const VIEWPORTS: { key: Viewport; label: string; icon: string }[] = [
  {
    key: "desktop",
    label: "Desktop",
    // monitor icon
    icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z",
  },
  {
    key: "tablet",
    label: "Tablet",
    // tablet icon
    icon: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z",
  },
  {
    key: "mobile",
    label: "Mobile",
    // phone icon
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  },
];

export default function ViewportSwitcher({
  active,
  onChange,
}: ViewportSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
      {VIEWPORTS.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={label}
          aria-label={label}
          className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
            active === key
              ? "bg-[#1A1A1A] text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </button>
      ))}
    </div>
  );
}
