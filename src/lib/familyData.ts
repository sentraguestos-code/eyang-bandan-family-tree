import { supabase } from './supabase';
import type { FamilyMember, FamilyStats } from '../types/family';

// ─── READ ────────────────────────────────────────────────────────────────────

export async function fetchAllMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('generation', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchMemberById(id: string): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function fetchRootMember(): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .is('parent_id', null)
    .single();

  if (error) return null;
  return data;
}

export async function fetchChildren(parentId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('parent_id', parentId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchMembersWithLocation(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null);

  if (error) throw error;
  return data ?? [];
}

export async function searchMembers(query: string): Promise<FamilyMember[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('generation', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function fetchFamilyStats(): Promise<FamilyStats> {
  const { data, error } = await supabase
    .from('family_members')
    .select('generation, location_lat, photo_url');

  if (error) throw error;

  const members = data ?? [];
  const generations = members.length > 0
    ? Math.max(...members.map((m) => m.generation))
    : 0;

  return {
    total_members: members.length,
    total_generations: generations,
    members_with_location: members.filter((m) => m.location_lat != null).length,
    members_with_photo: members.filter((m) => m.photo_url != null).length,
  };
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

export type MemberInput = Omit<FamilyMember, 'id' | 'created_at' | 'updated_at' | 'children' | 'children_count'>;

export async function addMember(input: MemberInput): Promise<FamilyMember> {
  const { data, error } = await supabase
    .from('family_members')
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMember(id: string, updates: Partial<MemberInput>): Promise<FamilyMember> {
  const { data, error } = await supabase
    .from('family_members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── TREE BUILDER ────────────────────────────────────────────────────────────

export function buildTree(members: FamilyMember[]): FamilyMember | null {
  const map = new Map<string, FamilyMember>();
  // members sudah diurutkan by created_at dari fetchAllMembers
  members.forEach((m) => map.set(m.id, { ...m, children: [] }));

  let root: FamilyMember | null = null;

  map.forEach((member) => {
    if (member.parent_id === null) {
      root = member;
    } else {
      const parent = map.get(member.parent_id);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(member);
        // urutan sudah terjaga karena members diiterasi sesuai created_at
      }
    }
  });

  return root;
}
