/**
 * Component with invalid annotation format
 *
 * @component
 * @screenshots
 *   missing-colon-here Description without colon
 *   - valid-one: This one is valid
 *   - INVALID_CAPS: This has uppercase letters
 */
export const InvalidAnnotation: React.FC = () => {
  return <div>Invalid</div>;
};
