import { Injectable } from '@angular/core';
import { UserStorage } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private readonly DB_NAME = 'TimeVisualizerDB';
  private readonly DB_VERSION = 1;

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB not available in SSR'));
        return;
      }
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'username' });
          store.createIndex('username', 'username', { unique: true });
        }
        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async withDB<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB not available');
    }
    const db = await this.openDB();
    try {
      return await fn(db);
    } finally {
      db.close();
    }
  }

  async getAllUsers(): Promise<UserStorage[]> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async addUser(user: UserStorage): Promise<void> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        store.add(user);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  }

  async findUserByUsername(username: string): Promise<UserStorage | undefined> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const request = store.get(username);
        request.onsuccess = () => resolve(request.result ?? undefined);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async setSession(username: string): Promise<void> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readwrite');
        const store = tx.objectStore('session');
        store.put({ id: 'current', username });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  }

  async getSession(): Promise<string | null> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readonly');
        const store = tx.objectStore('session');
        const request = store.get('current');
        request.onsuccess = () => resolve(request.result?.username ?? null);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async clearSession(): Promise<void> {
    return this.withDB(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readwrite');
        const store = tx.objectStore('session');
        store.delete('current');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    });
  }
}
