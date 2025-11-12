import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M12.22 2h-4.44l-2.22 4.44h.02l-2.22-4.44H-1" transform="translate(5.5 4)"/>
        <path d="M12.22 14h-4.44l-2.22 4.44h.02l-2.22-4.44H-1" transform="translate(5.5 4)"/>
        <path d="M20 12.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v1z" />
        <path d="M20 5.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v1z" />
      </svg>
      <span className="font-headline text-2xl font-bold text-foreground">
        ServiceWalla
      </span>
    </Link>
  );
}
