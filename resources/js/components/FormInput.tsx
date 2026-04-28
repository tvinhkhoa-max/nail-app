import React from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, ...props }: Props) => (
  <div className="mb-5">
    <label className="mb-3 block text-base font-medium text-dark dark:text-white">
      {label}
    </label>
    <input
      {...props}
      className={`w-full rounded-md border py-3 px-5 text-base outline-none transition focus:border-primary ${
        error ? 'border-red-500' : 'border-stroke dark:border-dark-3'
      } bg-transparent text-body-color dark:text-dark-6`}
    />
    {error && <span className="mt-2 text-sm text-red-500">{error}</span>}
  </div>
)

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

export const  FormRadioGroup: React.FC<FormRadioGroupProps> = ({ label, options, selectedValue, onChange, inline = false }) => {
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