import { Text, View } from 'react-native';

import { styles } from './styles';

export function Item({ data }) {
  return (
    <View style={styles.container}>
      <Text style={styles.percentage}>
        {data.percentage}
      </Text>

      <Text style={styles.title}>
        {data.name}
      </Text>
    </View>
  );
}