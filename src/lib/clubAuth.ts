
import { supabase } from "@/integrations/supabase/client";

const CLUB_TOKEN_KEY = "solidario_club_token";
const CLUB_DATA_KEY = "solidario_club_data";

export interface ClubSession {
  token: string;
  club: {
    id: string;
    name: string;
  };
}

export const setClubSession = (session: ClubSession) => {
  localStorage.setItem(CLUB_TOKEN_KEY, session.token);
  localStorage.setItem(CLUB_DATA_KEY, JSON.stringify(session.club));
};

export const getClubSession = (): ClubSession | null => {
  const token = localStorage.getItem(CLUB_TOKEN_KEY);
  const clubData = localStorage.getItem(CLUB_DATA_KEY);
  if (!token || !clubData) return null;
  return {
    token,
    club: JSON.parse(clubData)
  };
};

export const clearClubSession = () => {
  localStorage.removeItem(CLUB_TOKEN_KEY);
  localStorage.removeItem(CLUB_DATA_KEY);
};

export const isClubAuthenticated = () => {
  return !!localStorage.getItem(CLUB_TOKEN_KEY);
};

export const getClubId = () => {
  const session = getClubSession();
  return session?.club.id || null;
};

export const getClubName = () => {
  const session = getClubSession();
  return session?.club.name || null;
};

/**
 * Custom hook or helper to sync the club token with the Supabase client.
 * Supabase client handles sessions automatically, but since we use a custom JWT,
 * we might need to manually set it if the standard auth is empty.
 */
export const syncSupabaseWithClubToken = async () => {
  const session = getClubSession();
  if (session) {
    // If we have a club token, we can try to set it in supabase
    // This allows RLS to work using the custom JWT
    const { data: { session: sbSession } } = await supabase.auth.getSession();
    if (!sbSession) {
      await supabase.auth.setSession({
        access_token: session.token,
        refresh_token: "", // Custom JWTs don't have refresh tokens in this flow
      });
    }
  }
};
