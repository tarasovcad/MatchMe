"use client";

import {supabase} from "@/utils/superbase/client";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current session on component mount
    const fetchSession = async () => {
      const {data, error} = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
      }
      if (data.session) {
        setUser(data.session.user);
      }
      setLoading(false);
    };

    fetchSession();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>Your user ID is: {user.id}</p>
      <p>{user.role}</p>
    </div>
  );
}
