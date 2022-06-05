import { FC, useState } from 'react';

interface RangeInputProps {
  min: number;
  max: number;
  initial: number;
  step?: number;
  onSet: (value: number) => void;
  children?: React.ReactNode;
};

const RangeInput: FC<RangeInputProps> = ({min, max, initial, step, onSet, children}) => {
  const [text, setText] = useState(initial.toString());
  const [value, setValue] = useState(initial);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value);
    const n = event.currentTarget.valueAsNumber;
    if (!isNaN(n) && n <= max && n >= min) {
      setValue(n);
      onSet(n);
    }
  };

  return <>
    <label>
      {children && <>{children}{' '}</>}
      <input type="number" min={min} max={max} value={text} onChange={onChange}
        size={3} step={step ?? 1}/>
    </label>
    <br/>
    <small>{min}</small>
    <input type="range" min={min} max={max} value={value} onChange={onChange}
      style={{verticalAlign: 'middle'}} step={step ?? 1}/>
    <small>{max}</small>
  </>;
};

export default RangeInput;
