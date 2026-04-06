import axiosInstance from './axiosConfig';

export interface Decharge {
  id_decharge: number;
  courrier: { idCourrier: number; objet: string };
  utilisateur: { nom_utilisateur: string; prenom_utilisateur: string };
  date_signature: string;        // ← correction : underscore
  observation: string;
  type_signature: 'ELECTRONIQUE' | 'PHYSIQUE';
  nom_signataire: string;
}

export const dechargeApi = {
  accuserReception: async (idCourrier: number, observation?: string) => {
    const response = await axiosInstance.post(
      `/api/decharges/courrier/${idCourrier}/accuser-reception`,
      { observation: observation || '' }
    );
    return response.data;
  },

  enregistrerPhysique: async (
    idCourrier: number,
    nomSignataire: string,
    observation?: string
  ) => {
    const response = await axiosInstance.post(
      `/api/decharges/courrier/${idCourrier}/physique`,
      { nomSignataire, observation: observation || '' }
    );
    return response.data;
  },

  getByCourrier: async (idCourrier: number): Promise<Decharge[]> => {
    const response = await axiosInstance.get(
      `/api/decharges/courrier/${idCourrier}`
    );
    return response.data.decharges || [];
  },
};