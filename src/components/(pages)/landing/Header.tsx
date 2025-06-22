import {BookOpenIcon, InfoIcon, LifeBuoyIcon, Mail, Rocket} from "lucide-react";
import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {Slot} from "radix-ui";

import {cn} from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/shadcn/navigation-menu";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import Logo from "@/components/ui/Logo";
import Link from "next/link";

const navigationLinks = [
  {href: "#", label: "Home"},
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

export default function Header() {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="group size-8 md:hidden" variant="ghost" size="icon">
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
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
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      {link.submenu ? (
                        <>
                          <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                            {link.label}
                          </div>
                          <ul>
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink href={item.href} className="py-1.5">
                                  {item.label}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <NavigationMenuLink href={link.href} className="py-1.5">
                          {link.label}
                        </NavigationMenuLink>
                      )}
                      {/* Add separator between different types of items */}
                      {index < navigationLinks.length - 1 &&
                        // Show separator if:
                        // 1. One is submenu and one is simple link OR
                        // 2. Both are submenus but with different types
                        ((!link.submenu && navigationLinks[index + 1].submenu) ||
                          (link.submenu && !navigationLinks[index + 1].submenu) ||
                          (link.submenu &&
                            navigationLinks[index + 1].submenu &&
                            link.type !== navigationLinks[index + 1].type)) && (
                          <div
                            role="separator"
                            aria-orientation="horizontal"
                            className="bg-border -mx-1 my-1 h-px w-full"
                          />
                        )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link href="/home" className="">
              <Logo />
            </Link>
          </div>
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
        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <a href="#">Sign In</a>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <a href="#">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button, buttonVariants};
