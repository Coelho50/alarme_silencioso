#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- network ---
const char* ssid = "felipeEspindola";
const char* password = "penicilina";
const char* apiGateway = "http://IP:3000"; // TODO: colocar ip

// --- global variables ---
bool isArmed = false;
int pirSensitivity = 5000;
unsigned long lastConfigCheck = 0;

// --- pins ---
#define PIR_PIN 4
#define LED_GREEN 12
#define LED_YELLOW 13
#define LED_RED 25
#define BUZZER_PIN 26

// --- http ---
void fetchConfigurations() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(apiGateway) + "/controle/configuracoes";
    http.begin(url);
    
    int httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
      String payload = http.getString();
      JsonDocument doc;
      deserializeJson(doc, payload);
      
      String estado = doc["estado_alarme"];
      isArmed = (estado == "ligado");
      pirSensitivity = doc["sensibilidade_pir"];
    }
    http.end();
  }
}

void logEvent(String sensor, String eventMsg) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(apiGateway) + "/logging/logs";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    JsonDocument doc;
    doc["sensor_tipo"] = sensor;
    doc["evento"] = eventMsg;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    http.POST(requestBody);
    http.end();
  }
}

// --- helpers ---
void resetLEDs() {
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

bool presenceDetected() {
  return digitalRead(PIR_PIN) == HIGH;
}

// --- setup ---
void setup() {
  Serial.begin(115200);
  
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // connect
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

void loop() {
  // check backend for updates every 3 seconds
  if (millis() - lastConfigCheck > 3000) {
    fetchConfigurations();
    lastConfigCheck = millis();
  }

  if (!isArmed) {
    resetLEDs();
    digitalWrite(LED_GREEN, HIGH);
    return;
  }

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, HIGH);

  if (presenceDetected()) {
    logEvent("PIR", "Movimento detectado");
    digitalWrite(LED_RED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    
    delay(pirSensitivity);
    
    resetLEDs();
  }
}