import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Added this
import Icon from "react-native-vector-icons/Ionicons"; // npm i react-native-vector-icons

const { width: W, height: H } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 78 : 68;
const CARD_PADDING = 16;
const AVATAR_SIZE = Math.round(W * 0.12);

export default function PendingRequestsScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);

  const request = {
    name: "Aneti MG",
    subtitle: "Service Consultation / Phone",
    price: "₹2,8,500",
    categories: [
      { title: "Boot Reviews", subtitle: "Qook Consultation: 50kw Tlop (350kw)" },
      { title: "Free Mood kM Actinstunt", subtitle: "500kw 10/m00s05" },
    ],
    avatarColor: "#FFB57F",
  };

  const consultationTypes = [
    "Consultion Repack Vision",
    "Patrol Clott",
    "Portal Fack",
  ];

  function handleAccept() {
    setAccepted(true);
    Alert.alert("Accepted", "You accepted the request.");
  }

  function handleDecline() {
    Alert.alert("Declined", "You declined the request.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#5E55E6" />
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => {
            if (navigation && navigation.goBack) navigation.goBack();
            else Alert.alert("Back pressed");
          }}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Pending Requests
        </Text>
      </View>

      {/* Content below header */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HEADER_HEIGHT - 12 }} />

        {/* Request Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.avatar, { backgroundColor: request.avatarColor }]}>
              <Text style={styles.avatarText}>
                {request.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </Text>
            </View>

            <View style={styles.cardMain}>
              <Text style={styles.name}>{request.name}</Text>
              <Text style={styles.subtitle}>{request.subtitle}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{request.price}</Text>
            </View>
          </View>

          <View style={styles.requestCategories}>
            <Text style={styles.sectionTitle}>Request Categories</Text>
            {request.categories.map((c, i) => (
              <View key={i} style={styles.categoryRow}>
                <Text style={styles.categoryTitle}>{c.title}</Text>
                <Text style={styles.categorySubtitle}>{c.subtitle}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={handleAccept}
            >
              <Icon name="checkmark" size={18} color="#fff" />
              <Text style={[styles.btnText, { color: "#fff" }]}> Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.declineBtn]}
              onPress={handleDecline}
            >
              <Icon name="close" size={18} color="#C33" />
              <Text style={[styles.btnText, { color: "#C33" }]}> Decline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultation Types */}
        <View style={[styles.card, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Consultation Types Available</Text>
          {consultationTypes.map((t, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              style={styles.typeItem}
              onPress={() => Alert.alert("Selected", t)}
            >
              <Text style={styles.typeText}>{t}</Text>
              <Icon name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Floating right menu */}
      <View style={styles.floatingMenu}>
        <Text style={styles.fmenuTitle}>Screen: pendingRequests</Text>
   
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === "ios" ? 18 : StatusBar.currentHeight || 6,
    backgroundColor: "#5E55E6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    zIndex: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 4,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  card: {
    top:20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: Math.round(AVATAR_SIZE * 0.36),
    color: "#5E3A00",
    fontWeight: "700",
  },
  cardMain: {
    flex: 1,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b6b6b",
    marginTop: 2,
  },
  priceContainer: {
    minWidth: 86,
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
  },
  requestCategories: {
    marginTop: 12,
    backgroundColor: "#FAFBFF",
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  categoryRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  categoryTitle: {
    fontWeight: "700",
    fontSize: 13,
    color: "#222",
  },
  categorySubtitle: {
    fontSize: 11,
    color: "#7a7a7a",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#22A55A",
    marginRight: 10,
  },
  declineBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6B1B1",
    alignItems: "center",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  typeItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeText: {
    fontSize: 15,
    color: "#333",
  },
});