import { dbPool } from "@/lib/db";

export interface ChefBrigadeEntity {
  id_employe: string;
  nom: string;
  prenom: string;
  fonction: string;
  contact?: string;
  date_nomination?: string;
  id_brigade: number;
  nom_brigade: string;
}

export const chefBrigadeModel = {
  async findAll(): Promise<ChefBrigadeEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          cb.id_employe,
          cb.date_nomination,
          cb.id_brigade,
          b.nom_brigade,
          e.nom,
          e.prenom,
          e.fonction,
          e.contact
        FROM chefbrigade cb
        INNER JOIN brigade b ON b.id_brigade = cb.id_brigade
        INNER JOIN employe e ON e.id = cb.id_employe
        ORDER BY b.nom_brigade ASC, e.nom ASC`
      );

      return (rows as any[]).map((row) => ({
        id_employe: String(row.id_employe),
        nom: String(row.nom),
        prenom: String(row.prenom),
        fonction: String(row.fonction),
        contact: row.contact ? String(row.contact) : undefined,
        date_nomination: row.date_nomination
          ? new Date(row.date_nomination).toISOString().split("T")[0]
          : undefined,
        id_brigade: Number(row.id_brigade),
        nom_brigade: String(row.nom_brigade),
      }));
    } catch (error) {
      console.error("Error fetching chefs brigade:", error);
      throw error;
    }
  },

  async create(data: { id_employe: string; id_brigade: number; date_nomination?: string }): Promise<void> {
    try {
      await dbPool.query(
        `INSERT INTO chefbrigade (id_employe, id_brigade, date_nomination) 
         VALUES (?, ?, ?)`,
        [
          data.id_employe,
          data.id_brigade,
          data.date_nomination || new Date().toISOString().split('T')[0]
        ]
      );
    } catch (error) {
      console.error('Error creating chef brigade:', error);
      throw error;
    }
  },

  async delete(id_employe: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM chefbrigade WHERE id_employe = ?`,
        [id_employe]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting chef brigade:', error);
      throw error;
    }
  },

  async findByEmploye(id_employe: string): Promise<ChefBrigadeEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          cb.id_employe,
          cb.date_nomination,
          cb.id_brigade,
          b.nom_brigade,
          e.nom,
          e.prenom,
          e.fonction,
          e.contact
        FROM chefbrigade cb
        INNER JOIN brigade b ON b.id_brigade = cb.id_brigade
        INNER JOIN employe e ON e.id = cb.id_employe
        WHERE cb.id_employe = ?
        LIMIT 1`,
        [id_employe]
      );

      const arr = rows as any[];
      if (!arr.length) return null;

      const row = arr[0];
      return {
        id_employe: String(row.id_employe),
        nom: String(row.nom),
        prenom: String(row.prenom),
        fonction: String(row.fonction),
        contact: row.contact ? String(row.contact) : undefined,
        date_nomination: row.date_nomination
          ? new Date(row.date_nomination).toISOString().split("T")[0]
          : undefined,
        id_brigade: Number(row.id_brigade),
        nom_brigade: String(row.nom_brigade),
      };
    } catch (error) {
      console.error("Error fetching chef brigade by employe:", error);
      throw error;
    }
  },
};


