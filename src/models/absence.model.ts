import { dbPool } from "@/lib/db";

export interface AbsenceEntity {
  id: string;
  idEmploye: string;
  dateDebut: string;
  dateFin?: string;
  type: "conge" | "maladie";
  motif?: string;
  statut: "en_cours" | "termine" | "planifie";
}

// Fonctions de mapping séparées (pas dans l'objet)
const mapStatut = (statutDB: string): "en_cours" | "termine" | "planifie" => {
  switch (statutDB) {
    case "Validée": return "en_cours";
    case "Terminé": return "termine";
    default: return "planifie";
  }
};

const mapStatutToDB = (statut: "en_cours" | "termine" | "planifie"): string => {
  switch (statut) {
    case "en_cours": return "Validée";
    case "termine": return "Terminé";
    default: return "Planifié";
  }
};

export const absenceModel = {
  async findAll(): Promise<AbsenceEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          idEmploye, 
          dateDebut, 
          dateFin,
          type,
          motif,
          statut
         FROM absence 
         ORDER BY dateDebut DESC`
      );
      
      const absences = (rows as any[]).map(row => ({
        id: String(row.id),
        idEmploye: String(row.idEmploye),
        dateDebut: new Date(row.dateDebut).toISOString().split('T')[0],
        dateFin: row.dateFin ? new Date(row.dateFin).toISOString().split('T')[0] : undefined,
        type: row.type as "conge" | "maladie",
        motif: row.motif ? String(row.motif) : undefined,
        statut: mapStatut(row.statut)
      }));
      
      return absences;
    } catch (error) {
      console.error('Error fetching absences:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<AbsenceEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          idEmploye, 
          dateDebut, 
          dateFin,
          type,
          motif,
          statut
         FROM absence 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: String(row.id),
        idEmploye: String(row.idEmploye),
        dateDebut: new Date(row.dateDebut).toISOString().split('T')[0],
        dateFin: row.dateFin ? new Date(row.dateFin).toISOString().split('T')[0] : undefined,
        type: row.type as "conge" | "maladie",
        motif: row.motif ? String(row.motif) : undefined,
        statut: mapStatut(row.statut)
      };
    } catch (error) {
      console.error('Error fetching absence by id:', error);
      throw error;
    }
  },

  async create(absence: Omit<AbsenceEntity, 'id'>): Promise<AbsenceEntity> {
    try {
      // Générer un ID automatique
      const existingAbsences = await this.findAll();
      const lastId = existingAbsences.reduce((max, abs) => {
        const num = parseInt(abs.id.replace('A', '')) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = `A${(lastId + 1).toString().padStart(3, '0')}`;

      const [result] = await dbPool.query(
        `INSERT INTO absence (id, idEmploye, dateDebut, dateFin, type, motif, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          absence.idEmploye,
          absence.dateDebut,
          absence.dateFin || null,
          absence.type,
          absence.motif || null,
          mapStatutToDB(absence.statut)
        ]
      );
      
      return {
        id: newId,
        ...absence
      };
    } catch (error) {
      console.error('Error creating absence:', error);
      throw error;
    }
  },

  async update(id: string, absence: Partial<AbsenceEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE absence 
         SET idEmploye = ?, dateDebut = ?, dateFin = ?, type = ?, motif = ?, statut = ?
         WHERE id = ?`,
        [
          absence.idEmploye,
          absence.dateDebut,
          absence.dateFin || null,
          absence.type,
          absence.motif || null,
          mapStatutToDB(absence.statut!),
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating absence:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM absence WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting absence:', error);
      throw error;
    }
  }
};
