/**
 * @jsx Jurol.createElement
 */
function Counter() {
  const [state, setState] = Jurol.useState(1);
  return <h1 onClick={() => setState((c) => c + 1)}>Count: {}</h1>;
}
