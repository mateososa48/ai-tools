import Link from "next/link";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  Discover: [
    { href: "/tools", label: "Browse Tools" },
    { href: "/categories", label: "Categories" },
    { href: "/search", label: "AI Search" },
  ],
  Categories: [
    { href: "/categories/writing-content", label: "Writing & Content" },
    { href: "/categories/image-design", label: "Image & Design" },
    { href: "/categories/coding-development", label: "Coding & Dev" },
    { href: "/categories/video-audio", label: "Video & Audio" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/suggest", label: "Suggest a Tool" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              {APP_NAME}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Discover the perfect AI tools for your needs. No jargon, just honest recommendations.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
