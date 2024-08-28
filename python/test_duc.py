import json
import cv2
import numpy as np
import os
import sys
from PIL import Image, ImageDraw, ImageFont
import torch
from torch import nn
from torchvision import transforms
from efficientnet_pytorch import FireSmokeEfficientNet
import collections
import time
import paho.mqtt.client as mqtt
import base64
import asyncio
import threading
from queue import Queue
from concurrent.futures import ThreadPoolExecutor
from send_message import send_mes, send_mess_locate
from function_control import control_relay, setpin_relay
from function_GPS import get_gps_position, convert_ggmap
from new_dht_simpletest import read_dht22, read_mq2
from send_images import upload_file_to_server

# MQTT Configuration
BROKER = "test.mosquitto.org"
PORT = 1883
TOPIC_VIDEO = "firesmart/camera"
TOPIC_CONTROL = "firesmart/control"
TOPIC_ALERT = "firesmart/alert"

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe(TOPIC_CONTROL)

def on_message(client, userdata, message):
    msg = message.payload.decode()
    print(f"Received message: {msg}")
    if msg == 'on':
        control_relay()
        with open("location.txt","r") as file:
                locate_ggmap = file.read()
                #data_lora = 'https://google.com/maps?q='+locate_ggmap
                #lora.start(data_lora)
                send_mess_locate(locate_ggmap)
    elif msg == 'off':
        setpin_relay()

def send_mqtt_alert(client, topic_alert, alert):
    client.publish(topic_alert, alert)

# Initialize MQTT Client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(BROKER, PORT, 60)
client.loop_start()

# Asynchronous Frame Publishing
async def publish_frames(frame_queue):
    while True:
        frame = frame_queue.get()
        if frame is None:
            break
        _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        client.publish(TOPIC_VIDEO, jpg_as_text)
        await asyncio.sleep(0.1)

def run_event_loop(loop, frame_queue):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(publish_frames(frame_queue))

# Alarm Handling
def alarm_fire():
    upload_file_to_server(get_gps_position)
    send_mqtt_alert(client, TOPIC_ALERT, "detected")
    send_mes('https://dat.inotev.net/firesmart')
    print("Fire detected and alarm activated")

# Load Model
model = FireSmokeEfficientNet.from_arch('efficientnet-b0')
model._fc = nn.Linear(1280, 3)
model_para = torch.load('./checkpoint.pth.tar', map_location='cpu')
model.load_state_dict({k[7:]: v for k, v in model_para['state_dict'].items()})

# Image Preprocessing
tfms = transforms.Compose([
    transforms.Resize(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# Load Labels
labels_map = json.load(open('examples/simple/fire_smoke_map.txt'))
labels_map = [labels_map[str(i)] for i in range(3)]

# Initialize Camera
cap = cv2.VideoCapture(0)

# Initialize Event Loop and Frame Queue
frame_queue = Queue()
loop = asyncio.new_event_loop()
executor = ThreadPoolExecutor()
executor.submit(run_event_loop, loop, frame_queue)

# Alarm Control Variables
alarm_thread = None
fire_detected = False

# Main Loop
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_queue.put(frame)

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(frame_rgb.astype(np.uint8))

    img = tfms(image).unsqueeze(0)
    model.eval()
    with torch.no_grad():
        outputs = model(img)

    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype('simkai.ttf', 30)

    for idx in torch.topk(outputs, k=2).indices.squeeze(0).tolist():
        prob = torch.softmax(outputs, dim=1)[0, idx].item()
        position = (10, 30 * (idx + 1) - 20)
        text = f'{labels_map[idx]:<5} :{prob:.2f}%'
        draw.text(position, text, font=font, fill="#ff0000")

        if ((prob > 0.5 and labels_map[idx] in {'fire', 'smoke'}) and not fire_detected):
            print(f'{labels_map[idx]:<75} ({prob:.2f}%)')
            image.save('/home/pi/Desktop/picture_detected/photo1.JPEG')
            if alarm_thread is None or not alarm_thread.is_alive():
                alarm_thread = threading.Thread(target=alarm_fire)
                alarm_thread.start()
            fire_detected = True

    if ((read_dht22() > 40) or (read_mq2() == True)) and not fire_detected:
        image.save('/home/pi/Desktop/picture_detected/photo1.JPEG')
        if alarm_thread is None or not alarm_thread.is_alive():
            alarm_thread = threading.Thread(target=alarm_fire)
            alarm_thread.start()
        fire_detected = True

    opencv_image = np.array(image.convert("RGB"))[:, :, ::-1]
    cv2.imshow('Object', opencv_image)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

frame_queue.put(None)
cap.release()
client.disconnect()
loop.stop()
executor.shutdown()
cv2.destroyAllWindows()
