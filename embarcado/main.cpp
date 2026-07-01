#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "felipeEspindola";
const char* password = "penicilina";
const char* apiGateway = "http://10.49.54.56:3000";

bool isArmed = false;
int pirSensitivity = 5000;
unsigned long lastConfigCheck = 0;

#define PIR_PIN 14      // Wired to D5 on the board
#define LED_GREEN 12    // Wired to D6 on the board
#define LED_RED 13      // Wired to D7 on the board
#define BUZZER_PIN 4    // Wired to D2 on the board

WiFiClient client;

void fetchConfigurations() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Got here");
    HTTPClient http;
    String url = String(apiGateway) + "/controle/configuracoes";
    
    http.begin(client, url); 
    
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
    
    http.begin(client, url);
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

void resetLEDs() {
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

bool presenceDetected() {
  return digitalRead(PIR_PIN) == HIGH;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

void loop() {
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

  if (presenceDetected()) {
    logEvent("PIR", "Movimento detectado");
    digitalWrite(LED_RED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    
    delay(pirSensitivity);
    
    resetLEDs();
  }
}