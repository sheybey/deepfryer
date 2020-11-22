import React from 'react';

interface RangeInputProps {
  min: number,
  max: number,
  initial: number,
  onSet: (value: number) => void
};

const RangeInput: React.FC<RangeInputProps> = ({min, max, initial, onSet, children}) => {
  const [text, setText] = React.useState(initial.toString());
  const [value, setValue] = React.useState(initial);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value);
    const n = event.currentTarget.valueAsNumber;
    if (!isNaN(n) && n <= max && n >= min) {
      setValue(n);
      onSet(n);
    }
  };

  return <React.Fragment>
    <label>
      {children}{' '}
      <input type="number" min={min} max={max} value={text} onChange={onChange}
        size={3} step={1}/>
    </label>
    <br/>
    <small>{min}</small>
    <input type="range" min={min} max={max} value={value} onChange={onChange}
      style={{verticalAlign: 'middle'}} step={1}/>
    <small>{max}</small>
  </React.Fragment>;
};

export default RangeInput;
