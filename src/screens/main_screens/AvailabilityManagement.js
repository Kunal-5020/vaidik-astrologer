import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityManagement() {
  const [online, setOnline] = useState(true);

  const [days, setDays] = useState(
    daysOfWeek.map((day) => ({
      name: day,
      enabled: true,
      startTime: new Date(2025, 0, 1, 9, 0),
      endTime: new Date(2025, 0, 1, 21, 0),
    }))
  );

  const [breakStart, setBreakStart] = useState(new Date(2025, 0, 1, 13, 0));
  const [breakEnd, setBreakEnd] = useState(new Date(2025, 0, 1, 14, 0));
  const [autoOffline, setAutoOffline] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const [showPicker, setShowPicker] = useState({
    visible: false,
    type: "",
    index: null,
  });

  const toggleOnline = () => setOnline(!online);

  const toggleDay = (index) => {
    const updated = [...days];
    updated[index].enabled = !updated[index].enabled;
    setDays(updated);
  };

  const showTimePicker = (type, index = null) => {
    setShowPicker({ visible: true, type, index });
  };

  const onTimeChange = (event, selectedDate) => {
    if (!selectedDate) {
      setShowPicker({ ...showPicker, visible: false });
      return;
    }

    if (showPicker.type.includes("break")) {
      if (showPicker.type === "breakStart") setBreakStart(selectedDate);
      else setBreakEnd(selectedDate);
    } else {
      const updated = [...days];
      if (showPicker.type === "start") updated[showPicker.index].startTime = selectedDate;
      else updated[showPicker.index].endTime = selectedDate;
      setDays(updated);
    }

    setShowPicker({ ...showPicker, visible: false });
  };

  const saveAvailability = () => {
    console.log("Saved Availability:", {
      online,
      days,
      breakStart,
      breakEnd,
      autoOffline,
      doNotDisturb,
    });
    alert("Availability Saved Successfully!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Icon name="arrow-left" size={24} color="#fff" />
        <Text style={styles.headerText}>Availability Management</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Online Status */}
        <View
          style={[
            styles.onlineCard,
            { backgroundColor: online ? "#2E8B57" : "#aaa" },
          ]}
        >
          <View>
            <Text style={styles.onlineTitle}>
              You are {online ? "Online" : "Offline"}
            </Text>
            <Text style={styles.onlineSubtitle}>
              {online
                ? "Available for consultations"
                : "Currently unavailable"}
            </Text>
          </View>
          <Switch value={online} onValueChange={toggleOnline} />
        </View>

        {/* Working Hours */}
        <Text style={styles.sectionTitle}>Working Hours Setup</Text>
        {days.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.name}</Text>
              <Switch
                value={day.enabled}
                onValueChange={() => toggleDay(index)}
              />
              
            </View>

            {day.enabled && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => showTimePicker("start", index)}
                >
                  <Text>
                    Start:{" "}
                    {day.startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => showTimePicker("end", index)}
                >
                  <Text>
                    End:{" "}
                    {day.endTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Break Time */}
        <Text style={styles.sectionTitle}>Break Time Configuration</Text>
        <View style={styles.breakCard}>
          <View style={styles.timeRow}>
        
            <TouchableOpacity
              style={styles.breakBox}
              onPress={() => showTimePicker("breakStart")}
            >
              <Icon name="clock-outline" size={20} color="#6A0DAD" />
              <Text style={styles.breakText}>
                Start:{" "}
                {breakStart.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.breakBox}
              onPress={() => showTimePicker("breakEnd")}
            >
              <Icon name="clock-outline" size={20} color="#6A0DAD" />
              <Text style={styles.breakText}>
                End:{" "}
                {breakEnd.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auto-Offline & DND */}
        <Text style={styles.sectionTitle}>Auto-Offline Settings</Text>
        <View style={styles.optionCard}>
          <Text>Auto-offline after inactivity</Text>
          <Text style={styles.optionValue}>30 minutes</Text>
        </View>

        <View style={styles.optionCard}>
          <Text>Do Not Disturb</Text>
          <Switch value={doNotDisturb} onValueChange={setDoNotDisturb} />
        </View>

        {/* Timezone */}
        <View style={styles.optionCard}>
          <Text>Timezone</Text>
          <Text style={styles.optionValue}>
            India Standard Time (IST) - GMT+5:30
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={saveAvailability}>
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker */}
      {showPicker.visible && (
        <DateTimePicker
          value={
            showPicker.type.includes("break")
              ? showPicker.type === "breakStart"
                ? breakStart
                : breakEnd
              : days[showPicker.index][showPicker.type + "Time"]
          }
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection:'row',
    padding: 16,
    backgroundColor: "#6A0DAD",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    // top:10
    height:70
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold",left:20 },
  scrollContainer: { flex: 1, padding: 16 },

  onlineCard: {
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  onlineTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  onlineSubtitle: { color: "#f0f0f0", fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  dayCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
  },
  dayHeader: { flexDirection: "row", justifyContent: "space-between" },
  dayName: { fontSize: 16, fontWeight: "600" },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  timeBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },

  breakCard: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12 },
  breakBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    justifyContent: "center",
  },
  breakText: { marginLeft: 5 },

  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionValue: { color: "#6A0DAD", fontWeight: "bold" },

  saveButton: {
    backgroundColor: "#6A0DAD",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
