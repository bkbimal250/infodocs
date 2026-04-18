import {
  FaEye, FaEdit, FaHistory, FaExchangeAlt,
  FaTrash, FaSignOutAlt, FaPhone, FaUserPlus
} from 'react-icons/fa';
import Pagination from '../../../common/Pagination';

const StaffTable = ({
  loading,
  staff,
  navigate,
  viewHistory,
  setShowTransfer,
  executeDeleteStaff,
  setShowLeave,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange
}) => {

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inactive: 'bg-gray-50 text-gray-500 border-gray-200',
      left: 'bg-red-50 text-red-600 border-red-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${colors[status] || colors.inactive}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-50 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="p-12 text-center">
        <FaUserPlus className="mx-auto text-gray-300 mb-3" size={28} />
        <h3 className="font-semibold text-gray-700">No staff members found</h3>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Employee</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map(member => (
              <tr
                key={member.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/manager/staff/${member.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold">
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FaPhone size={8} /> {member.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={member.current_status} />
                    <span className="text-xs text-gray-400">{member.designation || 'Staff'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {member.joining_date ? new Date(member.joining_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <ActionBtn icon={<FaEye />} title="View" onClick={() => navigate(`/manager/staff/${member.id}`)} />
                    <ActionBtn icon={<FaEdit />} title="Edit" onClick={() => navigate(`/manager/staff/${member.id}/edit`)} />
                    <ActionBtn icon={<FaHistory />} title="History" onClick={() => viewHistory(member)} />
                    <ActionBtn icon={<FaExchangeAlt />} title="Transfer" onClick={() => setShowTransfer(member)} />
                    <ActionBtn icon={<FaSignOutAlt />} title="Mark Left" onClick={() => setShowLeave(member)} color="red" />
                    <ActionBtn icon={<FaTrash />} title="Delete" onClick={() => executeDeleteStaff(member)} color="red" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        {staff.map(member => (
          <div
            key={member.id}
            className="p-4 active:bg-gray-50 transition-colors"
            onClick={() => navigate(`/manager/staff/${member.id}`)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                {member.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                  <StatusBadge status={member.current_status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{member.phone} · {member.designation || 'Staff'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <ActionBtn icon={<FaEdit size={12} />} onClick={() => navigate(`/manager/staff/${member.id}/edit`)} />
                <ActionBtn icon={<FaHistory size={12} />} onClick={() => viewHistory(member)} />
                <ActionBtn icon={<FaExchangeAlt size={12} />} onClick={() => setShowTransfer(member)} />
              </div>
              <span className="text-xs text-gray-400">
                Joined {member.joining_date ? new Date(member.joining_date).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="border-t p-3">
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

const ActionBtn = ({ icon, title, onClick, color = 'gray' }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`p-2 rounded-md transition-colors ${
      color === 'red'
        ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
    }`}
    title={title}
  >
    {icon}
  </button>
);

export default StaffTable;