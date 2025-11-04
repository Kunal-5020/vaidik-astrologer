import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import countries from '../Data/countries.json';

const CountryCodePicker = ({ onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({
    name: 'India',
    code: 'IN',
    dial_code: '91',
    flag: 'https://flagcdn.com/w20/in.png',
  });

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = item => {
    setSelected(item);
    setModalVisible(false);
    onSelect?.(item);
  };

  return (
    <>
      {/* Country selector in phone input row */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: selected.flag }} style={styles.flag} />
        <Text style={styles.code}>+{selected.dial_code}</Text>
      </TouchableOpacity>

      {/* Modal list of countries */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Select Country</Text>

            <TextInput
              placeholder="Search..."
              placeholderTextColor="#666"
              style={styles.search}
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => handleSelect(item)}
                >
                  <Image source={{ uri: item.flag }} style={styles.flagLarge} />
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.dial}>+{item.dial_code}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  flag: {
    width: 25,
    height: 18,
    marginRight: 5,
  },
  code: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: 'black',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  flagLarge: {
    width: 28,
    height: 20,
    marginRight: 10,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  dial: {
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 10,
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CountryCodePicker;
