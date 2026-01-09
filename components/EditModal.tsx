
import React, { useState } from 'react';
import { TimeRecord } from '../types';
import { format } from 'date-fns';

interface EditModalProps {
  record: TimeRecord;
  onClose: () => void;
  onSave: (updated: TimeRecord) => void;
}

const EditModal: React.FC<EditModalProps> = ({ record, onClose, onSave }) => {
  const [startTime, setStartTime] = useState(format(new Date(record.startTime), "yyyy-MM-dd'T'HH:mm:ss"));
  const [endTime, setEndTime] = useState(format(new Date(record.endTime), "yyyy-MM-dd'T'HH:mm:ss"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end < start) {
      alert("End time cannot be before start time");
      return;
    }

    onSave({
      ...record,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: end.getTime() - start.getTime(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Record</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              step="1"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              step="1"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
