/**
 * Per-instance state for triggering a swipe reset (e.g. from a Cancel button).
 * Use one instance per row so each row has its own trigger state.
 *
 * Usage:
 *   const reset = new SwipeTriggerReset();
 *   {@attach swipe({ triggerReset: reset.triggerReset, onResetComplete: reset.handleResetComplete })}
 *   <button onclick={reset.requestReset}>Cancel</button>
 */
export class SwipeTriggerReset {
  triggerReset = $state(false);

  requestReset = () => {
    this.triggerReset = true;
  };

  handleResetComplete = () => {
    this.triggerReset = false;
  };
}
