#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#define WIFI_SSID "ruanito"
#define WIFI_PASS "ruanito1234"
#define API_GATEWAY "http://10.248.134.210:8000"

bool isArmed = false;
int alarmDelay = 5000; 
int lightThreshold = 5;
unsigned long lastConfigCheck = 0;

#define LDR_PIN A0      
#define LED_GREEN 12    // D6
#define LED_RED 13      // D7
#define BUZZER_PIN 4    // D2

WiFiClient client;

void fetchConfigurations() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(API_GATEWAY) + "/configuracoes";
    
    Serial.println("\n[DEBUG] --- Buscando Configuracoes ---");
    Serial.print("[DEBUG] URL: "); Serial.println(url);
    
    http.begin(client, url); 
    
    int httpResponseCode = http.GET();
    
    Serial.print("[DEBUG] HTTP Status Code: "); Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) { 
      if (httpResponseCode == 200) {
        String payload = http.getString();
        Serial.print("[DEBUG] Payload recebido: "); Serial.println(payload);
        
        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, payload);
        
        if (error) {
          Serial.print("[ERRO] Falha ao processar JSON: ");
          Serial.println(error.c_str());
        } else {
          String estado = doc["estado_alarme"];
          isArmed = (estado == "ligado");
          
          alarmDelay = doc["sensibilidade_pir"]; 
          
          Serial.print("[DEBUG] Estado Atualizado: "); 
          Serial.println(isArmed ? "LIGADO" : "DESLIGADO");
        }
      }
    } else {
      Serial.print("[ERRO] Falha na conexao HTTP. Erro: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
    Serial.println("[DEBUG] ------------------------------\n");
  } else {
    Serial.println("[ERRO] WiFi Desconectado. Nao foi possivel buscar configs.");
  }
}

void logEvent(String sensor, String eventMsg) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(API_GATEWAY) + "/logs";
    
    Serial.println("\n[DEBUG] --- Enviando Log ---");
    Serial.print("[DEBUG] URL: "); Serial.println(url);
    
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    
    JsonDocument doc;
    doc["sensor_tipo"] = sensor;
    doc["evento"] = eventMsg;
    
    String requestBody;
    serializeJson(doc, requestBody);
    Serial.print("[DEBUG] Corpo do Envio: "); Serial.println(requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    Serial.print("[DEBUG] HTTP Status Code: "); Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("[DEBUG] Resposta do Servidor: "); Serial.println(response);
    } else {
      Serial.print("[ERRO] Falha no POST. Erro: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
    Serial.println("[DEBUG] ------------------------------\n");
  }
}

void resetLEDs() {
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, HIGH);
}

bool isDark() {
  int lightLevel = analogRead(LDR_PIN);
  
  Serial.print("[DEBUG] Nivel de luz: "); Serial.println(lightLevel);
  
  return lightLevel < lightThreshold;
}

void setup() {
  Serial.begin(115200);
  
  pinMode(LDR_PIN, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
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

  if (isDark()) {
    logEvent("LDR", "Escuridao detectada");
    digitalWrite(LED_RED, HIGH);
    digitalWrite(BUZZER_PIN, LOW);
    
    delay(alarmDelay);
    
    resetLEDs();
  }
}