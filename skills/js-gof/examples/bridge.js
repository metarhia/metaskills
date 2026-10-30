'use strict';

class CommunicationProtocol {
  constructor(transport) {
    this.transport = transport;
  }

  sendCommand(device, command) {
    const target = `${this.transport} ${device}`;
    throw new Error(`send '${command}' is not implemented for ${target}`);
  }
}

class MQTTProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    const text = `[${this.transport}] Sending '${command}' to ${device}`;
    console.log(text);
  }
}

class HTTPProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    const text = `[${this.transport}] Sending '${command}' to ${device}`;
    console.log(text);
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
