import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchServices, updateServiceStatus } from '../../api/services';

const MyServicesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [activeServices, setActiveServices] = useState({});

  const MyServies = [
    {
      key: 'chat',
      title: 'Chat Consultation',
      sales: '111,001 Sales',
      rate: '₹8/min',
      earnings: '₹479',
      consults: 48,
    },
    {
      key: 'voice',
      title: 'Voice Call',
      sales: '302 Sales',
      rate: '₹10/min',
      earnings: '₹425',
      consults: 474,
    },
    {
      key: 'video',
      title: 'Video Call',
      sales: '302 Sales',
      rate: '₹20/min',
      earnings: '₹0',
      consults: 0,
    },
    {
      key: 'live',
      title: 'Live Stream Session',
      sales: '45 Sessions',
      rate: '₹50/session',
      earnings: '₹0',
      consults: 0,
    },
  ];

  // ✅ Load saved + backend data and merge
  useEffect(() => {
    const initializeData = async () => {
      try {
        const savedState = await AsyncStorage.getItem('activeServices');
        const localToggles = savedState ? JSON.parse(savedState) : {};

        const apiData = await fetchServices();
        const fetchedServices = apiData?.services || [];

        // merge backend services with local toggles
        const mergedToggles = {};
        fetchedServices.forEach(s => {
          mergedToggles[s.key] = localToggles[s.key] ?? false;
        });

        setServices(fetchedServices);
        setActiveServices(mergedToggles);
      } catch (err) {
        console.log('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // ✅ Toggle + save locally + sync API
  const toggleService = async key => {
    try {
      const updated = { ...activeServices, [key]: !activeServices[key] };
      setActiveServices(updated);
      await AsyncStorage.setItem('activeServices', JSON.stringify(updated));

      await updateServiceStatus(key, updated[key]);
    } catch (err) {
      console.log('API sync failed:', err.message);
      Alert.alert('Offline Mode', 'Changes will sync later when online.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 10 }}>Loading your services...</Text>
      </View>
    );
  }

  const handleSetting = () =>{
    navigation.navigate('Setting')
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity onPress={handleSetting}>
          <Icon name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Active Services</Text>

        {MyServies.map(item => (
          <View key={item.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Switch
                value={!!activeServices[item.key]}
                onValueChange={() => toggleService(item.key)}
                trackColor={{ false: '#ccc', true: '#6C63FF' }}
                thumbColor={'#fff'}
              />
            </View>
            <Text style={styles.salesText}>{item.sales}</Text>
            <Text style={styles.rateText}>{item.rate}</Text>
            <Text style={styles.earningText}>Earnings: {item.earnings}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Additional Services</Text>
        {[
          { key: 'kundli', title: 'Kundli Making' },
          { key: 'tarot', title: 'Tarot Card Reading' },
          { key: 'palmistry', title: 'Palmistry' },
          { key: 'numerology', title: 'Numerology Report' },
        ].map(item => (
          <View key={item.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Switch
                value={!!activeServices[item.key]}
                onValueChange={() => toggleService(item.key)}
                trackColor={{ false: '#ccc', true: '#6C63FF' }}
                thumbColor={'#fff'}
              />
            </View>
          </View>
        ))}

        {/* Pro Tip */}
        <View style={styles.proTipCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={styles.proTipIconBox}>
              <MaterialIcons
                name="lightbulb-outline"
                size={22}
                color="#FF7A00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.proTipTitle}>Pro Tip</Text>
              <Text style={styles.proTipText}>
                Enable more services to increase your visibility and earnings
                potential.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    backgroundColor: '#F5F6FA',
    width: '100%',
  },
  header: {
    width: '100%',
    height:60,
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 15, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  salesText: { fontSize: 13, color: '#666', marginTop: 5 },
  rateText: { color: '#FF7A00', fontWeight: '700', marginTop: 4 },
  earningText: { color: '#333', fontSize: 13, marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  proTipCard: {
    backgroundColor: '#FFF5E5',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  proTipTitle: { color: '#FF7A00', fontWeight: '700', marginBottom: 4 },
  proTipText: { color: '#333', fontSize: 13 },
  proTipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default MyServicesScreen;
