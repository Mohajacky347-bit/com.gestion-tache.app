import { dbPool } from "@/lib/db";

export interface MaterialEntity {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: "disponible" | "utilise" | "maintenance";
  tacheActuelle?: string | null;
  dateMaintenance?: string | null;
  responsable?: string | null;
}

export const materialModel = {
  async findAll(): Promise<MaterialEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT id, nom, type, quantite, etat, tache_actuelle AS tacheActuelle, date_maintenance AS dateMaintenance, responsable FROM materiels ORDER BY nom ASC`
    );
    return rows as MaterialEntity[];
  },

  async findById(id: string): Promise<MaterialEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT id, nom, type, quantite, etat, tache_actuelle AS tacheActuelle, date_maintenance AS dateMaintenance, responsable FROM materiels WHERE id = ? LIMIT 1`,
      [id]
    );
    const arr = rows as MaterialEntity[];
    return arr.length ? arr[0] : null;
  },
};



