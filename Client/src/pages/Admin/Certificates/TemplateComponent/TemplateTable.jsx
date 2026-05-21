import React from 'react';
import { TEMPLATE_TYPES } from '../../../../utils/certificateConstants';
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePhotograph, 
  HiOutlineDocumentReport,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineGlobeAlt,
  HiOutlineLockClosed
} from 'react-icons/hi';

const TemplateTable = React.memo(({ templates, onEdit, onDelete, getCategoryLabel }) => {
  if (!templates || templates.length === 0) {
    return (
      <div className="p-16 text-center bg-white">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineDocumentReport size={40} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No templates found</h3>
        <p className="text-gray-500 max-w-xs mx-auto">Start by creating your first template blueprint.</p>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('letter')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (normalized.includes('invoice') || normalized.includes('bill')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (normalized.includes('therapist')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (normalized.includes('salary')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Template Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Visibility</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {templates.map((template) => {
              const categoryLabel = getCategoryLabel(template.category);
              return (
                <tr key={template.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300">
                        {template.template_type === TEMPLATE_TYPES.IMAGE ? <HiOutlinePhotograph size={20} /> : <HiOutlineDocumentReport size={20} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 transition-colors">
                          {template.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5 flex items-center gap-2">
                          ID: #{template.id} • {template.is_active ? 
                            <span className="text-emerald-500 flex items-center gap-0.5"><HiOutlineEye size={10} /> Active</span> : 
                            <span className="text-gray-400 flex items-center gap-0.5"><HiOutlineEyeOff size={10} /> Inactive</span>
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getCategoryColor(categoryLabel)}`}>
                      {categoryLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                      {template.template_type?.toUpperCase() || TEMPLATE_TYPES.IMAGE.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {template.is_public ? (
                        <div className="flex flex-col items-center gap-1 text-blue-600" title="Visible to all users">
                          <HiOutlineGlobeAlt size={18} />
                          <span className="text-[9px] font-bold uppercase tracking-tighter">Public</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400" title="Private to creator">
                          <HiOutlineLockClosed size={18} />
                          <span className="text-[9px] font-bold uppercase tracking-tighter">Private</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEdit(template)}
                        title="Edit Template"
                        className="p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all active:scale-90"
                      >
                        <HiOutlinePencil size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(template.id)}
                        title="Delete Template"
                        className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all active:scale-90"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-50">
        {templates.map((template) => {
          const categoryLabel = getCategoryLabel(template.category);
          return (
            <div key={template.id} className="p-6 space-y-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    {template.template_type === TEMPLATE_TYPES.IMAGE ? <HiOutlinePhotograph size={20} /> : <HiOutlineDocumentReport size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{template.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: #{template.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(template)}
                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"
                  >
                    <HiOutlinePencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="p-2 text-rose-600 bg-rose-50 rounded-lg"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getCategoryColor(categoryLabel)}`}>
                  {categoryLabel}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                  {template.template_type?.toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${template.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {template.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TemplateTable;

