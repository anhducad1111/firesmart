<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Allow certain HTTP methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Allow certain headers
header("Access-Control-Allow-Headers: Content-Type");

// Allow credentials (if needed)
header("Access-Control-Allow-Credentials: true");

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Database connection parameters
    include 'db_connection.php';

    // Check if the 'data' parameter is set in the POST request
    if (isset($_POST["data"])) {
        // Prepare SQL statement to update based on 'data' value
        $isChecked = $_POST["data"];
        if ($isChecked === "AUTO" || $isChecked === "CONTROL") {
            $sql = "UPDATE controltb SET mode = '" . $conn->real_escape_string($isChecked) . "' WHERE node = 'D2101'";
        } else if ($isChecked === "0" || $isChecked === "1") {
            $sql = "UPDATE controltb SET control = '" . $conn->real_escape_string($isChecked) . "' WHERE node = 'D2101'";
        } else if ($isChecked === "i" || $isChecked === "d") {
            $sql = "UPDATE controltb SET control = '" . $conn->real_escape_string($isChecked) . "' WHERE node = 'D2101'";
        } else {
            // Invalid data received
            header('Content-Type: application/json');
            echo json_encode(array("error" => "Invalid data received"));
            exit();
        }

        // Execute SQL statement
        if ($conn->query($sql) === TRUE) {
            echo json_encode(array("message" => "Operation successful"));
        } else {
            echo json_encode(array("error" => "Error updating state: " . $conn->error));
        }
    }

    // Check if 'url' and 'timestamp' parameters are set in the POST request
    if (isset($_POST["url"]) && isset($_POST["timestamp"])) {
        // Escape user inputs for security
        $url = $conn->real_escape_string($_POST["url"]);
        $timestamp = $conn->real_escape_string($_POST["timestamp"]);

        // Prepare SQL statement to insert image data into 'images' table
        $sql = "INSERT INTO images (url, timestamp) VALUES ('$url', '$timestamp')";

        // Execute SQL statement
        if ($conn->query($sql) === TRUE) {
            echo json_encode(array("message" => "Image saved successfully"));
        } else {
            echo json_encode(array("error" => "Error saving image: " . $conn->error));
        }
    }

    // If neither 'data' nor 'url' and 'timestamp' parameters are set, return an error response
    if (!isset($_POST["data"]) && (!isset($_POST["url"]) || !isset($_POST["timestamp"]))) {
        echo json_encode(array("error" => "'data', 'url', or 'timestamp' parameter is missing"));
    }

    // Close connection
    $conn->close();
} else {
    // If request method is not POST, return an error response
    header('Content-Type: application/json');
    echo json_encode(array("error" => "Only POST requests are allowed"));
}
?>
