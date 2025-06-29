import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  // All useRef calls first
  const userRef = useRef<User | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // All useState calls after useRef calls
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000;
  const ACTIVITY_CHECK_INTERVAL = 60 * 1000;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const resetSessionTimeout = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    if (userRef.current) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowSessionWarning(true);
      }, SESSION_TIMEOUT - WARNING_TIME);

      sessionTimeoutRef.current = setTimeout(() => {
        handleAutoLogout();
      }, SESSION_TIMEOUT);
    }
  };
  
  const handleAutoLogout = async () => {
    console.log('⏳ Session expired due to inactivity, signing out...');
    await signOut();
    if (typeof window !== 'undefined') {
      alert('⏳ Session expired due to inactivity. Please sign in again.');
    }
  };
  
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    setShowSessionWarning(false);
    resetSessionTimeout();
  };
  
  const extendSession = () => {
    updateActivity();
  };
  
  const checkSessionValidity = async (): Promise<boolean> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) {
      console.error(error);
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    if (data.session.expires_at && data.session.expires_at < now) {
      console.log('❌ Session expired');
      return false;
    }
    return true;
  };
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error(error);
        alert('⚠️ Your account data is incomplete. Please sign up again.');
        await signOut();
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error(error);
      alert('❌ There was an error loading your profile. Please sign in again.');
      await signOut();
    }
  };
  
  const signOut = async () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setShowSessionWarning(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
    return { error };
  };
  
  const initializeAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        setSession(data.session);
        setUser(data.session ? data.session.user : null);

        if (data.session?.user) {
          const isValid = await checkSessionValidity();
          if (isValid) {
            await fetchProfile(data.session.user.id);
            updateActivity();
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let mounted = true;

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session ? session.user : null);

      if (session?.user) {
        await fetchProfile(session.user.id);
        updateActivity();
      } else {
        setProfile(null);
        setShowSessionWarning(false);
        if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      }
      setLoading(false);
    });

    const activityHandler = () => {
      if (userRef.current) {
        updateActivity();
      }
    };
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach((event) => {
      document.addEventListener(event, activityHandler, true);
    });

    const interval = setInterval(async () => {
      if (userRef.current) {
        const timeSinceActivity = Date.now() - lastActivityRef.current;

        if (timeSinceActivity >= SESSION_TIMEOUT) {
          await handleAutoLogout();
        } else if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && !showSessionWarning) {
          setShowSessionWarning(true);
        }
        await checkSessionValidity();
      }
    }, ACTIVITY_CHECK_INTERVAL);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      activityEvents.forEach((event) => {
        document.removeEventListener(event, activityHandler, true);
      });
      clearInterval(interval);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    return { data, error };
  };
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };
  
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };
  
  return {
    user,
    profile,
    session,
    loading,
    showSessionWarning,
    signUp,
    signIn,
    signOut,
    updateProfile,
    extendSession,
  };
}