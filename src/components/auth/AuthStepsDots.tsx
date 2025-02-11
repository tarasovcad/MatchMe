import {motion} from "framer-motion";

const dotVariants = {
  active: {
    width: 20,
    height: 10,
    backgroundColor: "#7E72EE",
    scale: [1, 1.2, 1],
    rotate: [0, 10, 0],
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      times: [0, 0.5, 1],
    },
  },
  inactive: {
    width: 10,
    height: 10,
    backgroundColor: "var(--dot-inactive-color)",
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

const AuthStepsDots = ({
  totalSteps,
  currentStep,
}: {
  totalSteps: number;
  currentStep: number;
}) => {
  return (
    <div className="text-center">
      <div className="flex gap-2.5 items-center justify-center">
        {Array.from({length: totalSteps}, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          return (
            <motion.div
              key={stepNumber}
              initial={false}
              layout
              variants={dotVariants}
              animate={isActive ? "active" : "inactive"}
              className="rounded-full"
            />
          );
        })}
      </div>
    </div>
  );
};

export default AuthStepsDots;
