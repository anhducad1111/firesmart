import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Switch,
  Button,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import styles from './styles';
import { Client, Message } from 'paho-mqtt';
import { LineChart } from 'react-native-chart-kit';

const brokerUrl = 'wss://io.adafruit.com:443/mqtt';
const topicControl = 'anhducad1111/feeds/control';
const topicVideo = 'anhducad1111/feeds/camera';
const topicAlert = 'anhducad1111/feeds/alert';
const clientId = 'mobile_' + Math.random().toString(16).substr(2, 8);
const username = 'anhducad1111';
const password = 'YOUR_ADAFRUIT_IO_KEY';

export default function HomeScreen() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState('...');
  const [isAuto, setIsAuto] = useState(false);
  const [isACOn, setIsACOn] = useState(false);
  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [videoSrc, setVideoSrc] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [messageToSend, setMessageToSend] = useState('');

  const handleDecrement = () => setTemperature((prev) => Math.max(prev - 1, 0));
  const handleIncrement = () => setTemperature((prev) => prev + 1);

  useEffect(() => {
    const client = new Client(brokerUrl, clientId);

    const connectClient = () => {
      client.connect({
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          client.subscribe(topicControl);
          client.subscribe(topicVideo);
          client.subscribe(topicAlert);
        },
        onFailure: (err) => {
          console.log('Connection failed:', err);
          setTimeout(connectClient, 5000); 
        },
        userName: username,
        password: password,
      });
    };

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('Connection Lost:', responseObject.errorMessage);
        connectClient(); // Reconnect on connection lost
      }
    };

    client.onMessageArrived = (message) => {
      const topic = message.destinationName;
      if (topic === topicVideo) {
        const imgSrc = 'data:image/jpeg;base64,' + message.payloadString;
        setVideoSrc(imgSrc);
      } else if (topic === topicAlert) {
        setNotificationImage('https://dat.inotev.net/firesmart/photo1.JPEG?' + new Date().getTime());
        setShowNotificationModal(true);
      }
    };

    connectClient();

    return () => {
      client.disconnect();
    };
  }, []);

  const fetchData = () => {
    fetch('https://dat.inotev.net/api/getDataD2101.php')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        setTemperature(data.temperature);
        setHumidity(data.humidity);
        updateChartData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const updateChartData = (data) => {
    setTemperatureData((prevData) => {
      const updatedData = [...prevData, data.temperature];
      return updatedData.length > 20 ? updatedData.slice(1) : updatedData;
    });

    setHumidityData((prevData) => {
      const updatedData = [...prevData, data.humidity];
      return updatedData.length > 20 ? updatedData.slice(1) : updatedData;
    });

    setLabels((prevLabels) => {
      const updatedLabels = [...prevLabels, new Date().toLocaleTimeString()];
      return updatedLabels.length > 20 ? updatedLabels.slice(1) : updatedLabels;
    });
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    fetchData();
    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const autoAirConditionerStateD2101 = (isChecked) => {
    const isCheckedState = isChecked ? 'AUTO' : 'CONTROL';
    sendData(isCheckedState);
  };

  const airConditionerStateD2101 = (isChecked) => {
    const isCheckedState = isChecked ? '1' : '0';
    sendData(isCheckedState);
  };

  const sendData = (data) => {
    const client = new Client(brokerUrl, clientId);
    client.connect({
      onSuccess: () => {
        console.log('Connected to MQTT broker');
        const message = new Message(data);
        message.destinationName = topicControl;
        client.send(message);
        console.log('Message sent:', data);
      },
      onFailure: (err) => {
        console.log('Connection failed:', err);
      },
      userName: username,
      password: password,
    });
  };

  const handleSendMessage = () => {
    if (messageToSend.trim().length > 0) {
      const client = new Client(brokerUrl, clientId);
      client.connect({
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          const message = new Message(messageToSend);
          message.destinationName = topicControl;
          client.send(message);
          console.log('Message sent:', messageToSend);
          setMessageToSend('');
        },
        onFailure: (err) => {
          console.log('Connection failed:', err);
        },
        userName: username,
        password: password,
      });
    } else {
      console.log('Input is empty');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.notificationIcon}
        onPress={() => setShowNotificationModal(true)}
      >
        <Text style={styles.notificationText}>🔔</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </Pressable>

      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alert</Text>
            <Text>An alert was triggered!</Text>
            {notificationImage && (
              <Image
                source={{ uri: notificationImage }}
                style={styles.modalImage}
              />
            )}
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowNotificationModal(false)}
              />
              <Button
                title="Confirm"
                onPress={() => setShowNotificationModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.header}>
        AUTOMATIC TEMPERATURE AND HUMIDITY ADJUSTMENT SYSTEM
      </Text>

      <View style={styles.tabContainer}>
        <Text style={styles.tab}>D2101</Text>
        <Text style={styles.tab}>D2102</Text>
      </View>

      <View style={styles.imageContainer}>
        {videoSrc ? (
          <Image
            source={{ uri: videoSrc }}
            style={styles.videoStream}
          />
        ) : (
          <Text>Loading video...</Text>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.flexContainer1}>
          <View style={styles.switchContainer}>
            <Switch
              value={isAuto}
              onValueChange={(value) => {
                setIsAuto(value);
                autoAirConditionerStateD2101(value);
              }}
            />
            <Text>AUTOMATIC</Text>
          </View>
          <Text style={styles.roomText}>Room</Text>
          <Text style={styles.roomNumber}>D2-101</Text>
          <View style={styles.acContainer}>
            <Text style={styles.acText}>Air Conditioner</Text>
            <Switch
              value={isACOn}
              onValueChange={(value) => {
                setIsACOn(value);
                airConditionerStateD2101(value);
              }}
            />
            <View style={styles.buttonGroup}>
              <Button title="-" onPress={handleDecrement} />
              <Text>{temperature}°C</Text>
              <Button title="+" onPress={handleIncrement} />
            </View>
          </View>
        </View>
        <View style={styles.flexContainer2}>
          <Text style={styles.marginBottom}>Temperature</Text>
          <Text style={styles.marginBottom}>{temperature}</Text>
          <Text style={styles.marginBottom}>Humidity</Text>
          <Text style={styles.marginBottom}>{humidity}</Text>
          <Button
            title="View Charts"
            onPress={() => setShowChartModal(true)}
          />
          <Modal visible={showChartModal} animationType="slide">
            <View style={styles.chartModalContainer}>
              <Button title="Close" onPress={() => setShowChartModal(false)} />
              <ScrollView>
                <LineChart
                  data={{
                    labels: labels,
                    datasets: [
                      {
                        data: temperatureData,
                        strokeWidth: 2,
                        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                      },
                      {
                        data: humidityData,
                        strokeWidth: 2,
                        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                      },
                    ],
                  }}
                  width={Dimensions.get('window').width - 16}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </View>
          </Modal>
        </View>
      </View>

      {/* New Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter message to send"
          value={messageToSend}
          onChangeText={(text) => setMessageToSend(text)}
        />
        <Button title="Send Message" onPress={handleSendMessage} />
      </View>
    </View>
  );
}