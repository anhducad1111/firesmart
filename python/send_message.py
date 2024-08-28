
import RPi.GPIO as GPIO
import serial
import time
import paho.mqtt.client as mqtt
ser = serial.Serial("/dev/ttyS0",115200)
ser.flushInput()

phone_number = '0708168590' #********** change it to the phone number you want to call
phone_number2 = '0794822549'
text_message = 'phat hien chay o nha ban, vui long xac nhan qua: '
power_key = 6
rec_buff = ''

def send_at(command,back,timeout):
	rec_buff = ''
	ser.write((command+'\r\n').encode())
	time.sleep(timeout)
	return 1
	#if ser.inWaiting():
	#	time.sleep(0.01 )
	#	rec_buff = ser.read(ser.inWaiting())
	#if back not in rec_buff.decode():
	#	print(command + ' ERROR')
	#	print(command + ' back:\t' + rec_buff.decode())
	#	return 0
	#else:
	#	print(rec_buff.decode())
	#	return 1

def SendShortMessage(phone_number,text_message):
	
	print("Setting SMS mode...")
	send_at("AT+CMGF=1","OK",1)
	print("Sending Short Message")
	answer = send_at("AT+CMGS=\""+phone_number+"\"",">",2)
	if 1 == answer:
		ser.write(text_message.encode())
		ser.write(b'\x1A')
		
		#answer = send_at('','OK',20)
		#if 1 == answer:
		#	print('send successfully')
		#else:
		#	print('error')
	else:
		print('error%d'%answer)

def ReceiveShortMessage():
	rec_buff = ''
	print('Setting SMS mode...')
	send_at('AT+CMGF=1','OK',1)
	send_at('AT+CPMS=\"SM\",\"SM\",\"SM\"', 'OK', 1)
	answer = send_at('AT+CMGR=1','+CMGR:',2)
	if 1 == answer:
		answer = 0
		if 'OK' in rec_buff:
			answer = 1
			print(rec_buff)
	else:
		print('error%d'%answer)
		return False
	return True

def power_on(power_key):
	print('SIM7600X is starting:')
	GPIO.setmode(GPIO.BCM)
	GPIO.setwarnings(False)
	GPIO.setup(power_key,GPIO.OUT)
	time.sleep(0.1)
	GPIO.output(power_key,GPIO.HIGH)
	time.sleep(2)
	GPIO.output(power_key,GPIO.LOW)
	time.sleep(20)
	ser.flushInput()
	print('SIM7600X is ready')

def power_down(power_key):
	print('SIM7600X is loging off:')
	GPIO.output(power_key,GPIO.HIGH)
	time.sleep(3)
	GPIO.output(power_key,GPIO.LOW)
	time.sleep(18)
	print('Good bye')
def send_mes(address):
    try:
        #power_on(power_key)
        
        print('Sending Short Message Test:')
        SendShortMessage(phone_number,text_message + address)

    except :
        if ser != None:
            ser.close()
        GPIO.cleanup()
def send_mess_locate(locate_ggmap):
    try:
        #power_on(power_key)
        data_mess = "co chay tai dia diem: https://google.com/maps?q="+locate_ggmap
        print('Sending Short Message Test:')
        SendShortMessage(phone_number2,data_mess)
        
    except :
        if ser != None:
            ser.close() 
        GPIO.cleanup()

    
