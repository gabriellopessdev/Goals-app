import * as SQLite from 'expo-sqlite';
let db: any
export async function initializeDatabase() {
  db = await SQLite.openDatabaseAsync('goalsDatabase');
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    )
  `);

  // Criação da tabela 'submetas'
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subgoals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goalsId INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (goalsId) REFERENCES goals (id) ON DELETE CASCADE
    )
  `);
}
export function getDb() {
  return db; // Retorna a instância do banco de dados
}

export async function create(title: string) {
  const result = await db.runAsync('INSERT INTO goals (title) VALUES (?)', [title]);
}