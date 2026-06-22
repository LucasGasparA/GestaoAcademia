const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconGrid(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c1.4-3.8 4.2-5.7 7.5-5.7s6.1 1.9 7.5 5.7" />
    </svg>
  );
}

export function IconBadge(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l2.3 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.7 1.2 2.5-2 1.9.3 2.7-2.6.8-1.3 2.4-2.6-.6-2.6.6-1.3-2.4-2.6-.8.3-2.7-2-1.9 1.2-2.5-.6-2.7 2.3-1.4 1-2.5 2.7.2z" />
      <circle cx="12" cy="11.5" r="2.4" />
    </svg>
  );
}

export function IconLayers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5l9 4.8-9 4.8-9-4.8z" />
      <path d="M3 12l9 4.8 9-4.8" /><path d="M3 16.7l9 4.8 9-4.8" />
    </svg>
  );
}

export function IconClipboard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="0.5" /><path d="M9 4V2.6h6V4" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function IconCoin(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7.5v9M9.3 9.6c0-1.2 1.2-2.1 2.7-2.1s2.7.9 2.7 1.9-1.1 1.5-2.7 1.7-2.7.6-2.7 1.9 1.2 1.9 2.7 1.9 2.7-.7 2.7-1.9" />
    </svg>
  );
}

export function IconActivity(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 13h4l2.2 7 4.6-15 2.3 8h5.9" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" /><path d="M19.5 19.5l-4.4-4.4" />
    </svg>
  );
}

export function IconEdit(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l.9-4.2L16.2 4.5a1.6 1.6 0 0 1 2.3 0l1 1a1.6 1.6 0 0 1 0 2.3L8.2 19.1z" />
      <path d="M14.5 6.5l3 3" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7h15" /><path d="M9 7V4.6h6V7" />
      <path d="M6 7l1 13.4h10L18 7" /><path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconAlert(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l9.5 17H2.5z" /><path d="M12 9.5v5" /><path d="M12 17.2h.01" />
    </svg>
  );
}

export function IconTerminal(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="0.5" />
      <path d="M7 9.5l3 2.5-3 2.5" /><path d="M12.5 14.5h4.5" />
    </svg>
  );
}

export function IconChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 8.5l7 7 7-7" />
    </svg>
  );
}

export function IconEmptyBox(props) {
  return (
    <svg {...base} width={32} height={32} {...props}>
      <path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v9l9 5 9-5V8" /><path d="M12 13v9" />
    </svg>
  );
}
