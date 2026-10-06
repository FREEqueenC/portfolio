import { Centrifuge } from 'centrifuge';

let centrifuge = null;
let subscription = null;

export function initRealtime(onEventReceived) {
    if (centrifuge) return centrifuge;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const url = `${protocol}://${host}/connection/websocket`;

    centrifuge = new Centrifuge(url);

    centrifuge.on('connected', (ctx) => {
        console.log("Realtime connection established", ctx);
    });

    centrifuge.on('disconnected', (ctx) => {
        console.warn("Realtime connection closed", ctx);
    });

    // Subscribe to the global 'events' channel
    subscription = centrifuge.newSubscription('events');

    subscription.on('publication', (ctx) => {
        console.log("Realtime event received:", ctx.data);
        onEventReceived(ctx.data);
    });

    subscription.on('subscribed', (ctx) => {
        console.log("Subscribed to 'events' channel successfully", ctx);
    });

    subscription.subscribe();
    centrifuge.connect();

    return centrifuge;
}

export function disconnectRealtime() {
    if (centrifuge) {
        centrifuge.disconnect();
        centrifuge = null;
        subscription = null;
    }
}
