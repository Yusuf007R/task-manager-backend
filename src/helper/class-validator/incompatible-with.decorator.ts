import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isDefined,
  ValidateIf,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsNotSiblingOfConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (isDefined(value)) {
      return this.getFailedConstraints(args).length === 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${
      args.property
    } cannot exist alongside the following defined properties: ${this.getFailedConstraints(
      args,
    ).join(', ')}`;
  }

  getFailedConstraints(args: ValidationArguments) {
    return args.constraints.filter((prop) => isDefined(args.object[prop]));
  }
}

function IsNotSiblingOf(
  props: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: props,
      validator: IsNotSiblingOfConstraint,
    });
  };
}

function incompatibleSiblingsNotPresent(incompatibleSiblings: string[]) {
  return function (o, v) {
    return Boolean(
      isDefined(v) || incompatibleSiblings.every((prop) => !isDefined(o[prop])),
    );
  };
}

export default function IncompatableWith(incompatibleSiblings: string[]) {
  const notSibling = IsNotSiblingOf(incompatibleSiblings);
  const validateIf = ValidateIf(
    incompatibleSiblingsNotPresent(incompatibleSiblings),
  );
  return function (target: any, key: string) {
    notSibling(target, key);
    validateIf(target, key);
  };
}
