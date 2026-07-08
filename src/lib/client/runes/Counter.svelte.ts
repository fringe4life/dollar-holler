export class Counter {
  count = $state(0);

  increment = () => (this.count += 1);

  decrement = () => (this.count -= 1);

  reset = () => {
    this.count = 0;
  };
}
