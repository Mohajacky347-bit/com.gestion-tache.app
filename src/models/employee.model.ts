import { dbPool } from "@/lib/db";

export interface EmployeeEntity {
  idEmploye: string;
  nom: string;
  prenom: string;
  matricule: string;
  fonction: string;
  contact: string;
  specialite: string;
  disponibilite: "disponible" | "affecte" | "absent";
}

export const employeeModel = {
  async findAll(): Promise<EmployeeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       ORDER BY nom ASC, prenom ASC`
    );
    return rows as EmployeeEntity[];
  },

  async findById(idEmploye: string): Promise<EmployeeEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       WHERE idEmploye = ? LIMIT 1`,
      [idEmploye]
    );
    const arr = rows as EmployeeEntity[];
    return arr.length ? arr[0] : null;
  },

  async findByMatricule(matricule: string): Promise<EmployeeEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       WHERE matricule = ? LIMIT 1`,
      [matricule]
    );
    const arr = rows as EmployeeEntity[];
    return arr.length ? arr[0] : null;
  },

  async findBySpecialite(specialite: string): Promise<EmployeeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       WHERE specialite = ? 
       ORDER BY nom ASC, prenom ASC`,
      [specialite]
    );
    return rows as EmployeeEntity[];
  },

  async findByDisponibilite(disponibilite: EmployeeEntity['disponibilite']): Promise<EmployeeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       WHERE disponibilite = ? 
       ORDER BY nom ASC, prenom ASC`,
      [disponibilite]
    );
    return rows as EmployeeEntity[];
  },

  async findAvailable(): Promise<EmployeeEntity[]> {
    return this.findByDisponibilite("disponible");
  },

  async search(term: string): Promise<EmployeeEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
       FROM employes 
       WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR fonction LIKE ? OR specialite LIKE ?
       ORDER BY nom ASC, prenom ASC`,
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
    );
    return rows as EmployeeEntity[];
  },

  async create(employee: Omit<EmployeeEntity, 'idEmploye'>): Promise<string> {
    const [result] = await dbPool.query(
      `INSERT INTO employes (nom, prenom, matricule, fonction, contact, specialite, disponibilite) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee.nom, employee.prenom, employee.matricule, employee.fonction, employee.contact, employee.specialite, employee.disponibilite]
    );
    return (result as any).insertId;
  },

  async update(idEmploye: string, employee: Partial<Omit<EmployeeEntity, 'idEmploye'>>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    Object.entries(employee).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(idEmploye);
    const [result] = await dbPool.query(
      `UPDATE employes SET ${fields.join(', ')} WHERE idEmploye = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  },

  async updateDisponibilite(idEmploye: string, disponibilite: EmployeeEntity['disponibilite']): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE employes SET disponibilite = ? WHERE idEmploye = ?`,
      [disponibilite, idEmploye]
    );
    return (result as any).affectedRows > 0;
  },

  async delete(idEmploye: string): Promise<boolean> {
    const [result] = await dbPool.query(
      `DELETE FROM employes WHERE idEmploye = ?`,
      [idEmploye]
    );
    return (result as any).affectedRows > 0;
  }
};
