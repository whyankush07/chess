import { useState, useEffect, useCallback } from "react";
import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  type StoredUser,
} from "../utils/storage";
import { apiSignIn, apiSignUp } from "../services/api/auth";

export default function useAuth() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getStoredUser().then((stored) => {
      if (isMounted) {
        setUser(stored);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiSignIn(email, password);
    if (res.ok && res.data.user) {
      await setStoredUser(res.data.user);
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      return apiSignUp(username, email, password);
    },
    []
  );

  const signOut = useCallback(async () => {
    await clearStoredUser();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
  };
}
