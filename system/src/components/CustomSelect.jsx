import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const CustomSelect = ({ icon: Icon, value, onChange, options, placeholder = 'Select...', disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 ${Icon ? 'pl-9' : 'pl-3.5'} pr-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-all
          ${open ? 'border-[#2e4ed2] ring-2 ring-[#2e4ed2]/25' : 'border-slate-200'}
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}
        `}
      >
        <span className={`truncate text-left ${selected ? 'text-[#1a1f36]' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />}

      {open && !disabled && (
        <div className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-card py-1.5 animate-fade-in">
          {options.length === 0 ? (
            <p className="px-3.5 py-2 text-sm text-slate-400">No options available</p>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left transition-colors
                  ${opt.value === value ? 'bg-[#eef1fb] text-[#1a1f36] font-semibold' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <FiCheck size={14} className="text-[#2e4ed2] flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
