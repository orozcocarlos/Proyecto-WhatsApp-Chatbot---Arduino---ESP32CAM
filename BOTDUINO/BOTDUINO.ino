#include "Musica.h"
const int led1=12; //Declaramos la variable led1.
const int led2=2; //Declaramos la variable led2.
const int LEDPin = 13;        // pin para el LED
const int PIRPin = 7;  
int Boton = 3;
int Boton1 = 4;
int Led = 9;
int sensorPin = A0;
int sensorValue;
int pinAlarma = 5; 
Musica musica(pinAlarma);
void setup() {
  Serial.begin(9600);
  pinMode(Boton, INPUT_PULLUP);
  pinMode(Boton1, INPUT_PULLUP);
  pinMode(Led, OUTPUT);
}

void loop() {
  if (digitalRead(Boton) == 0) {
    Serial.println("H");
     musica.reproducir();
    delay(500);
  }

  if (digitalRead(Boton1) == 0) {
    Serial.println("P");
    musica.reproducir();  
    delay(500);
  }

  if (Serial.available()) {
    sensorValue =  (( 5.0 * analogRead(sensorPin) * 100.0) / 1024.0);  
    char Letra = Serial.read();
    if (Letra == 'H') {
      digitalWrite(Led, HIGH);
    }
    else if (Letra == 'L') {
      digitalWrite(Led, LOW);
    }

      if(Letra=='T')Serial.println(String(sensorValue));
        if(Letra=='K')Serial.println(sensorValue);
        if(Letra=='M')
        {
           musica.reproducir();           
        }

  }
}
