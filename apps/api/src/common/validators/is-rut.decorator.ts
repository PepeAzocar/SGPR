import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidRut } from './rut.util.js';

@ValidatorConstraint({ name: 'IsRut', async: false })
class IsRutConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidRut(value);
  }

  defaultMessage(): string {
    return 'El RUT ingresado no es válido';
  }
}

export function IsRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRutConstraint,
    });
  };
}
