import { Redirect } from 'expo-router';

// Entry point — always start at Today tab
export default function Index() {
  return <Redirect href="/(tabs)/today" />;
}
