// --------------------------------------------------------------------
// Proyek UTS Internet of Things: Smart Home Terintegrasi
// VERSI FINAL: RTOS + Blynk (Internet) + Local Web Server
// --------------------------------------------------------------------

// 1. KONFIGURASI BLYNK
#define BLYNK_TEMPLATE_ID "TMPL6UAC-zx7N"
#define BLYNK_TEMPLATE_NAME "Smart Home"
#define BLYNK_AUTH_TOKEN "-nviSBxe4-ZNiRebwh7ejj5fMxX722PL"
#define BLYNK_PRINT Serial // Aktifkan Serial Monitor untuk Blynk

// 2. LIBRARY
#include <WiFi.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <BlynkSimpleEsp32.h>
#include <WebServer.h> // Web server lokal

// 3. KREDENSIAL WIFI & BLYNK
const char* ssid = "Ara";
const char* password = "ieqsholeh";
char auth[] = BLYNK_AUTH_TOKEN;

// 4. DEFINISI PIN
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define PIR_PIN 18
#define LED_PIN 5
#define TRIG_PIN 19
#define ECHO_PIN 23
#define SERVO_PIN 2

// 5. INISIALISASI OBJEK
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT_TYPE);
Servo doorServo;
WebServer server(80); // Web server lokal

// 6. VARIABEL GLOBAL (Shared Resources)
float temperature = NAN, humidity = NAN, distance = 0;
int motionState = LOW;
bool manualMode = false;
int manualLedState = LOW;
int manualServoPos = 0;

// 7. RTOS HANDLES
SemaphoreHandle_t sensorDataMutex;
TaskHandle_t broadcastTaskHandle;
TaskHandle_t blynkTaskHandle;

// 8. DEKLARASI FUNGSI TASK
void taskBacaSensor(void *pvParameters);
void taskKontrolLampu(void *pvParameters);
void taskKontrolPintu(void *pvParameters);
void taskUpdateLCD(void *pvParameters);
void taskBroadcastData(void *pvParameters);
void taskBlynkRun(void *pvParameters);
void taskWebServer(void *pvParameters);

// --------------------------------------------------------------------
// SETUP
// --------------------------------------------------------------------
void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Home RTOS");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  dht.begin();
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  doorServo.attach(SERVO_PIN);
  doorServo.write(0);

  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  
  lcd.clear();
  lcd.print("WiFi Terhubung!");
  delay(1000);

  // Inisialisasi Blynk (client)
  Blynk.begin(auth, ssid, password);

  lcd.clear();
  lcd.print("Blynk Terhubung!");
  delay(1500);
  lcd.clear();

  // Inisialisasi RTOS
  sensorDataMutex = xSemaphoreCreateMutex();
  if (sensorDataMutex == NULL) {
    Serial.println("Gagal membuat Mutex!"); while(1);
  }

  // Buat Tasks (sebar ke core agar responsif)
  xTaskCreatePinnedToCore(taskBacaSensor, "BacaSensor", 4096, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(taskKontrolLampu, "KontrolLampu", 2048, NULL, 2, NULL, 0);
  xTaskCreatePinnedToCore(taskKontrolPintu, "KontrolPintu", 2048, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(taskUpdateLCD, "UpdateLCD", 4096, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(taskBroadcastData, "BroadcastData", 4096, NULL, 1, &broadcastTaskHandle, 0); 
  xTaskCreatePinnedToCore(taskBlynkRun, "BlynkRun", 4096, NULL, 1, &blynkTaskHandle, 0); 
  xTaskCreatePinnedToCore(taskWebServer, "WebServer", 4096, NULL, 1, NULL, 1);

  // SETUP ROUTES WEB (dijalankan dari taskWebServer)
  // (Handler di-setup di dalam fungsi setupWebHandlers() dipanggil dari setup() supaya sudah terdaftar)
  // tapi kita definisikan lambdas langsung di sini:
  server.on("/", HTTP_GET, []() {
    // Halaman web sederhana (HTML + JS)
    String page = R"rawliteral(
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Smart Home - Lokal</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;padding:10px}
          .card{border-radius:8px;padding:12px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.12)}
          button{padding:8px 12px;border-radius:6px;border:none;cursor:pointer}
        </style>
      </head>
      <body>
        <h2>Smart Home (Lokal)</h2>
        <div class="card">
          <div><b>Suhu:</b> <span id="temp">...</span> °C</div>
          <div><b>Kelembaban:</b> <span id="hum">...</span> %</div>
          <div><b>Jarak:</b> <span id="dist">...</span> cm</div>
          <div><b>Gerak:</b> <span id="motion">...</span></div>
          <div><b>Mode:</b> <span id="mode">...</span></div>
          <div><b>Lampu:</b> <span id="led">...</span></div>
          <div><b>Pintu:</b> <span id="door">...</span></div>
        </div>

        <div class="card">
          <button onclick="setMode(0)">Mode: OTOMATIS</button>
          <button onclick="setMode(1)">Mode: MANUAL</button>
          <button onclick="setLed(1)">Lampu ON</button>
          <button onclick="setLed(0)">Lampu OFF</button>
          <button onclick="setDoor(1)">Buka Pintu</button>
          <button onclick="setDoor(0)">Tutup Pintu</button>
        </div>

        <script>
          async function fetchStatus(){
            try{
              const res = await fetch('/status');
              const j = await res.json();
              document.getElementById('temp').innerText = isNaN(j.temperature)? '...' : j.temperature.toFixed(1);
              document.getElementById('hum').innerText = isNaN(j.humidity)? '...' : j.humidity.toFixed(1);
              document.getElementById('dist').innerText = j.distance.toFixed(0);
              document.getElementById('motion').innerText = j.motion==1? 'DETEKSI' : 'TIDAK';
              document.getElementById('mode').innerText = j.manualMode? 'MANUAL' : 'OTOMATIS';
              document.getElementById('led').innerText = j.led==1? 'ON' : 'OFF';
              document.getElementById('door').innerText = j.door==1? 'TERBUKA' : 'TERTUTUP';
            }catch(e){
              console.log('err',e);
            }
          }
          async function setMode(m){
            await fetch('/set?mode='+m);
            fetchStatus();
          }
          async function setLed(s){
            await fetch('/set?led='+s);
            fetchStatus();
          }
          async function setDoor(s){
            await fetch('/set?door='+s);
            fetchStatus();
          }
          setInterval(fetchStatus, 1000);
          fetchStatus();
        </script>
      </body>
      </html>
    )rawliteral";
    server.send(200, "text/html", page);
  });

  server.on("/status", HTTP_GET, [](){
    // Kirim JSON status
    bool lm;
    float t,h,d;
    int m,led,door;
    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      lm = manualMode;
      t = temperature;
      h = humidity;
      d = distance;
      m = motionState;
      led = (manualLedState == HIGH) ? 1 : 0;
      door = (manualServoPos == 90) ? 1 : 0;
      xSemaphoreGive(sensorDataMutex);
    }
    String json = "{";
    json += "\"manualMode\":" + String(lm ? "true":"false") + ",";
    json += "\"temperature\":" + (isnan(t) ? String("null") : String(t,1)) + ",";
    json += "\"humidity\":" + (isnan(h) ? String("null") : String(h,1)) + ",";
    json += "\"distance\":" + String(d,0) + ",";
    json += "\"motion\":" + String(m) + ",";
    json += "\"led\":" + String(led) + ",";
    json += "\"door\":" + String(door);
    json += "}";
    server.send(200, "application/json", json);
  });

  // Endpoint untuk mengubah state via web (mode, led, door)
  server.on("/set", HTTP_GET, [](){
    bool changed = false;
    if (server.hasArg("mode")) {
      String v = server.arg("mode");
      if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
        manualMode = (v == "1");
        xSemaphoreGive(sensorDataMutex);
      }
      changed = true;
      Serial.printf("Web: set mode = %s\n", v.c_str());
    }
    if (server.hasArg("led")) {
      String v = server.arg("led");
      if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
        manualMode = true;
        manualLedState = (v == "1") ? HIGH : LOW;
        xSemaphoreGive(sensorDataMutex);
      }
      changed = true;
      Serial.printf("Web: set led = %s\n", v.c_str());
    }
    if (server.hasArg("door")) {
      String v = server.arg("door");
      if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
        manualMode = true;
        manualServoPos = (v == "1") ? 90 : 0;
        xSemaphoreGive(sensorDataMutex);
      }
      changed = true;
      Serial.printf("Web: set door = %s\n", v.c_str());
    }

    if (changed) {
      // beri tahu broadcast task agar sinkron ke Blynk
      xTaskNotifyGive(broadcastTaskHandle);
      server.send(200, "text/plain", "OK");
    } else {
      server.send(400, "text/plain", "No args");
    }
  });

  server.begin();
  Serial.println("Web server started at: " + WiFi.localIP().toString());
}

// --------------------------------------------------------------------
// LOOP UTAMA
// --------------------------------------------------------------------
void loop() {
  // Kosong: semua kerja di tasks
  vTaskDelay(1000 / portTICK_PERIOD_MS);
}

// --------------------------------------------------------------------
// TASK 1: BACA SENSOR
// --------------------------------------------------------------------
void taskBacaSensor(void *pvParameters) {
  (void) pvParameters;
  long localDuration;
  
  for (;;) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int m = digitalRead(PIR_PIN);

    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    localDuration = pulseIn(ECHO_PIN, HIGH);
    float d = localDuration * 0.034 / 2;

    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      if (!isnan(h) && !isnan(t)) {
        humidity = h;
        temperature = t;
      }
      distance = d;
      motionState = m;
      xSemaphoreGive(sensorDataMutex);
    }
    
    Serial.printf("S: %.1fC, H: %.1f%%, D: %.0fcm, M: %d\n", t, h, d, m);
    xTaskNotifyGive(broadcastTaskHandle); // Beri tahu task broadcast (untuk kirim ke Blynk)
    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// TASK 2: KONTROL LAMPU
// --------------------------------------------------------------------
void taskKontrolLampu(void *pvParameters) {
  (void) pvParameters;
  float localTemp;
  int localMotion;
  bool localManualMode;
  int localManualState;
  static int lastLedState = -1;

  for (;;) {
    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      localTemp = temperature;
      localMotion = motionState;
      localManualMode = manualMode;
      localManualState = manualLedState;
      xSemaphoreGive(sensorDataMutex);
    }
    int currentLedState;
    if (localManualMode) {
      currentLedState = localManualState;
    } else {
      currentLedState = LOW;
      if (localMotion == HIGH && localTemp < 25) {
        currentLedState = HIGH;
      }
    }
    if (currentLedState != lastLedState) {
      digitalWrite(LED_PIN, currentLedState);
      Serial.printf("Kontrol Lampu: Mode %s -> LED %s\n",
                    localManualMode ? "MANUAL" : "OTOMATIS",
                    currentLedState == HIGH ? "ON" : "OFF");
      lastLedState = currentLedState;
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// TASK 3: KONTROL PINTU
// --------------------------------------------------------------------
void taskKontrolPintu(void *pvParameters) {
  (void) pvParameters;
  float localDist;
  int localMotion;
  bool localManualMode;
  int localManualPos;
  static int lastServoPos = -1;

  for (;;) {
    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      localDist = distance;
      localMotion = motionState;
      localManualMode = manualMode;
      localManualPos = manualServoPos;
      xSemaphoreGive(sensorDataMutex);
    }
    int currentServoPos;
    if (localManualMode) {
      currentServoPos = localManualPos;
    } else {
      currentServoPos = 0;
      if (localMotion == HIGH && localDist < 20) {
        currentServoPos = 90;
      }
    }
    if (currentServoPos != lastServoPos) {
      doorServo.write(currentServoPos);
      Serial.printf("Kontrol Pintu: Mode %s -> Pintu %s\n",
                    localManualMode ? "MANUAL" : "OTOMATIS",
                    currentServoPos == 90 ? "TERBUKA" : "TERTUTUP");
      lastServoPos = currentServoPos;
    }
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// TASK 4: TAMPILKAN DATA KE LCD
// --------------------------------------------------------------------
void taskUpdateLCD(void *pvParameters) {
  (void) pvParameters;
  float localTemp, localHum;
  bool localManual;

  for (;;) {
    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      localTemp = temperature;
      localHum = humidity;
      localManual = manualMode;
      xSemaphoreGive(sensorDataMutex);
    }
    String tempStr = isnan(localTemp) ? "..." : String(localTemp, 1);
    String humStr = isnan(localHum) ? "..." : String(localHum, 1);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("S:" + tempStr + "C ");
    lcd.print("H:" + humStr + "%");
    lcd.setCursor(0, 1);
    lcd.print(localManual ? "Mode: MANUAL" : "Mode: OTOMATIS");
    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// TASK 5: BROADCAST DATA (KIRIM KE BLYNK)
// --------------------------------------------------------------------
void taskBroadcastData(void *pvParameters) {
  (void) pvParameters;
  for(;;) {
    // Tidur sampai ada notifikasi dari sensor atau web/blynk
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);

    // Ambil data terbaru (mutexed)
    float localTemp, localHum;
    int localLedState, localServoPos;
    bool localManualMode;
    
    if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
      localTemp = temperature;
      localHum = humidity;
      localManualMode = manualMode;
      localLedState = (manualLedState == HIGH) ? 1 : 0;
      localServoPos = manualServoPos;
      xSemaphoreGive(sensorDataMutex);
    }

    // Kirim ke Klien Blynk (Internet)
    if (Blynk.connected()) {
      Blynk.virtualWrite(V0, localManualMode ? 1 : 0); // V0: Tombol Mode (1=Manual, 0=Auto)
      Blynk.virtualWrite(V1, localLedState); // V1: Status Kontrol Lampu
      Blynk.virtualWrite(V4, (localServoPos == 90 ? 1 : 0)); // V4: Status Kontrol Pintu
      Blynk.virtualWrite(V2, localTemp);    // V2: Suhu Ruangan
      Blynk.virtualWrite(V3, localHum);     // V3: Kelembaban Ruangan
    }
    
    Serial.println("Broadcast: Data disinkronkan ke Blynk");
  }
}

// --------------------------------------------------------------------
// TASK 6: BLYNK RUN (TASK BARU)
// --------------------------------------------------------------------
void taskBlynkRun(void *pvParameters) {
  (void) pvParameters;
  for(;;) {
    if (WiFi.status() == WL_CONNECTED) {
      if (!Blynk.connected()) {
        Serial.println("Blynk terputus, mencoba menghubungkan kembali...");
        Blynk.connect();
      } else {
        Blynk.run();
      }
    } else {
      Serial.println("WiFi terputus, menunda Blynk.");
    }
    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// TASK 7: WEB SERVER (jalankan handleClient di task khusus)
// --------------------------------------------------------------------
void taskWebServer(void *pvParameters) {
  (void) pvParameters;
  for(;;) {
    server.handleClient(); // proses request HTTP
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

// --------------------------------------------------------------------
// FUNGSI EVENT HANDLER BLYNK (REVISI V-PIN)
// --------------------------------------------------------------------

// V0: Tombol Ganti Mode (BARU)
BLYNK_WRITE(V0) {
  int state = param.asInt();
  if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
    manualMode = (state == 1) ? true : false;
    xSemaphoreGive(sensorDataMutex);
  }
  xTaskNotifyGive(broadcastTaskHandle); // Beri tahu task broadcast
  Serial.printf("Perintah dari Blynk: Mode diubah ke %s\n", manualMode ? "MANUAL" : "OTOMATIS");
}

// V1: Kontrol Lampu
BLYNK_WRITE(V1) {
  int state = param.asInt();
  if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
    manualMode = true; // Otomatis pindah ke mode manual
    manualLedState = (state == 1) ? HIGH : LOW;
    xSemaphoreGive(sensorDataMutex);
  }
  xTaskNotifyGive(broadcastTaskHandle); // Beri tahu task broadcast
  Serial.println("Perintah dari Blynk: Lampu");
}

// V4: Kontrol Pintu
BLYNK_WRITE(V4) {
  int state = param.asInt();
  if (xSemaphoreTake(sensorDataMutex, portMAX_DELAY) == pdTRUE) {
    manualMode = true; // Otomatis pindah ke mode manual
    manualServoPos = (state == 1) ? 90 : 0;
    xSemaphoreGive(sensorDataMutex);
  }
  xTaskNotifyGive(broadcastTaskHandle); // Beri tahu task broadcast
  Serial.println("Perintah dari Blynk: Pintu");
}
