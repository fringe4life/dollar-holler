import type { Maybe } from "$lib/types";

const DATE_FORMATTER = new Intl.DateTimeFormat();
/**
 * @abstract converts the date to one to be presented to a user
 * @param {Maybe<string>} myDate a string representation of a date
 * @returns {string} unknown if myDate is undefined otherwise a formatted date
 */
export const convertDate = (myDate: Maybe<string>): string => {
  if (!myDate) {
    return "Unknown";
  }
  const date = new Date(myDate);
  return DATE_FORMATTER.format(date);
};

/**
 * @abstract takes a date to determine if the invoice is overdue
 * @param {Maybe<string>} myDate string or undefined
 * @returns {boolean} it is either late or not
 */
export const isLate = (myDate: Maybe<string>): boolean => {
  if (!myDate) {
    return false;
  }

  const [year, month, date] = splitDate(myDate);
  const dueDate = new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10),
    Number.parseInt(date, 10)
  );
  return dueDate.getTime() < Date.now();
};

/**
 * @abstract splits a string version of a date with the formatting ##-##-####
 * @param myDate a string to be split based on the encoding being 12-05-2024
 * @returns {string[]} an array of strings
 */
const splitDate = (myDate: string): string[] => myDate.split("-");

export const today = new Date().toISOString().split("T")[0];

/**
 * Converts a Date or ISO string to "yyyy-MM-dd" for HTML date inputs.
 * @param date - Date object or ISO date string
 * @returns "yyyy-MM-dd" string, or today if invalid
 */
export const toDateInputValue = (date: Maybe<Date | string>): string => {
  if (date == null) {
    return today;
  }
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return today;
  }
  return d.toISOString().split("T")[0];
};
