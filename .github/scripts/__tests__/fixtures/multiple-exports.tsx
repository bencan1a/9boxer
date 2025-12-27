/**
 * File with multiple exports - should extract the first one
 *
 * @component
 * @screenshots
 *   - multi-export-test: Test screenshot for multiple exports
 */
export const FirstComponent: React.FC = () => {
  return <div>First</div>;
};

export function SecondComponent() {
  return <div>Second</div>;
}
