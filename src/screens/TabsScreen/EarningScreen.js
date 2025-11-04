// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { PieChart, LineChart } from 'react-native-chart-kit';

// const screenWidth = Dimensions.get('window').width;

// const EarningsReportScreen = () => {
//   // ✅ State for service distribution (replace later with backend data)
//   const [serviceData, setServiceData] = useState([
//     {
//       id: 1,
//       title: 'Chat Sessions',
//       percentage: 50.88,
//       count: '3,445 / 6,774',
//       color: '#F26E3E',
//     },
//     {
//       id: 2,
//       title: 'Call Sessions',
//       percentage: 32.14,
//       count: '2,175 / 6,774',
//       color: '#3366CC',
//     },
//     {
//       id: 3,
//       title: 'Live Stream',
//       percentage: 16.98,
//       count: '1,154 / 6,774',
//       color: '#4CAF50',
//     },
//   ]);

//   // Example: fetching backend data (future use)
//   // useEffect(() => {
//   //   fetch('https://your-api-url.com/service-distribution')
//   //     .then(res => res.json())
//   //     .then(data => setServiceData(data))
//   //     .catch(err => console.error(err));
//   // }, []);

//   return (
//     <View style={styles.outerContainer}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Earnings Report</Text>
//         <TouchableOpacity style={styles.dateSelect}>
//           <Text style={styles.dateText}>Last 30 days</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Scrollable Content */}
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Summary Cards */}
//         <View style={styles.topCardsRow}>
//           <View style={styles.topCard}>
//             <Icon name="clipboard-check" size={36} color="#F26E3E" />
//             <Text style={styles.topCardTitle}>Total Orders</Text>
//             <Text style={styles.topCardValue}>1,430</Text>
//           </View>
//           <View style={styles.topCard}>
//             <Icon name="clock-outline" size={36} color="#6C63FF" />
//             <Text style={styles.topCardTitle}>Average Time</Text>
//             <Text style={styles.topCardValue}>2 min</Text>
//           </View>
//         </View>

//         {/* Pie Chart */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Earnings Breakdown</Text>
//           <View style={styles.breakdownContent}>
//             <PieChart
//               data={[
//                 {
//                   name: 'Chat',
//                   population: 22100,
//                   color: '#F26E3E',
//                   legendFontColor: '#333',
//                   legendFontSize: 14,
//                 },
//                 {
//                   name: 'Call',
//                   population: 2500,
//                   color: '#3366CC',
//                   legendFontColor: '#333',
//                   legendFontSize: 14,
//                 },
//                 {
//                   name: 'Live Stream',
//                   population: 3000,
//                   color: '#4CAF50',
//                   legendFontColor: '#333',
//                   legendFontSize: 14,
//                 },
//               ]}
//               width={206}
//               height={130}
//               chartConfig={{
//                 backgroundGradientFrom: '#fff',
//                 backgroundGradientTo: '#fff',
//                 color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
//               }}
//               accessor="population"
//               backgroundColor="transparent"
//               paddingLeft="0"
//               absolute
//               hasLegend={false}
//             />
//             <View style={styles.breakdownLegend}>
//               <Text style={styles.legendText}>
//                 <Icon name="circle" color="#F26E3E" /> Chat &nbsp;&nbsp; ₹22,100
//               </Text>
//               <Text style={styles.legendText}>
//                 <Icon name="circle" color="#3366CC" /> Call &nbsp;&nbsp; ₹2,500
//               </Text>
//               <Text style={styles.legendText}>
//                 <Icon name="circle" color="#4CAF50" /> Live Stream &nbsp;&nbsp;
//                 ₹3,000
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Line Chart */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Total Earnings (Last 30 Days)</Text>
//           <LineChart
//             data={{
//               labels: ['1 Jan', '5 Jan', '10 Jan', '15 Jan', '20 Jan', '25 Jan', '30 Jan'],
//               datasets: [
//                 {
//                   data: [4500, 6500, 6000, 7500, 13100, 11000, 17000],
//                   color: () => '#F26E3E',
//                 },
//               ],
//             }}
//             width={screenWidth * 0.9}
//             height={180}
//             chartConfig={{
//               backgroundGradientFrom: '#fff',
//               backgroundGradientTo: '#fff',
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
//               labelColor: () => '#333',
//               style: { borderRadius: 8 },
//             }}
//             style={{ borderRadius: 12, marginVertical: 8 }}
//           />
//         </View>

//         {/* ✅ Service Type Distribution (Dynamic) */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Service Type Distribution</Text>

//           {serviceData.map((item) => (
//             <View key={item.id} style={styles.chotaCard}>
//               <View style={styles.rowBetween}>
//                 <Text style={[styles.chotaTitle, { color: item.color }]}>
//                   {item.title}
//                 </Text>
//                 <Text style={styles.chotaValue}>{item.percentage}%</Text>
//               </View>

//               <View style={styles.progressBarBG}>
//                 <View
//                   style={[
//                     styles.progressBarFill,
//                     { width: `${item.percentage}%`, backgroundColor: item.color },
//                   ]}
//                 />
//               </View>

//               <View style={styles.rowBetween}>
//                 <View />
//                 <Text style={styles.chotaSubtitle}>{item.count}</Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default EarningsReportScreen;

// const styles = StyleSheet.create({
//   outerContainer: {
//     flex: 1,
//     backgroundColor: '#F5F6FA',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 18,
//     backgroundColor: '#6C63FF',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   headerTitle: {
//     color: '#FFF',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   dateSelect: {
//     backgroundColor: '#7D75F9',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   dateText: { color: '#FFF', fontWeight: 'bold' },
//   scrollContent: { alignItems: 'center', paddingBottom: 30 },

//   /* ===== Summary Cards ===== */
//   topCardsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '90%',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   topCard: {
//     flex: 1,
//     backgroundColor: '#FFF',
//     borderRadius: 14,
//     padding: 20,
//     marginRight: 10,
//     alignItems: 'center',
//     elevation: 2,
//   },
//   topCardTitle: {
//     color: '#8C8C8C',
//     fontWeight: 'bold',
//     marginTop: 8,
//     marginBottom: 2,
//   },
//   topCardValue: {
//     fontWeight: 'bold',
//     fontSize: 24,
//     marginTop: 2,
//     color: '#4C4C4C',
//   },

//   /* ===== Common Card ===== */
//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 18,
//     padding: 18,
//     marginHorizontal: 16,
//     marginVertical: 10,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#444',
//     marginBottom: 12,
//   },

//   /* ===== Breakdown (Pie) ===== */
//   breakdownContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//   },
//   breakdownLegend: { justifyContent: 'center', marginLeft: 10 },
//   legendText: { color: '#222', marginVertical: 5, fontSize: 15 },

//   /* ===== Service Type ===== */
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//   },
//   chotaCard: {
//     backgroundColor: '#F6F7FA',
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   chotaTitle: {
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   chotaValue: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#222',
//   },
//   chotaSubtitle: {
//     color: '#888',
//     fontSize: 12,
//     marginTop: 4,
//     textAlign: 'right',
//   },
//   progressBarBG: {
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: '#E0E0E0',
//     width: '100%',
//     marginVertical: 6,
//   },
//   progressBarFill: {
//     height: 7,
//     borderRadius: 4,
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const EarningsReportScreen = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  const [searchText, setSearchText] = useState('');

  const dropdownOptions = [
    'Last 7 Days',
    'Last 15 Days',
    'Last 30 Days',
    'Last 90 Days',
  ];

  const [serviceData, setServiceData] = useState([
    {
      id: 1,
      title: 'Chat Sessions',
      percentage: 50.88,
      count: '3,445 / 6,774',
      color: '#F26E3E',
    },
    {
      id: 2,
      title: 'Call Sessions',
      percentage: 32.14,
      count: '2,175 / 6,774',
      color: '#3366CC',
    },
    {
      id: 3,
      title: 'Live Stream',
      percentage: 16.98,
      count: '1,154 / 6,774',
      color: '#4CAF50',
    },
  ]);

  return (
    <View style={styles.outerContainer}>
      {/* 🟣 Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings Report</Text>

        {/* 🔍 Search + Dropdown Row */}
        <View style={styles.filterRow}>
          {/* Search Bar */}
          {/* <View style={styles.searchContainer}>
            <Icon name="magnify" size={18} color="#999" />
            <TextInput
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#ccc"
              style={styles.searchInput}
            />
          </View> */}

          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownText}>{selectedFilter}</Text>
              <Icon
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {dropdownOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedFilter(item);
                      setIsDropdownOpen(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item === selectedFilter && {
                          color: '#6C63FF',
                          fontWeight: 'bold',
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.topCardsRow}>
          <View style={styles.topCard}>
            <Icon name="clipboard-check" size={36} color="#F26E3E" />
            <Text style={styles.topCardTitle}>Total Orders</Text>
            <Text style={styles.topCardValue}>1,430</Text>
          </View>
          <View style={styles.topCard}>
            <Icon name="clock-outline" size={36} color="#6C63FF" />
            <Text style={styles.topCardTitle}>Average Time</Text>
            <Text style={styles.topCardValue}>2 min</Text>
          </View>
        </View>

        {/* Pie Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownContent}>
            <PieChart
              data={[
                {
                  name: 'Chat',
                  population: 22100,
                  color: '#F26E3E',
                  legendFontColor: '#333',
                  legendFontSize: 14,
                },
                {
                  name: 'Call',
                  population: 2500,
                  color: '#3366CC',
                  legendFontColor: '#333',
                  legendFontSize: 14,
                },
                {
                  name: 'Live Stream',
                  population: 3000,
                  color: '#4CAF50',
                  legendFontColor: '#333',
                  legendFontSize: 14,
                },
              ]}
              width={206}
              height={130}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
              hasLegend={false}
            />
            <View style={styles.breakdownLegend}>
              <Text style={styles.legendText}>
                <Icon name="circle" color="#F26E3E" /> Chat &nbsp;&nbsp; ₹22,100
              </Text>
              <Text style={styles.legendText}>
                <Icon name="circle" color="#3366CC" /> Call &nbsp;&nbsp; ₹2,500
              </Text>
              <Text style={styles.legendText}>
                <Icon name="circle" color="#4CAF50" /> Live Stream &nbsp;&nbsp;
                ₹3,000
              </Text>
            </View>
          </View>
        </View>

        {/* Line Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Earnings (Last 30 Days)</Text>
          <LineChart
            data={{
              labels: [
                '1 Jan',
                '5 Jan',
                '10 Jan',
                '15 Jan',
                '20 Jan',
                '25 Jan',
                '30 Jan',
              ],
              datasets: [
                {
                  data: [4500, 6500, 6000, 7500, 13100, 11000, 17000],
                  color: () => '#F26E3E',
                },
              ],
            }}
            width={screenWidth * 0.9}
            height={180}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              labelColor: () => '#333',
              style: { borderRadius: 8 },
            }}
            style={{ borderRadius: 12, marginVertical: 8 }}
          />
        </View>

        {/* ✅ Service Type Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Type Distribution</Text>
          {serviceData.map(item => (
            <View key={item.id} style={styles.chotaCard}>
              <View style={styles.rowBetween}>
                <Text style={[styles.chotaTitle, { color: item.color }]}>
                  {item.title}
                </Text>
                <Text style={styles.chotaValue}>{item.percentage}%</Text>
              </View>
              <View style={styles.progressBarBG}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.rowBetween}>
                <View />
                <Text style={styles.chotaSubtitle}>{item.count}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default EarningsReportScreen;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignContent:'center',
    backgroundColor: '#F5F6FA',
  },

  /* ===== Header Section ===== */
  header: {
    backgroundColor: '#372643',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // searchContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#372643',
  //   borderRadius: 10,
  //   paddingHorizontal: 10,
  //   flex: 1,
  //   marginRight: 10,
  //   height: 40,
  // },
  // searchInput: {
  //   flex: 1,
  //   color: '#372643',
  //   marginLeft: 6,
  //   fontSize: 13,
  // },

  dropdownContainer: {
    position: 'relative',
    left: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7D75F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    justifyContent: 'space-between',
    minWidth: 350,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 13,
  },
  dropdownList: {
    position: 'absolute',
    top: 45,
    left: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 340,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 10,
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
  },

  /* ===== Scroll Content ===== */
  scrollContent: { alignItems: 'center', paddingBottom: 30 },

  /* ===== Summary Cards ===== */
  topCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 16,
    marginBottom: 8,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    marginRight: 10,
    alignItems: 'center',
    elevation: 2,
  },
  topCardTitle: {
    color: '#8C8C8C',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  topCardValue: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 2,
    color: '#4C4C4C',
  },

  /* ===== Common Card ===== */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 12,
  },

  /* ===== Breakdown (Pie) ===== */
  breakdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  breakdownLegend: { justifyContent: 'center', marginLeft: 10 },
  legendText: { color: '#222', marginVertical: 5, fontSize: 15 },

  /* ===== Service Type ===== */
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  chotaCard: {
    backgroundColor: '#F6F7FA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  chotaTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  chotaValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
  },
  chotaSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  progressBarBG: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 6,
  },
  progressBarFill: {
    height: 7,
    borderRadius: 4,
  },
});
