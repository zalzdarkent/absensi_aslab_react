#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/queue.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// ==========================================
// KONFIGURASI LCD & PIN I2C
// ==========================================
#define I2C_SDA 25
#define I2C_SCL 26
// Alamat LCD biasanya 0x27 atau 0x3F. Jika tidak tampil, coba ganti.
LiquidCrystal_I2C lcd(0x27, 16, 2); 

// ==========================================
// KONFIGURASI WIFI & SERVER
// ==========================================
const char *ssid = "Asisten Laboratorium";
const char *password = "2025Labkomp:3";

// API Endpoints
String registrationEndpoint = "http://36.50.94.112:8081/api/rfid/scan-for-registration";
String attendanceEndpoint = "http://36.50.94.112:8081/api/rfid/scan";
String commandEndpoint = "http://36.50.94.112:8081/api/rfid/get-mode-command";

// ==========================================
// KONFIGURASI RFID
// ==========================================
#define RST_PIN 22
#define SS_PIN 21
#define MODE_BUTTON_PIN 2  
#define LED_REG_PIN 4      
#define LED_ATT_PIN 5      
 
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

// Variabel untuk komunikasi antar Task (Display)
volatile bool showSuccessPopup = false;
String userNameToDisplay = "";

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

// Helper Function: Extract Value from JSON String simple
String extractJsonValue(String json, String key) {
  String keyPattern = "\"" + key + "\":\"";
  int start = json.indexOf(keyPattern);
  if (start == -1) return "";
  start += keyPattern.length();
  int end = json.indexOf("\"", start);
  if (end == -1) return "";
  return json.substring(start, end);
}

// Helper Function: Get First Name only
String getFirstName(String fullName) {
  int spaceIndex = fullName.indexOf(' ');
  if (spaceIndex == -1) return fullName; // No space, return full string
  return fullName.substring(0, spaceIndex);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP32 DUAL MODE RFID SYSTEM ===");

  // Initialize I2C custom pins & LCD
  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  
  // Intro LCD
  lcd.setCursor(0, 0);
  lcd.print("System Booting..");
  lcd.setCursor(0, 1);
  lcd.print("Please Wait...");

  // Initialize pins
  pinMode(MODE_BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_REG_PIN, OUTPUT);
  pinMode(LED_ATT_PIN, OUTPUT);

  updateModeIndicators();

  // Initialize SPI and RFID
  SPI.begin(18, 19, 23, 21);
  mfrc522.PCD_Init();

  Serial.println("RFID reader initialized");

  if (mfrc522.PCD_PerformSelfTest()) {
    Serial.println("✓ RFID Reader OK");
  } else {
    Serial.println("✗ RFID Reader FAILED");
    lcd.clear();
    lcd.print("RFID FAILED!");
    delay(2000);
  }
  mfrc522.PCD_Init();

  // Initialize FreeRTOS components
  rfidQueue = xQueueCreate(10, sizeof(RFIDData));
  wifiMutex = xSemaphoreCreateMutex();

  connectWiFi();

  // Create Tasks
  xTaskCreatePinnedToCore(rfidScanTask, "RFID_Scan", 4096, NULL, 2, &rfidTaskHandle, 1);
  xTaskCreatePinnedToCore(networkTask, "Network_Handler", 8192, NULL, 1, &networkTaskHandle, 0);
  xTaskCreatePinnedToCore(displayTask, "Display_Status", 4096, NULL, 1, &displayTaskHandle, 1); // Increased stack & moved to Core 1 for I2C safety
  xTaskCreatePinnedToCore(commandTask, "Command_Listener", 4096, NULL, 1, &commandTaskHandle, 0);

  Serial.println("\n=== SYSTEM READY ===");
}

void loop() {
  delay(100);
}

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  lcd.clear();
  lcd.print("Connecting WiFi");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    Serial.print(".");
    lcd.print(".");
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    lcd.clear();
    lcd.print("WiFi Connected!");
    delay(1000);
  } else {
    Serial.println("\n✗ WiFi Failed.");
    lcd.clear();
    lcd.print("WiFi Failed!");
    delay(1000);
  }
}

void updateModeIndicators() {
  if (currentMode == MODE_REGISTRATION) {
    digitalWrite(LED_REG_PIN, HIGH);
    digitalWrite(LED_ATT_PIN, LOW);
  } else {
    digitalWrite(LED_REG_PIN, LOW);
    digitalWrite(LED_ATT_PIN, HIGH);
  }
}

// --------------------------------------------------------------------------
// TASK: RFID SCAN
// --------------------------------------------------------------------------
void rfidScanTask(void *pvParameters) {
  RFIDData rfidData;
  while (true) {
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      String uid = "";
      for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(mfrc522.uid.uidByte[i], HEX);
      }
      uid.toUpperCase();

      rfidData.uid = uid;
      rfidData.mode = currentMode;
      rfidData.timestamp = millis();

      // Beri notifikasi visual sebentar di LCD
      if(!showSuccessPopup) {
         lcd.clear();
         lcd.setCursor(0,0);
         lcd.print("Processing...");
      }

      if (xQueueSend(rfidQueue, &rfidData, pdMS_TO_TICKS(100)) == pdPASS) {
        Serial.println("\n=== KARTU TERDETEKSI: " + uid);
      }

      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      vTaskDelay(pdMS_TO_TICKS(1000)); 
    }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

// --------------------------------------------------------------------------
// TASK: NETWORK HANDLER
// --------------------------------------------------------------------------
void networkTask(void *pvParameters) {
  RFIDData receivedData;
  while (true) {
    if (xQueueReceive(rfidQueue, &receivedData, pdMS_TO_TICKS(1000)) == pdPASS) {
      if (xSemaphoreTake(wifiMutex, pdMS_TO_TICKS(5000)) == pdPASS) {
        if (WiFi.status() == WL_CONNECTED) {
          String endpoint = (receivedData.mode == MODE_REGISTRATION) ? registrationEndpoint : attendanceEndpoint;
          
          WiFiClient client;
          HTTPClient http;
          http.setTimeout(8000);
          http.begin(client, endpoint);
          http.addHeader("Content-Type", "application/json");

          String jsonData = "{\"rfid_code\":\"" + receivedData.uid + "\"}";
          if (receivedData.mode != MODE_REGISTRATION) {
            String type = (receivedData.mode == MODE_CHECK_IN) ? "check_in" : "check_out";
            jsonData = "{\"rfid_code\":\"" + receivedData.uid + "\",\"type\":\"" + type + "\"}";
          }

          int httpCode = http.POST(jsonData);
          String payload = http.getString();

          Serial.println("Response: " + payload);

          if (httpCode == 200) {
            if (receivedData.mode == MODE_REGISTRATION) {
               // Registrasi sukses (Web based), LCD tetap mode saja
               Serial.println("Registrasi Sukses terkirim");
            } else {
               // Absensi Sukses
               // Coba ambil nama dari JSON response. 
               // Asumsi JSON: {"message":"Success", "data": {"name": "Budi Santoso"}}
               // Atau simple: {"name": "Budi Santoso"}
               
               // Cari field "name" atau "nama" di response
               String extractedName = extractJsonValue(payload, "name");
               if (extractedName == "") extractedName = extractJsonValue(payload, "nama");
               
               // Jika tidak ketemu nama di JSON, pakai default "User"
               if (extractedName == "") extractedName = "Member";

               // Siapkan variabel untuk ditampilkan di Display Task
               userNameToDisplay = getFirstName(extractedName);
               showSuccessPopup = true; // Trigger LCD
            }
          } else {
            // Error handling (opsional, bisa tampilkan error di LCD jika mau)
            Serial.println("HTTP Error");
          }
          http.end();
        } 
        xSemaphoreGive(wifiMutex);
      }
    }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

// --------------------------------------------------------------------------
// TASK: DISPLAY STATUS (LCD)
// --------------------------------------------------------------------------
void displayTask(void *pvParameters) {
  SystemMode lastMode = MODE_CHECK_OUT; // Init beda biar update awal
  bool lastWifiState = false;
  unsigned long lcdRefreshTimer = 0;

  while (true) {
    // 1. Cek apakah harus menampilkan Pop-up Sukses Absensi?
    if (showSuccessPopup) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Absen Sukses!");
      lcd.setCursor(0, 1);
      
      // Tampilkan "Halo, [Nama Depan]"
      String msg = "Halo, " + userNameToDisplay;
      // Jika kepanjangan, potong
      if (msg.length() > 16) msg = msg.substring(0, 16);
      lcd.print(msg);

      // Tahan 3 Detik
      vTaskDelay(pdMS_TO_TICKS(3000));
      
      // Reset Flag & Bersihkan
      showSuccessPopup = false;
      lcd.clear();
      lastMode = (SystemMode)-1; // Paksa refresh tampilan mode
    } 
    
    // 2. Tampilan Default (Mode Standby)
    else {
      // Update setiap 500ms atau jika mode berubah
      if (millis() - lcdRefreshTimer > 500 || currentMode != lastMode) {
        
        // Baris 1: Mode
        lcd.setCursor(0, 0);
        if (currentMode == MODE_REGISTRATION) {
           lcd.print("MODE: REGISTRASI");
        } else if (currentMode == MODE_CHECK_IN) {
           lcd.print("MODE: ABSEN MSK ");
        } else {
           lcd.print("MODE: ABSEN KLR ");
        }

        // Baris 2: Status WiFi atau Pesan
        lcd.setCursor(0, 1);
        if (WiFi.status() == WL_CONNECTED) {
           // Tampilkan IP belakang atau Ready
           // lcd.print("Ready " + WiFi.localIP().toString());
           lcd.print("Silahkan Scan...");
        } else {
           lcd.print("WiFi Disconnect ");
        }

        lastMode = currentMode;
        lcdRefreshTimer = millis();
      }
    }

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// --------------------------------------------------------------------------
// TASK: COMMAND LISTENER
// --------------------------------------------------------------------------
void commandTask(void *pvParameters) {
  while (true) {
    if (xSemaphoreTake(wifiMutex, pdMS_TO_TICKS(3000)) == pdPASS) {
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClient client;
        HTTPClient http;
        http.setTimeout(3000);
        http.begin(client, commandEndpoint);
        int httpCode = http.GET();

        if (httpCode == 200) {
          String response = http.getString();
          if (response.indexOf("registration") > -1) currentMode = MODE_REGISTRATION;
          else if (response.indexOf("check_in") > -1) currentMode = MODE_CHECK_IN;
          else if (response.indexOf("check_out") > -1) currentMode = MODE_CHECK_OUT;
          
          updateModeIndicators();
        }
        http.end();
      }
      xSemaphoreGive(wifiMutex);
    }
    vTaskDelay(pdMS_TO_TICKS(3000));
  }
}