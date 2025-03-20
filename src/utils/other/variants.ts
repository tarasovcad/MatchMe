export const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

export const itemVariants = {
  hidden: {y: 20, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
      duration: 0.2,
    },
  },
};

export const bottomSectionButtonsVariants = {
  hidden: {y: 50, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
      duration: 0.3,
    },
  },
};
