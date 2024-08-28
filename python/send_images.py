import paramiko
import requests
from datetime import datetime
import cv2

# SSH and API details
hostname = "your_server_ip"
port = 8022
username = "your_username"
password = "your_password"
local_path = "C:/Users/AnhDuc/Pictures/drone.png"
remote_dir = "/var/www/html/firesmart/photo/"
api_url = "your_api_url"

def connect_ssh(hostname, port, username, password):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, port=port, username=username, password=password)
        print(f"Đăng nhập thành công vào server {hostname} qua SSH!")
        return client
    except Exception as e:
        print(f"Lỗi khi kết nối SSH: {e}")
        return None

def open_laptop_camera():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Không thể mở camera")
        return

    while True:
        # Đọc frame từ camera
        ret, frame = cap.read()

        if not ret:
            print("Không thể nhận frame từ camera")
            break
        flipped_frame = cv2.flip(frame, 1)
        # Hiển thị frame
        cv2.imshow('Laptop Camera', flipped_frame)

        # Nhấn 'q' để thoát
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Giải phóng camera và đóng cửa sổ
    cap.release()
    cv2.destroyAllWindows()

def upload_file_to_server():
    try:
        def upload_file(sftp, local_path, remote_path):
            try:
                sftp.put(local_path, remote_path)
                print(f"Đã upload file {local_path} lên {remote_path}")
            except Exception as e:
                print(f"Lỗi khi upload file: {e}")
        
        def save_image_to_db(image_url, timestamp):
            try:
                # Prepare data to send via POST request
                data = {
                    'url': image_url,
                    'timestamp': timestamp
                }

                # Make a POST request to save the image data in the database
                response = requests.post(api_url, data=data)
                if response.status_code == 200:
                    response_data = response.json()
                    if 'error' in response_data:
                        print(f"Lỗi khi lưu thông tin ảnh vào database: {response_data['error']}")
                    else:
                        print("Đã lưu thông tin ảnh vào database thành công!")
                else:
                    print(f"Lỗi khi lưu thông tin ảnh vào database: {response.text}")
            except Exception as e:
                print(f"Lỗi khi gọi API để lưu ảnh: {e}")
        
        client = connect_ssh(hostname, port, username, password)
        if client:
            try:
                sftp = client.open_sftp()
                timestamp = datetime.now()
                remote_path = f"{remote_dir}photo_{timestamp}.jpeg"
                upload_file(sftp, local_path, remote_path)
                
                # URL của ảnh trên server
                image_url = f"http://{hostname}/firesmart/photo/photo_{timestamp}.jpeg"

                # Lưu thông tin ảnh vào database qua API
                save_image_to_db(image_url, timestamp)
            finally:
                sftp.close()
                client.close()
    
    except Exception as e:
        print(f"Lỗi khi upload file: {e}")

# Thực thi hàm để upload file vào server và lưu thông tin vào database
if __name__ == "__main__":
    open_laptop_camera()