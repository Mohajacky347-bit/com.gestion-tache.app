import { dbPool } from "@/lib/db";

export const employeEquipeService = {
  async assignToEquipe(id_employe: string, id_equipe: number, role?: string): Promise<void> {
    try {
      // Vérifier si l'employé est déjà dans une équipe
      const [existing] = await dbPool.query(
        `SELECT * FROM employe_equipe WHERE id_employe = ?`,
        [id_employe]
      );
      
      const existingRows = existing as any[];
      
      if (existingRows.length > 0) {
        // Mettre à jour l'équipe existante
        await dbPool.query(
          `UPDATE employe_equipe SET id_equipe = ?, role = ? WHERE id_employe = ?`,
          [id_equipe, role || null, id_employe]
        );
      } else {
        // Créer une nouvelle assignation
        await dbPool.query(
          `INSERT INTO employe_equipe (id_employe, id_equipe, role) VALUES (?, ?, ?)`,
          [id_employe, id_equipe, role || null]
        );
      }
    } catch (error) {
      console.error('Error assigning employe to equipe:', error);
      throw error;
    }
  },

  async removeFromEquipe(id_employe: string): Promise<void> {
    try {
      await dbPool.query(
        `DELETE FROM employe_equipe WHERE id_employe = ?`,
        [id_employe]
      );
    } catch (error) {
      console.error('Error removing employe from equipe:', error);
      throw error;
    }
  },

  async getEquipeByEmploye(id_employe: string): Promise<number | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT id_equipe FROM employe_equipe WHERE id_employe = ? LIMIT 1`,
        [id_employe]
      );
      
      const arr = rows as any[];
      return arr.length > 0 ? Number(arr[0].id_equipe) : null;
    } catch (error) {
      console.error('Error getting equipe by employe:', error);
      throw error;
    }
  },
};


