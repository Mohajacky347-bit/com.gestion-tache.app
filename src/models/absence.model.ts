import { dbPool } from "@/lib/db";

export interface AbsenceEntity {
  idAbsence: string;
  typeAbsence: "conge" | "maladie" | "formation" | "personnel" | "autre";
  dateDebut: string;
  dateFin?: string | null;
  statut: "planifie" | "en_cours" | "termine" | "annule";
  raison: string;
  idEmploye: string;
}

export const absenceModel = {
  async findAll(): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       ORDER BY dateDebut DESC`
    );
    return rows as AbsenceEntity[];
  },

  async findById(idAbsence: string): Promise<AbsenceEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE idAbsence = ? LIMIT 1`,
      [idAbsence]
    );
    const arr = rows as AbsenceEntity[];
    return arr.length ? arr[0] : null;
  },

  async findByEmployee(idEmploye: string): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE idEmploye = ? 
       ORDER BY dateDebut DESC`,
      [idEmploye]
    );
    return rows as AbsenceEntity[];
  },

  async findByType(typeAbsence: AbsenceEntity['typeAbsence']): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE typeAbsence = ? 
       ORDER BY dateDebut DESC`,
      [typeAbsence]
    );
    return rows as AbsenceEntity[];
  },

  async findByStatus(statut: AbsenceEntity['statut']): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE statut = ? 
       ORDER BY dateDebut DESC`,
      [statut]
    );
    return rows as AbsenceEntity[];
  },

  async findCurrentAbsences(): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE statut = 'en_cours' AND dateFin IS NULL 
       ORDER BY dateDebut ASC`
    );
    return rows as AbsenceEntity[];
  },

  async findAbsencesInPeriod(startDate: string, endDate: string): Promise<AbsenceEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idAbsence, typeAbsence, dateDebut, dateFin, statut, raison, idEmploye 
       FROM absences 
       WHERE (dateDebut <= ? AND (dateFin >= ? OR dateFin IS NULL)) 
       ORDER BY dateDebut ASC`,
      [endDate, startDate]
    );
    return rows as AbsenceEntity[];
  },

  async create(absence: Omit<AbsenceEntity, 'idAbsence'>): Promise<string> {
    const [result] = await dbPool.query(
      `INSERT INTO absences (typeAbsence, dateDebut, dateFin, statut, raison, idEmploye) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [absence.typeAbsence, absence.dateDebut, absence.dateFin, absence.statut, absence.raison, absence.idEmploye]
    );
    return (result as any).insertId;
  },

  async update(idAbsence: string, absence: Partial<Omit<AbsenceEntity, 'idAbsence'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    Object.entries(absence).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(idAbsence);
    const [result] = await dbPool.query(
      `UPDATE absences SET ${fields.join(', ')} WHERE idAbsence = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  },

  async updateStatus(idAbsence: string, statut: AbsenceEntity['statut']): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE absences SET statut = ? WHERE idAbsence = ?`,
      [statut, idAbsence]
    );
    return (result as any).affectedRows > 0;
  },

  async terminateAbsence(idAbsence: string, dateFin: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE absences SET dateFin = ?, statut = 'termine' WHERE idAbsence = ?`,
      [dateFin, idAbsence]
    );
    return (result as any).affectedRows > 0;
  },

  async delete(idAbsence: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `DELETE FROM absences WHERE idAbsence = ?`,
      [idAbsence]
    );
    return (result as any).affectedRows > 0;
  }
};
