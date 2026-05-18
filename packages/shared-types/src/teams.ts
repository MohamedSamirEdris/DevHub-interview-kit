export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount: number;
  leadId?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
  services: string[];
}
