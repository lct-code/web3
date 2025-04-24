import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { mergeProps, useObjectRef } from '@react-aria/utils';
import { BaseFieldPropsWithDom } from '../base-field-props';
import { getInputFieldClassNames } from '../get-input-field-class-names';
import { Field } from '../field';
import { useField } from '../use-field';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/build/css/intlTelInput.css';
import { IntlTelInputRef } from 'intl-tel-input/react';
import { message } from '@common/i18n/message';
import { useTrans } from '@common/i18n/use-trans';

const errorMap = [
  "Invalid number",
  "Invalid country code",
  "Too short",
  "Too long",
  "Invalid number",
];
export interface PhoneFieldProps
  extends BaseFieldPropsWithDom<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: (value: any) => void;
  onChangeValidity?: (value: any) => void;
  onChangeErrorCode?: (value: any) => void;
  onlyCountries?: string[];
  preferredCountries?: string[];
  excludeCountries?: string[];
  initialCountry?: string;
}

export const PhoneField = forwardRef<HTMLDivElement, PhoneFieldProps>(
  ({
    inputRef,
    inputTestId,
    value,
    onChange,
    onChangeValidity,
    onChangeErrorCode,
    onlyCountries = [],
    preferredCountries,
    excludeCountries = [],
    initialCountry = 'auto',
    ...props
  },
    ref
  ) => {
    const inputObjRef = useObjectRef(inputRef);
    const { fieldProps, inputProps } = useField<HTMLInputElement>({
      ...props,
      focusRef: inputObjRef,
    });

    const inputFieldClassNames = getInputFieldClassNames({
      ...props,
    });
    inputProps.className = 'w-full ' + inputFieldClassNames.input
    inputFieldClassNames.wrapper += ' [&_.iti]:w-full'
    const itiRef = useRef<IntlTelInputRef>(null);

    const handleNumberChange = (e: string) => {
      if (itiRef.current) {
        const instance = itiRef.current.getInstance();
        const formattedNumber = instance?.getNumber();
        // Ensure we're passing the formatted number to onChange
        if (formattedNumber) {
          onChange?.(formattedNumber);
        } else {
          // If formatting fails, pass the raw input
          onChange?.(e);
        }
      }
    };

    return (
      <Field ref={ref} fieldClassNames={inputFieldClassNames} {...fieldProps}>
        <IntlTelInput
          ref={itiRef}
          initialValue={value}
          inputProps={(inputProps as any)}
          initOptions={{
            onlyCountries,
            initialCountry,
            excludeCountries,
          }}
          onChangeNumber={handleNumberChange}
          onChangeValidity={onChangeValidity}
          onChangeErrorCode={onChangeErrorCode}
        />
      </Field>
    );
  }
);

export interface FormPhoneFieldProps extends PhoneFieldProps {
  name: string;
}

export const FormPhoneField = forwardRef<HTMLDivElement, FormPhoneFieldProps>(
  ({ name, ...props }, ref) => {
    const [isValid, setIsValid] = useState(true);
    const [errorCode, setErrorCode] = useState<number | null>(null);
    const latestValueRef = useRef<string>('');
    const {trans} = useTrans();

    const {
      field: { onChange, onBlur, value = '', ref: inputRef },
      fieldState: { invalid, error, isTouched },
      formState: { isSubmitting },
    } = useController({
      name,
      rules: {
        validate: {
          phoneValid: (value) => {
            // Return true only if the number is valid
            if (!isValid) {
              return trans(message?.(errorMap[errorCode || 0]));
            }
            // Also validate that we have a value
            if (!latestValueRef.current?.trim()) {
              return 'Phone number is required';
            }
            return true;
          },
        },
      },
    });

    const handleValidationChange = (isNewValid: boolean | undefined, errorCode: number | null | undefined) => {
      if (isNewValid !== undefined) setIsValid(isNewValid || !isTouched);
      if (errorCode !== undefined) setErrorCode(!isTouched ? null : errorCode);

      if (!isSubmitting) {
        // Use the latest value when triggering validation
        onChange(latestValueRef.current);
      }
    };

    const formProps: PhoneFieldProps = {
      onChange: (phoneNumber: string) => {
        // Store the latest value
        latestValueRef.current = phoneNumber;
        onChange(phoneNumber);
      },
      onBlur,
      value: value == null ? '' : value,
      invalid: invalid || !isValid,
      errorMessage: error?.message || (errorCode !== null ?
        trans(message(errorMap[errorCode])) :
        undefined),
      inputRef,
      name,
      onChangeValidity: (isValid: boolean) => {
        handleValidationChange(isValid, undefined);
      },
      onChangeErrorCode: (errorCode: number | null) => {
        handleValidationChange(undefined, errorCode);
      },
    };

    return <PhoneField ref={ref} {...mergeProps(formProps, props)} />;
  }
);