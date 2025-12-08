// src/screens/main_screens/AvailabilityManagement.js

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { astrologerService } from '../../services/api/astrologer.service';

const { width } = Dimensions.get('window');

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const dayLabels = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function AvailabilityManagement() {
  // ✅ ALL HOOKS AT THE TOP - BEFORE ANY CONDITIONAL RENDERING
  const { state, updateAstrologer } = useAuth();
  const { astrologer } = state;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [online, setOnline] = useState(true);
  const [workingHours, setWorkingHours] = useState([]);
  const [showPicker, setShowPicker] = useState({
    visible: false,
    type: '',
    dayIndex: null,
    slotIndex: null,
  });

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const formatTime = (timeString) => {
    try {
      const date = parseTime(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);

      const response = await astrologerService.getAvailability();

      if (response.success && response.data) {
        const availability = response.data;

        setOnline(availability.isOnline || false);

        const hours = daysOfWeek.map(day => {
          const existingDay = availability.workingHours?.find(
            wh => wh.day.toLowerCase() === day
          );

          if (existingDay && existingDay.slots?.length > 0) {
            return {
              day,
              enabled: true,
              slots: existingDay.slots.map(slot => ({
                start: slot.start || '09:00',
                end: slot.end || '21:00',
                isActive: slot.isActive !== false,
              })),
            };
          }

          return {
            day,
            enabled: false,
            slots: [
              {
                start: '09:00',
                end: '21:00',
                isActive: true,
              },
            ],
          };
        });

        setWorkingHours(hours);
        console.log('✅ [Availability] Data loaded');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [Availability] Error:', error);
      Alert.alert('Error', error.message || 'Failed to load availability');
      setLoading(false);
    }
  }, []);

  const toggleOnline = useCallback(async () => {
    try {
      const newStatus = !online;

      const response = await astrologerService.toggleOnlineStatus(newStatus);

      if (response.success) {
        setOnline(newStatus);

        if (updateAstrologer) {
          updateAstrologer({
            availability: {
              ...astrologer?.availability,
              isOnline: newStatus,
            },
          });
        }

        console.log('✅ [Availability] Online status updated');
      }
    } catch (error) {
      console.error('❌ [Availability] Error:', error);
      Alert.alert('Error', error.message || 'Failed to update online status');
    }
  }, [online, astrologer, updateAstrologer]);

  const toggleDay = useCallback((dayIndex) => {
    setWorkingHours(prev => {
      const updated = [...prev];
      updated[dayIndex].enabled = !updated[dayIndex].enabled;
      return updated;
    });
  }, []);

  const showTimePicker = useCallback((type, dayIndex, slotIndex = 0) => {
    setShowPicker({
      visible: true,
      type,
      dayIndex,
      slotIndex,
    });
  }, []);

  const onTimeChange = useCallback(
    (event, selectedDate) => {
      if (Platform.OS === 'android') {
        setShowPicker(prev => ({ ...prev, visible: false }));
      }

      if (event.type === 'dismissed' || !selectedDate) {
        return;
      }

      const timeString = selectedDate.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      setWorkingHours(prev => {
        const updated = [...prev];
        const { dayIndex, slotIndex, type } = showPicker;

        if (type === 'start') {
          updated[dayIndex].slots[slotIndex].start = timeString;
        } else {
          updated[dayIndex].slots[slotIndex].end = timeString;
        }

        return updated;
      });

      if (Platform.OS === 'ios') {
        setShowPicker(prev => ({ ...prev, visible: false }));
      }
    },
    [showPicker]
  );

  const saveAvailability = useCallback(async () => {
    try {
      setSaving(true);

      const formattedHours = workingHours
        .filter(day => day.enabled)
        .map(day => ({
          day: day.day,
          slots: day.slots.map(slot => ({
            start: slot.start,
            end: slot.end,
            isActive: slot.isActive,
          })),
        }));

      console.log('💾 [Availability] Saving:', formattedHours);

      const response = await astrologerService.updateWorkingHours({
        workingHours: formattedHours,
      });

      if (response.success) {
        Alert.alert('Success', 'Availability settings saved successfully!');

        if (updateAstrologer) {
          updateAstrologer({
            availability: {
              ...astrologer?.availability,
              workingHours: formattedHours,
            },
          });
        }

        console.log('✅ [Availability] Saved successfully');
      }
    } catch (error) {
      console.error('❌ [Availability] Error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save availability settings'
      );
    } finally {
      setSaving(false);
    }
  }, [workingHours, astrologer, updateAstrologer]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // ✅ NOW SAFE TO RENDER CONDITIONALLY
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#372643" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Online Status Card */}
            <View
              style={[
                styles.statusCard,
                { borderLeftColor: online ? '#10B981' : '#EF4444' },
              ]}
            >
              <View style={styles.statusContent}>
                <View
                  style={[
                    styles.statusIcon,
                    { backgroundColor: online ? '#D1FAE5' : '#FEE2E2' },
                  ]}
                >
                  <Icon
                    name={online ? 'check-circle' : 'close-circle'}
                    size={24}
                    color={online ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>
                    {online ? 'Online' : 'Offline'}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {online
                      ? 'Visible to clients'
                      : 'Not accepting calls'}
                  </Text>
                </View>
                <Switch
                  value={online}
                  onValueChange={toggleOnline}
                  trackColor={{ false: '#FEE2E2', true: '#A7F3D0' }}
                  thumbColor={online ? '#10B981' : '#EF4444'}
                  ios_backgroundColor="#FEE2E2"
                />
              </View>
            </View>

            {/* Weekly Schedule */}
            <View style={styles.sectionHeader}>
              <Icon name="calendar-clock" size={18} color="#372643" />
              <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            </View>

            <View style={styles.scheduleContainer}>
              {workingHours.map((day, dayIndex) => (
                <View
                  key={day.day}
                  style={[
                    styles.dayRow,
                    dayIndex === workingHours.length - 1 && styles.lastDayRow,
                  ]}
                >
                  <View style={styles.dayInfo}>
                    <Switch
                      value={day.enabled}
                      onValueChange={() => toggleDay(dayIndex)}
                      trackColor={{ false: '#E5E7EB', true: '#E8EAF6' }}
                      thumbColor={day.enabled ? '#372643' : '#9CA3AF'}
                      ios_backgroundColor="#E5E7EB"
                      style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                    />
                    <Text
                      style={[
                        styles.dayName,
                        !day.enabled && styles.disabledText,
                      ]}
                    >
                      {dayLabels[day.day]}
                    </Text>
                  </View>

                  {day.enabled ? (
                    <View style={styles.timeSelector}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => showTimePicker('start', dayIndex, 0)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.timeText}>
                          {formatTime(day.slots[0].start)}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.dash}>-</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => showTimePicker('end', dayIndex, 0)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.timeText}>
                          {formatTime(day.slots[0].end)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.closedText}>Closed</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Icon name="information-outline" size={20} color="#372643" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>
                  Set your weekly availability. Clients can only book during your available hours.
                </Text>
              </View>
            </View>

            {/* Timezone */}
            <View style={styles.timezoneContainer}>
              <Icon name="earth" size={14} color="#6B7280" />
              <Text style={styles.timezoneText}>India Standard Time (IST)</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveAvailability}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="content-save" size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Time Picker */}
          {showPicker.visible && showPicker.dayIndex !== null && (
            <DateTimePicker
              value={
                showPicker.type === 'start'
                  ? parseTime(
                      workingHours[showPicker.dayIndex].slots[
                        showPicker.slotIndex
                      ].start
                    )
                  : parseTime(
                      workingHours[showPicker.dayIndex].slots[
                        showPicker.slotIndex
                      ].end
                    )
              }
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Math.min(width * 0.04, 16),
    paddingBottom: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#372643',
    marginLeft: 8,
  },

  scheduleContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastDayRow: {
    borderBottomWidth: 0,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width < 360 ? '35%' : '40%',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  disabledText: {
    color: '#9CA3AF',
  },

  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: '#E8EAF6',
    paddingVertical: 6,
    paddingHorizontal: width < 360 ? 8 : 10,
    borderRadius: 6,
  },
  timeText: {
    color: '#372643',
    fontSize: 12,
    fontWeight: '600',
  },
  dash: {
    marginHorizontal: 6,
    color: '#9CA3AF',
    fontSize: 14,
  },
  closedText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
  },

  infoCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#372643',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },

  timezoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  timezoneText: {
    color: '#6B7280',
    fontSize: 11,
  },

  saveButton: {
    backgroundColor: '#372643',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#372643',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
