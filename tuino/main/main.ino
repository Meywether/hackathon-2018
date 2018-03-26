#include "gmx_nbiot.h"

#define INTERVAL 10
#define SENSOR_TIMEOUT 1000
#define IR_FRONT 5
#define IR_BACK 4

unsigned long oldMillis = 0;
unsigned long currMillis = 0;
unsigned short interval = 0; 
unsigned long firstSensorDetection = 0;
char sensorDirection = 0;
unsigned char devAddress[8] = {0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00};

void sendUbirchPacket(char *data_to_send){
    unsigned char ubirch_packet[512];
    char payload[500];
    int payload_len;
    
    String nbiot_payload;
    char string_byte[3];
    
    ubirch_packet[0] = 0x00;
    ubirch_packet[1] = 0xCE;
    
    
    ubirch_packet[2] = devAddress[4];
    ubirch_packet[3] = devAddress[5];
    ubirch_packet[4] = devAddress[6];
    ubirch_packet[5] = devAddress[7];

    ubirch_packet[6] = 0xD9;

    Serial.println("Sending Data to Ubirch");
    strcpy(payload,data_to_send);
    Serial.println(payload);
    payload_len = strlen( payload );

    Serial.print("Payload Len:");
    Serial.println(payload_len);
    
    ubirch_packet[7] = payload_len;

    for(int i=0;i<payload_len;i++ )
      ubirch_packet[8+i] = payload[i];

  /* 
   *  Debug
   */

 for (int i=0;i<payload_len+8;i++)
  {  
    sprintf(string_byte,"%02x",ubirch_packet[i]);
    Serial.print((char)ubirch_packet[i]);
    Serial.print("=");
    Serial.print(ubirch_packet[i],HEX);
    Serial.print("/");
    Serial.println(string_byte);
    
    
    
    nbiot_payload = nbiot_payload + string_byte;
  } 

  Serial.print("NBIoT Payload:");
  Serial.println(nbiot_payload);
  
  /*
   * End Debug
   */

   
    if ( gmxNB_TXData(nbiot_payload) == GMXNB_OK )
      Serial.println("TX OK");
    else
      Serial.println("TX KO");


 }

void sendUbirchInt(char *key, int value){
   char payload[500];
   sprintf(payload,"{\"%s\":%d}",key,value);

   sendUbirchPacket(payload);
}

void sendUbirchText(char *key, char *string)
{
   char payload[500];
   sprintf(payload,"{\"%s\":\"%s\"}",key,string);

   sendUbirchPacket(payload);
}

void setup() {
  // Setup serial
  Serial.begin(9600);

  // Setup pinmodes
  pinMode(IR_FRONT, INPUT);
  pinMode(IR_BACK, INPUT);

  // Setup NB
  gmxNB_Led2(GMXNB_LED_ON);
  gmxNB_init("5.230.140.153","3000");
  gmxNB_start();
   while(gmxNB_isNetworkJoined() != NB_NETWORK_JOINED) {
    Serial.println("Waiting to connect...");
    
    delay(2500);
  }
  Serial.println("Connected");
  gmxNB_Led2(GMXNB_LED_OFF);
  gmxNB_Led1(GMXNB_LED_ON);

  sendUbirchText("deviceName", "David sagt");
}

void sendToServer(){
  if(sensorDirection > 0){
    Serial.println("Einsteigen");
  } else {
    Serial.println("Aussteigen");
  }
  
  sendUbirchInt("person", sensorDirection);
  
  firstSensorDetection = 0;
  sensorDirection = 0;
}

void setFirstSensorDetection(short dir){
  firstSensorDetection = currMillis;
  sensorDirection = dir;
}

void checkSensor(){
  if(digitalRead(IR_FRONT) == LOW && sensorDirection < 1){
    if(sensorDirection == 0){
      return setFirstSensorDetection(1);
    }
    return sendToServer();
  }

  if(digitalRead(IR_BACK) == LOW && sensorDirection > -1){
    if(sensorDirection == 0){
      return setFirstSensorDetection(-1);
    }
    return sendToServer();
  }
}

void loop() {
  currMillis = millis(); 

  if(currMillis - oldMillis > INTERVAL){
    checkSensor();
    oldMillis = currMillis;
  }

  if(currMillis - firstSensorDetection > SENSOR_TIMEOUT && firstSensorDetection > 0){
    firstSensorDetection = 0;
    sensorDirection = 0;
  }
}

