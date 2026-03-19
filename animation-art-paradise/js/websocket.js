// WebSocket连接管理

class WebSocketManager {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.messageHandlers = new Map();
        this.connectionHandlers = {
            onOpen: [],
            onClose: [],
            onError: []
        };
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.handleReconnect();
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log('WebSocket连接成功');
            this.reconnectAttempts = 0;
            this.connectionHandlers.onOpen.forEach(handler => handler(event));
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const handler = this.messageHandlers.get(data.type);
                if (handler) {
                    handler(data);
                } else {
                    console.warn('未知消息类型:', data.type);
                }
            } catch (error) {
                console.error('消息解析失败:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭');
            this.connectionHandlers.onClose.forEach(handler => handler(event));
            this.handleReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.connectionHandlers.onError.forEach(handler => handler(error));
        };
    }
    
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error('WebSocket重连失败，请刷新页面');
        }
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        }
        return false;
    }
    
    on(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    onOpen(handler) {
        this.connectionHandlers.onOpen.push(handler);
    }
    
    onClose(handler) {
        this.connectionHandlers.onClose.push(handler);
    }
    
    onError(handler) {
        this.connectionHandlers.onError.push(handler);
    }
    
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// 导出单例
const wsManager = new WebSocketManager(`ws://${window.location.host}/ws-ai`);