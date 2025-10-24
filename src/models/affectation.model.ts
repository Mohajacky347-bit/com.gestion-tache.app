import { dbPool } from "@/lib/db";

export interface AffectationEmployeEntity {
  idAffectation: string;
  role: string;
  dateDebutAffectation: string;
  dateFinAffectation?: string | null;
  idTache: string;
  idEmploye: string;
}

export const affectationModel = {
  async findAll(): Promise<AffectationEmployeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye 
       FROM affectations_employes 
       ORDER BY dateDebutAffectation DESC`
    );
    return rows as AffectationEmployeEntity[];
  },

  async findById(idAffectation: string): Promise<AffectationEmployeEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye 
       FROM affectations_employes 
       WHERE idAffectation = ? LIMIT 1`,
      [idAffectation]
    );
    const arr = rows as AffectationEmployeEntity[];
    return arr.length ? arr[0] : null;
  },

  async findByTask(idTache: string): Promise<AffectationEmployeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye 
       FROM affectations_employes 
       WHERE idTache = ? 
       ORDER BY dateDebutAffectation ASC`,
      [idTache]
    );
    return rows as AffectationEmployeEntity[];
  },

  async findByEmployee(idEmploye: string): Promise<AffectationEmployeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye 
       FROM affectations_employes 
       WHERE idEmploye = ? 
       ORDER BY dateDebutAffectation DESC`,
      [idEmploye]
    );
    return rows as AffectationEmployeEntity[];
  },

  async findActiveByEmployee(idEmploye: string): Promise<AffectationEmployeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAffectation, role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye 
       FROM affectations_employes 
       WHERE idEmploye = ? AND dateFinAffectation IS NULL 
       ORDER BY dateDebutAffectation DESC`,
      [idEmploye]
    );
    return rows as AffectationEmployeEntity[];
  },

  async create(affectation: Omit<AffectationEmployeEntity, 'idAffectation'>): Promise<string> {
    const [result] = await dbPool.query(
      `INSERT INTO affectations_employes (role, dateDebutAffectation, dateFinAffectation, idTache, idEmploye) 
       VALUES (?, ?, ?, ?, ?)`,
      [affectation.role, affectation.dateDebutAffectation, affectation.dateFinAffectation, affectation.idTache, affectation.idEmploye]
    );
    return (result as any).insertId;
  },

  async update(idAffectation: string, affectation: Partial<Omit<AffectationEmployeEntity, 'idAffectation'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    Object.entries(affectation).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(idAffectation);
    const [result] = await dbPool.query(
      `UPDATE affectations_employes SET ${fields.join(', ')} WHERE idAffectation = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  },

  async delete(idAffectation: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `DELETE FROM affectations_employes WHERE idAffectation = ?`,
      [idAffectation]
    );
    return (result as any).affectedRows > 0;
  },

  async terminateAffectation(idAffectation: string, dateFin: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE affectations_employes SET dateFinAffectation = ? WHERE idAffectation = ?`,
      [dateFin, idAffectation]
    );
    return (result as any).affectedRows > 0;
  }
};
