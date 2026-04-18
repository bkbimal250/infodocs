import React, { useState } from 'react';
import {
    FaTimes, FaHistory, FaCheckCircle, FaExchangeAlt, FaUserMinus,
    FaArrowRight, FaMapMarkerAlt, FaSearch, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';

/**
 * Enhanced Modal Base Component
 */
const BaseModal = ({ title, onClose, children, maxWidth = 'max-w-2xl' }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300`}>
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-gray-900 tracking-tight text-xl">{title}</h3>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-2xl hover:bg-white hover:shadow-md transition-all text-gray-400 hover:text-gray-900 active:scale-90"
                >
                    <FaTimes size={20} />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

/**
 * Optimized History Timeline Modal
 */
export const HistoryModal = ({ staff, history, allSpasMap, onClose }) => (
    <BaseModal title={`Audit Logs: ${staff.name}`} onClose={onClose}>
        <div className="relative space-y-8 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-1 before:bg-gray-50">
            {history.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FaHistory className="text-gray-200" size={24} />
                    </div>
                    <p className="text-gray-400 text-sm font-bold italic tracking-tight ">No historical records found for this member</p>
                </div>
            ) : (
                history.map((event, idx) => {
                    const isJoin = event.type === 'new_join' || event.type === 're_join';
                    const isTransfer = event.type === 'transfer_out';
                    const isLeave = event.type === 'leave';

                    const iconStyles = {
                        join: 'bg-emerald-500 text-white shadow-emerald-200',
                        transfer: 'bg-orange-500 text-white shadow-orange-200',
                        leave: 'bg-rose-500 text-white shadow-rose-200',
                        default: 'bg-gray-400 text-white shadow-gray-200'
                    };

                    const styleKey = isJoin ? 'join' : isTransfer ? 'transfer' : isLeave ? 'leave' : 'default';

                    return (
                        <div key={event.id || idx} className="relative pl-14 group">
                            <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center z-10 ring-4 ring-white transition-transform group-hover:scale-110 ${iconStyles[styleKey]}`}>
                                {isJoin && <FaCheckCircle size={16} />}
                                {isTransfer && <FaExchangeAlt size={16} />}
                                {isLeave && <FaUserMinus size={16} />}
                                {!isJoin && !isTransfer && !isLeave && <FaHistory size={16} />}
                            </div>

                            <div className="p-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-black  tracking-widest px-2.5 py-1 rounded-lg border ${isJoin ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            isTransfer ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                isLeave ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                        }`}>
                                        {event.type.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400  bg-white px-2 py-1 rounded-lg shadow-sm">
                                        <FaCalendarAlt size={8} /> {new Date(event.event_date).toLocaleString()}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {isTransfer ? (
                                        <div className="flex items-center gap-2 flex-wrap text-sm font-black">
                                            <span className="text-gray-900">{allSpasMap[event.spa_id]?.name || `Branch #${event.spa_id}`}</span>
                                            <FaArrowRight className="text-gray-300 animate-pulse" size={10} />
                                            <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100/30">
                                                {allSpasMap[event.to_spa_id]?.name || `Branch #${event.to_spa_id}`}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                            {allSpasMap[event.spa_id]?.name || `Branch #${event.spa_id}`}
                                        </div>
                                    )}

                                    {event.notes && (
                                        <div className="p-3 bg-white/80 rounded-2xl border border-gray-100 text-[11px] font-bold text-gray-500 italic leading-relaxed">
                                            "{event.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </BaseModal>
);

/**
 * Premium Transfer Workflow Modal
 */
export const TransferModal = ({ staff, spas, onClose, onSubmit }) => {
    const [data, setData] = useState({
        to_spa_id: '',
        transfer_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSpas = spas.filter(s =>
        s.id !== staff.spa_id &&
        (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.code?.toString().includes(searchTerm))
    );

    return (
        <BaseModal title={`Initiate Branch Transfer`} onClose={onClose}>
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-3xl border border-orange-100">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <FaExchangeAlt size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-orange-900 ">Employee to Transfer</p>
                        <p className="text-lg font-black text-gray-900 tracking-tight">{staff.name}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Target Station Search</label>
                    <div className="relative group">
                        <FaSearch className="absolute left-4 top-4 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find branch by name, code or location..."
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-52 overflow-y-auto pr-1 space-y-2 custom-scrollbar p-1">
                        {filteredSpas.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 text-xs font-bold italic  tracking-tighter">No eligible target branches found</div>
                        ) : (
                            filteredSpas.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setData({ ...data, to_spa_id: s.id })}
                                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between group active:scale-95 border-2 ${data.to_spa_id === s.id
                                            ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-xl shadow-orange-100/40'
                                            : 'bg-white border-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <FaMapMarkerAlt className={data.to_spa_id === s.id ? 'text-orange-500 scale-125' : 'text-gray-300 group-hover:text-gray-400'} />
                                        <div className="ml-3">
                                            <div className="text-xs font-black  tracking-tight">{s.name}</div>
                                            <div className="text-[10px] opacity-60 font-black tracking-widest mt-0.5">{s.city || 'LOCATION PENDING'} {s.code ? `• ${s.code}` : ''}</div>
                                        </div>
                                    </div>
                                    {data.to_spa_id === s.id && <FaCheckCircle className="text-orange-500 animate-in zoom-in" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Effective Transfer Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all font-black text-sm shadow-inner"
                            value={data.transfer_date}
                            onChange={(e) => setData({ ...data, transfer_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Assignment Memo</label>
                        <input
                            type="text"
                            placeholder="Handover notes or reason..."
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-inner"
                            value={data.notes}
                            onChange={(e) => setData({ ...data, notes: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    onClick={() => onSubmit(data)}
                    disabled={!data.to_spa_id}
                    className={`w-full py-5 text-white rounded-3xl font-black  tracking-[0.2em] text-[10px] shadow-2xl transition-all mt-4 transform active:scale-95 ${data.to_spa_id
                            ? 'bg-gradient-to-r from-orange-600 to-orange-400 shadow-orange-200/50 hover:brightness-110 scroll-mt-px'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale'
                        }`}
                >
                    Confirm & Execute Transfer
                </button>
            </div>
        </BaseModal>
    );
};

/**
 * Departure & Termination Workflow Modal
 */
export const LeaveModal = ({ staff, onClose, onSubmit }) => {
    const [data, setData] = useState({
        leave_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    return (
        <BaseModal title={`Deactivate Employee Profile`} onClose={onClose} maxWidth="max-w-xl">
            <div className="space-y-6">
                <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 flex gap-4 text-rose-900 group">
                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 group-hover:rotate-12 transition-transform">
                        <FaExclamationTriangle size={20} />
                    </div>
                    <div className="flex-grow">
                        <p className="font-black  tracking-widest text-[10px] mb-1">Critical Conflict Alert</p>
                        <p className="text-xs font-bold leading-relaxed opacity-80">You are about to end employment for <b>{staff.name}</b>. This will deactivate their profile and finalize all current history records.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Separation Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-black text-sm shadow-inner"
                            value={data.leave_date}
                            onChange={(e) => setData({ ...data, leave_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400  tracking-widest px-1">Final Exit Memo</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-sm shadow-inner h-28 resize-none"
                            placeholder="Reason for separation, feedback, or administrative notes..."
                            value={data.notes}
                            onChange={(e) => setData({ ...data, notes: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-grow py-4 text-gray-400 font-black  tracking-widest text-[10px] hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        Retain Member
                    </button>
                    <button
                        onClick={() => onSubmit(data)}
                        className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black  tracking-[0.2em] text-[10px] shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95"
                    >
                        Confirm Termination
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
