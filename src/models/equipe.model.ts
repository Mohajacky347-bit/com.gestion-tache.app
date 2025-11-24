import { dbPool } from "@/lib/db";

export interface EquipeEntity {
  id_equipe: number;
  nom_equipe: string;
  specialite: string;
  id_brigade: number;
  brigade_nom?: string;
  membres?: number;
}

export const equipeModel = {
  async findAll(): Promise<EquipeEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          e.id_equipe,
          e.nom_equipe,
          e.specialite,
          e.id_brigade,
          b.nom_brigade as brigade_nom,
          COUNT(ee.id_employe) as membres
        FROM equipe e
        LEFT JOIN brigade b ON b.id_brigade = e.id_brigade
        LEFT JOIN employe_equipe ee ON ee.id_equipe = e.id_equipe
        GROUP BY e.id_equipe, e.nom_equipe, e.specialite, e.id_brigade, b.nom_brigade
        ORDER BY e.nom_equipe ASC`
      );
      
      const equipes = (rows as any[]).map(row => ({
        id_equipe: Number(row.id_equipe),
        nom_equipe: String(row.nom_equipe),
        specialite: String(row.specialite),
        id_brigade: Number(row.id_brigade),
        brigade_nom: row.brigade_nom ? String(row.brigade_nom) : undefined,
        membres: row.membres != null ? Number(row.membres) : 0
      }));
      
      return equipes;
    } catch (error) {
      console.error('Error fetching equipes:', error);
      throw error;
    }
  },

  async findById(id: number): Promise<EquipeEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          e.id_equipe,
          e.nom_equipe,
          e.specialite,
          e.id_brigade,
          b.nom_brigade as brigade_nom,
          COUNT(ee.id_employe) as membres
        FROM equipe e
        LEFT JOIN brigade b ON b.id_brigade = e.id_brigade
        LEFT JOIN employe_equipe ee ON ee.id_equipe = e.id_equipe
        WHERE e.id_equipe = ?
        GROUP BY e.id_equipe, e.nom_equipe, e.specialite, e.id_brigade, b.nom_brigade
        LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id_equipe: Number(row.id_equipe),
        nom_equipe: String(row.nom_equipe),
        specialite: String(row.specialite),
        id_brigade: Number(row.id_brigade),
        brigade_nom: row.brigade_nom ? String(row.brigade_nom) : undefined,
        membres: row.membres != null ? Number(row.membres) : 0
      };
    } catch (error) {
      console.error('Error fetching equipe by id:', error);
      throw error;
    }
  },

  async findByBrigade(id_brigade: number): Promise<EquipeEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          e.id_equipe,
          e.nom_equipe,
          e.specialite,
          e.id_brigade,
          b.nom_brigade as brigade_nom,
          COUNT(ee.id_employe) as membres
        FROM equipe e
        LEFT JOIN brigade b ON b.id_brigade = e.id_brigade
        LEFT JOIN employe_equipe ee ON ee.id_equipe = e.id_equipe
        WHERE e.id_brigade = ?
        GROUP BY e.id_equipe, e.nom_equipe, e.specialite, e.id_brigade, b.nom_brigade
        ORDER BY e.nom_equipe ASC`,
        [id_brigade]
      );
      
      const equipes = (rows as any[]).map(row => ({
        id_equipe: Number(row.id_equipe),
        nom_equipe: String(row.nom_equipe),
        specialite: String(row.specialite),
        id_brigade: Number(row.id_brigade),
        brigade_nom: row.brigade_nom ? String(row.brigade_nom) : undefined,
        membres: row.membres != null ? Number(row.membres) : 0
      }));
      
      return equipes;
    } catch (error) {
      console.error('Error fetching equipes by brigade:', error);
      throw error;
    }
  },

  async create(equipe: Omit<EquipeEntity, 'id_equipe' | 'brigade_nom' | 'membres'>): Promise<EquipeEntity> {
    try {
      const [result] = await dbPool.query(
        `INSERT INTO equipe (nom_equipe, specialite, id_brigade) 
         VALUES (?, ?, ?)`,
        [equipe.nom_equipe, equipe.specialite, equipe.id_brigade]
      );
      
      const insertResult = result as any;
      const newId = insertResult.insertId;
      
      // Récupérer l'équipe créée
      const created = await this.findById(newId);
      if (!created) {
        throw new Error('Failed to retrieve created equipe');
      }
      
      return created;
    } catch (error) {
      console.error('Error creating equipe:', error);
      throw error;
    }
  },

  async update(id: number, equipe: Partial<Omit<EquipeEntity, 'id_equipe' | 'brigade_nom' | 'membres'>>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (equipe.nom_equipe !== undefined) {
        fields.push('nom_equipe = ?');
        values.push(equipe.nom_equipe);
      }
      
      if (equipe.specialite !== undefined) {
        fields.push('specialite = ?');
        values.push(equipe.specialite);
      }
      
      if (equipe.id_brigade !== undefined) {
        fields.push('id_brigade = ?');
        values.push(equipe.id_brigade);
      }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      const [result] = await dbPool.query(
        `UPDATE equipe SET ${fields.join(', ')} WHERE id_equipe = ?`,
        values
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating equipe:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM equipe WHERE id_equipe = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting equipe:', error);
      throw error;
    }
  }
};
