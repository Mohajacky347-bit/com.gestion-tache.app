import mysql from "mysql2/promise";

const databaseHost = process.env.DATABASE_HOST ?? "localhost";
const databasePort = Number(process.env.DATABASE_PORT ?? 3306);
const databaseUser = process.env.DATABASE_USER ?? "root";
const databasePassword = process.env.DATABASE_PASSWORD ?? "";
const databaseName = process.env.DATABASE_NAME ?? "gestion_tache";

export const dbPool = mysql.createPool({
  host: databaseHost,
  port: databasePort,
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export type SqlRow<T extends object> = T & Record<string, unknown>;



