import { dbPool } from "@/lib/db";
import { AuthUser, AppUserRole } from "@/types/auth";
import { SessionPayload } from "@/lib/session";

interface AuthenticateParams {
  identifier: string;
  role: AppUserRole;
}

interface AuthenticateResult {
  user: AuthUser;
  session: SessionPayload;
}

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

export const authService = {
  async authenticate({
    identifier,
    role,
  }: AuthenticateParams): Promise<AuthenticateResult | null> {
    if (role === "chef_section") {
      return this.authenticateChefSection(identifier);
    }
    return this.authenticateChefBrigade(identifier);
  },

  async authenticateChefSection(identifier: string): Promise<AuthenticateResult | null> {
    const email = normalizeIdentifier(identifier);
    const [rows] = await dbPool.query(
      `SELECT id, nom, email, role 
       FROM utilisateur 
       WHERE LOWER(email) = ? 
       LIMIT 1`,
      [email]
    );

    const arr = rows as Array<{
      id: string;
      nom: string;
      email: string;
      role: string;
    }>;

    if (!arr.length) return null;

    const record = arr[0];
    if (record.role.toLowerCase() !== "chefsection") {
      return null;
    }

    const user: AuthUser = {
      id: record.id,
      name: record.nom,
      role: "chef_section",
      email: record.email,
    };

    return {
      user,
      session: {
        userId: record.id,
        role: "chef_section",
      },
    };
  },

  async authenticateChefBrigade(identifier: string): Promise<AuthenticateResult | null> {
    const formattedIdentifier = identifier.trim();
    const lowered = normalizeIdentifier(identifier);

    const [rows] = await dbPool.query(
      `SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.contact,
        cb.id_brigade,
        b.nom_brigade
      FROM chefbrigade cb
      INNER JOIN employe e ON e.id = cb.id_employe
      INNER JOIN brigade b ON b.id_brigade = cb.id_brigade
      WHERE e.id = ? OR LOWER(e.contact) = ?`,
      [formattedIdentifier, lowered]
    );

    const arr = rows as Array<{
      id: string;
      nom: string;
      prenom: string;
      contact: string | null;
      id_brigade: number;
      nom_brigade: string;
    }>;

    if (!arr.length) return null;

    const record = arr[0];
    const user: AuthUser = {
      id: record.id,
      name: `${record.prenom} ${record.nom}`.trim(),
      role: "chef_brigade",
      contact: record.contact ?? undefined,
      brigadeId: record.id_brigade,
      brigadeName: record.nom_brigade,
    };

    return {
      user,
      session: {
        userId: record.id,
        role: "chef_brigade",
        brigadeId: record.id_brigade,
      },
    };
  },

  async getUserFromSession(session: SessionPayload): Promise<AuthUser | null> {
    if (session.role === "chef_section") {
      const [rows] = await dbPool.query(
        `SELECT id, nom, email 
         FROM utilisateur 
         WHERE id = ? 
         LIMIT 1`,
        [session.userId]
      );
      const arr = rows as Array<{ id: string; nom: string; email: string }>;
      if (!arr.length) return null;

      const record = arr[0];
      return {
        id: record.id,
        name: record.nom,
        role: "chef_section",
        email: record.email,
      };
    }

    const [rows] = await dbPool.query(
      `SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.contact,
        cb.id_brigade,
        b.nom_brigade
      FROM chefbrigade cb
      INNER JOIN employe e ON e.id = cb.id_employe
      INNER JOIN brigade b ON b.id_brigade = cb.id_brigade
      WHERE e.id = ?
      LIMIT 1`,
      [session.userId]
    );

    const arr = rows as Array<{
      id: string;
      nom: string;
      prenom: string;
      contact: string | null;
      id_brigade: number;
      nom_brigade: string;
    }>;

    if (!arr.length) return null;

    const record = arr[0];
    return {
      id: record.id,
      name: `${record.prenom} ${record.nom}`.trim(),
      role: "chef_brigade",
      contact: record.contact ?? undefined,
      brigadeId: record.id_brigade,
      brigadeName: record.nom_brigade,
    };
  },
};



