type ILangObject = {
  EN: string;
  RU: string;
};

interface IErrorTextMessages {
  hasLength: {
    min: (length: number) => ILangObject;
    max: (length: number) => ILangObject;
    exact: (length: number) => ILangObject;
  };
  isAlpha: () => ILangObject;
  isEmail: () => ILangObject;
}

const errorTextMessages: IErrorTextMessages = {
  hasLength: {
    min: (minLength) => ({
      EN: `Should be more than or equal to ${minLength} symbols`,
      RU: `Количество символов должно быть больше или равно ${minLength}`,
    }),
    max: (maxLength) => ({
      EN: `Should be no more than ${maxLength} symbols`,
      RU: `Количество символов не должно превышать ${maxLength}`,
    }),
    exact: (exactLength) => ({
      EN: `Should be exactly ${exactLength} symbols`,
      RU: `Количество символов должно точно равняться ${exactLength}`,
    }),
  },
  isAlpha: () => ({ EN: `Should contain only alphabetic letters`, RU: `` }),
  isEmail: () => ({
    EN: `Incorrect email address`,
    RU: `Неверный адрес электронной почты`,
  }),
};

enum ValidatorRules {
  hasLength = 'hasLength',
  isAlpha = 'isAlpha',
  isEmail = 'isEmail',
}

type IValidatorRules = {
  [key in ValidatorRules]: any;
};

interface IValidatorHandlers {
  onValidationFinish: (error: any[]) => void;
}

interface IValidatorSettings {
  currentLanguage: 'EN' | 'RU';
}

export default class InputValidator {
  input: HTMLInputElement | null = null;
  validatorRules: IValidatorRules = {
    hasLength: { exact: 0, min: 0, max: 0 },
    isAlpha: false,
    isEmail: false,
  };
  validatorHandlers: IValidatorHandlers = { onValidationFinish: ([]) => {} };
  validatorSettings: IValidatorSettings = { currentLanguage: 'EN' };
  errors: any[] = [];

  constructor(
    input: HTMLInputElement,
    validatorRules: Partial<IValidatorRules>,
    validatorHandlers: Partial<IValidatorHandlers>,
    validatorSettings: Partial<IValidatorSettings>
  ) {
    this.input = input;

    this.validatorRules = { ...this.validatorRules, ...validatorRules };
    this.validatorHandlers = {
      ...this.validatorHandlers,
      ...validatorHandlers,
    };
    this.validatorSettings = {
      ...this.validatorSettings,
      ...validatorSettings,
    };
  }

  get isValid() {
    return !this.errors.length;
  }

  get validationErrors() {
    return this.errors;
  }

  _addError(checkName = '', message = '') {
    this.errors.push({ checkName, message });
  }

  _validateCheck(checkName = '') {
    this.errors = this.errors.filter((error) => error.checkName !== checkName);
  }

  hasLength() {
    if (!this.input || typeof this.input.value !== 'string') {
      throw new Error('Input value must be type of string');
    }

    const methodName = this.hasLength.name;

    if (this.input.value.length < this.validatorRules.hasLength.min) {
      this._addError(
        methodName,
        errorTextMessages.hasLength.min(this.validatorRules.hasLength.min)[
          this.validatorSettings.currentLanguage
        ]
      );
    } else if (
      !!+this.validatorRules.hasLength.max &&
      this.input.value.length > this.validatorRules.hasLength.max
    ) {
      this._addError(
        methodName,
        `Should be no more than ${this.validatorRules.hasLength.max} symbols`
      );
    } else if (
      !!+this.validatorRules.hasLength.exact &&
      this.input.value.length !== this.validatorRules.hasLength.exact
    ) {
      this._addError(
        methodName,
        `Should be exactly ${this.validatorRules.hasLength.exact} symbols`
      );
    } else {
      this._validateCheck(methodName);
    }
  }

  isAlpha() {
    if (!this.input || typeof this.input.value !== 'string') {
      throw new Error('Input value must be type of string');
    }

    const methodName = this.isAlpha.name;

    if (!/^[a-z]*$/gi.test(this.input.value)) {
      this._addError(methodName, `Should contain only alphabetic letters`);
    } else {
      this._validateCheck(methodName);
    }
  }

  isEmail() {
    if (!this.input || typeof this.input.value !== 'string') {
      throw new Error('Input value must be type of string');
    }

    const methodName = this.isEmail.name;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.input.value)) {
      this._addError(methodName, `Incorrect email address`);
    } else {
      this._validateCheck(methodName);
    }
  }

  customCheck(
    fn = (inputValue = '') => true,
    checkName = '',
    errorMessage = ''
  ) {
    if (!this.input || typeof this.input.value !== 'string') {
      throw new Error('Input value must be type of string');
    }

    if (!checkName) {
      throw new Error('Name for validation check must be specified');
    }

    if (fn(this.input.value) !== true) {
      this._addError(checkName, errorMessage || `${checkName} check failed`);
    } else {
      this._validateCheck(checkName);
    }
  }

  validate() {
    if (!this.input || typeof this.input.value !== 'string') {
      throw new Error('Input value must be type of string');
    }

    Object.entries(this.validatorRules).forEach(([methodName, methodValue]) => {
      if (!methodValue) return;
      let key: keyof InputValidator;

      if (methodName in Object.keys(this)) {
        this[methodName as ValidatorRules]();
      }
    });

    this.input.dataset.isValid = this.errors.length ? 'Invalid' : 'Valid';

    this.validatorHandlers.onValidationFinish(this.errors);
  }
}
