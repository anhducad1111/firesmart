<?php
include 'db_connection.php';
$api_key = 'iotlab'; // API key for NodeMCU, to validate the data sent from NodeMCU

// Get date and time variables
//date_default_timezone_set('Asia/Ho_Chi_Minh');  // for other timezones, refer:- https://www.php.net/manual/en/tim>   // $d = date("Y-m-d");
//   $t = date("H:i:s");

// If values send by NodeMCU are not empty then insert into MySQL database table
//echo $_POST;
//if(!empty($_POST['temperature']) && !empty($_POST['humidity']) )
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    echo var_dump($_POST);
    if ($_POST["api_key"] == $api_key) {
        echo "Oke";
        $node = $_POST["node"];
        $val = $_POST["temperature"];
        $val2 = $_POST["humidity"];
        $ac_state = $_POST["ac_state"];
        echo "Node: " . $node . "<br>";

        // Update your tablename here
        $sql = "INSERT INTO labdb (node, temperature, humidity, state_AC) VALUES ('" . $node . "','" . $val . "', '" . $v . '","' . $val2 . "', '" . $ac_state . "')";
        echo $sql;
        if ($conn->query($sql) === TRUE) {
            echo "Values inserted in MySQL database table.";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "no data";
    }
}
echo 'end';
// Close MySQL connection
$conn->close();
