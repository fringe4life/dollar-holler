/**
 * @abstract converts the date to one to be presented to a user
 * @param {string|undefined} myDate a string representation of a date
 * @returns {string} unknown if myDate is undefined otherwise a formatted date
 */
export const convertDate = (myDate: string | null): string => {
  if (!myDate) return "Unknown";
  const dateFormatter = new Intl.DateTimeFormat();
  const date = new Date(myDate);
  return dateFormatter.format(date);
};

/**
 * @abstract takes a date to determine if the invoice is overdue
 * @param {string|undefined} myDate string or undefined
 * @returns {boolean} it is either late or not
 */
export const isLate = (myDate: string | null): boolean => {
  if (!myDate) return false;

  const [year, month, date] = splitDate(myDate);
  const dueDate = new Date(parseInt(year), parseInt(month), parseInt(date));
  return dueDate.getTime() < Date.now();
};

/**
 * @abstract splits a string version of a date with the formatting ##-##-####
 * @param myDate a string to be split based on the encoding being 12-05-2024
 * @returns {string[]} an array of strings
 */
export const splitDate = (myDate: string): string[] => {
  return myDate.split("-");
};

export const today = new Date().toISOString().split("T")[0];
