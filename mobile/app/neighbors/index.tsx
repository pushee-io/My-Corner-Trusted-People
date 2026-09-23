import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { NeighborResults } from '@/components/NeighborResults';
import { reportStyles } from '@/components/JobReportParts';
export default function Neighbors() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <Screen title="Neighbors">
      <TextInput
        accessibilityLabel="Search eligible neighbors"
        placeholder="Search by public name"
        value={query}
        onChangeText={setQuery}
        maxLength={80}
        style={[reportStyles.input, { minHeight: 48 }]}
      />
      <NeighborResults query={debounced} />
    </Screen>
  );
}
