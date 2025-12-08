import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ChangeRequest({ navigation }) {
  const changeRequests = [
    {
      id: 'CR2025001',
      field: 'Phone Number',
      current: '+91 9876543210',
      requested: '+91 9988776655',
      status: 'Pending',
      remarks: '',
      date: 'Jan 12, 2025',
    },
    {
      id: 'CR2025002',
      field: 'Email Address',
      current: 'maya.sharma@example.com',
      requested: 'maya.astro@example.com',
      status: 'Approved',
      remarks: 'Approved and updated successfully',
      date: 'Jan 10, 2025',
    },
    {
      id: 'CR2025003',
      field: 'Years of Experience',
      current: '8 years',
      requested: '10 years',
      status: 'Rejected',
      remarks: 'Please provide certificate proof for additional years',
      date: 'Jan 8, 2025',
    },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return '#F5A623';
      case 'Approved':
        return '#2ECC71';
      case 'Rejected':
        return '#E74C3C';
      default:
        return '#ccc';
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== Fixed Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Requests</Text>
        <TouchableOpacity style={styles.newRequestButton}>
          <Text style={styles.newRequestText}>+ New Request</Text>
        </TouchableOpacity>
      </View>

      {/* ===== Scrollable Body ===== */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.infoText}>
          Request admin approval to change restricted profile fields like phone
          number, email, or experience.
        </Text>

        {changeRequests.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.fieldTitle}>{item.field}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.requestId}>Request ID: {item.id}</Text>

            <View style={styles.valueBox}>
              <Text style={styles.label}>Current Value</Text>
              <Text style={styles.value}>{item.current}</Text>
            </View>

            <View style={styles.arrowDown}>
              <Icon name="arrow-down" size={20} color="#888" />
            </View>

            <View style={[styles.valueBox, styles.requestedBox]}>
              <Text style={styles.label}>Requested Value</Text>
              <Text style={styles.requestedValue}>{item.requested}</Text>
            </View>

            <Text style={styles.submitted}>Submitted: {item.date}</Text>

            {item.remarks ? (
              <View style={styles.remarksBox}>
                <Text style={styles.label}>Admin Remarks:</Text>
                <Text style={styles.remarks}>{item.remarks}</Text>
              </View>
            ) : null}
          </View>
        ))}

        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About Change Requests</Text>
          <Text style={styles.aboutText}>
            • Some fields require admin approval for security reasons.
          </Text>
          <Text style={styles.aboutText}>
            • Requests typically reviewed within 24–48 hours.
          </Text>
          <Text style={styles.aboutText}>
            • Provide valid reason for change when submitting.
          </Text>
          <Text style={styles.aboutText}>
            • You’ll be notified once request is processed.
          </Text>
        </View>

        <View style={styles.restrictedBox}>
          <Icon name="alert-circle-outline" size={20} color="#E67E22" />
          <Text style={styles.restrictedText}>
            Restricted Fields: Phone Number, Email, Years of Experience, and
            Qualification require admin approval to change.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    height: 75,
    backgroundColor: '#4B3FFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    // paddingVertical: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  newRequestButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  newRequestText: {
    color: '#4B3FFD',
    fontWeight: '600',
  },
  scrollArea: {
    padding: 15,
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    marginBottom: 12,
  },
  card: {
    width: '100%',
    // height:280,
    borderWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  valueBox: {
    borderWidth: 1,
    borderColor: '#ffe0b3',
    backgroundColor: '#F6F6F6',
    padding: 10,
    borderRadius: 8,
  },
  requestedBox: {
    backgroundColor: '#FFF5E6',
  },
  label: {
    fontSize: 12,
    color: '#666',
    // left:4
  },
  value: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  requestedValue: {
    fontSize: 15,
    color: '#E67E22',
    fontWeight: '600',
  },
  arrowDown: {
    alignItems: 'center',
    marginVertical: 6,
  },
  submitted: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
  remarksBox: {
    width: '98%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ffe0b3',
    backgroundColor: '#ffe0b3',
    borderRadius: 10,
    marginTop: 6,
    left: -2,
  },
  remarks: {
    color: '#444',
    fontSize: 13,
    marginTop: 2,
    left: 6,
  },
  aboutBox: {
    borderWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  aboutTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  aboutText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  restrictedBox: {
    width: '100%',
    height: 90,
    borderWidth: 1,
    borderColor: '#E67E22',
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  restrictedText: {
    fontSize: 13,
    color: '#E67E22',
    marginLeft: 6,
    flex: 1,
    bottom: 8,
  },
});
