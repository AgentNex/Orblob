import { createClient } from '@insforge/sdk';
import { SceneConfig } from '@orblob/config';

export const INSFORGE_URL =
  process.env.NEXT_PUBLIC_INSFORGE_URL ||
  'https://q7hwjwtx.ap-southeast.insforge.app';

export const INSFORGE_ANON_KEY =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  'anon_4c318c8b629d149fca35396623101b6db2d93f213ba6b3e591878f9c66e52e70';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

export interface CloudProjectRecord {
  id: string;
  user_id?: string | null;
  name: string;
  description?: string | null;
  slug?: string | null;
  scene_config: SceneConfig;
  is_public: boolean;
  preset_id?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser() {
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error) return null;
    return data?.user || null;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function fetchUserProjects(): Promise<CloudProjectRecord[]> {
  try {
    const { data, error } = await insforge.database
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return (data as CloudProjectRecord[]) || [];
  } catch (err) {
    console.error('Exception fetching projects:', err);
    return [];
  }
}

export async function saveCloudProject(project: {
  id?: string;
  name: string;
  description?: string;
  scene_config: SceneConfig;
  is_public?: boolean;
  preset_id?: string;
}): Promise<{ data: CloudProjectRecord | null; error: Error | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: new Error('User must be signed in to save to the cloud.') };
    }

    if (project.id) {
      // Update existing
      const { data, error } = await insforge.database
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          scene_config: project.scene_config,
          is_public: project.is_public ?? false,
          preset_id: project.preset_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .select();

      if (error) return { data: null, error };
      return { data: (data?.[0] as CloudProjectRecord) || null, error: null };
    } else {
      // Insert new
      const { data, error } = await insforge.database
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: project.name,
            description: project.description,
            scene_config: project.scene_config,
            is_public: project.is_public ?? false,
            preset_id: project.preset_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) return { data: null, error };
      return { data: (data?.[0] as CloudProjectRecord) || null, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function deleteCloudProject(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await insforge.database
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function signUp(email: string, password: string, name?: string) {
  try {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function signOut() {
  try {
    const { error } = await insforge.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}
