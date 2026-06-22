#include <SPI.h>
#include <MFRC522.h>

#define PIR_PIN 4
#define LED_GREEN 12
#define LED_YELLOW 13
#define LED_RED 25
#define RST_PIN 21
#define SS_PIN 5
#define BUZZER_PIN 26

MFRC522 reader(SS_PIN, RST_PIN);

const unsigned long gracePeriod = 1000;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  reader.PCD_Init();
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
}

bool checkForCard() {
  if (!reader.PICC_IsNewCardPresent()) return false;
  if (!reader.PICC_ReadCardSerial()) return false;

  reader.PICC_HaltA();
  return true;
}

void resetLEDs() {
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

bool presenceDetected() {
  if (digitalRead(PIR_PIN) == HIGH) {
    return true;
  } else {
    return false;
  }
}

// ------- STATES --------------
void idle() {
  resetLEDs();
  digitalWrite(LED_GREEN, HIGH);

  while (!checkForCard())
    ;

  int timeElapsed = 0;
  while (timeElapsed <= gracePeriod) {
    digitalWrite(LED_YELLOW, HIGH);
    delay(250);
    digitalWrite(LED_YELLOW, LOW);
    delay(250);
    timeElapsed += 500;
  }
}

void pir_activated() {
  resetLEDs();
  digitalWrite(LED_RED, HIGH);

  while (!presenceDetected())
    ;
}

void alarm() {
  resetLEDs();
  digitalWrite(LED_YELLOW, HIGH);

  int timeElapsed = 0;
  while (timeElapsed <= gracePeriod) {
    if (checkForCard()) {
      return;
    }
    delay(50);
    timeElapsed += 50;
  }

  while (!checkForCard()) {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_RED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(350);
    resetLEDs();
    delay(350);
  }
}

void loop() {
  idle();

  pir_activated();

  alarm();
}