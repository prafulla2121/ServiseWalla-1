import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect width="32" height="32" rx="8" fill="currentColor"/>
        <path d="M19.3333 9.33331C21.4667 9.33331 23.3333 11.2 23.3333 13.3333C23.3333 17.1573 17.5467 21.444 16 22.6666C14.4533 21.444 8.66667 17.1573 8.66667 13.3333C8.66667 11.2 10.5333 9.33331 12.6667 9.33331C13.84 9.33331 14.9253 9.87198 15.6306 10.7413L16 11.1666L16.3694 10.7413C17.0747 9.87198 18.16 9.33331 19.3333 9.33331Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <span className="font-headline text-2xl font-bold text-foreground">
        ServiceWalla
      </span>
    </Link>
  );
}
