import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export type AuthUser = User;

// 회원가입
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 로그인
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user as AuthUser;
}

// 세션 확인
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Get session error:", error);
    return null;
  }

  return data.session;
}
