import { dbPool } from "@/lib/db";

export interface PhaseEntity {
  id: string;
  idTache: string;
  nom: string;
  description?: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Terminé";
}

export const phaseModel = {
  async findAll(): Promise<PhaseEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          idTache, 
          nom, 
          description,
          dureePrevue,
          dateDebut,
          dateFin,
          statut
         FROM phase 
         ORDER BY idTache, dateDebut ASC`
      );
      
      const phases = (rows as any[]).map(row => ({
        id: String(row.id),
        idTache: String(row.idTache),
        nom: String(row.nom),
        description: row.description ? String(row.description) : undefined,
        dureePrevue: Number(row.dureePrevue),
        dateDebut: new Date(row.dateDebut).toISOString().split('T')[0],
        dateFin: new Date(row.dateFin).toISOString().split('T')[0],
        statut: row.statut as "En attente" | "En cours" | "Terminé"
      }));
      
      return phases;
    } catch (error) {
      console.error('Error fetching phases:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<PhaseEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          idTache, 
          nom, 
          description,
          dureePrevue,
          dateDebut,
          dateFin,
          statut
         FROM phase 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: String(row.id),
        idTache: String(row.idTache),
        nom: String(row.nom),
        description: row.description ? String(row.description) : undefined,
        dureePrevue: Number(row.dureePrevue),
        dateDebut: new Date(row.dateDebut).toISOString().split('T')[0],
        dateFin: new Date(row.dateFin).toISOString().split('T')[0],
        statut: row.statut as "En attente" | "En cours" | "Terminé"
      };
    } catch (error) {
      console.error('Error fetching phase by id:', error);
      throw error;
    }
  },

  async create(phase: Omit<PhaseEntity, 'id'>): Promise<PhaseEntity> {
    try {
      // Générer un ID automatique
      const existingPhases = await this.findAll();
      const lastId = existingPhases.reduce((max, phase) => {
        const num = parseInt(phase.id.replace('P', '')) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = `P${(lastId + 1).toString().padStart(3, '0')}`;

      const [result] = await dbPool.query(
        `INSERT INTO phase (id, idTache, nom, description, dureePrevue, dateDebut, dateFin, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          phase.idTache,
          phase.nom,
          phase.description || null,
          phase.dureePrevue,
          phase.dateDebut,
          phase.dateFin,
          phase.statut
        ]
      );
      
      return {
        id: newId,
        ...phase
      };
    } catch (error) {
      console.error('Error creating phase:', error);
      throw error;
    }
  },

  async update(id: string, phase: Partial<PhaseEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE phase 
         SET idTache = ?, nom = ?, description = ?, dureePrevue = ?, dateDebut = ?, dateFin = ?, statut = ?
         WHERE id = ?`,
        [
          phase.idTache,
          phase.nom,
          phase.description || null,
          phase.dureePrevue,
          phase.dateDebut,
          phase.dateFin,
          phase.statut,
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating phase:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM phase WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }
  }
};
