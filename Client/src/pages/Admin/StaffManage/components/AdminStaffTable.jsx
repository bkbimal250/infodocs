import {
    FaEye, FaEdit, FaHistory, FaExchangeAlt,
    FaTrash, FaSignOutAlt, FaPhone, FaCalendarAlt, FaChevronRight, FaMapMarkerAlt, FaUserPlus
} from 'react-icons/fa';
import Pagination from '../../../common/Pagination';

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

    const ActionButton = ({ icon, tooltip, onClick, color = 'gray' }) => {
        const styles = {
            blue: 'text-blue-600 hover:bg-blue-50',
            gray: 'text-gray-500 hover:bg-gray-100',
            orange: 'text-orange-500 hover:bg-orange-50',
            red: 'text-red-500 hover:bg-red-50'
        };

        return (
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`p-2 rounded-md transition-colors ${styles[color]}`}
                title={tooltip}
            >
                {icon}
            </button>
        );
    };

    const StatusBadge = ({ status }) => {
        const statusStr = status ? status.toLowerCase() : '';
        const colors = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            left: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[statusStr] || colors.inactive}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse hidden md:table-row border-b border-gray-100">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-grow">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-48 ml-auto"></div></td>
        </tr>
    );

    const SkeletonCard = () => (
        <div className="md:hidden p-4 bg-white rounded-lg border border-gray-200 animate-pulse space-y-4">
            <div className="flex gap-3 items-center border-b border-gray-100 pb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-8 bg-gray-100 rounded flex-grow"></div>
                <div className="h-8 bg-gray-100 rounded w-1/3"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-4 md:p-0">
                <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-sm font-medium text-gray-500">Employee Profile</th>
                                <th className="px-6 py-3 text-sm font-medium text-gray-500">City</th>
                                <th className="px-6 py-3 text-sm font-medium text-gray-500">Spa Details</th>
                                <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>{Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)}</tbody>
                    </table>
                </div>
                <div className="md:hidden space-y-3">
                    {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="px-6 py-12 text-center bg-white rounded-lg border border-gray-200 mx-4 md:mx-0">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserPlus className="text-gray-400" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">No staff records found</h3>
                <p className="text-gray-500 text-sm mt-1">Refine your search parameters or enroll a new member.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Employee Profile</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">City</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">Spa Details</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staff.map(member => (
                            <tr 
                                key={member.id} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer" 
                                onClick={() => navigate(`/admin/staff/${member.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                                            {member.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {member.designation || 'Staff'} • {member.phone}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {member.city || '—'}
                                </td>
                                <td className="px-6 py-4">
                                    {(() => {
                                        const spa = allSpasMap[member.spa_id];
                                        return spa ? (
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{spa.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {[spa.code && `#${spa.code}`, spa.area].filter(Boolean).join(' · ')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">Central Pool</div>
                                        );
                                    })()}
                                    <StatusBadge status={member.current_status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <ActionButton icon={<FaEye />} tooltip="View Details" onClick={() => navigate(`/admin/staff/${member.id}`)} />
                                        <ActionButton icon={<FaEdit />} tooltip="Edit Profile" onClick={() => navigate(`/admin/staff/${member.id}/edit`)} color="blue" />
                                        <ActionButton icon={<FaHistory />} tooltip="View History" onClick={() => viewHistory(member)} color="gray" />
                                        <ActionButton icon={<FaExchangeAlt />} tooltip="Transfer" onClick={() => setShowTransfer(member)} color="orange" />
                                        <ActionButton icon={<FaTrash />} tooltip="Delete" onClick={() => executeDeleteStaff(member)} color="red" />
                                        <ActionButton icon={<FaSignOutAlt />} tooltip="Terminate" onClick={() => setShowLeave(member)} color="red" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3 p-4">
                {staff.map(member => (
                    <div
                        key={member.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                        onClick={() => navigate(`/admin/staff/${member.id}`)}
                    >
                        <div className="flex items-start gap-3 border-b border-gray-100 pb-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                                {member.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                    <StatusBadge status={member.current_status} />
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {member.designation || 'Staff'} • {member.phone}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                            <div>
                                <span className="text-xs font-medium text-gray-400 block mb-0.5 uppercase tracking-wider">City</span>
                                {member.city || '—'}
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-400 block mb-0.5 uppercase tracking-wider">Spa</span>
                                {(() => {
                                    const spa = allSpasMap[member.spa_id];
                                    return spa ? (
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{spa.name}</div>
                                            {(spa.code || spa.area) && (
                                                <div className="text-xs text-gray-400">
                                                    {[spa.code && `#${spa.code}`, spa.area].filter(Boolean).join(' · ')}
                                                </div>
                                            )}
                                        </div>
                                    ) : <span className="text-gray-500">Central Pool</span>;
                                })()}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex gap-1 -ml-2">
                                <ActionButton icon={<FaEdit size={16} />} onClick={() => navigate(`/admin/staff/${member.id}/edit`)} color="blue" />
                                <ActionButton icon={<FaExchangeAlt size={16} />} onClick={() => setShowTransfer(member)} color="orange" />
                                <ActionButton icon={<FaTrash size={16} />} onClick={() => executeDeleteStaff(member)} color="red" />
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); viewHistory(member); }}
                                className="flex items-center gap-1 text-sm text-gray-600 font-medium px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                History <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Layer */}
            {!loading && totalItems > itemsPerPage && (
                <div className="mt-4 px-4 md:px-0">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        onPageChange={onPageChange}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminStaffTable;
