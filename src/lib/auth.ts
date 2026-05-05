import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown';

  // Sync user horizontally if they don't exist
  // We use ON CONFLICT (clerk_user_id) if we had a constraint, 
  // but let's query first then insert, or just raw upsert.
  // Using direct query here for simplicity and safety, assuming clerk_user_id is unique:

  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        email,
        name,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error syncing user to Supabase:', insertError);
      return null;
    }
    user = newUser;
  }

  return user;
}
