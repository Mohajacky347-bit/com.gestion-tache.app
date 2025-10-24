import { dbPool } from "@/lib/db";

export interface PhaseEntity {
  idPhase: string;
  nom: string;
  description: string;
  ordre: number;
  dateDebutPrev: string;
  dateFinPrev: string;
  dateDebutReel?: string | null;
  dateFinReel?: string | null;
  statut: "planifie" | "en_cours" | "termine" | "annule";
}

export const phaseModel = {
  async findAll(): Promise<PhaseEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idPhase, nom, description, ordre, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut 
       FROM phases 
       ORDER BY ordre ASC`
    );
    return rows as PhaseEntity[];
  },

  async findById(idPhase: string): Promise<PhaseEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idPhase, nom, description, ordre, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut 
       FROM phases 
       WHERE idPhase = ? LIMIT 1`,
      [idPhase]
    );
    const arr = rows as PhaseEntity[];
    return arr.length ? arr[0] : null;
  },

  async findByOrder(ordre: number): Promise<PhaseEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idPhase, nom, description, ordre, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut 
       FROM phases 
       WHERE ordre = ? LIMIT 1`,
      [ordre]
    );
    const arr = rows as PhaseEntity[];
    return arr.length ? arr[0] : null;
  },

  async create(phase: Omit<PhaseEntity, 'idPhase'>): Promise<string> {
    const [result] = await dbPool.query(
      `INSERT INTO phases (nom, description, ordre, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [phase.nom, phase.description, phase.ordre, phase.dateDebutPrev, phase.dateFinPrev, phase.dateDebutReel, phase.dateFinReel, phase.statut]
    );
    return (result as any).insertId;
  },

  async update(idPhase: string, phase: Partial<Omit<PhaseEntity, 'idPhase'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    Object.entries(phase).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(idPhase);
    const [result] = await dbPool.query(
      `UPDATE phases SET ${fields.join(', ')} WHERE idPhase = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  },

  async delete(idPhase: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `DELETE FROM phases WHERE idPhase = ?`,
      [idPhase]
    );
    return (result as any).affectedRows > 0;
  }
};
