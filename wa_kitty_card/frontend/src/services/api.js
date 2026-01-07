import { auth } from '../firebase/config';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '';
const WS_BASE_URL = process.env.VUE_APP_WS_BASE_URL || '';

async function getAuthHeader() {
  const user = auth.currentUser;
  console.log('Firebase User:', user ? `Logged in as ${user.email || user.uid}` : 'NOT LOGGED IN');
  
  if (!user) {
    console.warn('No Firebase user - request will be sent WITHOUT auth token');
    return {};
  }
  
  const token = await user.getIdToken();
  console.log('Firebase ID Token:', token.substring(0, 20) + '...');
  return { Authorization: `Bearer ${token}` }; 
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeader = await getAuthHeader();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeader,
      ...options.headers
    }
  };

  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

function getWebSocketUrl(sessionId, playerId) {
  if (WS_BASE_URL) {
    return `${WS_BASE_URL}/api/ws/${sessionId}/${playerId}`;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws/${sessionId}/${playerId}`;
  }
}

export default {
  createGame(playerName) {
    return apiFetch('/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ playerName })
    });
  },

  joinGame(sessionId, playerName) {
    return apiFetch('/api/game/join', {
      method: 'POST',
      body: JSON.stringify({ sessionId, playerName })
    });
  },

  getGameState(sessionId, playerId) {
    return apiFetch(`/api/game/state?sessionId=${sessionId}&playerId=${playerId}`, {
      method: 'GET'
    });
  },

  drawCard(sessionId, playerId) {
    return apiFetch('/api/card/draw', {
      method: 'POST',
      body: JSON.stringify({ sessionId, playerId })
    });
  },

  placeCard({ cardIndex, x, y, sessionId, playerId }) {
    return apiFetch('/api/card/place', {
      method: 'POST',
      body: JSON.stringify({
        cardIndex,
        x,
        y,
        sessionId,
        playerId
      })
    });
  },

  getWebSocketUrl
};
