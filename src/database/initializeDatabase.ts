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
      goalstitle INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (goalstitle) REFERENCES goals (title) ON DELETE CASCADE
    )
  `);
}
export function getDb() {
  return db; // Retorna a instância do banco de dados
}

export async function createGoals(title: string) {
  await db.runAsync('INSERT INTO goals (title) VALUES (?)', [title]);
}

export async function removeGoals(id: number) {
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}

export async function updateGoals(id:number, title: string) {
  await db.runAsync('UPDATE goals SET title = ? WHERE id = ?', [title, id])
}

/* export async function select() {
  await db.getAllAsync('SELECT * FROM goals');
  } */

  export async function createSubgoals(title: string) {
  await db.runAsync('INSERT INTO goals (title) VALUES (?)', [title]);
}

export async function removesubgoals(id: number) {
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}