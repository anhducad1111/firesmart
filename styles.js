import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  notificationIcon: {
    position: 'relative',
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0', // Light background for visibility
    borderRadius: 25, // Circular shape
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    elevation: 5, // Elevation for Android shadow
    marginRight: 15, // Margin to separate from other elements
  },
  notificationText: {
    fontSize: 24,
    color: '#333', // Dark color for the bell icon
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: 'red', // Red background for the badge
    borderRadius: 10, // Circular shape for the badge
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white', // White border for contrast
  },
  badgeText: {
    fontSize: 12,
    color: 'white', // White text color on the red badge
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#f4f2f2',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    fontSize: 16,
    color: '#000',
    padding: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexContainer1: {
    flex: 1,
    backgroundColor: '#f0de36',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  acContainer: {
    alignItems: 'center',
  },
  acText: {
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  flexContainer2: {
    flex: 1,
    backgroundColor: '#d71313',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    margin: 5,
  },
  chartContainer: {
    width: '100%',
    height: 200, 
    backgroundColor: '#ddd', 
    borderRadius: 10,
    marginVertical: 10,
  },
  marginBottom: {
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
});

export default styles;
