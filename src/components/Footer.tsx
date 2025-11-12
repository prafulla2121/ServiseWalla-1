import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Facebook } from "lucide-react";

export function Footer() {
  const footerNavs = [
    {
      label: "Company",
      items: [
        { href: "/about", name: "About" },
        { href: "/services", name: "Services" },
        { href: "/careers", name: "Careers" },
        { href: "/contact", name: "Contact" },
      ],
    },
    {
      label: "Legal",
      items: [
        { href: "/terms", name: "Terms of Service" },
        { href: "/privacy", name: "Privacy Policy" },
        { href: "/help", name: "Help Center" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Twitter className="size-5" />, href: "#" },
    { icon: <Facebook className="size-5" />, href: "#" },
    { icon: <Github className="size-5" />, href: "#" },
  ];

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-16 py-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-muted-foreground">
              Your one-stop marketplace for trusted local services.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h3 className="font-headline font-semibold uppercase tracking-wider text-primary">
                  {nav.label}
                </h3>
                <ul className="mt-4 space-y-2">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t py-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ServiceWalla, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center space-x-2">
            {socialLinks.map((link, index) => (
              <Button key={index} variant="ghost" size="icon" asChild>
                <Link href={link.href}>{link.icon}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
