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
    // Check if the 'data' parameter is set in the POST request
    if (isset($_POST["data"])) {
        // Database connection parameters
        include 'db_connection.php';

        // Prepare SQL statement to update based on 'data' value
        $isChecked = $_POST["data"];
        if ($isChecked === "AUTO" || $isChecked === "CONTROL") {
            $sql = "UPDATE controltb SET mode = '" . $isChecked . "' WHERE node = 'D2101'";
        } else if ($isChecked === "0" || $isChecked === "1") {
            $sql = "UPDATE controltb SET control = '" . $isChecked . "' WHERE node = 'D2101'";
        } else if ($isChecked === "i" || $isChecked === "d") {
            $sql = "UPDATE controltb SET control = '" . $isChecked . "' WHERE node = 'D2101'";
        } else {
                // Invalid data received
            header('Content-Type: application/json');
            echo json_encode(array("error" => "Invalid data received"));
            exit();
        }

        // Execute SQL statement
        if ($conn->query($sql) === TRUE) {
            // Return JSON response on success
            header('Content-Type: application/json');
            echo json_encode(array("message" => "Operation successful"));
        } else {
            // Return JSON response on error
            header('Content-Type: application/json');
            echo json_encode(array("error" => "Error updating state: " . $conn->error));
        }

        // Close connection
        $conn->close();
    } else {
        // If 'data' parameter is not set, return an error response
        header('Content-Type: application/json');
        echo json_encode(array("error" => "'data' parameter is missing"));
    }
} else {
    // If request method is not POST, return an error response
    header('Content-Type: application/json');
    echo json_encode(array("error" => "Only POST requests are allowed"));
}
?>