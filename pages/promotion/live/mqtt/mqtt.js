// #ifndef MP-WEIXIN
import api from "@/config/api.js";
import mqtt from "mqtt";

const mqttEndpoint = api.mqtt;

class MqttClient {
  constructor(options = {}) {
    const defaultOptions = {
      endpoint: mqttEndpoint,
      username: "admin",
      password: "hivemq",
      ssl: true,
      keepalive: 30,
      clean: true,
      reconnectPeriod: 15000,
      connectTimeout: 20000,
      topicHandlers: [],
    };

    this.options = { ...defaultOptions, ...options };
    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.reconnecting = false;
    this.error = null;
    this.topics = [];
    this.connectCount = 0;
    this.MAX_CONNECT_RETRIES = 5;
    this.manualDisconnect = false;

    this.onConnectCallback = null;
    this.onReconnectCallback = null;
    this.onErrorCallback = null;
    this.onCloseCallback = null;
    this.onOfflineCallback = null;
    this.onMessageCallback = null;

    this.onConnect = this.onConnect.bind(this);
    this.onReconnect = this.onReconnect.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onOffline = this.onOffline.bind(this);
  }

  connect() {
    try {
      if (!this.options.endpoint) {
        throw new Error("MQTT 地址未配置，请检查 config/api.js 的 mqtt 字段");
      }

      console.log("[MQTT] 开始连接:", this.options.endpoint);
      this.manualDisconnect = false;

      if (this.client) {
        this.disconnect();
      }

      this.connecting = true;
      this.error = null;

      const connectionOptions = {
        clientId: this.options.clientId,
        keepalive: this.options.keepalive,
        clean: this.options.clean,
        reconnectPeriod: this.options.reconnectPeriod,
        connectTimeout: this.options.connectTimeout,
        username: this.options.username || undefined,
        password: this.options.password || undefined,
      };

      this.client = mqtt.connect(this.options.endpoint, connectionOptions);

      this.client.on("connect", this.onConnect);
      this.client.on("reconnect", this.onReconnect);
      this.client.on("error", this.onError);
      this.client.on("message", this.onMessage);
      this.client.on("close", this.onClose);
      this.client.on("offline", this.onOffline);

      const timeoutId = setTimeout(() => {
        if (!this.connected) {
          this.onError(new Error("连接超时"));
          if (this.client && typeof this.client.end === "function" && !this.manualDisconnect) {
            try {
              this.client.end(true);
            } catch (e) {
              console.warn("[MQTT] 超时关闭客户端失败:", e);
            }
          }
        }
      }, this.options.connectTimeout);

      this.client.once("connect", () => {
        clearTimeout(timeoutId);
      });
    } catch (err) {
      console.error("[MQTT] 连接异常:", err);
      this.onError(err);
    }

    return this;
  }

  disconnect() {
    this.manualDisconnect = true;

    if (this.client) {
      try {
        if (this.client.removeAllListeners) {
          this.client.removeAllListeners();
        }
        if (typeof this.client.end === "function") {
          this.client.end(true);
        }
        console.log("[MQTT] 连接已断开");
      } catch (err) {
        console.warn("[MQTT] 断开连接异常:", err);
      }
    }

    this.client = null;
    this.connected = false;
    this.connecting = false;
    this.reconnecting = false;
    this.topics = [];
    this.error = null;
    this.connectCount = 0;

    return this;
  }

  onConnect() {
    console.log("[MQTT] 连接成功");
    this.connected = true;
    this.connecting = false;
    this.reconnecting = false;
    this.error = null;
    this.connectCount = 0;
    this.subscribeToTopics();
    this.onConnectCallback?.();
  }

  onReconnect() {
    console.log("[MQTT] 重连中...");
    this.connected = false;
    this.connecting = true;
    this.reconnecting = true;
    this.connectCount++;

    if (this.connectCount > this.MAX_CONNECT_RETRIES) {
      console.warn("[MQTT] 重连次数超限，停止重连");
      if (this.client && typeof this.client.end === "function") {
        try {
          this.client.end(true);
        } catch (err) {
          console.warn("[MQTT] 停止客户端异常:", err);
        }
      }
      this.client = null;
      this.onError(new Error("重连次数超限"));
    }

    this.onReconnectCallback?.(this.connectCount);
  }

  onError(err) {
    console.error("[MQTT] 错误:", err?.message || err);
    this.error = err;
    this.connecting = false;
    this.onErrorCallback?.(err);
  }

  onClose() {
    console.log("[MQTT] 连接关闭");
    this.connected = false;
    this.onCloseCallback?.();
  }

  onOffline() {
    console.log("[MQTT] 客户端离线");
    this.connected = false;
    this.onOfflineCallback?.();
  }

  onMessage(topic, message) {
    const msgStr = message.toString();

    this.options.topicHandlers
      .filter((handler) => handler.topic === topic || this.matchTopicPattern(handler.topic, topic))
      .forEach((handler) => {
        try {
          handler.handler(msgStr, topic);
        } catch (err) {
          console.error(`[MQTT] 处理主题 ${topic} 消息失败:`, err);
        }
      });

    this.onMessageCallback?.(topic, msgStr);
  }

  isClientValid() {
    return this.client && this.connected && typeof this.client.subscribe === "function";
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

  subscribe(topic, options = { qos: 0 }, handler) {
    if (!this.isClientValid()) {
      console.warn("[MQTT] 客户端无效，无法订阅");
      return false;
    }

    try {
      this.client.subscribe(topic, options, (err, granted) => {
        if (err) {
          console.error(`[MQTT] 订阅 ${topic} 失败:`, err);
          return;
        }
        console.log(`[MQTT] 订阅成功: ${topic}`, granted);

        const idx = this.topics.findIndex((t) => t.topic === topic);
        if (idx >= 0) {
          this.topics[idx] = { topic, qos: options.qos, handler };
        } else {
          this.topics.push({ topic, qos: options.qos, handler });
        }

        if (handler && typeof handler === "function") {
          const hIdx = this.options.topicHandlers.findIndex((h) => h.topic === topic);
          if (hIdx >= 0) {
            this.options.topicHandlers[hIdx] = { topic, qos: options.qos, handler };
          } else {
            this.options.topicHandlers.push({ topic, qos: options.qos, handler });
          }
        }
      });
      return true;
    } catch (err) {
      console.error(`[MQTT] 订阅 ${topic} 异常:`, err);
      return false;
    }
  }

  subscribeToTopics() {
    if (!this.isClientValid()) return;

    this.options.topicHandlers.forEach(({ topic, qos = 0, handler }) => {
      this.subscribe(topic, { qos }, handler);
    });
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
// #endif

// #ifdef MP-WEIXIN
class MqttClient {
  connect() {
    return Promise.resolve(this);
  }
  disconnect() {}
  isConnected() {
    return false;
  }
  subscribe() {
    return this;
  }
  on() {
    return this;
  }
}

export function createMqttClient() {
  return new MqttClient();
}

export { MqttClient };
// #endif
