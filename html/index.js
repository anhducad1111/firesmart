const brokerUrl = "wss://test.mosquitto.org:8081/mqtt";
const video = document.getElementById("videoStream1");
const topicControl = "firesmart/control";
const topicVideo = "firesmart/camera";
const topicAlert = "firesmart/alert";
const clientId = "web_" + Math.random().toString(16).substr(2, 8);

const client = mqtt.connect(brokerUrl, { clientId: clientId });

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(topicControl, function (err) {
    if (!err) {
      console.log("Subscribed to topicControl");
    }
  });
  client.subscribe(topicVideo, function (err) {
    if (!err) {
      console.log("Subscribed to topicVideo");
    }
  });
  client.subscribe(topicAlert, function (err) {
    if (!err) {
      console.log("Subscribed to topicAlert");
    }
  });
});

client.on("error", (err) => {
  console.error("Connection error: ", err);
});

function turnOn() {
  sendMessage("on");
}

function turnOff() {
  sendMessage("off");
}

client.on("message", function (topic, message) {
  if (topic === topicVideo) {
    const imgSrc = "data:image/jpeg;base64," + message.toString();
    video.src = imgSrc;
  } else if (topic === topicAlert) {
    showNotificationModal(message.toString());
  }
});

function sendMessage(message) {
  if (client.connected) {
    client.publish(topicControl, message, { qos: 0, retain: false });
    console.log("Message sent:", message);
  } else {
    console.error("Unable to send message, client not connected");
  }
}
function getDataFromServerD2101() {
  fetch("https://dat.inotev.net/api/getDataD2101.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Hiển thị nhiệt độ và độ ẩm
      document.getElementById("temperatureD2101").innerText =
        data.temperature + "°C";
      document.getElementById("humidityD2101").innerText = data.humidity + "%";

      updateDataD2101(data);

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function getDataImageFromServerD2101() {
  fetch("https://dat.inotev.net/api/getDataImageD2101.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const imageListContainer = document.getElementById("imageList");
      const template = document.getElementById("imageTemplate").content;

      // Clear existing content (optional, depends on your use case)
      imageListContainer.innerHTML = "";

      // Loop through the image data and create new elements
      data.forEach((imageData) => {
        // Clone the template content
        const clone = document.importNode(template, true);

        // Populate the cloned template with data
        const imgElement = clone.querySelector(".image-placeholder");
        imgElement.src = imageData.url;

        const locationElement = clone.querySelector(".location-placeholder");
        locationElement.innerText = imageData.location || "...";

        const timeElement = clone.querySelector(".time-placeholder");
        timeElement.innerText = new Date(imageData.timestamp).toLocaleString();

        // Append the populated template to the container
        imageListContainer.appendChild(clone);
        updateImageDataD2101(data);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
// Call the function to load data
getDataImageFromServerD2101();
function updateImageDataD2101(data) {
  const imageListContainer = document.getElementById("imageList");
  const template = document.getElementById("imageTemplate").content;

  // Clear existing content (optional, depends on your use case)
  imageListContainer.innerHTML = "";

  // Loop through the image data and create new elements
  data.forEach((imageData) => {
    // Clone the template content
    const clone = document.importNode(template, true);

    // Populate the cloned template with data
    const imgElement = clone.querySelector(".image-placeholder");
    imgElement.src = imageData.url;

    const locationElement = clone.querySelector(".location-placeholder");
    locationElement.innerText = imageData.location || "...";

    const timeElement = clone.querySelector(".time-placeholder");
    timeElement.innerText = new Date(imageData.timestamp).toLocaleString();

    // Append the populated template to the container
    imageListContainer.appendChild(clone);
  });
}

var temperatureDataD2101 = [];
var humidityDataD2101 = [];
var labelsD2101 = [];

var ctxD2101 = document.getElementById("chartD2101").getContext("2d");

var chartD2101 = new Chart(ctxD2101, {
  type: "line",
  data: {
    labels: labelsD2101,
    datasets: [
      {
        label: "Temperature D2101 (°C)",
        data: temperatureDataD2101,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Humidity D2101 (%)",
        data: humidityDataD2101,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  },
});

// Cập nhật dữ liệu mỗi 5 giây cho cả D2101 và D2102...
setInterval(getDataFromServerD2101, 5000);

// Đảm bảo lấy dữ liệu ban đầu khi trang được tải
getDataFromServerD2101();

function updateDataD2101(dataD2101) {
  var temperatureD2101 = document.getElementById("temperatureD2101");
  var humidityD2101 = document.getElementById("humidityD2101");

  temperatureD2101.innerHTML = dataD2101.temperature + "°C";
  humidityD2101.innerHTML = dataD2101.humidity + "%";

  // Thêm dữ liệu vào biểu đồ D2101
  temperatureDataD2101.push(dataD2101.temperature);
  humidityDataD2101.push(dataD2101.humidity);
  labelsD2101.push(
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
  );
  // labelsD2101.push(dataD2101.time);

  // Giới hạn số lượng mẫu dữ liệu trên biểu đồ D2101
  if (temperatureDataD2101.length > 20) {
    temperatureDataD2101.shift();
    humidityDataD2101.shift();
    labelsD2101.shift();
  }

  // Cập nhật biểu đồ D2101
  chartD2101.update();
}
var currentIndexd2101 = 25;

function incrementIndex() {
  currentIndexd2101 =
    currentIndexd2101 === 30 ? currentIndexd2101 : ++currentIndexd2101;
  document.getElementById("indexDisplayd2101").innerText =
    currentIndexd2101 + "°C";

  fetch("https://dat.inotev.net/api/controlACD2101.php/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=i",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Handle the response data if needed
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function decrementIndex() {
  currentIndexd2101 =
    currentIndexd2101 === 18 ? currentIndexd2101 : --currentIndexd2101;
  document.getElementById("indexDisplayd2101").innerText =
    currentIndexd2101 + "°C";

  fetch("https://dat.inotev.net/api/controlACD2101.php/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=d",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Handle the response data if needed
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
function AutoAirConditionerStateD2101() {
  var airConditionerCheckbox = document.getElementById("auto-D2101");
  var isChecked = airConditionerCheckbox.checked ? "AUTO" : "CONTROL";
  sendData(isChecked); // Gọi hàm gửi dữ liệu lên server
}

function AirConditionerStateD2101() {
  var airConditionerCheckbox = document.getElementById("ACCheckboxD2101");
  var isChecked = airConditionerCheckbox.checked ? "1" : "0";
  sendData(isChecked); // Gọi hàm gửi dữ liệu lên server
}

function sendData(data) {
  fetch("https://dat.inotev.net/api/controlACD2101.php/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=" + encodeURIComponent(data), // Chuyển dữ liệu sang dạng phù hợp
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // Xử lý dữ liệu phản hồi nếu cần
    })
    .catch((error) => {
      console.error("Có vấn đề trong quá trình fetch:", error);
    });
}

function showNotificationModal(message) {
  var img = document.getElementById("notificationImage");
  var timestamp = new Date().getTime();
  img.src = "https://dat.inotev.net/firesmart/photo1.JPEG?" + timestamp;
  if (message === "detected") {
    // Trigger the modal to show up
    var notificationModal = new bootstrap.Modal(
      document.getElementById("notificationModal"),
      {
        keyboard: false,
      }
    );
    notificationModal.show();
  }
}
