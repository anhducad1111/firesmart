#!/usr/bin/python
# -*- coding:utf-8 -*-
import RPi.GPIO as GPIO

import serial
import time
import re

ser = serial.Serial('/dev/ttyS0',115200)
ser.flushInput()

power_key = 6
rec_buff = ''
rec_buff2 = ''
time_count = 0
def send_at(command,back,timeout):
	rec_buff = ''
	ser.write((command+'\r\n').encode())
	time.sleep(timeout)
	if ser.inWaiting():
		time.sleep(0.01 )
		rec_buff = ser.read(ser.inWaiting())
	if rec_buff != '':
		if back not in rec_buff.decode():
			print(command + ' ERROR')
			print(command + ' back:\t' + rec_buff.decode())
			return '0'
		else:
			#print(rec_buff.decode())
			return rec_buff
	else:
		print('GPS is not ready')
		return '0'

def get_gps_position():
	rec_null = True
	answer = '0'
	print('Start GPS session...')
	rec_buff = ''
	send_at('AT+CGPS=1,1','OK',1)
	time.sleep(2)
	answer = send_at('AT+CGPSINFO','+CGPSINFO: ',1).decode()
	print(answer)
	while(',,,,,,' in answer):
		answer = send_at('AT+CGPSINFO','+CGPSINFO: ',1).decode()
		print(answer)
	if '0' != answer:
		if ',,,,,,' in rec_buff:
			print('GPS is not ready')
			rec_null = False
			time.sleep(1)
		return answer
	else:
		print('error ',answer)
		rec_buff = ''
		send_at('AT+CGPS=0','OK',1)
		return False
	time.sleep(1.5)

def convert_ggmap():
        data = get_gps_position()
        # Sử dụng biểu thức chính quy để tìm kiếm các số thập phân trong chuỗi
        pattern = r"[-+]?[0-9]*\.?[0-9]+"
        # Tìm kiếm và trích xuất các giá trị số từ chuỗi
        matches = re.findall(pattern, data)
        # Trích xuất giá trị tọa độ
        latitude = matches[0]
        longitude = matches[1]
        # Chuyển đổi định dạng của tọa độ
        latitude_decimal = str(float(latitude[:2]) + float(latitude[2:]) / 60)
        longitude_decimal = str(float(longitude[:3]) + float(longitude[3:]) / 60)
        # In ra tọa độ
        locate_ggmap = latitude_decimal+","+longitude_decimal
        print(locate_ggmap)
        return locate_ggmap
#try:
	#power_on(power_key)
#    convert_ggmap()
	#get_gps_position()
	#power_down(power_key)
#except:
#	if ser != None:
#		ser.close()
#	power_down(power_key)
#	GPIO.cleanup()
#if ser != None:
#	ser.close()
#GPIO.cleanup()	