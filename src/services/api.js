import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  
  // ============ REQUÊTES CLIENT ============
  
  // Créer une nouvelle demande
  async createRequest(formData) {
    return api.post('/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Récupérer le statut d'une demande
  async getRequestStatus(requestId) {
    return api.get(`/requests/${requestId}/status`);
  }

  // ============ ADMINISTRATION ============
  
  // Récupérer toutes les demandes (admin)
  async getAllRequests(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return api.get(`/requests?${params.toString()}`);
  }

  // Récupérer une demande spécifique
  async getRequestById(requestId) {
    return api.get(`/requests/${requestId}`);
  }

  // Traiter une demande avec l'IA
  async processRequest(requestId, finalPrice = null) {
    const data = {};
    if (finalPrice) data.final_price = finalPrice;
    
    return api.put(`/requests/${requestId}/process`, data);
  }

  // Envoyer la réponse au client
  async sendResponse(requestId) {
    return api.put(`/requests/${requestId}/send-response`);
  }

  // Supprimer une demande
  async deleteRequest(requestId) {
    return api.delete(`/requests/${requestId}`);
  }

  // ============ PAIEMENTS ============
  
  // Créer une session de paiement Stripe
  async createStripePayment(requestId) {
    return api.post('/payments/stripe/create-session', {
      request_id: requestId
    });
  }

  // Créer un paiement Mobile Money
  async createMobileMoneyPayment(requestId, provider, phoneNumber) {
    return api.post(`/payments/${provider}/create`, {
      request_id: requestId,
      phone_number: phoneNumber
    });
  }

  // Vérifier un paiement
  async verifyPayment(paymentId, provider = 'stripe') {
    return api.get(`/payments/${provider}/verify/${paymentId}`);
  }

  // ============ UTILITAIRES ============
  
  // Vérifier la santé de l'API
  async healthCheck() {
    return api.get('/health');
  }

  // Télécharger un fichier
  getFileUrl(filename) {
    return `${API_BASE_URL.replace('/api', '')}/uploads/${filename}`;
  }

  // ============ AUTHENTIFICATION ADMIN ============
  
  // Connexion admin (si vous ajoutez l'auth plus tard)
  async adminLogin(credentials) {
    return api.post('/admin/login', credentials);
  }

  // Vérifier le token admin
  async verifyAdminToken(token) {
    return api.get('/admin/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

// Fonctions utilitaires pour les erreurs
export const handleApiError = (error, defaultMessage = 'Une erreur est survenue') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 404) {
    return 'Ressource non trouvée';
  }
  
  if (error.response?.status === 500) {
    return 'Erreur serveur, veuillez réessayer plus tard';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Erreur de connexion, vérifiez votre connexion internet';
  }
  
  return defaultMessage;
};

// Formatter les données pour l'affichage
export const formatRequestData = (request) => {
  return {
    ...request,
    created_at: new Date(request.created_at).toLocaleString('fr-FR'),
    processed_at: request.processed_at ? new Date(request.processed_at).toLocaleString('fr-FR') : null,
    response_sent_at: request.response_sent_at ? new Date(request.response_sent_at).toLocaleString('fr-FR') : null,
    final_price: request.final_price ? `${request.final_price}€` : null,
    client_proposed_price: `${request.client_proposed_price}€`
  };
};

// Statuts avec traductions
export const REQUEST_STATUSES = {
  pending: {
    label: 'En attente',
    color: 'warning',
    icon: '⏳'
  },
  processing: {
    label: 'En traitement',
    color: 'info',
    icon: '🔄'
  },
  completed: {
    label: 'Terminé',
    color: 'success',
    icon: '✅'
  },
  paid: {
    label: 'Payé',
    color: 'primary',
    icon: '💳'
  },
  cancelled: {
    label: 'Annulé',
    color: 'danger',
    icon: '❌'
  }
};

export const PAYMENT_STATUSES = {
  pending: {
    label: 'En attente',
    color: 'warning',
    icon: '⏳'
  },
  paid: {
    label: 'Payé',
    color: 'success',
    icon: '✅'
  },
  failed: {
    label: 'Échec',
    color: 'danger',
    icon: '❌'
  },
  refunded: {
    label: 'Remboursé',
    color: 'info',
    icon: '↩️'
  }
};

const apiService = new ApiService();
export default apiService;