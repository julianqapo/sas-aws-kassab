// "use server";

// import { createServerSupabaseClient } from "../../lib/supabase-server";

// const activationPasswordId = 6


// export async function readActivationPassword(oldPassword: string, newPassword: string) {
//   const supabase = createServerSupabaseClient();

//   const { data, error } = await supabase.rpc("insert_credential", {
//     p_username: username,
//     p_password: password,
//   });

//   if (error) {
//     return { success: false, message: error.message };
//   }

//   return data as { success: boolean; message: string };
// }

