import {
  HiEye,
  HiPencil,
  HiTrash,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const spaName = (form) => form.spa?.name || form.spa_name_text || 'SPA not assigned';

const spaLocation = (spa) => {
  if (!spa) return 'Location not available';
  return [spa.area, spa.city, spa.state].filter(Boolean).join(', ') || 'Location not available';
};

const spaAddress = (spa) => {
  if (!spa) return 'Address not available';
  return [spa.address, spa.city, spa.state, spa.pincode].filter(Boolean).join(', ') || 'Address not available';
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const HiringDataTable = ({ hiringForms, onEdit, onDelete, onView }) => {
  if (!hiringForms || hiringForms.length === 0) {
    return (
      <div className="bg-white py-16 text-center">
        <HiOutlineBriefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <h3 className="text-base font-semibold text-gray-900">No hiring requirements found</h3>
        <p className="mt-1 text-sm text-gray-500">Try changing the filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                SPA Details
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Requirement
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Qualification
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Submitted
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {hiringForms.map((form) => (
              <tr key={form.id} className="align-top hover:bg-slate-50/80">
                <td className="max-w-md px-5 py-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                      <HiOutlineOfficeBuilding className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-950">{spaName(form)}</p>
                        {form.spa?.code !== null && form.spa?.code !== undefined && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            Code {form.spa.code}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600">
                        <HiOutlineLocationMarker className="mt-0.5 h-4 w-4 flex-none text-gray-400" />
                        <span>{spaLocation(form.spa)}</span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                        {spaAddress(form.spa)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-sm px-5 py-4">
                  <p className="font-semibold text-gray-950">{form.for_role || 'N/A'}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600">
                    {form.description || 'No description provided'}
                  </p>
                  {form.required_skills && (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Skills: <span className="font-normal text-slate-600">{form.required_skills}</span>
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <div className="space-y-1">
                    <p><span className="font-medium text-gray-800">Experience:</span> {form.required_experience || 'N/A'}</p>
                    <p><span className="font-medium text-gray-800">Education:</span> {form.required_education || 'N/A'}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                  {formatDate(form.created_at)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(form.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-indigo-700 hover:bg-indigo-50"
                        title="View details"
                      >
                        <HiEye className="h-4 w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(form)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-slate-700 hover:bg-slate-50"
                        title="Edit"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(form.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HiringDataTable;
