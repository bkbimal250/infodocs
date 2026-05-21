import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import Select from 'react-select';

import {
  Modal,
  staffName,
  spaLabel,
} from './StaffHelpers';

/* =========================
   VERIFICATION MODAL
========================= */

export const VerificationModal = ({
  staff,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState(
    staff.verification_status === 'verified'
      ? 'rejected'
      : 'verified'
  );

  const [reason, setReason] = useState('');

  return (
    <Modal
      title={`Verification: ${staffName(staff)}`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ status, reason });
        }}
        className="space-y-5"
      >

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Verification Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          >
            <option value="verified">
              Verify
            </option>

            <option value="rejected">
              Reject
            </option>

            <option value="pending">
              Move to Pending
            </option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Reason / Notes
          </label>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            required={status !== 'verified'}
            rows={4}
            placeholder="Enter reason or notes..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Submit Verification
        </button>

      </form>
    </Modal>
  );
};

/* =========================
   TRANSFER MODAL
========================= */

export const TransferModal = ({
  staff,
  spas,
  loadingSpas,
  onClose,
  onSubmit,
}) => {

  const [data, setData] = useState({
    target_spa_id: '',
    transfer_reason: '',
    notes: '',
  });

  const spaList = Array.isArray(spas)
    ? spas
    : [];

  const eligibleSpas = spaList.filter(
    (spa) =>
      Number(spa.id) !==
      Number(staff.current_spa_id)
  );

  const spaOptions = eligibleSpas.map(
    (spa) => ({
      value: spa.id,
      label: spaLabel(spa),
      code: spa.code,
      city: spa.city,
      area: spa.area,
      state: spa.state,
      address: spa.address,
    })
  );

  const selectedSpa = spaOptions.find(
    (option) =>
      String(option.value) ===
      String(data.target_spa_id)
  );

  return (
    <Modal
      title={`Transfer Staff`}
      onClose={onClose}
    >

      {/* Current Staff */}
      <div className="mb-5 rounded-3xl border border-gray-200 bg-gray-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Staff Member
        </p>

        <div className="mt-2">
          <p className="text-base font-semibold text-gray-900">
            {staffName(staff)}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Current SPA:
            <span className="ml-1 font-medium text-gray-900">
              {spaLabel(
                spaList.find(
                  (spa) =>
                    Number(spa.id) ===
                    Number(staff.current_spa_id)
                )
              )}
            </span>
          </p>
        </div>

      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }}
        className="space-y-5"
      >

        {/* SPA Selection */}
        <div>

          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Select Target SPA
            </label>

            <span className="text-xs text-gray-400">
              {eligibleSpas.length} locations
            </span>
          </div>

          <p className="mb-3 text-xs text-gray-500">
            Search by SPA name, code, city, area, or state
          </p>

          <Select
            options={spaOptions}

            value={selectedSpa || null}

            onChange={(selected) =>
              setData((prev) => ({
                ...prev,
                target_spa_id:
                  selected?.value || '',
              }))
            }

            placeholder="Type to search SPA..."

            isSearchable

            isLoading={loadingSpas}

            className="text-sm"

            classNamePrefix="spa-select"

            noOptionsMessage={() =>
              loadingSpas
                ? 'Loading SPAs...'
                : 'No SPA found'
            }

            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: 58,
                borderRadius: 20,
                borderColor: state.isFocused
                  ? '#111827'
                  : '#D1D5DB',
                boxShadow: 'none',
                paddingLeft: 8,
                paddingRight: 8,

                '&:hover': {
                  borderColor: '#111827',
                },
              }),

              valueContainer: (base) => ({
                ...base,
                paddingTop: 8,
                paddingBottom: 8,
              }),

              placeholder: (base) => ({
                ...base,
                color: '#9CA3AF',
              }),

              menu: (base) => ({
                ...base,
                borderRadius: 20,
                overflow: 'hidden',
                zIndex: 9999,
              }),

              menuList: (base) => ({
                ...base,
                maxHeight: 300,
                paddingTop: 6,
                paddingBottom: 6,
              }),

              option: (base, state) => ({
                ...base,
                padding: 14,
                backgroundColor: state.isFocused
                  ? '#F9FAFB'
                  : '#fff',
                color: '#111827',
                cursor: 'pointer',
              }),
            }}

            filterOption={(
              candidate,
              input
            ) => {

              const search =
                String(input || '')
                  .trim()
                  .toLowerCase();

              if (!search) return true;

              const data = candidate.data || {};

              const searchableText = [
                candidate.label,
                candidate.value,
                data.code,
                data.city,
                data.area,
                data.state,
                data.address,
              ]
                .filter(Boolean)
                .map(String)
                .join(' ')
                .toLowerCase();

              return searchableText.includes(
                search
              );
            }}

            formatOptionLabel={(option) => (
              <div className="flex flex-col">

                <div className="flex items-center gap-2">

                  <span className="font-semibold text-gray-900">
                    {option.label}
                  </span>

                  {option.code && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      {option.code}
                    </span>
                  )}

                </div>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">

                  {option.city && (
                    <span>
                      {option.city}
                    </span>
                  )}

                  {option.area && (
                    <span>
                      • {option.area}
                    </span>
                  )}

                  {option.state && (
                    <span>
                      • {option.state}
                    </span>
                  )}

                </div>

              </div>
            )}
          />

        </div>

        {/* Selected SPA Preview */}
        {selectedSpa && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Selected Transfer Location
            </p>

            <div className="mt-2">

              <div className="flex items-center gap-2">

                <p className="text-sm font-semibold text-emerald-900">
                  {selectedSpa.label}
                </p>

                {selectedSpa.code && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {selectedSpa.code}
                  </span>
                )}

              </div>

              <p className="mt-1 text-xs text-emerald-700">
                {[
                  selectedSpa.city,
                  selectedSpa.area,
                  selectedSpa.state,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>

            </div>

          </div>
        )}

        {/* Transfer Reason */}
        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Transfer Reason
          </label>

          <input
            value={data.transfer_reason}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                transfer_reason:
                  e.target.value,
              }))
            }
            placeholder="Example: Staff rotation, performance, operational requirement..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />

        </div>

        {/* Notes */}
        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Additional Notes
          </label>

          <textarea
            value={data.notes}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            rows={4}
            placeholder="Add additional instructions or notes..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!data.target_spa_id}
            className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Transfer
          </button>

        </div>

      </form>
    </Modal>
  );
};
/* =========================
   LEAVE MODAL
========================= */

export const LeaveModal = ({
  staff,
  onClose,
  onSubmit,
}) => {

  const [data, setData] = useState({
    leave_date: new Date()
      .toISOString()
      .split('T')[0],

    reason: '',
    notes: '',
  });

  return (
    <Modal
      title={`Mark Left: ${staffName(staff)}`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }}
        className="space-y-5"
      >

        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Leave Date
          </label>

          <input
            type="date"
            value={data.leave_date}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                leave_date: e.target.value,
              }))
            }
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Leave Reason
          </label>

          <input
            value={data.reason}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                reason: e.target.value,
              }))
            }
            placeholder="Enter leave reason"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={data.notes}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            rows={4}
            placeholder="Enter notes..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Confirm Leave
        </button>

      </form>
    </Modal>
  );
};