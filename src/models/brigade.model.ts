import { dbPool } from "@/lib/db";

export interface BrigadeEntity {
  id_brigade: number;
  nom_brigade: string;
  lieu: string;
  chef_nom?: string;
}

export const brigadeModel = {
  async findAll(): Promise<BrigadeEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          b.id_brigade,
          b.nom_brigade,
          b.lieu,
          CONCAT(e.prenom, ' ', e.nom) as chef_nom
        FROM brigade b
        LEFT JOIN chefbrigade cb ON cb.id_brigade = b.id_brigade
        LEFT JOIN employe e ON e.id = cb.id_employe
        ORDER BY b.nom_brigade ASC`
      );
      
      const brigades = (rows as any[]).map(row => ({
        id_brigade: Number(row.id_brigade),
        nom_brigade: String(row.nom_brigade),
        lieu: String(row.lieu),
        chef_nom: row.chef_nom ? String(row.chef_nom) : undefined
      }));
      
      return brigades;
    } catch (error) {
      console.error('Error fetching brigades:', error);
      throw error;
    }
  },

  async findById(id: number): Promise<BrigadeEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          b.id_brigade,
          b.nom_brigade,
          b.lieu,
          CONCAT(e.prenom, ' ', e.nom) as chef_nom
        FROM brigade b
        LEFT JOIN chefbrigade cb ON cb.id_brigade = b.id_brigade
        LEFT JOIN employe e ON e.id = cb.id_employe
        WHERE b.id_brigade = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id_brigade: Number(row.id_brigade),
        nom_brigade: String(row.nom_brigade),
        lieu: String(row.lieu),
        chef_nom: row.chef_nom ? String(row.chef_nom) : undefined
      };
    } catch (error) {
      console.error('Error fetching brigade by id:', error);
      throw error;
    }
  },

  async create(brigade: Omit<BrigadeEntity, 'id_brigade' | 'chef_nom'>): Promise<BrigadeEntity> {
    try {
      const [result] = await dbPool.query(
        `INSERT INTO brigade (nom_brigade, lieu) 
         VALUES (?, ?)`,
        [brigade.nom_brigade, brigade.lieu]
      );
      
      const insertResult = result as any;
      const newId = insertResult.insertId;
      
      // Récupérer la brigade créée avec le chef si disponible
      const created = await this.findById(newId);
      if (!created) {
        throw new Error('Failed to retrieve created brigade');
      }
      
      return created;
    } catch (error) {
      console.error('Error creating brigade:', error);
      throw error;
    }
  },

  async update(id: number, brigade: Partial<Omit<BrigadeEntity, 'id_brigade' | 'chef_nom'>>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (brigade.nom_brigade !== undefined) {
        fields.push('nom_brigade = ?');
        values.push(brigade.nom_brigade);
      }
      
      if (brigade.lieu !== undefined) {
        fields.push('lieu = ?');
        values.push(brigade.lieu);
      }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      const [result] = await dbPool.query(
        `UPDATE brigade SET ${fields.join(', ')} WHERE id_brigade = ?`,
        values
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating brigade:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM brigade WHERE id_brigade = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting brigade:', error);
      throw error;
    }
  }
};
