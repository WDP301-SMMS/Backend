export const getSchoolYear = (): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Determine the school year based on the current date
  if (month < 8) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};
