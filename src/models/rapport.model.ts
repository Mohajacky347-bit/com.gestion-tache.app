import { dbPool } from "@/lib/db";

export interface RapportEntity {
  id: string;
  description: string;
  dateRapport: string;
  photoUrl?: string;
  avancement: number;
  idPhase: string;
  validation: "en_attente" | "a_reviser" | "approuve";
}

// Fonctions de mapping séparées
const mapValidation = (validationDB: string): "en_attente" | "a_reviser" | "approuve" => {
  switch (validationDB) {
    case "En attente": return "en_attente";
    case "À réviser": return "a_reviser";
    case "Approuvé": return "approuve";
    default: return "en_attente";
  }
};

const mapValidationToDB = (validation: "en_attente" | "a_reviser" | "approuve"): string => {
  switch (validation) {
    case "en_attente": return "En attente";
    case "a_reviser": return "À réviser";
    case "approuve": return "Approuvé";
  }
};

export const rapportModel = {
  async findAll(): Promise<RapportEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          description, 
          dateRapport, 
          photoUrl,
          avancement,
          idPhase,
          validation
         FROM rapport 
         ORDER BY dateRapport DESC`
      );
      
      const rapports = (rows as any[]).map(row => ({
        id: String(row.id),
        description: String(row.description),
        dateRapport: new Date(row.dateRapport).toISOString().split('T')[0],
        photoUrl: row.photoUrl ? String(row.photoUrl) : undefined,
        avancement: Number(row.avancement),
        idPhase: String(row.idPhase),
        validation: mapValidation(row.validation)
      }));
      
      return rapports;
    } catch (error) {
      console.error('Error fetching rapports:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<RapportEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          description, 
          dateRapport, 
          photoUrl,
          avancement,
          idPhase,
          validation
         FROM rapport 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: String(row.id),
        description: String(row.description),
        dateRapport: new Date(row.dateRapport).toISOString().split('T')[0],
        photoUrl: row.photoUrl ? String(row.photoUrl) : undefined,
        avancement: Number(row.avancement),
        idPhase: String(row.idPhase),
        validation: mapValidation(row.validation)
      };
    } catch (error) {
      console.error('Error fetching rapport by id:', error);
      throw error;
    }
  },

  async create(rapport: Omit<RapportEntity, 'id'>): Promise<RapportEntity> {
    try {
      // Générer un ID automatique
      const existingRapports = await this.findAll();
      const lastId = existingRapports.reduce((max, rap) => {
        const num = parseInt(rap.id.replace('R', '')) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = `R${(lastId + 1).toString().padStart(3, '0')}`;

      const [result] = await dbPool.query(
        `INSERT INTO rapport (id, description, dateRapport, photoUrl, avancement, idPhase, validation) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          rapport.description,
          rapport.dateRapport,
          rapport.photoUrl || null,
          rapport.avancement,
          rapport.idPhase,
          mapValidationToDB(rapport.validation)
        ]
      );
      
      return {
        id: newId,
        ...rapport
      };
    } catch (error) {
      console.error('Error creating rapport:', error);
      throw error;
    }
  },

  async update(id: string, rapport: Partial<RapportEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE rapport 
         SET description = ?, dateRapport = ?, photoUrl = ?, avancement = ?, idPhase = ?, validation = ?
         WHERE id = ?`,
        [
          rapport.description,
          rapport.dateRapport,
          rapport.photoUrl || null,
          rapport.avancement,
          rapport.idPhase,
          mapValidationToDB(rapport.validation!),
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating rapport:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM rapport WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting rapport:', error);
      throw error;
    }
  }
};
