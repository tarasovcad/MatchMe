export const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      duration: 0.05,
      when: "beforeChildren",
      staggerChildren: 0.02,
    },
  },
} as const;

export const itemVariants = {
  hidden: {y: 20, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      duration: 0.1,
    },
  },
} as const;

export const bottomSectionButtonsVariants = {
  hidden: {y: 50, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 18,
      duration: 0.15,
    },
  },
} as const;

// DROPDOWN MENU

export const menuVariants = {
  closed: {
    clipPath: "inset(10% 50% 90% 50% round 1px)",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.15,
    },
  },
  open: {
    clipPath: "inset(0% 0% 0% 0% round 1px)",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.15,
      staggerChildren: 0.02,
      delayChildren: 0.05,
    },
  },
} as const;

export const itemDropdownVariants = {
  closed: {opacity: 0, scale: 0.3, filter: "blur(20px)"},
  open: {opacity: 1, scale: 1, filter: "blur(0px)"},
};

export const userInfoVariants = {
  closed: {opacity: 0, filter: "blur(20px)"},
  open: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.15,
      type: "spring",
      bounce: 0,
    },
  },
} as const;

export const pageContainerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

export const pageHeaderVariants = {
  hidden: {opacity: 0, y: -20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
} as const;

export const newPeopleVariants = {
  hidden: {scale: 0.8, opacity: 0},
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export const controlsSectionVariants = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
} as const;

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;
