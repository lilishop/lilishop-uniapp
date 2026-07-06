import api from "@/config/api.js";

function normalizeSocketUrl(url = "") {
  return url.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://");
}

const mqttEndpoint = normalizeSocketUrl(api.mqtt);

function stringToUtf8Bytes(str = "") {
  const encoded = encodeURIComponent(String(str));
  const bytes = [];
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === "%") {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }
  return bytes;
}

function utf8BytesToString(bytes) {
  let encoded = "";
  bytes.forEach((byte) => {
    if (byte < 0x80) {
      encoded += String.fromCharCode(byte);
    } else {
      encoded += `%${byte.toString(16).padStart(2, "0")}`;
    }
  });
  try {
    return decodeURIComponent(encoded);
  } catch (e) {
    return "";
  }
}

function encodeString(str) {
  const bytes = stringToUtf8Bytes(str);
  return [(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes];
}

function encodeRemainingLength(length) {
  const bytes = [];
  do {
    let digit = length % 128;
    length = Math.floor(length / 128);
    if (length > 0) digit |= 0x80;
    bytes.push(digit);
  } while (length > 0);
  return bytes;
}

function toArrayBuffer(bytes) {
  return new Uint8Array(bytes).buffer;
}

function decodeRemainingLength(bytes, offset = 1) {
  let multiplier = 1;
  let value = 0;
  let index = offset;
  let digit = 0;
  do {
    digit = bytes[index++];
    value += (digit & 127) * multiplier;
    multiplier *= 128;
  } while ((digit & 128) !== 0 && index < bytes.length);
  return { value, bytesUsed: index - offset, nextIndex: index };
}

class MqttClient {
  constructor(options = {}) {
    const defaultOptions = {
      endpoint: mqttEndpoint,
      username: "admin",
      password: "hivemq",
      keepalive: 30,
      clean: true,
      connectTimeout: 20000,
      topicHandlers: [],
    };

    this.options = { ...defaultOptions, ...options };
    this.socketTask = null;
    this.connected = false;
    this.connecting = false;
    this.manualDisconnect = false;
    this.packetId = 1;
    this.topics = [];
    this.pingTimer = null;
    this.connectTimeoutTimer = null;

    this.onConnectCallback = null;
    this.onErrorCallback = null;
    this.onCloseCallback = null;
    this.onOfflineCallback = null;
    this.onMessageCallback = null;
  }

  connect() {
    if (!this.options.endpoint) {
      this.onError(new Error("MQTT 地址未配置，请检查 config/api.js 的 mqtt 字段"));
      return this;
    }

    this.disconnect();
    this.manualDisconnect = false;
    this.connecting = true;

    console.log("[MQTT-MP] 开始连接:", this.options.endpoint);
    this.socketTask = uni.connectSocket({
      url: this.options.endpoint,
      protocols: ["mqtt"],
      success: () => {},
      fail: (error) => this.onError(error),
    });

    this.socketTask.onOpen(() => {
      this.sendConnectPacket();
      this.connectTimeoutTimer = setTimeout(() => {
        if (!this.connected) {
          this.onError(new Error("连接超时"));
          this.disconnect();
        }
      }, this.options.connectTimeout);
    });

    this.socketTask.onMessage((event) => {
      this.handlePacket(event.data);
    });

    this.socketTask.onError((error) => {
      this.onError(error);
    });

    this.socketTask.onClose(() => {
      this.clearTimers();
      this.connected = false;
      this.connecting = false;
      if (!this.manualDisconnect) {
        this.onCloseCallback?.();
      }
    });

    return this;
  }

  sendConnectPacket() {
    const variableHeader = [
      ...encodeString("MQTT"),
      0x04,
      (this.options.username ? 0x80 : 0) |
        (this.options.password ? 0x40 : 0) |
        (this.options.clean ? 0x02 : 0),
      (this.options.keepalive >> 8) & 0xff,
      this.options.keepalive & 0xff,
    ];
    const payload = [
      ...encodeString(this.options.clientId),
      ...(this.options.username ? encodeString(this.options.username) : []),
      ...(this.options.password ? encodeString(this.options.password) : []),
    ];
    const body = [...variableHeader, ...payload];
    this.sendBytes([0x10, ...encodeRemainingLength(body.length), ...body]);
  }

  subscribeToTopics() {
    this.options.topicHandlers.forEach(({ topic, qos = 0, handler }) => {
      this.subscribe(topic, { qos }, handler);
    });
  }

  subscribe(topic, options = { qos: 0 }, handler) {
    if (!this.isClientValid()) {
      console.warn("[MQTT-MP] 客户端无效，无法订阅");
      return false;
    }

    const qos = options.qos || 0;
    const packetId = this.nextPacketId();
    const payload = [...encodeString(topic), qos];
    const variableHeader = [(packetId >> 8) & 0xff, packetId & 0xff];
    const body = [...variableHeader, ...payload];
    this.sendBytes([0x82, ...encodeRemainingLength(body.length), ...body]);

    const idx = this.topics.findIndex((item) => item.topic === topic);
    if (idx >= 0) {
      this.topics[idx] = { topic, qos, handler };
    } else {
      this.topics.push({ topic, qos, handler });
    }
    console.log(`[MQTT-MP] 订阅发送: ${topic}`);
    return true;
  }

  sendBytes(bytes) {
    if (!this.socketTask) return;
    this.socketTask.send({
      data: toArrayBuffer(bytes),
      fail: (error) => this.onError(error),
    });
  }

  handlePacket(data) {
    const bytes = new Uint8Array(data);
    const packetType = bytes[0] >> 4;
    const flags = bytes[0] & 0x0f;
    const remaining = decodeRemainingLength(bytes);
    let index = remaining.nextIndex;

    if (packetType === 2) {
      const returnCode = bytes[index + 1];
      if (returnCode === 0) {
        this.connected = true;
        this.connecting = false;
        this.clearConnectTimeout();
        this.startPing();
        this.subscribeToTopics();
        this.onConnectCallback?.();
      } else {
        this.onError(new Error(`CONNACK 失败: ${returnCode}`));
      }
      return;
    }

    if (packetType === 3) {
      const topicLength = (bytes[index] << 8) + bytes[index + 1];
      index += 2;
      const topic = utf8BytesToString(Array.from(bytes.slice(index, index + topicLength)));
      index += topicLength;

      const qos = (flags >> 1) & 0x03;
      let packetId = 0;
      if (qos > 0) {
        packetId = (bytes[index] << 8) + bytes[index + 1];
        index += 2;
      }

      const payloadEnd = remaining.nextIndex + remaining.value;
      const message = utf8BytesToString(Array.from(bytes.slice(index, payloadEnd)));
      this.dispatchMessage(topic, message);

      if (qos === 1 && packetId) {
        this.sendBytes([0x40, 0x02, (packetId >> 8) & 0xff, packetId & 0xff]);
      }
      return;
    }

    if (packetType === 9) {
      console.log("[MQTT-MP] 订阅确认");
    }
  }

  dispatchMessage(topic, message) {
    this.options.topicHandlers
      .filter((handler) => handler.topic === topic || this.matchTopicPattern(handler.topic, topic))
      .forEach((handler) => {
        try {
          handler.handler(message, topic);
        } catch (error) {
          console.error(`[MQTT-MP] 处理主题 ${topic} 消息失败:`, error);
        }
      });
    this.onMessageCallback?.(topic, message);
  }

  matchTopicPattern(pattern, topic) {
    const regex = new RegExp(
      `^${pattern
        .replace(/\+/g, "[^/]+")
        .replace(/#$/, ".*")
        .replace(/\//g, "\\/")}$`
    );
    return regex.test(topic);
  }

  nextPacketId() {
    this.packetId += 1;
    if (this.packetId > 65535) this.packetId = 1;
    return this.packetId;
  }

  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.connected) {
        this.sendBytes([0xc0, 0x00]);
      }
    }, Math.max(10000, (this.options.keepalive * 1000) / 2));
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  clearConnectTimeout() {
    if (this.connectTimeoutTimer) {
      clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }
  }

  clearTimers() {
    this.stopPing();
    this.clearConnectTimeout();
  }

  disconnect() {
    this.manualDisconnect = true;
    this.clearTimers();

    if (this.socketTask) {
      try {
        if (this.connected) {
          this.sendBytes([0xe0, 0x00]);
        }
        this.socketTask.close({});
      } catch (error) {
        console.warn("[MQTT-MP] 断开连接异常:", error);
      }
    }

    this.socketTask = null;
    this.connected = false;
    this.connecting = false;
    this.topics = [];
    return this;
  }

  onError(error) {
    console.error("[MQTT-MP] 错误:", error?.message || error);
    this.connecting = false;
    this.onErrorCallback?.(error);
  }

  isClientValid() {
    return this.socketTask && this.connected;
  }

  onConnected(callback) {
    this.onConnectCallback = callback;
    return this;
  }

  onErrorOccurred(callback) {
    this.onErrorCallback = callback;
    return this;
  }

  onClosed(callback) {
    this.onCloseCallback = callback;
    return this;
  }

  onClientOffline(callback) {
    this.onOfflineCallback = callback;
    return this;
  }

  isConnected() {
    return this.connected;
  }
}

let mqttInstance = null;

export function createMqttClient(options = {}) {
  if (mqttInstance && mqttInstance.isConnected()) {
    mqttInstance.disconnect();
  }
  mqttInstance = new MqttClient(options);
  return mqttInstance;
}

export { MqttClient };
