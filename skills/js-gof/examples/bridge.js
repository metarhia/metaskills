'use strict';

class CommunicationProtocol {
  sendCommand() {
    throw new Error('sendCommand() must be implemented');
  }
}

class MQTTProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    console.log(`[MQTT] Sending '${command}' to ${device}`);
  }
}

class HTTPProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    console.log(`[HTTP] Sending '${command}' to ${device}`);
  }
}

class IoTDevice {
  constructor(name, protocol) {
    this.name = name;
    this.protocol = protocol;
  }

  operate(command) {
    this.protocol.sendCommand(this.name, command);
  }
}

class SmartLight extends IoTDevice {
  turnOn() {
    this.operate('Turn On Light');
  }

  turnOff() {
    this.operate('Turn Off Light');
  }
}

class SmartThermostat extends IoTDevice {
  setTemperature(temp) {
    this.operate(`Set Temperature to ${temp}°C`);
  }
}

module.exports = {
  CommunicationProtocol,
  MQTTProtocol,
  HTTPProtocol,
  IoTDevice,
  SmartLight,
  SmartThermostat,
};
