import React, {forwardRef, HTMLProps, Ref} from 'react';
import {getInputFieldClassNames} from '../input-field/get-input-field-class-names';
import {BaseFieldProps} from '../input-field/base-field-props';

interface Props
  extends BaseFieldProps,
    Omit<React.ComponentPropsWithoutRef<'select'>, 'size'> {}

export const NativeSelect = forwardRef<HTMLSelectElement, Props>((props: Props, ref: Ref<HTMLSelectElement>) => {
  const style = getInputFieldClassNames(props);
  const {label, id, children, size, className, ...other} = {...props};
  return (
    <div className={style.wrapper}>
      {label && (
        <label className={style.label} htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={style.input} ref={ref} {...other}>
        {children}
      </select>
    </div>
  );
})
