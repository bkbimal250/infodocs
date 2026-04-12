import {
    FaEye, FaEdit, FaHistory, FaExchangeAlt,
    FaTrash, FaSignOutAlt, FaPhone, FaCalendarAlt, FaChevronRight, FaMapMarkerAlt, FaUserPlus
} from 'react-icons/fa';
import Pagination from '../../../common/Pagination';

/**
 * Premium Responsive Admin Staff Table & Card View
 */
const AdminStaffTable = ({
    loading,
    staff,
    allSpasMap,
    navigate,
    viewHistory,
    setShowTransfer,
    executeDeleteStaff,
    setShowLeave,
    // Pagination Props
    currentPage = 1,
    itemsPerPage = 10,
    totalItems = 0,
    onPageChange
}) => {

    const ActionButton = ({ icon, tooltip, onClick, color = 'blue' }) => {
        const styles = {
            blue: 'text-blue-500 hover:bg-blue-50 bg-blue-50/10',
            indigo: 'text-indigo-500 hover:bg-indigo-50 bg-indigo-50/10',
            gray: 'text-gray-400 hover:bg-gray-100 bg-gray-50/30',
            orange: 'text-orange-500 hover:bg-orange-50 bg-orange-50/10',
            red: 'text-red-500 hover:bg-red-50 bg-red-50/10'
        };

        return (
            <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`p-2.5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-current/10 ${styles[color]}`}
                title={tooltip}
            >
                {icon}
            </button>
        );
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            inactive: 'bg-gray-50 text-gray-500 border-gray-100',
            left: 'bg-red-50 text-red-600 border-red-100'
        };
        return (
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black  tracking-widest border ${colors[status] || colors.inactive}`}>
                {status}
            </span>
        );
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse hidden md:table-row">
            <td className="px-6 py-5">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                    <div className="space-y-2 py-1 flex-grow">
                        <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                        <div className="h-3 bg-gray-50 rounded-lg w-1/4"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5"><div className="h-10 bg-gray-50 rounded-xl w-32"></div></td>
            <td className="px-6 py-5"><div className="h-10 bg-gray-100 rounded-2xl w-48 ml-auto"></div></td>
        </tr>
    );

    const SkeletonCard = () => (
        <div className="md:hidden p-4 bg-white rounded-[2rem] border border-gray-50 animate-pulse space-y-4">
            <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-gray-100 rounded-3xl"></div>
                <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-gray-100 rounded-lg w-2/3"></div>
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3"></div>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-10 bg-gray-50 rounded-xl flex-grow"></div>
                <div className="h-10 bg-gray-50 rounded-xl flex-grow"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="hidden md:block">
                    <table className="w-full">
                        <tbody>{Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)}</tbody>
                    </table>
                </div>
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="p-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 mx-4 md:mx-0">
                <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
                    <FaUserPlus className="text-gray-300" size={30} />
                </div>
                <h3 className="font-black text-gray-900 tracking-tight">No staff records detected</h3>
                <p className="text-gray-400 text-xs mt-1">Refine your search parameters or enroll a new member.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400  tracking-[0.2em]">Employee Profile</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400  tracking-[0.2em]">Operational Context</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400  tracking-[0.2em] text-right">Goverance Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-blue-50/10 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/staff/${member.id}`)}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 shadow-xl shadow-gray-200 flex items-center justify-center text-white font-black text-lg ring-4 ring-white transition-transform group-hover:scale-110">
                                            {member.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-gray-900 tracking-tight">{member.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold tracking-widest flex items-center gap-1.5 mt-0.5">
                                                <FaPhone size={8} /> {member.phone}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50 flex items-center gap-1">
                                                <FaMapMarkerAlt size={8} />
                                                {allSpasMap[member.spa_id] || 'Central Pool'}
                                            </span>
                                            <StatusBadge status={member.current_status} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-400  tracking-widest">{member.designation || 'Specialist'}</span>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                            <span className="text-[10px] font-black text-gray-400 flex items-center gap-1  tracking-tighter">
                                                <FaCalendarAlt size={8} />
                                                Since {member.joining_date ? new Date(member.joining_date).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-all">
                                        <ActionButton icon={<FaEye />} tooltip="Deep View" onClick={() => navigate(`/admin/staff/${member.id}`)} />
                                        <ActionButton icon={<FaEdit />} tooltip="Edit Profile" onClick={() => navigate(`/admin/staff/${member.id}/edit`)} color="indigo" />
                                        <ActionButton icon={<FaHistory />} tooltip="Audit Logs" onClick={() => viewHistory(member)} color="gray" />
                                        <ActionButton icon={<FaExchangeAlt />} tooltip="Branch Transfer" onClick={() => setShowTransfer(member)} color="orange" />
                                        <ActionButton icon={<FaTrash />} tooltip="Purge Record" onClick={() => executeDeleteStaff(member)} color="red" />
                                        <ActionButton icon={<FaSignOutAlt />} tooltip="Terminate" onClick={() => setShowLeave(member)} color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                {staff.map(member => (
                    <div
                        key={member.id}
                        className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group"
                        onClick={() => navigate(`/admin/staff/${member.id}`)}
                    >
                        <div className="flex items-center gap-4 mb-5 relative z-10">
                            <div className="w-14 h-14 rounded-3xl bg-gray-900 flex items-center justify-center text-white font-black shadow-lg">
                                {member.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-gray-900 tracking-tight">{member.name}</h4>
                                    <StatusBadge status={member.current_status} />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-gray-400 font-bold  tracking-widest">{member.designation || 'Staff'}</p>
                                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                    <p className="text-[10px] text-blue-500 font-black  tracking-tight">{allSpasMap[member.spa_id] || 'Central Pool'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10 font-bold">
                            <div className="p-3 bg-gray-50/80 rounded-2xl flex flex-col gap-1">
                                <span className="text-[8px] text-gray-400  tracking-widest">Contact</span>
                                <span className="text-[10px] text-gray-900">{member.phone}</span>
                            </div>
                            <div className="p-3 bg-gray-50/80 rounded-2xl flex flex-col gap-1">
                                <span className="text-[8px] text-gray-400  tracking-widest">Joined</span>
                                <span className="text-[10px] text-gray-900">{member.joining_date ? new Date(member.joining_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 relative z-10">
                            <div className="flex gap-2">
                                <ActionButton icon={<FaEdit size={12} />} onClick={() => navigate(`/admin/staff/${member.id}/edit`)} color="indigo" />
                                <ActionButton icon={<FaExchangeAlt size={12} />} onClick={() => setShowTransfer(member)} color="orange" />
                                <ActionButton icon={<FaTrash size={12} />} onClick={() => executeDeleteStaff(member)} color="red" />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); viewHistory(member); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black  tracking-widest active:scale-90 transition-all shadow-lg shadow-black/10"
                            >
                                History <FaChevronRight size={8} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Layer */}
            {!loading && totalItems > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={onPageChange}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};

export default AdminStaffTable;
