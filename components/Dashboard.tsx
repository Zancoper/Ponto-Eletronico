
import React, { useState, useEffect, useMemo } from 'react';
import { TimeRecord } from '../types';
import { storage } from '../services/storage';
import { generatePDF } from '../services/pdfExport';
import TimerDisplay from './TimerDisplay';
import EditModal from './EditModal';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

  useEffect(() => {
    setRecords(storage.getRecords());
    
    const activeSession = localStorage.getItem('active_session_start');
    if (activeSession) {
      const start = new Date(activeSession);
      setStartTime(start);
      setIsRunning(true);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && startTime) {
      interval = window.setInterval(() => {
        setElapsed(new Date().getTime() - startTime.getTime());
      }, 100);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Calculate total time of all records
  const totalRecordedMs = useMemo(() => {
    return records.reduce((acc, record) => acc + record.duration, 0);
  }, [records]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    localStorage.setItem('active_session_start', now.toISOString());
  };

  const handleStop = () => {
    if (!startTime) return;
    const endTime = new Date();
    const newRecord: TimeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: endTime.getTime() - startTime.getTime(),
      description: 'Work Session',
    };
    
    storage.addRecord(newRecord);
    setRecords(prev => [newRecord, ...prev]);
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
    localStorage.removeItem('active_session_start');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      storage.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdate = (updated: TimeRecord) => {
    storage.updateRecord(updated);
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setEditingRecord(null);
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor(ms / (1000 * 60 * 60));
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Timer Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-slate-100 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <TimerDisplay elapsedMs={elapsed} />
        
        <div className="flex gap-4 mt-10 w-full max-w-sm relative z-10">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
              </svg>
              Stop Timer
            </button>
          )}
        </div>

        {/* Total Time Summary Card inside Timer Section */}
        <div className="mt-8 pt-8 border-t border-slate-50 w-full flex justify-center">
          <div className="bg-slate-50 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Recorded Time</p>
              <p className="text-xl font-mono font-bold text-slate-700 tabular-nums">
                {formatDuration(totalRecordedMs)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header for Records */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your Records</h2>
          <p className="text-slate-500">History of your time clock sessions</p>
        </div>
        <button
          onClick={() => generatePDF(records)}
          disabled={records.length === 0}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No records found. Start your first session!</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{format(new Date(record.startTime), 'MMMM d, yyyy')}</div>
                  <div className="text-sm text-slate-500 font-medium">
                    {format(new Date(record.startTime), 'HH:mm')} - {format(new Date(record.endTime), 'HH:mm')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-xl font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">
                  {formatDuration(record.duration)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingRecord(record)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Record"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Record"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingRecord && (
        <EditModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default Dashboard;
