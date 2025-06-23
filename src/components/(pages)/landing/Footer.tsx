import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import {Github, Instagram, Linkedin, Youtube} from "lucide-react";
import Image from "next/image";

// Types for better type safety
interface FooterLink {
  href: string;
  label: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Reusable FooterColumn component
const FooterColumn: React.FC<FooterColumn> = ({title, links}) => {
  return (
    <div>
      <h3 className="text-[15px] font-medium text-foreground mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  // Footer columns configuration - easily add, remove, or modify columns
  const footerColumns: FooterColumn[] = [
    {
      title: "Explore",
      links: [
        // {href: "/", label: "Home"},
        {href: "/projects", label: "Explore Projects"},
        {href: "/feed", label: "Community Feed"},
        {href: "/profiles", label: "Find People"},
        {href: "/pricing", label: "Plans"},
      ],
    },
    {
      title: "About",
      links: [
        {href: "/about", label: "About Us"},
        {href: "/our-mission", label: "Our Mission"},
        {href: "/faq", label: "FAQs"},
        // {href: "/blog", label: "Blog"},
        {href: "/contact", label: "Contact"},
      ],
    },
    {
      title: "Account",
      links: [
        {href: "/login", label: "Log In"},
        {href: "/signup", label: "Sign Up"},
        {href: "/dashboard", label: "My Dashboard"},
      ],
    },
    {
      title: "Legal",
      links: [
        {href: "/privacy", label: "Privacy Policy"},
        {href: "/terms", label: "Terms of Service"},
      ],
    },
  ];

  // Social links configuration
  const socialLinks: SocialLink[] = [
    {
      href: "https://x.com/tarasovcad",
      label: "Twitter",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: "https://instagram.com/tarasovcad",
      label: "Instagram",
      icon: <Instagram size={16} />,
    },
    {
      href: "https://tiktok.com/@matchme",
      label: "TikTok",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  // Calculate grid columns dynamically based on number of columns
  const getGridCols = (columnCount: number) => {
    if (columnCount <= 2) return "sm:grid-cols-2";
    if (columnCount <= 3) return "sm:grid-cols-3";
    if (columnCount <= 4) return "sm:grid-cols-4";
    return "sm:grid-cols-4 lg:grid-cols-5"; // For 5+ columns, use 4 on small screens, 5 on large
  };

  return (
    <footer className="bg-background">
      <div className="py-12 px-4 md:px-6 bg-background">
        {/* Main footer content */}
        <div className="flex items-stretch justify-between gap-8">
          {/* Logo and social section */}
          <div className="flex flex-col justify-between min-w-[200px]">
            <div className="flex flex-col gap-3">
              <Link href="/home" className="inline-flex">
                <Image src="/logo/full_logo.svg" alt="Logo" width={150} height={0} />
              </Link>
              <p className="text-[15px] text-foreground">Connect. Collaborate. Create.</p>
            </div>

            {/* Social icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}>
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
          {/* Dynamic columns section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div
              className={`grid grid-cols-2 gap-8 ${getGridCols(footerColumns.length)} lg:col-span-4`}>
              {footerColumns.map((column, index) => (
                <FooterColumn key={index} title={column.title} links={column.links} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 MatchMe Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
