<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Allow certain HTTP methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Allow certain headers
header("Access-Control-Allow-Headers: Content-Type");

// Allow credentials (if needed)
header("Access-Control-Allow-Credentials: true");

function getDataFromDatabaseD2101()
{
    // Thông tin kết nối đến cơ sở dữ liệu
    include 'db_connection.php';

    // Truy vấn dữ liệu từ bảng temperature_data
    $sqlTemp = "SELECT temperature, humidity FROM labdb ORDER BY datetime DESC LIMIT 1";
    $resultTemp = $conn->query($sqlTemp);

    if ($resultTemp->num_rows > 0) {
        // Lấy dữ liệu nhiệt độ và độ ẩm từ hàng đầu tiên
        $rowTemp = $resultTemp->fetch_assoc();
        $dataTemp = array(
            'temperature' => $rowTemp['temperature'],
            'humidity' => $rowTemp['humidity']
        );
    } else {
        $dataTemp = array(
            'temperature' => 'N/A',
            'humidity' => 'N/A'
        );
    }

    // Truy vấn dữ liệu từ bảng images
    $sqlImages = "SELECT url, timestamp FROM images ORDER BY timestamp DESC";
    $resultImages = $conn->query($sqlImages);

    $dataImages = array();
    while ($rowImages = $resultImages->fetch_assoc()) {
        $dataImages[] = array(
            'url' => $rowImages['url'],
            'timestamp' => $rowImages['timestamp']
        );
    }

    // Đóng kết nối
    $conn->close();

    // Trả về dữ liệu dưới dạng JSON
    return array(
        'temperature_data' => $dataTemp,
        'image_data' => $dataImages
    );
}

// Sử dụng hàm để lấy dữ liệu từ cơ sở dữ liệu
$data = getDataFromDatabaseD2101();

// Xuất dữ liệu dưới dạng JSON để có thể sử dụng trong mã JavaScript
echo json_encode($data);
?>
