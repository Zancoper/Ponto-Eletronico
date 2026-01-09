
import { TimeRecord } from '../types';

const STORAGE_KEY = 'elegance_timesheet_records';

export const storage = {
  getRecords: (): TimeRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveRecords: (records: TimeRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },
  addRecord: (record: TimeRecord) => {
    const records = storage.getRecords();
    storage.saveRecords([record, ...records]);
  },
  updateRecord: (updatedRecord: TimeRecord) => {
    const records = storage.getRecords();
    storage.saveRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  },
  deleteRecord: (id: string) => {
    const records = storage.getRecords();
    storage.saveRecords(records.filter(r => r.id !== id));
  }
};
