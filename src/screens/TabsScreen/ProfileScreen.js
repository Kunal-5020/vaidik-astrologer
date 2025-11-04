import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

    const handleAvailability = () => {
    navigation.navigate('EditProfile');
  };

    const handleServices= () => {
    navigation.navigate('Services');
  };
  return (
    <View style={styles.container}>
      {/* Header with profile */}
      <View style={styles.header}>
        <Avatar.Text size={64} label="MS" style={styles.avatar} />
        <Text style={styles.name}>Maya Sharma</Text>
        <Text style={styles.rating}>⭐ 4.8 (1,245 reviews)</Text>
        <Text style={styles.verified}>🔒 Verified Astrologer</Text>
        <Text style={styles.experience}>10+ years experience</Text>
        <Text style={styles.languages}>Hindi, English</Text>
      </View>

      {/* 3 cards in row */}
      <ScrollView style={{ backgroundColor: '#f5f5f5' }}>
        <View style={styles.cardRow}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardValue}>2,300</Text>
              <Text>Total Consultations</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardValue}>98%</Text>
              <Text>Success Rate</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardValue}>4.8 ⭐</Text>
              <Text>Avg Rating</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Specializations */}
        <View style={styles.specializations}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.chips}>
            {[
              'Vedic Astrology',
              'Tarot Reading',
              'Numerology',
              'Palmistry',
              'Vastu Shastra',
            ].map((item, index) => (
              <Chip
                key={index}
                style={styles.chip}
                textStyle={{ fontSize: 12 }}
              >
                {item}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.buttonList}>
          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleEditProfile}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                <Icon name="edit" size={24} color="#6200ea" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={() => console.log('Availability Management')}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                <Icon name="schedule" size={24} color="#6200ea" />
                <Text style={styles.buttonText}>Availability Management</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonItem}
            onPress={handleServices}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonLeft}>
                <Icon name="work" size={24} color="#6200ea" />
                <Text style={styles.buttonText}>My Services</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#6200ea',
    //  backgroundColor: '#372643',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    backgroundColor: '#f4a261',
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rating: {
    color: '#fff',
    marginTop: 4,
  },
  verified: {
    color: '#d3f9d8',
    marginTop: 4,
  },
  experience: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  languages: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  specializations: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    margin: 4,
    backgroundColor: '#e0e0e0',
  },

  // ============new=================

  buttonList: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  buttonItem: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    height: 60, // 👈 consistent height
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
