import React from 'react';
import {
  FaEye,
  FaExchangeAlt,
  FaPen,
  FaSpinner,
  FaUserMinus,
  FaBan,
  FaTrash,
  FaCheck,
} from 'react-icons/fa';

import {
  getStaffKey,
  staffName,
  spaLabel,
  formatDate,
} from './StaffHelpers';

import {
  Badge,
  ProfilePhoto,
} from './StaffHelpers';

export const StaffTable = ({
  loading,
  staff,
  spaMap,
  basePath,
  canAct,
  navigate,
  onVerify,
  onTransfer,
  onLeave,
  onBlacklist,
  onDelete,
}) => {

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        <FaSpinner className="mx-auto mb-2 animate-spin" />
        Loading staff...
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        No staff records found.
      </div>
    );
  }

  return (
    <div className="relative overflow-visible">

 {/* Desktop Table */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full min-w-full text-left">
    
    <thead className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
      <tr>
        <th className="px-5 py-4">Profile</th>
        <th className="px-5 py-4">Designation</th>
        <th className="px-5 py-4">Current SPA</th>
        <th className="px-5 py-4">Status</th>
        <th className="px-5 py-4">Joined</th>
        <th className="px-5 py-4 text-right">Actions</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100 bg-white">
      {staff.map((member) => {
        const staffId = getStaffKey(member);

        return (
          <tr
            key={staffId}
            className="transition hover:bg-gray-50"
          >

            {/* Profile */}
            <td className="px-5 py-4">
              <button
                type="button"
                onClick={() => navigate(`${basePath}/${staffId}`)}
                className="flex items-center gap-4 text-left"
              >

                <ProfilePhoto staff={member} />

                <div className="min-w-0">

                  {/* Name */}
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {staffName(member)}
                  </p>

                  {/* Phone */}
                  <p className="mt-1 text-sm text-gray-700">
                    {member.phone || '-'}
                  </p>
            

                </div>
              </button>
            </td>

            {/* Designation */}
            <td className="px-5 py-4">
              <div className="space-y-1">

                <p className="text-sm font-medium text-gray-800">
                  {member.designation || '-'}
                </p>

                <p className="text-xs text-gray-400">
                  ID: {staffId}
                </p>

              </div>
            </td>

            {/* SPA */}
            <td className="px-5 py-4">
              <p className="text-sm font-medium text-gray-700">
                {spaLabel(spaMap[member.current_spa_id])}
              </p>
            </td>

            {/* Status */}
            <td className="px-5 py-4">
              <div className="flex flex-col gap-2">
                <Badge value={member.verification_status} />
                <Badge value={member.employment_status} />

                {member.is_blacklisted && (
                  <Badge
                    value="Blacklisted"
                    tone="blacklisted"
                  />
                )}
              </div>
            </td>

            {/* Joined */}
            <td className="px-5 py-4">
              <p className="text-sm text-gray-700">
                {formatDate(member.joining_date)}
              </p>
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
              <div className="flex items-center justify-end gap-2">

                {/* View */}
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/${staffId}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  title="View"
                >
                  <FaEye size={14} />
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/${staffId}/edit`)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  title="Edit"
                >
                  <FaPen size={13} />
                </button>

                {/* Verify */}
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onVerify(member)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                    title="Verify"
                  >
                    <FaCheck size={13} />
                  </button>
                )}

                {/* Transfer */}
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onTransfer(member)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                    title="Transfer"
                  >
                    <FaExchangeAlt size={13} />
                  </button>
                )}

                {/* Leave */}
                <button
                  type="button"
                  onClick={() => onLeave(member)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
                  title="Mark Left"
                >
                  <FaUserMinus size={13} />
                </button>

                {/* Blacklist */}
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onBlacklist(member)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition ${
                      member.is_blacklisted
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title={
                      member.is_blacklisted
                        ? 'Remove Blacklist'
                        : 'Blacklist'
                    }
                  >
                    <FaBan size={13} />
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <FaTrash size={13} />
                </button>

              </div>
            </td>

          </tr>
        );
      })}
    </tbody>
  </table>
</div>

   {/* Mobile Cards */}
<div className="space-y-4 md:hidden">
  {staff.map((member) => {
    const staffId = getStaffKey(member);

    return (
      <div
        key={staffId}
        className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
      >

        {/* Header */}
        <div className="flex items-start gap-4">

          <ProfilePhoto staff={member} />

          <div className="min-w-0 flex-1">

            {/* Name */}
            <p className="truncate text-base font-semibold text-gray-900">
              {staffName(member)}
            </p>

            {/* Phone */}
            <p className="mt-1 text-sm text-gray-700">
              {member.phone || '-'}
            </p>

            {/* Email */}
            <p className="truncate text-xs text-gray-400">
              {member.email || 'No email'}
            </p>

            {/* Designation */}
            <div className="mt-3 flex items-center gap-2">

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                {member.designation || 'Staff'}
              </span>

              <span className="text-xs text-gray-400">
                ID: {staffId}
              </span>

            </div>

            {/* SPA */}
            <p className="mt-3 text-sm font-medium text-gray-700">
              {spaLabel(spaMap[member.current_spa_id])}
            </p>

          </div>
        </div>

        {/* Status */}
        <div className="mt-5 flex flex-wrap gap-2">

          <Badge value={member.verification_status} />

          <Badge value={member.employment_status} />

          {member.is_blacklisted && (
            <Badge
              value="Blacklisted"
              tone="blacklisted"
            />
          )}

        </div>

        {/* Joined */}
        <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Joined
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {formatDate(member.joining_date)}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">

          {/* View */}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${staffId}`)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FaEye size={15} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${staffId}/edit`)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <FaPen size={14} />
          </button>

          {/* Verify */}
          {canAct && (
            <button
              type="button"
              onClick={() => onVerify(member)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
            >
              <FaCheck size={14} />
            </button>
          )}

          {/* Transfer */}
          {canAct && (
            <button
              type="button"
              onClick={() => onTransfer(member)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
            >
              <FaExchangeAlt size={14} />
            </button>
          )}

          {/* Leave */}
          <button
            type="button"
            onClick={() => onLeave(member)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
          >
            <FaUserMinus size={14} />
          </button>

          {/* Blacklist */}
          {canAct && (
            <button
              type="button"
              onClick={() => onBlacklist(member)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition ${
                member.is_blacklisted
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <FaBan size={14} />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(member)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <FaTrash size={14} />
          </button>

        </div>
      </div>
    );
  })}
</div>
    </div>
  );
};