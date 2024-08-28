#include <ESP8266WiFi.h>
// #include <WiFiClientSecure.h>
// #include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include "DHT.h"
#include <IRremoteESP8266.h>
#include <IRsend.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define IR_LED_PIN D8  // Define the pin connected to the IR LED
IRsend mySender(IR_LED_PIN);

#define DHTTYPE DHT22      // type of the temperature sensor
const int DHTPin = D6;     //--> The pin used for the DHT11 sensor is Pin D1 = GPIO5
DHT dht(DHTPin, DHTTYPE);  //--> Initialize DHT sensor, DHT dht(Pin_used, Type_of_DHT_Sensor);

#define ON_Board_LED 2  //--> Defining an On Board LED, used for indicators when the process of connecting to a wifi router

const char* ssid = "Bulble";        //--> Your wifi name or SSID.
const char* password = "25102018";  //--> Your wifi password.

#define Dehumidifier D3


#define SERVER_IP "dat.inotev.net"
//----------------------------------------
void turnOn();
void turnOff();
void AC_Controller(float, float);
String AC_State = "OFF";
int ac_temp = 25;
String AC_Control = "";
String message = "";

static unsigned long lastPrintTime = 0;
static unsigned long lastGetTime = 0;
unsigned long currentTime;
unsigned long currentGetTime;
float h, t;

#define RAW_DATA_LEN 60
uint16_t rawDataOn[RAW_DATA_LEN] = {
	8682, 4090, 502, 1542, 410, 610, 466, 554,
	410, 606, 434, 1610, 482, 534, 390, 626,
	434, 586, 406, 610, 410, 614, 390, 626,
	406, 614, 406, 610, 406, 618, 446, 570,
	406, 614, 386, 630, 410, 614, 446, 1586,
	406, 1638, 482, 534, 390, 630, 390, 1646,
	394, 622, 394, 626, 390, 1650, 390, 630,
	478, 1558, 382, 1000
};

uint16_t rawDataOff[RAW_DATA_LEN] = {
	8470, 4326, 302, 1702, 374, 666, 326, 666,
	378, 670, 326, 1734, 298, 726, 322, 690,
	250, 826, 222, 1762, 326, 1742, 274, 662,
	378, 666, 326, 694, 354, 670, 350, 690,
	302, 670, 374, 666, 326, 722, 298, 770,
	270, 694, 302, 690, 330, 1686, 350, 722,
	298, 1710, 350, 666, 330, 670, 346, 718,
	302, 1738, 274, 1000
};

uint16_t rawDataInc[RAW_DATA_LEN] = {
	8678, 4110, 474, 1586, 446, 514, 474, 518,
	474, 514, 474, 1586, 446, 518, 470, 518,
	474, 518, 470, 518, 474, 518, 470, 518,
	474, 518, 470, 1586, 450, 514, 474, 518,
	470, 518, 474, 518, 470, 1590, 446, 514,
	474, 518, 470, 518, 474, 1586, 446, 518,
	474, 514, 474, 518, 474, 514, 474, 518,
	474, 518, 470, 1000
};

uint16_t rawDataDec[RAW_DATA_LEN] = {
	8678, 4106, 474, 1582, 450, 518, 470, 518,
	470, 522, 470, 1586, 446, 518, 474, 514,
	474, 518, 470, 518, 474, 518, 470, 518,
	474, 518, 470, 1586, 446, 518, 470, 522,
	470, 518, 470, 518, 474, 518, 470, 1586,
	450, 1582, 446, 518, 474, 1582, 450, 518,
	470, 518, 474, 1582, 450, 1582, 450, 1582,
	450, 1582, 450, 1000
};

void setup() {
	// put your setup code here, to run once:
	Serial.begin(115200);
	mySender.begin();
	dht.begin();  //--> Start reading DHT11 sensors
	delay(100);

	WiFi.begin(ssid, password);  //--> Connect to your WiFi router
	Serial.println("");

	pinMode(ON_Board_LED, OUTPUT);     //--> On Board LED port Direction output
	digitalWrite(ON_Board_LED, HIGH);  //--> Turn off Led On Board

	pinMode(Dehumidifier, OUTPUT);  //--> On Board LED port Direction output
	digitalWrite(Dehumidifier, LOW);

	lcd.init();
	// Print a message to the LCD.
	lcd.backlight();

	//----------------------------------------Wait for connection
	Serial.print("Connecting");
	while (WiFi.status() != WL_CONNECTED) {
		Serial.print(".");
		//----------------------------------------Make the On Board Flashing LED on the process of connecting to the wifi router.
		digitalWrite(ON_Board_LED, LOW);
		delay(250);
		digitalWrite(ON_Board_LED, HIGH);
		delay(250);
		//----------------------------------------
	}
	//----------------------------------------
	digitalWrite(ON_Board_LED, HIGH);  //--> Turn off the On Board LED when it is connected to the wifi router.
	Serial.println("");
	Serial.print("Successfully connected to : ");
	Serial.println(ssid);
	Serial.print("IP address: ");
	Serial.println(WiFi.localIP());
	Serial.println();
	//----------------------------------------
}

void loop() {
	currentTime = millis();
	currentGetTime = millis();
	h = dht.readHumidity();
	t = dht.readTemperature();

	if (isnan(h) || isnan(t)) {
		Serial.println("Failed to read from DHT sensor !");
		h = 0;
		t = 0;
		delay(2000);
		// return;
	}
	String Temp = "Temp:   " + String(t) + " oC";
	String Humi = "Humi:   " + String(h) + " %";
	// Serial.println(Temp);
	// Serial.println(Humi);

	lcd.clear();
	lcd.setCursor(0, 0);
	lcd.print(Temp);
	lcd.setCursor(0, 1);
	lcd.print(Humi);

	if (currentTime - lastPrintTime >= 5000) {
		sendDataToServer(t, h);
		lastPrintTime = currentTime;
	}
	if (currentGetTime - lastGetTime >= 1000) {
		readDataMode();
		lastGetTime = currentGetTime;
	}
		delay(2000);
}
void turnOn() {
	mySender.sendRaw(rawDataOn, RAW_DATA_LEN, 36);  // Use sendRaw method for IRremote library
	Serial.println(F("AC Switched On"));
	AC_State = "ON";
}
void turnOff() {
	mySender.sendRaw(rawDataOff, RAW_DATA_LEN, 36);  // Use sendRaw method for IRremote library
	Serial.println(F("AC Switched Off"));
	AC_State = "OFF";
}
void IncreAC() {
	mySender.sendRaw(rawDataInc, RAW_DATA_LEN, 36);  // Use sendRaw method for IRremote library
	Serial.println(F("AC temp + 1"));
	ac_temp += 1;
}
void DecreAC() {
	mySender.sendRaw(rawDataInc, RAW_DATA_LEN, 36);  // Use sendRaw method for IRremote library
	Serial.println(F("AC temp - 1"));
	ac_temp -= 1;
}

void AC_Controller(float t, float h) {
	if ((t >= 26 || h >= 80) && AC_State == "OFF") {
		turnOn();

	} else if (t < 26 && h < 80 && AC_State == "ON") {
		turnOff();
	}
}


void sendDataToServer(float tem, float hum) {
	WiFiClient client;
	HTTPClient http;
	String temp = String(tem);
	String humi = String(hum);
	Serial.print("[HTTP] begin...\n");
	// configure traged server and url
	http.begin(client, "http://" SERVER_IP "/dbwrite.php/");  // HTTP
	http.addHeader("Content-Type", "application/x-www-form-urlencoded");
	String dataSend = "api_key=iotlab&node=D2101&temperature=" + temp + "&humidity=" + humi + "&ac_state=" + AC_State;
	Serial.print("[HTTP] POST...\n");
	// start connection and send HTTP header and body
	int httpCode = http.POST(dataSend);

	// httpCode will be negative on error
	if (httpCode > 0) {
		// HTTP header has been send and Server response header has been handled
		// Serial.printf("[HTTP] POST... code: %d\n", httpCode);

		// file found at server
		if (httpCode == HTTP_CODE_OK) {
			const String& payload = http.getString();
			// Serial.println("received payload:\n<<");
			// Serial.println(payload);
			Serial.println(">>");
		}
	} else {
		Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
	}

	http.end();
}
void readDataMode(void) {
	String mode;
	String control;
	int spaceIndex;
	WiFiClient client;
	HTTPClient http;
	Serial.print("[HTTP] begin...\n");
	// configure traged server and url
	http.begin(client, "http://" SERVER_IP "/dbread.php/");  // HTTP
	http.addHeader("Content-Type", "application/x-www-form-urlencoded");
	// String dataSend = "api_key=iotlab&node=node1&temperature="+ temp +"&humidity="+ humi +"&ac_state="+ AC_State;
	String dataSend = "api_key=iotlab&node=D2101";
	Serial.print("[HTTP] POST...\n");
	// start connection and send HTTP header and body
	int httpCode = http.POST(dataSend);
	//-----------------------------------------------------------------------------------
	if (httpCode <= 0) {
		Serial.println("Error on HTTP request");
		http.end();
		return;
	}
	//-----------------------------------------------------------------------------------
	//reading data comming from Google Sheet
	String payload = http.getString();
	Serial.println("Payload: " + payload);

	//-----------------------------------------------------------------------------------
	if (httpCode == 200) {
		spaceIndex = payload.indexOf(' ');

		if (spaceIndex != -1) {
			mode = payload.substring(0, spaceIndex);
			control = payload.substring(spaceIndex + 1);
		}
		// Serial.println(mode);
		// Serial.println(control);
		message = mode;
		if (mode == "CONTROL") {
			if (control == "1") {
				turnOn();
			} else if (control == "0") {
				turnOff();
			} else if (control == "i") {
				IncreAC();
			} else if (control == "d") {
				DecreAC();
			}
		} else {
			AC_Controller(t, h);
		}
	}

	//-------------------------------------------------------------------------------------
	http.end();
}