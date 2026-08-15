const FLAG_CDN_BASE = "https://flagcdn.com";

/** flagcdn.com covers the 50 states but has no District of Columbia flag. */
const STATES_WITHOUT_FLAGS = new Set(["DC"]);

export interface StateFlag {
  src: string;
  srcset: string;
}

/**
 * flagcdn.com US state flag urls (`us-<code>` naming, e.g. `us-ca`).
 * Returns `null` when no flag is available so callers can render a fallback.
 */
export const stateFlag = (value: string): StateFlag | null => {
  if (STATES_WITHOUT_FLAGS.has(value)) {
    return null;
  }
  const code = `us-${value.toLowerCase()}`;
  return {
    src: `${FLAG_CDN_BASE}/24x18/${code}.png`,
    srcset: `${FLAG_CDN_BASE}/48x36/${code}.png 2x, ${FLAG_CDN_BASE}/72x54/${code}.png 3x`,
  };
};

export const states = [
  {
    name: "Alaska",
    value: "AK",
  },
  {
    name: "Alabama",
    value: "AL",
  },
  {
    name: "Arkansas",
    value: "AR",
  },
  {
    name: "Arizona",
    value: "AZ",
  },
  {
    name: "California",
    value: "CA",
  },
  {
    name: "Colorado",
    value: "CO",
  },
  {
    name: "Connecticut",
    value: "CT",
  },
  {
    name: "District of Columbia",
    value: "DC",
  },
  {
    name: "Delaware",
    value: "DE",
  },
  {
    name: "Florida",
    value: "FL",
  },
  {
    name: "Georgia",
    value: "GA",
  },
  {
    name: "Hawaii",
    value: "HI",
  },
  {
    name: "Iowa",
    value: "IA",
  },
  {
    name: "Idaho",
    value: "ID",
  },
  {
    name: "Illinois",
    value: "IL",
  },
  {
    name: "Indiana",
    value: "IN",
  },
  {
    name: "Kansas",
    value: "KS",
  },
  {
    name: "Kentucky",
    value: "KY",
  },
  {
    name: "Louisiana",
    value: "LA",
  },
  {
    name: "Massachusetts",
    value: "MA",
  },
  {
    name: "Maryland",
    value: "MD",
  },
  {
    name: "Maine",
    value: "ME",
  },
  {
    name: "Michigan",
    value: "MI",
  },
  {
    name: "Minnesota",
    value: "MN",
  },
  {
    name: "Missouri",
    value: "MO",
  },
  {
    name: "Mississippi",
    value: "MS",
  },
  {
    name: "Montana",
    value: "MT",
  },
  {
    name: "North Carolina",
    value: "NC",
  },
  {
    name: "North Dakota",
    value: "ND",
  },
  {
    name: "Nebraska",
    value: "NE",
  },
  {
    name: "New Hampshire",
    value: "NH",
  },
  {
    name: "New Jersey",
    value: "NJ",
  },
  {
    name: "New Mexico",
    value: "NM",
  },
  {
    name: "Nevada",
    value: "NV",
  },
  {
    name: "New York",
    value: "NY",
  },
  {
    name: "Ohio",
    value: "OH",
  },
  {
    name: "Oklahoma",
    value: "OK",
  },
  {
    name: "Oregon",
    value: "OR",
  },
  {
    name: "Pennsylvania",
    value: "PA",
  },
  {
    name: "Rhode Island",
    value: "RI",
  },
  {
    name: "South Carolina",
    value: "SC",
  },
  {
    name: "South Dakota",
    value: "SD",
  },
  {
    name: "Tennessee",
    value: "TN",
  },
  {
    name: "Texas",
    value: "TX",
  },
  {
    name: "Utah",
    value: "UT",
  },
  {
    name: "Virginia",
    value: "VA",
  },
  {
    name: "Vermont",
    value: "VT",
  },
  {
    name: "Washington",
    value: "WA",
  },
  {
    name: "Wisconsin",
    value: "WI",
  },
  {
    name: "West Virginia",
    value: "WV",
  },
  {
    name: "Wyoming",
    value: "WY",
  },
];
