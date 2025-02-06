"use server";

import {createClient} from "@/utils/superbase/server";

export async function handleStep3(
  data: {
    email: string;
    name: string;
    username: string;
  },
  email: string,
) {
  try {
    const {name, username} = data;
    if (name.length === 0 || username.length === 0) {
      return {
        error: "Name and username cannot be empty",
      };
    }
    if (email?.length === 0) {
      return {
        error: "Email cannot be empty",
      };
    }

    const supabase = await createClient();

    const {data: userData, error: userError} = await supabase.auth.getUser();
    if (userError) {
      return {
        error: userError.message,
      };
    }
    const {error: profileError} = await supabase.from("profiles").insert({
      id: userData.user.id,
      email: email,
      name: data.name,
      username: data.username,
    });
    if (profileError) {
      console.log("Undexpected error in handleStep3:", profileError);
      return {
        error:
          profileError instanceof Error
            ? profileError.message
            : "An unexpected error occurred",
      };
    }
    const {data: updatedUser, error} = await supabase.auth.updateUser({
      data: {
        name: name,
        username: username,
      },
    });

    if (!updatedUser) {
      return {
        error: "Failed to update user profile",
      };
    }

    if (error) {
      console.log("Undexpected error in handleStep3:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }

    return {
      message: "Account created successfully!",
    };
  } catch (error) {
    console.log("Undexpected error in handleStep3:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
