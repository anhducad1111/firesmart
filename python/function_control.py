import RPi.GPIO as GPIO
import time
relay_pin1 = 12
relay_pin2 = 12
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(relay_pin1, GPIO.OUT)
GPIO.setup(relay_pin2, GPIO.OUT)
def control_relay():
    GPIO.output(relay_pin1,GPIO.HIGH)
    GPIO.output(relay_pin2,GPIO.HIGH)
def setpin_relay():
    GPIO.output(relay_pin1,GPIO.LOW)
    GPIO.output(relay_pin2,GPIO.LOW)

