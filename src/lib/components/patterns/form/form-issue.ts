/** Shape returned by SvelteKit remote `form.fields.*.issues()`. */
export type FormIssue = {
  message: string;
  path: ReadonlyArray<string | number>;
};

/** Stable {#each} key: path identifies the field; message disambiguates multiple rules on one field. */
export const formIssueKey = (issue: FormIssue): string =>
  `${issue.path.map(String).join(".")}::${issue.message}`;
