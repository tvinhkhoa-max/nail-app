import React, { useEffect, useState, useMemo, useRef } from 'react'

interface FormInputProps {
  label: string;
  error?: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  className?: string;
}

interface RadioOption {
  label: string;
  value: string;
}

interface FormRadioGroupProps {
  label: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  inline?: boolean;
}

interface FormSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  description?: string;
  disabled?: boolean;
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  containerClassName?: string
}

export const FormInput = ({ label, error, ...props }: FormInputProps) => (
  <div className="mb-5">
    {/* <label className="mb-3 block text-base font-medium text-dark dark:text-white"> */}
    <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">
      {label}
    </label>
    <input
      type="text" 
      {...props}
      className={`w-full rounded-md border py-3 px-5 text-base outline-none transition focus:border-primary 
        ${error ? 'border-red-500' : 'border-stroke dark:border-dark-3'} 
        bg-transparent text-body-color dark:text-dark-6`}
    />
    {error && <span className="mt-2 text-sm text-red-500">{error}</span>}
  </div>
)

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({ label, options, selectedValue, onChange, inline = false }) => {
  return (
    <div className="mb-4">
      <label className="mb-2.5 block font-medium text-dark dark:text-white text-sm uppercase tracking-wider">
        {label}
      </label>
      <div className={`flex ${inline ? 'flex-row gap-6' : 'flex-col gap-3'}`}>
        {options.map((option) => (
          <label key={option.value} className="relative flex cursor-pointer select-none items-center gap-2">
            <input
              type="radio"
              className="sr-only"
              name={label}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
            />
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                selectedValue === option.value 
                  ? 'border-primary' 
                  : 'border-stroke dark:border-dark-3'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full bg-primary transition-transform ${
                  selectedValue === option.value ? 'scale-100' : 'scale-0'
                }`}
              />
            </div>
            <span className="text-sm text-dark dark:text-white">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const FormSwitch: React.FC<FormSwitchProps> = ({ 
  label, 
  enabled, 
  onChange, 
  description, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex flex-col">
        {/* <span className="text-sm font-medium text-dark dark:text-white"></span> */}
        <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">{label}</label>
        {description && (
          <p className="text-xs text-body-color dark:text-dark-6">{description}</p>
        )}
      </div>
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-4'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export const SearchableSelectForm = ({ label, value, options, searchTerm, onSearchChange, onSelect }: any) => {
  const filtered = options.filter((o: string) => o.toLowerCase().includes(searchTerm.toLowerCase()))
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

    // 1. Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between rounded border border-stroke p-3 text-sm dark:border-dark-3 dark:bg-dark-2 dark:text-white cursor-pointer"
      >
        <span>{value}</span>
        <svg className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded border border-stroke bg-white shadow-lg dark:border-dark-3 dark:bg-dark-3">
          <div className="p-2">
            <input 
              autoFocus
              className="w-full rounded border border-stroke bg-transparent py-1.5 px-3 text-sm outline-none focus:border-primary dark:border-dark-4 dark:text-white"
              placeholder="Tìm..."
              value={searchTerm}
              onChange={(e: any) => onSearchChange(e.target.value)}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.map((opt: string) => (
              <li 
                key={opt}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-white dark:text-white"
                onClick={() => { onSelect(opt); setIsOpen(false); onSearchChange(''); }}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface SelectOption {
  text: string
  value: any
}

interface SelectableProps {
  label: string;
  options: SelectOption[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  error?: string | undefined;
}

export const SearchableSelect2 = ({ label, options = [], value, onChange, placeholder = "Chọn một mục...", error }: SelectableProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // 2. Xử lý tìm kiếm (Memoized để tối ưu performance)
  const filteredOptions = useMemo(() => {
    return options.filter((opt: any) => 
      opt.text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // 3. Tìm text hiển thị cho option đang chọn
  const selectedDisplay = useMemo(() => {
    const found = options.find(opt => opt.value === value)
    return found ? found.text : placeholder
  }, [options, value, placeholder])

  return (
    <div className="relative mb-5 w-full" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">
          {label}
        </label>
      )}

      {/* Box hiển thị chính - Đã fix rớt dòng */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white py-3 px-4 transition-all dark:bg-dark-2 
          ${isOpen ? 'border-primary ring-1 ring-primary/10' : 'border-stroke dark:border-dark-3'}
          ${error ? 'border-red-500' : ''}`}
      >
        <span className={`block truncate pr-4 text-sm ${!value ? 'text-body-color opacity-50' : 'text-dark dark:text-white'}`}>
          {selectedDisplay}
        </span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-body-color">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[99] mt-2 w-full rounded-xl border border-stroke bg-white shadow-2xl dark:border-dark-4 dark:bg-dark-3 animate-fade-in">
          {/* Ô Search */}
          <div className="p-3 border-b border-stroke dark:border-dark-4">
            <div className="relative">
              <input
                autoFocus
                type="text"
                className="w-full rounded-md border border-stroke bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white"
                placeholder="Tìm nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-body-color" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* List Options */}
          <ul className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: any, idx: any) => (
                <li
                  key={`${opt.value}-${idx}`}
                  title={opt.text}
                  onClick={() => {
                    onChange?.(opt.value)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-all hover:bg-primary hover:text-white
                    ${value === opt.value ? 'bg-primary/5 text-primary font-bold' : 'text-dark dark:text-white'}`}
                >
                  <span className="truncate">{opt.text}</span>
                  {value === opt.value && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="p-5 text-center text-xs text-body-color italic opacity-70">Không có kết quả phù hợp</li>
            )}
          </ul>
        </div>
      )}
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export const FormTextarea = ({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}: FormTextareaProps) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-md border py-3 px-5 outline-none transition 
          ${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-stroke focus:border-primary dark:border-dark-3 dark:focus:border-primary'
          } 
          bg-transparent text-base text-body-color dark:text-dark-6 disabled:cursor-default disabled:bg-gray-2 
          ${className}`}
        rows={4}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
}

export const FormMultiSelect = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Chọn mục...",
  error
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const newValues = selectedValues.includes(id)
      ? selectedValues.filter(v => v !== id)
      : [...selectedValues, id];
    onChange(newValues);
  };

  const removeValue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== id));
  };

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-4" ref={containerRef}>
      {/* <label className="mb-2 block text-sm font-medium text-dark dark:text-white"> */}
      <label className="mb-2 block text-xs font-bold uppercase text-body-color dark:text-dark-6">
        {label}
      </label>
      
      <div className="relative">
        {/* Khung hiển thị chính */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`min-h-[46px] w-full cursor-pointer rounded-md border bg-transparent px-3 py-2 outline-none transition
            ${error ? 'border-red-500' : 'border-stroke focus:border-primary dark:border-dark-3'}
            flex flex-wrap gap-2 items-center`}
        >
          {selectedValues.length > 0 ? (
            selectedValues.map(id => {
              const option = options.find(o => o.id === id);
              return (
                <span 
                  key={id}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded"
                >
                  {option?.name}
                  <button onClick={(e) => removeValue(id, e)} className="hover:text-red-500 font-bold">×</button>
                </span>
              );
            })
          ) : (
            <span className="text-body-color/50 dark:text-dark-6">{placeholder}</span>
          )}
          
          <span className="ml-auto text-xs transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-stroke dark:bg-dark-3 dark:border-dark-4 overflow-hidden">
            <div className="p-2 border-b border-stroke dark:border-dark-4">
              <input
                type="text"
                autoFocus
                className="w-full p-2 text-sm bg-gray-50 dark:bg-dark-2 rounded outline-none"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ul className="max-h-60 overflow-y-auto overflow-x-hidden">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between
                      ${selectedValues.includes(opt.id) ? 'bg-primary text-white' : 'hover:bg-primary/10 dark:hover:bg-white/5'}`}
                  >
                    {opt.name}
                    {selectedValues.includes(opt.id) && <span>✓</span>}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-400 italic">Không tìm thấy kết quả</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  );
};