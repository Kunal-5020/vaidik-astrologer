import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Switch, Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

export default function AccountSettingsScreen() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [vibration, setVibration] = useState(true);
  const [notifications, setNotifications] = useState({
    order: true,
    payment: false,
    marketing: true,
    rating: false,
  });

  // Language dropdown
  const [language, setLanguage] = useState('English');
  const [languageOpen, setLanguageOpen] = useState(false);

  // Logout Timer dropdown
  const [logoutTimer, setLogoutTimer] = useState('Never');
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Security */}
        <Text style={styles.sectionTitle}>Account Security</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="lock-outline" size={22} color="#4A4A4A" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Change Password</Text>
                <Text style={styles.rowSubtitle}>Update your password</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="shield-check-outline" size={22} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Two-Factor Authentication</Text>
                <Text style={styles.rowSubtitle}>Extra security layer</Text>
              </View>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              color="#6200EE"
            />
          </View>
        </View>

        {/* Notification Preferences */}
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        {[
          {
            key: 'order',
            title: 'Order Notifications',
            subtitle: 'New consultation requests',
          },
          {
            key: 'payment',
            title: 'Payment Notifications',
            subtitle: 'Earnings and transactions',
          },
          {
            key: 'marketing',
            title: 'Marketing Notifications',
            subtitle: 'Updates and promotions',
          },
          {
            key: 'rating',
            title: 'Rating & Reviews',
            subtitle: 'Customer feedback alerts',
          },
        ].map(item => (
          <View key={item.key} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Icon name="bell-outline" size={22} color="#4A4A4A" />
                </View>
                <View>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={notifications[item.key]}
                onValueChange={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key],
                  })
                }
                color="#6200EE"
              />
            </View>
          </View>
        ))}

        {/* App Preferences */}
        <Text style={styles.sectionTitle}>App Preferences</Text>

        {/* Language Dropdown */}
        <View style={styles.card}>
          <View style={styles.rowLeft}>
            <View style={styles.iconCircleForLagTimer}>
              <Icon name="translate" size={22} color="#4A4A4A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Language</Text>
              <DropDownPicker
                open={languageOpen}
                value={language}
                items={[
                  { label: 'English', value: 'English' },
                  { label: 'Hindi', value: 'Hindi' },
                  { label: 'Tamil', value: 'Tamil' },
                ]}
                setOpen={setLanguageOpen}
                setValue={setLanguage}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
          </View>
        </View>

        {/* Dark Mode */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="weather-night" size={22} color="#4A4A4A" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowSubtitle}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              color="#6200EE"
            />
          </View>
        </View>

        {/* Auto-Logout Timer Dropdown */}
        <View style={styles.card}>
          <View style={styles.rowLeft}>
            <View style={styles.iconCircleForLagTimer}>
              <Icon name="clock-outline" size={22} color="#4A4A4A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Auto-Logout Timer</Text>
              <DropDownPicker
                open={timerOpen}
                value={logoutTimer}
                items={[
                  { label: '15 minutes', value: '15min' },
                  { label: '30 minutes', value: '30min' },
                  { label: '1 hour', value: '1hr' },
                  { label: 'Never', value: 'Never' },
                ]}
                setOpen={setTimerOpen}
                setValue={setLogoutTimer}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>
          </View>
        </View>

        {/* Vibration */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="vibrate" size={22} color="#4A4A4A" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Vibration</Text>
                <Text style={styles.rowSubtitle}>Haptic feedback</Text>
              </View>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              color="#6200EE"
            />
          </View>
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="shield-outline" size={22} color="#4A4A4A" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Privacy Settings</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Icon name="database-outline" size={22} color="#4A4A4A" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Data & Storage</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: 'red' }]}>Danger Zone</Text>
        <View style={styles.dangerZone}>
          <Button
            mode="outlined"
            textColor="red"
            style={styles.dangerButton}
            onPress={() => console.log('Clear Cache')}
          >
            Clear Cache
          </Button>

          <Button
            mode="contained"
            buttonColor="red"
            onPress={() => console.log('Delete Account')}
          >
            Delete Account
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA',alignContent:'center' },
  header: {
    backgroundColor: '#6200EE',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth:0.5,
    borderColor:'lightgrey'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 30,
  },
  iconCircleForLagTimer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 30,
    bottom: 25,
  },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  rowSubtitle: { fontSize: 12, color: '#888' },
  dangerZone: {
    marginVertical: 20,
    marginHorizontal: 16,
    gap: 10,
  },
  dangerButton: { borderColor: 'red' },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    height: 55,
    marginTop: 6,
  },
  dropdownContainer: {
    borderColor: '#ddd',
  },
});
