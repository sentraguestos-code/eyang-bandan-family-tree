export interface FamilyMember {
  id: string;
  name: string;
  photo_url?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  location_city?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  parent_id: string | null;
  generation: number;
  gender?: 'male' | 'female' | null;
  child_order?: number | null;
  created_at: string;
  updated_at: string;
  // joined from children query
  children?: FamilyMember[];
  children_count?: number;
}

export interface FamilyStats {
  total_members: number;
  total_generations: number;
  members_with_location: number;
  members_with_photo: number;
}
