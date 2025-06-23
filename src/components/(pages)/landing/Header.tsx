"use client";
import {InfoIcon, Mail, Rocket} from "lucide-react";
import * as React from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Button} from "@/components/shadcn/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";

import {cn} from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/shadcn/navigation-menu";
import Logo from "@/components/ui/Logo";
import Link from "next/link";
import {User} from "@supabase/supabase-js";
import {useState, useEffect} from "react";

const navigationLinks = [
  {href: "/home", label: "Home"},
  {
    label: "Features",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/profiles",
        label: "Explore Profiles",
        description: "Discover talented developers and their portfolios",
      },
      {
        href: "/projects",
        label: "Explore Projects",
        description: "Browse innovative projects and find inspiration",
      },
      {
        href: "/feed",
        label: "Explore Feed",
        description: "See what the community is building, sharing, and discussing",
      },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [
      {
        href: "/about",
        label: "About Us",
        description: "Learn more about MatchMe and our journey",
        icon: <InfoIcon size={16} className="text-foreground opacity-60" aria-hidden="true" />,
      },
      {
        href: "/contact",
        label: "Contact Us",
        description: "Get in touch with our team for questions or feedback",
        icon: <Mail size={16} className="text-foreground opacity-60" aria-hidden="true" />,
      },
      {
        href: "/our-mission",
        label: "Our Mission",
        description: "Understand our values and the vision behind MatchMe",
        icon: <Rocket size={16} className="text-foreground opacity-60" aria-hidden="true" />,
      },
    ],
  },
  {href: "/pricing", label: "Pricing"},
  {href: "/blog", label: "Blog"},
];

export default function Header({user}: {user?: User | null}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScrollBlock = () => {
      const isMdOrLarger = window.innerWidth >= 768;

      if (isMobileMenuOpen && !isMdOrLarger) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };

    handleScrollBlock();
    window.addEventListener("resize", handleScrollBlock);

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", handleScrollBlock);
    };
  }, [isMobileMenuOpen]);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border px-4 md:px-6 bg-background">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/home" className="">
              <Logo />
            </Link>
          </div>

          {/* Navigation menu */}
          <NavigationMenu viewport={false} className="max-md:hidden">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  {link.submenu ? (
                    <>
                      <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground bg-transparent px-2 py-1.5 font-medium *:[svg]:-me-0.5 *:[svg]:size-3.5">
                        {link.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
                        <ul className={cn(link.type === "description" ? "min-w-64" : "min-w-48")}>
                          {link.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <NavigationMenuLink href={item.href} className="py-1.5">
                                {/* Display icon if present */}
                                {link.type === "icon" && "icon" in item && (
                                  <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span>{item.label}</span>
                                  </div>
                                )}

                                {/* Display label with description if present */}
                                {link.type === "description" && "description" in item ? (
                                  <div className="space-y-1">
                                    <div className="font-medium">{item.label}</div>
                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                      {item.description}
                                    </p>
                                  </div>
                                ) : (
                                  // Display simple label if not icon or description type
                                  !link.type ||
                                  (link.type !== "icon" && link.type !== "description" && (
                                    <span>{item.label}</span>
                                  ))
                                )}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      href={link.href}
                      className="text-foreground/80 hover:text-foreground py-1.5 font-medium">
                      {link.label}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            className="group size-8 md:hidden cursor-pointer"
            variant="ghost"
            size="icon"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg
              className="pointer-events-none h-[18px] w-[18px] max-[500px]:h-[20px] max-[500px]:w-[20px]"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 12L20 12"
                className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
              />
              <path
                d="M4 12H20"
                className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
              />
              <path
                d="M4 12H20"
                className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
              />
            </svg>
          </Button>

          {user ? (
            <div className="cursor-pointer hidden md:block">
              <Link href="/dashboard" className="cursor-pointer w-full">
                <Button
                  variant={"default"}
                  size={"sm"}
                  className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3 text-sm">
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="items-center gap-2 hidden md:flex">
              <Link href="/login" className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="cursor-pointer ">
                <Button
                  variant={"default"}
                  size={"sm"}
                  className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3 text-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <AnimatePresence>{isMobileMenuOpen && <MobileMenu user={user} />}</AnimatePresence>
    </>
  );
}

const MobileMenu = ({user}: {user?: User | null}) => {
  return (
    <motion.div
      className="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-background border-t border-border/40 z-40 overflow-y-auto md:hidden"
      initial={{opacity: 0, y: -20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}>
      <div className="flex flex-col h-full">
        {/* Main Navigation - scrollable content */}
        <motion.div
          className="flex-1 overflow-y-auto"
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.05, duration: 0.2}}>
          <div className="p-4 pt-4">
            <Accordion type="multiple" className="w-full space-y-2">
              {navigationLinks.map((link, index) => (
                <div key={index} className="border-b border-border pb-2 last:border-b-0">
                  {link.submenu ? (
                    <AccordionItem value={link.label} className="border-0">
                      <AccordionTrigger className="py-2 px-0 cursor-pointer  hover:no-underline text-foreground  hover:text-foreground/80 font-medium max-[500px]:text-base">
                        {link.label}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2 pt-0">
                        <div className="pl-4 space-y-2">
                          {link.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href || "#"}
                              className="block py-2 text-sm text-muted-foreground hover:text-foreground">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">{item.label}</div>
                                {"description" in item && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <Link
                      href={link.href || "#"}
                      className="block py-2 text-foreground hover:text-foreground/80 font-medium text-sm max-[500px]:text-base">
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </Accordion>
          </div>
        </motion.div>

        {/* Bottom section - Authentication Buttons and Footer */}
        <motion.div
          className="flex-shrink-0 p-4 border-t border-border bg-background"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1, duration: 0.2}}>
          <div className="space-y-3 mb-6">
            {user ? (
              <Link href="/dashboard" className="cursor-pointer w-full">
                <Button
                  variant={"default"}
                  size={"sm"}
                  className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3 text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="cursor-pointer w-full block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="cursor-pointer w-full block">
                  <Button
                    variant={"default"}
                    size={"sm"}
                    className="cursor-pointer w-full gap-2 h-8 rounded-[6px] px-3 text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground">
                About us
              </Link>
              <Link href="/press" className="block text-muted-foreground hover:text-foreground">
                Press
              </Link>
              <Link href="/careers" className="block text-muted-foreground hover:text-foreground">
                Careers
              </Link>
              <Link href="/legal" className="block text-muted-foreground hover:text-foreground">
                Legal
              </Link>
            </div>
            <div className="space-y-3">
              <Link href="/support" className="block text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/sitemap" className="block text-muted-foreground hover:text-foreground">
                Sitemap
              </Link>
              <Link href="/cookies" className="block text-muted-foreground hover:text-foreground">
                Cookie settings
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
