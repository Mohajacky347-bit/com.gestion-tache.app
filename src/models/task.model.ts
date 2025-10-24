import { dbPool } from "@/lib/db";

export interface TaskEntity {
  idTache: string;
  titre: string;
  description: string;
  priorite: "basse" | "normale" | "haute" | "critique";
  dateDebutPrev: string;
  dateFinPrev: string;
  dateDebutReel?: string | null;
  dateFinReel?: string | null;
  statut: "planifie" | "en_cours" | "termine" | "annule" | "en_pause";
  idPhase: string;
}

export const taskModel = {
  async findAll(): Promise<TaskEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
       FROM taches 
       ORDER BY priorite DESC, dateDebutPrev ASC`
    );
    return rows as TaskEntity[];
  },

  async findById(idTache: string): Promise<TaskEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
       FROM taches 
       WHERE idTache = ? LIMIT 1`,
      [idTache]
    );
    const arr = rows as TaskEntity[];
    return arr.length ? arr[0] : null;
  },

  async findByPhase(idPhase: string): Promise<TaskEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
       FROM taches 
       WHERE idPhase = ? 
       ORDER BY priorite DESC, dateDebutPrev ASC`,
      [idPhase]
    );
    return rows as TaskEntity[];
  },

  async findByStatus(statut: TaskEntity['statut']): Promise<TaskEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
       FROM taches 
       WHERE statut = ? 
       ORDER BY priorite DESC, dateDebutPrev ASC`,
      [statut]
    );
    return rows as TaskEntity[];
  },

  async create(task: Omit<TaskEntity, 'idTache'>): Promise<string> {
    const [result] = await dbPool.query(
      `INSERT INTO taches (titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.titre, task.description, task.priorite, task.dateDebutPrev, task.dateFinPrev, task.dateDebutReel, task.dateFinReel, task.statut, task.idPhase]
    );
    return (result as any).insertId;
  },

  async update(idTache: string, task: Partial<Omit<TaskEntity, 'idTache'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    Object.entries(task).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(idTache);
    const [result] = await dbPool.query(
      `UPDATE taches SET ${fields.join(', ')} WHERE idTache = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  },

  async delete(idTache: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `DELETE FROM taches WHERE idTache = ?`,
      [idTache]
    );
    return (result as any).affectedRows > 0;
  }
};
