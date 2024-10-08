# SPDX-FileCopyrightText: 2021 ladyada for Adafruit Industries
# SPDX-License-Identifier: MIT
import RPi.GPIO as GPIO
import time
import board
import adafruit_dht
MQ2_PIN = 21
GPIO.setup(MQ2_PIN, GPIO.IN)

# Initial the dht device, with data pin connected to:
dhtDevice = adafruit_dht.DHT22(board.D16, use_pulseio=False)

# you can pass DHT22 use_pulseio=False if you wouldn't like to use pulseio.
# This may be necessary on a Linux single board computer like the Raspberry Pi,
# but it will not work in CircuitPython.
# dhtDevice = adafruit_dht.DHT22(board.D24, use_pulseio=False)
def read_mq2():
    smoke_state = GPIO.input(MQ2_PIN)
    if (smoke_state == GPIO.LOW):
        return True
    else:
        return False
def read_dht22():
    while True:
        try:
            # Print the values to the serial port
            temperature_c = dhtDevice.temperature
            # temperature_f = temperature_c * (9 / 5) + 32
            # humidity = dhtDevice.humidity
            # print(
            #     "Temp: {:.1f} F / {:.1f} C    Humidity: {}% ".format(
            #         temperature_f, temperature_c, humidity
            #     )
            # )
            print(temperature_c)
            return temperature_c
        except RuntimeError as error:
            # Errors happen fairly often, DHT's are hard to read, just keep going
            #print(error.args[0])
            time.sleep(2.0)
        except Exception as error:
            dhtDevice.exit()
            raise error
        time.sleep(2.0)
        return 0
