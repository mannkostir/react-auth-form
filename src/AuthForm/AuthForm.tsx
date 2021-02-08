import React, { createContext, useState, useContext, useRef } from 'react';
import InputValidator from '../InputValidator';
import { useMemo } from 'react';
import { useEffect } from 'react';

export const useForm = (initialValue: Map<string, string> = new Map()) => {
  const [values, setValues] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setValues(values.set(e.target.name, e.target.value));
  };

  return { keyValueMap: values, handleChange };
};

interface IDefaultAuthContext {
  keyValueMap: Map<string, string>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  initValidator: (
    input: HTMLInputElement,
    validationRules: Record<string, unknown>
  ) => any;
  errors: {
    [key: string]: any;
  };
  currentLanguage: 'EN' | 'RU';
}

const defaultAuthContext: IDefaultAuthContext = {
  keyValueMap: new Map(),
  handleChange: () => {},
  initValidator: () => {},
  errors: {},
  currentLanguage: 'EN',
};

const AuthFormContext = createContext(defaultAuthContext);

interface IAuthFormProps {
  children: JSX.Element[] | JSX.Element;
  onSubmit: (formValues: Map<string, string>) => typeof formValues;
  validateInputs: boolean;
}

const AuthForm = ({
  children,
  onSubmit,
  validateInputs = true,
  ...args
}: IAuthFormProps) => {
  const { handleChange, keyValueMap } = useForm();

  const [errors, setErrors] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState<'EN' | 'RU'>('EN');

  const initValidator = (input: HTMLInputElement, validationRules = {}) => {
    const validator = new InputValidator(
      input,
      validationRules,
      {
        onValidationFinish: (errors) => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [input.name]: errors,
          }));
        },
      },
      { currentLanguage }
    );

    return validator;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(keyValueMap);
  };

  return (
    <AuthFormContext.Provider
      value={{
        keyValueMap,
        handleChange,
        initValidator,
        errors,
        currentLanguage,
      }}
    >
      <form onSubmit={handleSubmit} aria-label="Authentication form" {...args}>
        {children}
      </form>
    </AuthFormContext.Provider>
  );
};

interface IFormTitleProps {
  children: JSX.Element | JSX.Element[];
  style: Record<string, unknown>;
}

const FormTitle = ({ children, style, ...args }: IFormTitleProps) => {
  return (
    <h2 aria-label="Form title" style={style} {...args}>
      {children}
    </h2>
  );
};

interface IUsernameInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatorRules: Record<string, unknown>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const UsernameInput = ({
  onChange,
  validatorRules,
  onBlur,
  ...args
}: IUsernameInputProps) => {
  const { handleChange, initValidator, errors } = useContext(AuthFormContext);
  const [validator, setValidator] = useState<ReturnType<
    typeof initValidator
  > | null>(null);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  const usernameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!usernameInput.current) return;
    setValidator(initValidator(usernameInput.current, validatorRules));
  }, [validatorRules]);

  useEffect(() => {
    if (!usernameInput.current) return;
    setValidationErrorMessage(errors[usernameInput.current.name]?.[0]?.message);
  }, [errors]);

  return (
    <div>
      <input
        type="text"
        name="username"
        aria-label="username"
        placeholder={'Enter username'}
        ref={usernameInput}
        onBlur={(e) => {
          onBlur(e);
          validator.validate();
        }}
        onChange={(e) => {
          handleChange(e);
          onChange(e);
        }}
        {...args}
      />
      {validationErrorMessage && (
        <span
          style={{
            position: 'absolute',
            bottom: '-0.7em',
            transform: 'translateY(100%)',
            right: '0',
            left: '0',
            margin: 'auto',
          }}
        >
          {validationErrorMessage}
        </span>
      )}
    </div>
  );
};

interface IEmailInputProps {
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatorRules: Record<string, unknown>;
}

const EmailInput = ({
  onBlur,
  onChange,
  validatorRules,
  ...args
}: IEmailInputProps) => {
  const { handleChange, initValidator, errors } = useContext(AuthFormContext);

  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  const emailInput = useRef<HTMLInputElement>();

  const validator = useMemo(() => {
    if (!emailInput.current) return;

    return initValidator(emailInput.current, validatorRules);
  }, [initValidator, validatorRules]);

  useEffect(() => {
    if (!emailInput.current) return;
    setValidationErrorMessage(errors[emailInput.current.name]?.[0]?.message);
  }, [errors]);

  return (
    <div>
      <input
        type="email"
        name="email"
        aria-label="email"
        placeholder={'Enter email'}
        onChange={(e) => {
          handleChange(e);
          onChange(e);
        }}
        onBlur={(e) => {
          onBlur(e);
          validator.validate();
        }}
        {...args}
      />
      {validationErrorMessage && (
        <span
          style={{
            position: 'absolute',
            bottom: '-0.7em',
            transform: 'translateY(100%)',
            right: '0',
            left: '0',
            margin: 'auto',
          }}
        >
          {validationErrorMessage}
        </span>
      )}
    </div>
  );
};

interface IPasswordInputProps {
  style: Record<string, unknown>;
  icon: any;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validatorRules: Record<string, unknown>;
}

const PasswordInput = ({
  style = {},
  icon = 'See',
  onBlur,
  onChange,
  validatorRules,
  ...args
}: IPasswordInputProps) => {
  const { handleChange, initValidator, errors } = useContext(AuthFormContext);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const [validator, setValidator] = useState<ReturnType<
    typeof initValidator
  > | null>(null);
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  const passwordField = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!passwordField.current) return;
    setValidator(initValidator(passwordField.current, validatorRules));
  }, []);

  useEffect(() => {
    if (!passwordField.current) return;
    const id = passwordField.current.id || null;
    setId(id);
  }, []);

  useEffect(() => {
    if (!passwordField.current) return;
    setValidationErrorMessage(errors[passwordField.current.name]?.[0]?.message);
  }, [errors]);

  const revealPassword = () => {
    if (!passwordField.current) return;
    passwordField.current.type = 'text';
    setIsPasswordVisible(true);
  };

  const hidePassword = () => {
    if (!passwordField.current) return;
    passwordField.current.type = 'password';
    setIsPasswordVisible(false);
  };

  const togglePasswordVisibility = () => {
    if (!passwordField.current) return;
    const type = passwordField.current.type;

    type === 'password' ? revealPassword() : hidePassword();
  };

  return (
    <div style={{ ...style }}>
      <input
        type="password"
        name="password"
        aria-label="password"
        placeholder={'Enter password'}
        onChange={(e) => {
          handleChange(e);
          onChange(e);
        }}
        ref={passwordField}
        onBlur={(e) => {
          onBlur(e);
          validator.validate();
        }}
        {...args}
        role="password"
      />
      <label onClick={togglePasswordVisibility} htmlFor={id ? id : ''}>
        {isPasswordVisible ? <i>Hide</i> : <i>Show</i>}
      </label>
      {validationErrorMessage && (
        <span
          style={{
            position: 'absolute',
            bottom: '-0.7em',
            transform: 'translateY(100%)',
            right: '0',
            left: '0',
            margin: 'auto',
          }}
        >
          {validationErrorMessage}
        </span>
      )}
    </div>
  );
};

interface ISubmitButtonProps {
  children: JSX.Element | JSX.Element[];
  disabled: boolean;
}

const SubmitButton = ({ children, disabled, ...args }: ISubmitButtonProps) => {
  const { errors } = useContext(AuthFormContext);

  const [isAllInputsValid, setIsAllInputsValid] = useState(false);

  useEffect(() => {
    setIsAllInputsValid(!Object.values(errors).flat().length);
  }, [errors]);
  return (
    <button type="submit" {...args} disabled={!isAllInputsValid}>
      {children}
    </button>
  );
};

AuthForm.FormTitle = FormTitle;
AuthForm.UsernameInput = UsernameInput;
AuthForm.EmailInput = EmailInput;
AuthForm.PasswordInput = PasswordInput;
AuthForm.SubmitButton = SubmitButton;

export default AuthForm;
