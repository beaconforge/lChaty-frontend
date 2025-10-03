import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface Props {
  value: unknown;
  theme?: 'light' | 'dark';
}

export function JSONViewer({ value, theme = 'light' }: Props) {
  return <JsonView data={value} shouldInitiallyExpand={() => true} style={theme === 'dark' ? darkStyles : defaultStyles} />;
}
