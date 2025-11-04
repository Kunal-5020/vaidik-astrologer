import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const buttons = [
  { label: 'Call', icon: 'call-outline', color: '#7e57c2' },
  { label: 'Chat', icon: 'chatbox-ellipses-outline', color: '#ff9800' },
  { label: 'Report', icon: 'document-text-outline', color: '#f44336' },
  { label: 'Query', icon: 'help-circle-outline', color: '#ff5722' },
  { label: 'VaidikMall', icon: 'cart-outline', color: '#2196f3' },
  { label: 'Wallet', icon: 'wallet-outline', color: '#9c27b0' },
  { label: 'Waitlist', icon: 'list-circle-outline', color: '#4caf50' },
  { label: 'Offer', icon: 'gift-outline', color: '#3f51b5' },
  { label: 'Support', icon: 'headset-outline', color: '#311b92' },
  { label: 'My Reviews', icon: 'people-circle-outline', color: '#ffca28' },
  { label: 'Ranking', icon: 'ribbon-outline', color: '#ffa726' },
  { label: 'Ticket', icon: 'warning-outline', color: '#e53935' },
];

const DashboardScreen1 = () => {
  const { width } = useWindowDimensions();
  const numColumns = 3;
  const itemSize = width / numColumns - 24;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, { width: itemSize }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={28} color="#fff" />
      </View>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.headText}>Dashboard</Text>
      </View>
      <FlatList
        data={buttons}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        // contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={9}
        initialNumToRender={6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  item: {
    margin: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#000333',
    borderRadius: 10,
    height: 150,
  },
  iconContainer: {
    padding: 25,
    borderRadius: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  header:{
    marginBottom:10,
    marginVertical:-10
  },
  headText:{
    fontSize:24,
    color:'blue'
  }
});

export default DashboardScreen1;
