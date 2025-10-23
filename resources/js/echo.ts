import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

// Debug environment variables
console.log('Echo Configuration Debug:');
console.log('VITE_REVERB_APP_KEY:', import.meta.env.VITE_REVERB_APP_KEY);
console.log('VITE_REVERB_HOST:', import.meta.env.VITE_REVERB_HOST);
console.log('VITE_REVERB_PORT:', import.meta.env.VITE_REVERB_PORT);
console.log('VITE_REVERB_SCHEME:', import.meta.env.VITE_REVERB_SCHEME);

const isLocal = import.meta.env.VITE_APP_ENV === 'local';

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'kbvmwc88p3jhxvt0chy8',
  wsHost: isLocal
    ? (import.meta.env.VITE_REVERB_HOST || 'localhost')
    : (import.meta.env.VITE_REVERB_HOST || '36.50.94.112'),
  wsPort: isLocal
    ? (import.meta.env.VITE_REVERB_PORT || 5090)
    : (import.meta.env.VITE_REVERB_PORT || 8080),
  wssPort: isLocal
    ? (import.meta.env.VITE_REVERB_PORT || 5090)
    : (import.meta.env.VITE_REVERB_PORT || 8080),
  forceTLS: false,
  enabledTransports: ['ws'],
  enableStats: false,
  enableLogging: true,
});


// Add connection event listeners for debugging
window.Echo.connector.pusher.connection.bind('connecting', () => {
  console.log('Echo: Connecting to WebSocket...');
});

window.Echo.connector.pusher.connection.bind('connected', () => {
  console.log('Echo: Connected to WebSocket successfully!');
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
  console.log('Echo: Disconnected from WebSocket');
});

window.Echo.connector.pusher.connection.bind('failed', () => {
  console.error('Echo: Connection failed');
});

window.Echo.connector.pusher.connection.bind('error', (error: unknown) => {
  console.error('Echo: Connection error:', error);
});

export default window.Echo;
