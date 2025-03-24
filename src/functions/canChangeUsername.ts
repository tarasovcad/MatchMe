export function canChangeUsername(lastChangedDate: Date | null) {
  if (!lastChangedDate) return {canChange: true, nextAvailableDate: null};

  const lastChange = new Date(lastChangedDate);
  const currentDate = new Date();

  // Get next available date (1 month after last change)
  const nextAvailableDate = new Date(lastChange);
  nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 1);

  // Check if enough time has passed
  if (currentDate < nextAvailableDate) {
    const formattedDate = nextAvailableDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      canChange: false,
      nextAvailableDate: formattedDate,
    };
  }

  return {canChange: true, nextAvailableDate: null};
}
