export interface Direction {
  // Pour votre interface existante
  id: number;
  code: string;
  nom: string;
  actif: boolean;
  description?: string;
  
  // Propriétés du backend (pour mapping)
  id_direction?: number;
  nomDirection?: string;
  descriptionDirection?: string;
  responsable?: string;
  contact_telephone?: string;
  email_direction?: string;
}

export interface DirectionCreateDTO {
  code: string;
  nom: string;
  description?: string;
}

export interface DirectionUpdateDTO {
  code?: string;
  nom?: string;
  description?: string;
  actif?: boolean;
}