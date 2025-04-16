// lib/api.ts
import { useAuthStore } from './auth';
import { useConversationsStore } from './conversationStore';

  const refreshTokenIfNeeded = async (): Promise<string> => {
    try {
      // Check if we have a session
      const currentSession = getAccessToken();

      // If we don't have a session or the token is expired, refresh it
      if (!currentSession || !getAccessToken()) {
        console.log("Token expired or missing, refreshing session...");

        // Assuming useAuthStore has a refreshSession method
        await useAuthStore.getState().refreshSession();

        // Get the new session
        const newSession = useAuthStore.getState().session;
        const newToken = newSession?.access_token;

        console.log("Session refreshed:", newToken ? "Success" : "Failed");
        return newToken || "";
      }

      return getAccessToken() || "";
    } catch (error) {
      console.error("Error refreshing token:", error);
      return "";
    }
  };

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = getAccessToken();
  const userId = useAuthStore.getState().user?.id;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (userId) {
    headers["X-User-ID"] = userId;
  }
  
  return headers;
};

export const getAccessToken = () => {
  const session = useAuthStore.getState().session;
  if (!session) return "";
  
  if (typeof session === 'string') {
    try {
      const parsedSession = JSON.parse(session);
      return parsedSession?.access_token || "";
    } catch {
      return ""; 
    }
  }
  
  return session.access_token || "";
};

export const fetchConversations = async () => {
  const { setConversations, setIsLoading } = useConversationsStore.getState();
  const { isAuthenticated, user } = useAuthStore.getState();
  
  if (!isAuthenticated || !user?.id) return;
  
  try {
    setIsLoading(true);
    const headers = await getAuthHeaders();
    const response = await fetch("/api/conversations", { headers });
    
    if (response.ok) {
      const data = await response.json();
      setConversations(data);
    } else {
      console.error("Failed to fetch conversations:", response.status);
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
  } finally {
    setIsLoading(false);
  }
};