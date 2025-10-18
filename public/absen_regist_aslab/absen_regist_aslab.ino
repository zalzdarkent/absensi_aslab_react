#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/queue.h>

// WiFi
const char *ssid = "Ya";
const char *password = "wooyoungie";
  
// API Endpoints Laravel
String registrationEndpoint = "http://10.169.100.54:8000/api/rfid/scan-for-registration";
String attendanceEndpoint = "http://10.169.100.54:8000/api/rfid/scan";

// RFID
#define RST_PIN 22
#define SS_PIN 21
#define MODE_BUTTON_PIN 2  // Pin untuk switch mode
#define LED_REG_PIN 4      // LED indikator mode registrasi (hijau)
#define LED_ATT_PIN 5      // LED indikator mode absensi (biru)

MFRC522 mfrc522(SS_PIN, RST_PIN);

// System Variables
enum SystemMode {
  MODE_REGISTRATION,
  MODE_CHECK_IN,
  MODE_CHECK_OUT
};

SystemMode currentMode = MODE_REGISTRATION;
QueueHandle_t rfidQueue;
SemaphoreHandle_t wifiMutex;
String commandEndpoint = "http://10.169.100.54:8000/api/rfid/get-mode-command";

struct RFIDData {
  String uid;
  SystemMode mode;
  unsigned long timestamp;
};

// Task Handles
TaskHandle_t rfidTaskHandle;
TaskHandle_t networkTaskHandle;
TaskHandle_t displayTaskHandle;
TaskHandle_t commandTaskHandle;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP32 DUAL MODE RFID SYSTEM ===");

  // Initialize pins
  pinMode(MODE_BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_REG_PIN, OUTPUT);
  pinMode(LED_ATT_PIN, OUTPUT);

  // Set initial mode indicators
  updateModeIndicators();

  // Initialize SPI and RFID
  SPI.begin(18, 19, 23, 21);  // SCK, MISO, MOSI, SS
  mfrc522.PCD_Init();

  Serial.println("RFID reader initialized");

  // Test RFID reader
  if (mfrc522.PCD_PerformSelfTest()) {
    Serial.println("✓ RFID Reader OK");
  } else {
    Serial.println("✗ RFID Reader FAILED");
  }
  mfrc522.PCD_Init();  // Re-init after self test

  // Initialize FreeRTOS components
  rfidQueue = xQueueCreate(10, sizeof(RFIDData));
  wifiMutex = xSemaphoreCreateMutex();

  // Connect WiFi
  connectWiFi();

  // Create FreeRTOS Tasks
  xTaskCreatePinnedToCore(
    rfidScanTask,     // Task function
    "RFID_Scan",      // Task name
    4096,             // Stack size
    NULL,             // Parameters
    2,                // Priority
    &rfidTaskHandle,  // Task handle
    1                 // Core 1
  );

  xTaskCreatePinnedToCore(
    networkTask,         // Task function
    "Network_Handler",   // Task name
    8192,                // Stack size
    NULL,                // Parameters
    1,                   // Priority
    &networkTaskHandle,  // Task handle
    0                    // Core 0
  );

  xTaskCreatePinnedToCore(
    displayTask,         // Task function
    "Display_Status",    // Task name
    2048,                // Stack size
    NULL,                // Parameters
    1,                   // Priority
    &displayTaskHandle,  // Task handle
    0                    // Core 0
  );

  xTaskCreatePinnedToCore(
    commandTask,         // Task function
    "Command_Listener",  // Task name
    4096,                // Stack size
    NULL,                // Parameters
    1,                   // Priority
    &commandTaskHandle,  // Task handle
    0                    // Core 0
  );

  Serial.println("\n=== SYSTEM READY ===");
  printCurrentMode();
  Serial.println("Listening for web commands to change mode...");
  Serial.println("===============================================");
}

void loop() {
  // Main loop mostly empty, tasks handle everything
  delay(100);
}

// WiFi Connection Function
void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.mode(WIFI_STA);  // Mode station
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();

  // Tunggu sampai 10 detik
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    Serial.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength (RSSI): ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.print("\n✗ WiFi Failed. Status Code: ");
    Serial.println(WiFi.status());
    // Tambahan info
    if (WiFi.status() == WL_NO_SSID_AVAIL) Serial.println("SSID not found!");
    else if (WiFi.status() == WL_CONNECT_FAILED) Serial.println("Password salah!");
    else if (WiFi.status() == WL_IDLE_STATUS) Serial.println("Idle, belum connect.");
    else if (WiFi.status() == WL_DISCONNECTED) Serial.println("Disconnected.");
  }
}

// Update LED indicators based on current mode
void updateModeIndicators() {
  if (currentMode == MODE_REGISTRATION) {
    digitalWrite(LED_REG_PIN, HIGH);  // Green LED ON
    digitalWrite(LED_ATT_PIN, LOW);   // Blue LED OFF
  } else {
    digitalWrite(LED_REG_PIN, LOW);   // Green LED OFF
    digitalWrite(LED_ATT_PIN, HIGH);  // Blue LED ON
  }
}

// Print current mode to serial
void printCurrentMode() {
  Serial.println("\n=== MODE CHANGED ===");
  if (currentMode == MODE_REGISTRATION) {
    Serial.println("🔧 REGISTRATION MODE");
    Serial.println("Scan cards to register new RFID");
  } else if (currentMode == MODE_CHECK_IN) {
    Serial.println("📋 CHECK-IN MODE");
    Serial.println("Scan registered cards for check-in");
  } else {
    Serial.println("📤 CHECK-OUT MODE");
    Serial.println("Scan registered cards for check-out");
  }
  Serial.println("====================");
}

// FreeRTOS Task: RFID Scanning
void rfidScanTask(void *pvParameters) {
  RFIDData rfidData;

  while (true) {
    // Cek kartu RFID
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {

      // Ambil UID RFID
      String uid = "";
      for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) {
          uid += "0";
        }
        uid += String(mfrc522.uid.uidByte[i], HEX);
      }
      uid.toUpperCase();

      // Prepare data for queue
      rfidData.uid = uid;
      rfidData.mode = currentMode;
      rfidData.timestamp = millis();

      // Send to queue
      if (xQueueSend(rfidQueue, &rfidData, pdMS_TO_TICKS(100)) == pdPASS) {
        Serial.println("\n=== KARTU TERDETEKSI ===");
        Serial.println("UID: " + uid);
        String modeStr = (currentMode == MODE_REGISTRATION) ? "REGISTRATION" : (currentMode == MODE_CHECK_IN) ? "CHECK-IN"
                                                                                                              : "CHECK-OUT";
        Serial.println("Mode: " + modeStr);
        Serial.println("========================");
      }

      // Halt PICC and stop encryption
      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();

      vTaskDelay(pdMS_TO_TICKS(2000));  // Prevent spam scanning
    }

    vTaskDelay(pdMS_TO_TICKS(100));  // Task delay
  }
}

// FreeRTOS Task: Network Handler
void networkTask(void *pvParameters) {
  RFIDData receivedData;

  while (true) {
    // Wait for RFID data from queue
    if (xQueueReceive(rfidQueue, &receivedData, pdMS_TO_TICKS(1000)) == pdPASS) {

      // Take WiFi mutex
      if (xSemaphoreTake(wifiMutex, pdMS_TO_TICKS(5000)) == pdPASS) {

        if (WiFi.status() == WL_CONNECTED) {
          String endpoint = (receivedData.mode == MODE_REGISTRATION) ? registrationEndpoint : attendanceEndpoint;

          sendRFIDData(receivedData.uid, endpoint, receivedData.mode);
        } else {
          Serial.println("✗ WiFi Disconnected - Reconnecting...");
          WiFi.reconnect();
        }

        // Release WiFi mutex
        xSemaphoreGive(wifiMutex);
      }
    }

    vTaskDelay(pdMS_TO_TICKS(100));  // Task delay
  }
}

// FreeRTOS Task: Display Status
void displayTask(void *pvParameters) {
  unsigned long lastStatusTime = 0;

  while (true) {
    unsigned long currentTime = millis();

    // Status check setiap 15 detik
    if (currentTime - lastStatusTime > 15000) {
      Serial.println("\n[STATUS] System running...");
      String modeStr = (currentMode == MODE_REGISTRATION) ? "REGISTRATION" : (currentMode == MODE_CHECK_IN) ? "CHECK-IN"
                                                                                                            : "CHECK-OUT";
      Serial.println("Mode: " + modeStr);
      Serial.println("WiFi: " + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected"));
      Serial.println("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
      Serial.println("Queue Messages: " + String(uxQueueMessagesWaiting(rfidQueue)));

      lastStatusTime = currentTime;
    }

    vTaskDelay(pdMS_TO_TICKS(5000));  // Check every 5 seconds
  }
}

// Send RFID data to server
void sendRFIDData(String uid, String endpoint, SystemMode mode) {
  HTTPClient http;
  http.setTimeout(5000);
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{\"rfid_code\":\"" + uid + "\"}";

  if (mode == MODE_CHECK_IN || mode == MODE_CHECK_OUT) {
    // For attendance, also send timestamp and type
    String attendanceType = (mode == MODE_CHECK_IN) ? "check_in" : "check_out";
    jsonData = "{\"rfid_code\":\"" + uid + "\",\"type\":\"" + attendanceType + "\",\"timestamp\":\"" + String(millis()) + "\"}";
  }

  Serial.println("Sending to: " + endpoint);
  Serial.println("JSON Data: " + jsonData);

  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response Code: " + String(httpResponseCode));
    Serial.println("Response: " + response);

    if (httpResponseCode == 200) {
      if (mode == MODE_REGISTRATION) {
        Serial.println("✓ RFID tersedia untuk registrasi");
      } else if (mode == MODE_CHECK_IN) {
        Serial.println("✓ Check-in berhasil dicatat");
      } else {
        Serial.println("✓ Check-out berhasil dicatat");
      }
    } else {
      if (mode == MODE_REGISTRATION) {
        Serial.println("✗ RFID sudah terdaftar atau error");
      } else {
        Serial.println("✗ RFID tidak terdaftar atau error absensi");
      }
    }
  } else {
    Serial.print("HTTP Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

// FreeRTOS Task: Command Listener
void commandTask(void *pvParameters) {
  while (true) {
    // Check for mode commands from web every 3 seconds
    if (xSemaphoreTake(wifiMutex, pdMS_TO_TICKS(3000)) == pdPASS) {

      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.setTimeout(3000);
        http.begin(commandEndpoint);

        int httpResponseCode = http.GET();

        if (httpResponseCode == 200) {
          String response = http.getString();

          // Parse JSON response to get mode command
          if (response.indexOf("\"mode\":\"registration\"") > -1) {
            if (currentMode != MODE_REGISTRATION) {
              currentMode = MODE_REGISTRATION;
              updateModeIndicators();
              printCurrentMode();
            }
          } else if (response.indexOf("\"mode\":\"check_in\"") > -1) {
            if (currentMode != MODE_CHECK_IN) {
              currentMode = MODE_CHECK_IN;
              updateModeIndicators();
              printCurrentMode();
            }
          } else if (response.indexOf("\"mode\":\"check_out\"") > -1) {
            if (currentMode != MODE_CHECK_OUT) {
              currentMode = MODE_CHECK_OUT;
              updateModeIndicators();
              printCurrentMode();
            }
          }
        }

        http.end();
      }

      xSemaphoreGive(wifiMutex);
    }

    vTaskDelay(pdMS_TO_TICKS(3000));  // Check every 3 seconds
  }
}
