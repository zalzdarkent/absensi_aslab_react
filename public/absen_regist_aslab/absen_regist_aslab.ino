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
// KONFIGURASI LCD & PIN I2C (SDA=25, SCL=26)
// ==========================================
#define I2C_SDA 25
#define I2C_SCL 26
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
  MODE_ATTENDANCE 
};

SystemMode currentMode = MODE_ATTENDANCE; 
QueueHandle_t rfidQueue;
SemaphoreHandle_t wifiMutex;

// Variabel Komunikasi Display
volatile bool showSuccessPopup = false;
String userNameToDisplay = "";
String userStatusToDisplay = ""; // "IN" atau "OUT"

struct RFIDData {
  String uid;
  SystemMode mode;
};

// Task Handles
TaskHandle_t rfidTaskHandle;
TaskHandle_t networkTaskHandle;
TaskHandle_t displayTaskHandle;
TaskHandle_t commandTaskHandle;

// Helper: Ambil Nama Depan Saja
String getFirstName(String fullName) {
  int spaceIndex = fullName.indexOf(' ');
  if (spaceIndex == -1) return fullName;
  return fullName.substring(0, spaceIndex);
}

void setup() {
  Serial.begin(115200);
  
  // Init I2C LCD Pin 25 & 26
  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("System Booting..");

  pinMode(LED_REG_PIN, OUTPUT);
  pinMode(LED_ATT_PIN, OUTPUT);

  // Init SPI & RFID
  SPI.begin(18, 19, 23, 21);
  mfrc522.PCD_Init();

  if (mfrc522.PCD_PerformSelfTest()) {
    Serial.println("RFID OK");
  } 
  mfrc522.PCD_Init();

  rfidQueue = xQueueCreate(10, sizeof(RFIDData));
  wifiMutex = xSemaphoreCreateMutex();

  connectWiFi();

  // Create Tasks
  xTaskCreatePinnedToCore(rfidScanTask, "RFID", 4096, NULL, 2, &rfidTaskHandle, 1);
  xTaskCreatePinnedToCore(networkTask, "Network", 8192, NULL, 1, &networkTaskHandle, 0);
  xTaskCreatePinnedToCore(displayTask, "Display", 4096, NULL, 1, &displayTaskHandle, 1);
  xTaskCreatePinnedToCore(commandTask, "Command", 4096, NULL, 1, &commandTaskHandle, 0);
  
  updateModeIndicators();
}

void loop() { delay(100); }

void connectWiFi() {
  lcd.clear();
  lcd.print("Connecting WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(500);
  }
  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) lcd.print("WiFi Connected");
  else lcd.print("WiFi Failed");
  delay(1000);
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

// ==========================================
// TASK: RFID SCAN
// ==========================================
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

      // Feedback visual instan
      if (!showSuccessPopup) {
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("Processing...");
      }

      xQueueSend(rfidQueue, &rfidData, pdMS_TO_TICKS(100));

      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      vTaskDelay(pdMS_TO_TICKS(1500)); 
    }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

// ==========================================
// TASK: NETWORK HANDLER (PARSING JSON DISINI)
// ==========================================
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
          
          int httpCode = http.POST(jsonData);
          String payload = http.getString();
          Serial.println("Response: " + payload); 

          if (httpCode == 200) {
            if (receivedData.mode == MODE_REGISTRATION) {
               Serial.println("Registrasi terkirim");
            } else {
               // ==========================================================
               // LOGIKA PARSING JSON MANUAL DARI RESPONSE SERVER
               // JSON: {"data": {"user": {"name": "Alif..."}, "attendance": {"type": "check_in"}}}
               // ==========================================================
               
               // 1. CARI TIPE ABSEN (check_in atau check_out)
               // Kita cari string: "type":"check_in"
               if (payload.indexOf("\"type\":\"check_in\"") != -1) {
                 userStatusToDisplay = "IN";
               } 
               else if (payload.indexOf("\"type\":\"check_out\"") != -1) {
                 userStatusToDisplay = "OUT";
               } 
               else {
                 // Default fallback jika format berubah
                 userStatusToDisplay = "IN";
               }

               // 2. CARI NAMA USER
               // Kita cari string: "name":"
               int nameIndex = payload.indexOf("\"name\":\"");
               if (nameIndex != -1) {
                  // Geser index 8 karakter (panjang dari "name":")
                  int startIdx = nameIndex + 8; 
                  // Cari tanda kutip penutup setelah nama
                  int endIdx = payload.indexOf("\"", startIdx);
                  
                  // Ambil string nama lengkap
                  String fullName = payload.substring(startIdx, endIdx);
                  
                  // Ambil nama depan saja untuk LCD
                  userNameToDisplay = getFirstName(fullName);
               } else {
                  userNameToDisplay = "Member";
               }

               // Trigger LCD untuk menampilkan hasil parsing
               showSuccessPopup = true;
            }
          } 
          http.end();
        } 
        xSemaphoreGive(wifiMutex);
      }
    }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

// ==========================================
// TASK: DISPLAY STATUS
// ==========================================
void displayTask(void *pvParameters) {
  unsigned long lcdRefreshTimer = 0;

  while (true) {
    // ----------------------------------------
    // KONDISI 1: TAMPILKAN POPUP HASIL ABSEN
    // ----------------------------------------
    if (showSuccessPopup) {
      lcd.clear();
      
      // Tentukan ucapan berdasarkan parsing JSON tadi
      lcd.setCursor(0, 0);
      if (userStatusToDisplay == "IN") {
        lcd.print("Selamat Datang,");
      } else {
        lcd.print("Sampai Jumpa,");
      }

      // Tampilkan Nama Depan
      lcd.setCursor(0, 1);
      lcd.print(userNameToDisplay);

      // Tahan tampilan selama 3 detik
      vTaskDelay(pdMS_TO_TICKS(3000));
      
      // Reset dan kembali ke standby
      showSuccessPopup = false;
      lcd.clear();
    } 
    
    // ----------------------------------------
    // KONDISI 2: TAMPILAN STANDBY (MODE)
    // ----------------------------------------
    else {
      if (millis() - lcdRefreshTimer > 1000) {
        lcd.setCursor(0, 0);
        if (currentMode == MODE_REGISTRATION) {
          lcd.print("MODE: REGISTRASI");
        } else {
          lcd.print("MODE: ABSENSI   "); 
        }

        lcd.setCursor(0, 1);
        if (WiFi.status() == WL_CONNECTED) {
          lcd.print("Silahkan Scan...");
        } else {
          lcd.print("WiFi Putus!     ");
        }
        
        lcdRefreshTimer = millis();
      }
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// ==========================================
// TASK: COMMAND LISTENER
// ==========================================
void commandTask(void *pvParameters) {
  while (true) {
    if (xSemaphoreTake(wifiMutex, pdMS_TO_TICKS(3000)) == pdPASS) {
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClient client;
        HTTPClient http;
        http.setTimeout(3000);
        http.begin(client, commandEndpoint);
        if (http.GET() == 200) {
          String response = http.getString();
          if (response.indexOf("registration") > -1) {
             currentMode = MODE_REGISTRATION;
          } else {
             currentMode = MODE_ATTENDANCE; 
          }
          updateModeIndicators();
        }
        http.end();
      }
      xSemaphoreGive(wifiMutex);
    }
    vTaskDelay(pdMS_TO_TICKS(3000));
  }
}