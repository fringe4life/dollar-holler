import type { Maybe } from "#lib/types.ts";

const DATE_FORMATTER = new Intl.DateTimeFormat();
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

/**
 * @abstract formats a date as the month and year it started, e.g. "March 2024"
 * @param {Maybe<Date | string>} myDate the date to present
 * @returns {string} unknown when the value is missing or unparseable
 */
export const convertMonthYear = (myDate: Maybe<Date | string>): string => {
  if (!myDate) {
    return "Unknown";
  }
  const date = new Date(myDate);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : MONTH_YEAR_FORMATTER.format(date);
};
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

const getInputDate = (date: Date = new Date()) => {
  return date.toISOString().split("T")[0];
};

export const today = getInputDate();
/**
 * Converts a Date or ISO string to "yyyy-MM-dd" for HTML date inputs.
 * @param date - Date object or ISO date string
 * @returns "yyyy-MM-dd" string, or today if invalid
 */
export const toDateInputValue = (date: Maybe<Date | string>): string => {
  if (!date) {
    return today;
  }
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return today;
  }
  return getInputDate(d);
};
