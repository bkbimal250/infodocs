import React from 'react';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import SelectSpa from '../../../common/Selectspa';

/**
 * Branch Assignment Component
 * Uses the common SelectSpa for selection and provides a detailed view card.
 */
const BranchAssignment = ({ spaId, spas, editing, onChange }) => {
  const currentSpa = spas.find(s => String(s.id) === String(spaId));

  return (
    <div className="md:col-span-2 space-y-3">
      {editing ? (
        <SelectSpa
          value={spaId}
          onChange={(e) => onChange(e.target.value)}
          label="Assigned Branch Governance"
          placeholder="Search by name, city, area or code..."
        />
      ) : (
        <div className="w-full space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400  tracking-widest ml-1">
            <HiOutlineLocationMarker className="text-blue-500 text-xs" />
            Infrastructure Mapping
          </label>
          {currentSpa ? (
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm shadow-black/5 flex items-start gap-4 group hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-600">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
                <FaMapMarkerAlt size={20} />
              </div>
              <div className="flex-grow">
                <h4 className="text-lg font-black text-gray-900 leading-tight mb-1">{currentSpa.name}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-xs font-extrabold text-blue-600  tracking-widest">{currentSpa.city || 'City N/A'}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <p className="text-[10px] font-bold text-gray-400  tracking-tight">{currentSpa.area || 'Unknown Area'}</p>
                  {currentSpa.code && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <p className="text-[10px] font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded ">Code: {currentSpa.code}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50/50 border border-dashed border-orange-200 rounded-2xl p-6 text-center group cursor-default">
              <p className="text-xs font-black text-orange-600  tracking-[0.2em] mb-1">Unassigned Status</p>
              <p className="text-[10px] font-bold text-orange-400 ">You are currently not linked to any specific branch.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchAssignment;
