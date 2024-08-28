<?php
header("Access-Control-Allow-Origin: *");

// Allow certain HTTP methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Allow certain headers
header("Access-Control-Allow-Headers: Content-Type");

// Allow credentials (if needed)
header("Access-Control-Allow-Credentials: true");

include 'db_connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->username) && isset($data->password)) {
        // Login Form
        $username = $data->username;
        $password = $data->password;

        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                echo json_encode(['status' => 'success', 'id' => $user['id']]);
            } else {
                echo "Invalid password.";
            }
        } else {
            echo "User not found.";
        }

        $stmt->close();
    } elseif (isset($data->registerUsername) && isset($data->fullname) && isset($data->password)) {
        // Register Form
        $registerUsername = $data->registerUsername;
        $fullname = $data->fullname;
        $password = $data->password;

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, fullname, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $registerUsername, $fullname, $hashedPassword);

        if ($stmt->execute()) {
            echo "User registered successfully!";
        } else {
            echo "Failed to register user.";
        }

        $stmt->close();
    } else {
        echo "Missing required fields.";
    }
}

// Close the connection
$conn->close();
?>